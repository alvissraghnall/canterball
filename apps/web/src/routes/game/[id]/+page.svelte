<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { GameConnection } from '$lib/game/ws';
	import {
		gameState as gameStateStore,
		playerId as playerIdStore,
		playerSide as playerSideStore,
		playerName as playerNameStore,
		phase as phaseStore,
		shotPath as shotPathStore,
		shotAnimating as shotAnimatingStore,
		goalieWindowActive as goalieWindowActiveStore,
		errorMessage as errorMessageStore,
		isMyTurn as isMyTurnStore,
		resetStores,
	} from '$lib/stores/game';
	import type { ServerOutMessage, GameState, Team, Point } from '@canterball/shared';
	import GameBoard from '$lib/components/GameBoard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Local Svelte 5 state to avoid $store auto-subscription crashes
	let localGameState = $state<GameState | null>(null);
	let localPhase = $state<'lobby' | 'playing' | 'finished'>('lobby');
	let localPlayerSide = $state<Team | null>(null);
	let localIsMyTurn = $state(false);
	let localShotPath = $state<Point[]>([]);
	let localShotAnimating = $state(false);
	let localGoalieWindowActive = $state(false);
	let localErrorMessage = $state<string | null>(null);

	let conn: GameConnection | null = null;

	onMount(() => {
		const unsubscribers: (() => void)[] = [];

		// Sync local state from stores
		unsubscribers.push(gameStateStore.subscribe((v) => (localGameState = v)));
		unsubscribers.push(phaseStore.subscribe((v) => (localPhase = v)));
		unsubscribers.push(playerSideStore.subscribe((v) => (localPlayerSide = v)));
		unsubscribers.push(isMyTurnStore.subscribe((v) => (localIsMyTurn = v)));
		unsubscribers.push(shotPathStore.subscribe((v) => (localShotPath = v)));
		unsubscribers.push(shotAnimatingStore.subscribe((v) => (localShotAnimating = v)));
		unsubscribers.push(goalieWindowActiveStore.subscribe((v) => (localGoalieWindowActive = v)));
		unsubscribers.push(errorMessageStore.subscribe((v) => (localErrorMessage = v)));

		if (data.initialState && (data.initialState as any).pieces) {
			gameStateStore.set(data.initialState as unknown as GameState);
			phaseStore.set('playing');
		} else if (data.initialState && (data.initialState as any).phase === 'IDLE') {
			phaseStore.set('lobby');
		}

		playerNameStore.set(data.name);
		conn = new GameConnection();
		conn.connect(data.roomId, data.name);
		conn.onMessage(handleMessage);

		function handleMessage(msg: ServerOutMessage) {
			switch (msg.type) {
				case 'ROOM_JOINED':
					playerIdStore.set(msg.playerId);
					playerSideStore.set(msg.playerSide);
					break;

				case 'STATE_UPDATE':
					gameStateStore.set(msg.state);
					phaseStore.set('playing');
					break;

				case 'GOALIE_WINDOW':
					goalieWindowActiveStore.set(true);
					setTimeout(() => goalieWindowActiveStore.set(false), msg.durationMs);
					break;

				case 'SHOT_RESOLVED': {
					const path = msg.path.map((p) => p);
					shotPathStore.set(path);
					shotAnimatingStore.set(true);
					setTimeout(() => {
						shotAnimatingStore.set(false);
						shotPathStore.set([]);
					}, 2000);
					break;
				}

				case 'GAME_OVER':
					phaseStore.set('finished');
					break;

				case 'ERROR':
					errorMessageStore.set(msg.message);
					setTimeout(() => errorMessageStore.set(null), 3000);
					break;

				case 'OPPONENT_DISCONNECTED':
					errorMessageStore.set('Opponent disconnected');
					setTimeout(() => goto('/'), 3000);
					break;
			}
		}

		// Use the returned cleanup function from onMount as suggested by Svelte 5 docs
		return () => {
			unsubscribers.forEach((unsub) => unsub());
			if (conn) conn.disconnect();
			resetStores();
		};
	});

	function handleMovePiece(pieceId: string, x: number, y: number) {
		if (conn) conn.send({ type: 'MOVE_PIECE', pieceId, targetX: x, targetY: y });
	}

	function handleDeclareShot(pieceId: string, targetX: number, targetY: number, power: number) {
		if (conn) conn.send({ type: 'DECLARE_SHOT', pieceId, targetX, targetY, power });
	}

	function handleRepositionGoalie(x: number, y: number) {
		if (conn) conn.send({ type: 'REPOSITION_GOALIE', x, y });
	}
</script>

<div class="game-page">
	{#if localPhase === 'finished'}
		<div class="overlay">
			<div class="modal">
				<h2>Game Over</h2>
				{#if localGameState}
					<p>
						{localGameState.homePlayerName}
						{localGameState.score[0]} - {localGameState.score[1]}
						{localGameState.awayPlayerName}
					</p>
				{/if}
				<button onclick={() => goto('/')}>Back to Lobby</button>
			</div>
		</div>
	{/if}

	{#if localErrorMessage}
		<div class="toast">{localErrorMessage}</div>
	{/if}

	{#if localGameState}
		<div class="scorebar">
			<span class="home"
				>{localGameState.homePlayerName} <strong>{localGameState.score[0]}</strong></span
			>
			<span class="turn-info">
				{#if localGoalieWindowActive}
					<span class="goalie-hint">Goalie window!</span>
				{:else if localShotAnimating}
					<span class="shot-hint">Shot in flight...</span>
				{:else if localPhase === 'playing'}
					{localIsMyTurn ? 'Your turn' : "Opponent's turn"}
					(turn {localGameState.turnNumber})
				{/if}
			</span>
			<span class="away"
				><strong>{localGameState.score[1]}</strong> {localGameState.awayPlayerName}</span
			>
		</div>
	{/if}

	<GameBoard
		state={localGameState}
		mySide={localPlayerSide}
		isMyTurn={localIsMyTurn}
		shotPath={localShotPath}
		shotAnimating={localShotAnimating}
		goalieWindowActive={localGoalieWindowActive}
		onMovePiece={handleMovePiece}
		onDeclareShot={handleDeclareShot}
		onRepositionGoalie={handleRepositionGoalie}
	/>
</div>

<style>
	.game-page {
		position: relative;
	}

	.scorebar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: #16213e;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.home {
		color: #4fc3f7;
	}

	.away {
		color: #ff8a65;
	}

	.turn-info {
		color: #888;
	}

	.goalie-hint {
		color: #ffd54f;
		animation: pulse 0.5s ease-in-out infinite alternate;
	}

	.shot-hint {
		color: #e94560;
		animation: pulse 0.3s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		from {
			opacity: 0.5;
		}
		to {
			opacity: 1;
		}
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal {
		background: #16213e;
		padding: 2rem;
		border-radius: 12px;
		text-align: center;
	}

	.modal h2 {
		margin-bottom: 1rem;
		color: #e94560;
	}

	.modal p {
		font-size: 1.2rem;
		margin-bottom: 1.5rem;
	}

	.toast {
		position: fixed;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: #e94560;
		padding: 0.6rem 1.5rem;
		border-radius: 6px;
		z-index: 200;
		font-size: 0.9rem;
	}
</style>
