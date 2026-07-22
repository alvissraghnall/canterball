import type { DurableObjectState } from '@cloudflare/workers-types';
import type { Env } from './env';
import { type Team, type ClientInMessage } from '@canterball/shared';
import { GameStateMachine } from './game-state';
import { RoomDB } from './db';

interface SessionInfo {
	playerId: string;
	playerName: string;
	side: Team;
}

export class RoomDO {
	private sessions: Map<WebSocket, SessionInfo> = new Map();
	private game: GameStateMachine | null = null;
	private roomId: string;
	private db: RoomDB;

	constructor(ctx: DurableObjectState, env: Env) {
		this.roomId = ctx.id?.name ?? ctx.id.toString().slice(0, 8);
		this.db = new RoomDB(env);
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (request.headers.get('Upgrade') === 'websocket') {
			return this.handleWebSocket(request);
		}

		if (url.pathname === '/state') {
			return this.handleGetState();
		}

		return new Response('Not found', { status: 404 });
	}

	private handleWebSocket(request: Request): Response {
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

		server.accept();

		const url = new URL(request.url);
		const playerName = url.searchParams.get('name') ?? 'Anonymous';

		if (this.sessions.size >= 2) {
			server.send(JSON.stringify({ type: 'ERROR', message: 'Room is full' }));
			server.close(1000, 'Room full');
			return new Response('Room full', { status: 403 });
		}

		const side: Team = this.sessions.size === 0 ? 'HOME' : 'AWAY';
		const playerId = crypto.randomUUID();

		this.sessions.set(server, { playerId, playerName, side });

		this.db.updatePlayerCount(this.roomId, this.sessions.size);

		server.send(
			JSON.stringify({
				type: 'ROOM_JOINED',
				roomId: this.roomId,
				playerId,
				playerSide: side,
				playerCount: this.sessions.size,
			}),
		);

		if (this.sessions.size === 2) {
			this.db.updateStatus(this.roomId, 'playing');
			this.startGame();
		}

		// Notify others about the new player
		for (const [ws, info] of this.sessions) {
			if (ws !== server) {
				ws.send(
					JSON.stringify({
						type: 'PLAYER_JOINED',
						playerName,
						side,
						playerCount: this.sessions.size,
					}),
				);
			}
		}

		this.broadcastState();

		server.addEventListener('message', (event: MessageEvent) => {
			try {
				const msg: ClientInMessage = JSON.parse(event.data as string);
				this.handleMessage(server, msg);
			} catch {
				server.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message' }));
			}
		});

		server.addEventListener('close', () => {
			this.handleDisconnect(server);
		});

		return new Response(null, { status: 101, webSocket: client });
	}

	private startGame(): void {
		const sides: SessionInfo[] = [];
		for (const [, info] of this.sessions) {
			sides.push(info);
		}

		const homeInfo = sides.find((s) => s.side === 'HOME')!;
		const awayInfo = sides.find((s) => s.side === 'AWAY')!;

		this.game = new GameStateMachine(
			homeInfo.playerId,
			homeInfo.playerName,
			awayInfo.playerId,
			awayInfo.playerName,
		);

		this.broadcastState();
	}

	private handleMessage(server: WebSocket, msg: ClientInMessage): void {
		const info = this.sessions.get(server);
		if (!info) return;

		switch (msg.type) {
			case 'MOVE_PIECE':
				this.handleMovePiece(info, msg);
				break;
		}
	}

	private handleMovePiece(
		info: SessionInfo,
		msg: { type: 'MOVE_PIECE'; pieceId: string; targetX: number; targetY: number },
	): void {
		if (!this.game) return;

		const result = this.game.canMovePiece(msg.pieceId, msg.targetX, msg.targetY);
		if (!result.valid) {
			this.sendTo(info.side, { type: 'ERROR', message: result.reason });
			return;
		}

		this.game.applyMove(msg.pieceId, msg.targetX, msg.targetY);

		const gameOver = this.game.isGameOver();
		if (gameOver.over) {
			const winner: 'HOME' | 'AWAY' | 'DRAW' = gameOver.draw
				? 'DRAW'
				: this.game.state.score[0] > this.game.state.score[1]
					? 'HOME'
					: 'AWAY';
			this.broadcast({
				type: 'GAME_OVER',
				winner,
				score: this.game.state.score,
			});

			this.db.recordMatchResult({
				id: crypto.randomUUID(),
				roomId: this.roomId,
				homePlayerId: this.game.state.homePlayerId,
				awayPlayerId: this.game.state.awayPlayerId,
				homePlayerName: this.game.state.homePlayerName,
				awayPlayerName: this.game.state.awayPlayerName,
				winner,
				homeScore: this.game.state.score[0],
				awayScore: this.game.state.score[1],
			}).catch((e) => console.error('Failed to record match result:', e));
		} else {
			this.broadcastState();
		}
	}

	private handleDisconnect(server: WebSocket): void {
		this.sessions.delete(server);
		this.db.updatePlayerCount(this.roomId, this.sessions.size);
		this.broadcast({ type: 'OPPONENT_DISCONNECTED' });
	}

	private handleGetState(): Response {
		if (!this.game) {
			return new Response(JSON.stringify({ phase: 'IDLE' }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return new Response(JSON.stringify(this.game.state), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private broadcastState(): void {
		if (!this.game) return;
		this.broadcast({ type: 'STATE_UPDATE', state: this.game.state });
	}

	private broadcast(msg: object): void {
		const payload = JSON.stringify(msg);
		for (const [ws] of this.sessions) {
			try {
				ws.send(payload);
			} catch {
				// connection already closed
			}
		}
	}

	private sendTo(side: Team, msg: object): void {
		const payload = JSON.stringify(msg);
		for (const [ws, info] of this.sessions) {
			if (info.side === side) {
				try {
					ws.send(payload);
				} catch {
					// connection already closed
				}
			}
		}
	}
}
