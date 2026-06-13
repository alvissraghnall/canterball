import type { GameState, Team } from '@canterball/shared';

class GameStore {
	#state = $state({
		connection: null as WebSocket | null,
		gameState: null as GameState | null,
		playerId: null as string | null,
		playerSide: null as Team | null,
		playerName: '',
		playerCount: 0,
		phase: 'lobby' as 'lobby' | 'playing' | 'finished',
		shotPath: [] as { x: number; y: number }[],
		shotAnimating: false,
		goalieWindowActive: false,
		errorMessage: null as string | null,
		disconnected: false,
	});

	get disconnected() {
		return this.#state.disconnected;
	}
	set disconnected(v) {
		this.#state.disconnected = v;
	}

	get connection() {
		return this.#state.connection;
	}
	set connection(v) {
		this.#state.connection = v;
	}

	get gameState() {
		return this.#state.gameState;
	}
	set gameState(v) {
		this.#state.gameState = v;
	}

	get playerId() {
		return this.#state.playerId;
	}
	set playerId(v) {
		this.#state.playerId = v;
	}

	get playerSide() {
		return this.#state.playerSide;
	}
	set playerSide(v) {
		this.#state.playerSide = v;
	}

	get playerName() {
		return this.#state.playerName;
	}
	set playerName(v) {
		this.#state.playerName = v;
	}

	get playerCount() {
		return this.#state.playerCount;
	}
	set playerCount(v) {
		this.#state.playerCount = v;
	}

	get phase() {
		return this.#state.phase;
	}
	set phase(v) {
		this.#state.phase = v;
	}

	get shotPath() {
		return this.#state.shotPath;
	}
	set shotPath(v) {
		this.#state.shotPath = v;
	}

	get shotAnimating() {
		return this.#state.shotAnimating;
	}
	set shotAnimating(v) {
		this.#state.shotAnimating = v;
	}

	get goalieWindowActive() {
		return this.#state.goalieWindowActive;
	}
	set goalieWindowActive(v) {
		this.#state.goalieWindowActive = v;
	}

	get errorMessage() {
		return this.#state.errorMessage;
	}
	set errorMessage(v) {
		this.#state.errorMessage = v;
	}

	isMyTurn = $derived.by(() => {
		if (!this.#state.gameState || !this.#state.playerSide) return false;
		return this.#state.gameState.currentTurn === this.#state.playerSide;
	});

	myTeamPieces = $derived.by(() => {
		if (!this.#state.gameState || !this.#state.playerSide) return [];
		return this.#state.gameState.pieces.filter((p) => p.team === this.#state.playerSide);
	});

	opponentPieces = $derived.by(() => {
		if (!this.#state.gameState || !this.#state.playerSide) return [];
		const opp: Team = this.#state.playerSide === 'HOME' ? 'AWAY' : 'HOME';
		return this.#state.gameState.pieces.filter((p) => p.team === opp);
	});

	reset() {
		this.#state.gameState = null;
		this.#state.playerId = null;
		this.#state.playerSide = null;
		this.#state.playerCount = 0;
		this.#state.phase = 'lobby';
		this.#state.shotPath = [];
		this.#state.shotAnimating = false;
		this.#state.goalieWindowActive = false;
		this.#state.errorMessage = null;
		this.#state.disconnected = false;
	}
}

export const gameStore = new GameStore();
