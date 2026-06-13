<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { GameConnection } from '$lib/game/ws';
	import { gameStore } from '$lib/stores/game.svelte';
	import type { ServerOutMessage, GameState } from '@canterball/shared';
	import GameBoard from '$lib/components/GameBoard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let conn: GameConnection | null = null;

	onMount(() => {
		if (data.initialState && (data.initialState as any).pieces) {
			gameStore.gameState = data.initialState as unknown as GameState;
			gameStore.phase = 'playing';
		} else if (data.initialState && (data.initialState as any).phase === 'IDLE') {
			gameStore.phase = 'lobby';
		}

		gameStore.playerName = data.name;
		conn = new GameConnection();
		conn.connect(data.roomId, data.name);
		conn.onMessage(handleMessage);

		function handleMessage(msg: ServerOutMessage) {
			switch (msg.type) {
				case 'ROOM_JOINED':
					gameStore.playerId = msg.playerId;
					gameStore.playerSide = msg.playerSide;
					gameStore.playerCount = msg.playerCount;
					break;

				case 'PLAYER_JOINED':
					gameStore.playerCount = msg.playerCount;
					break;

				case 'STATE_UPDATE':
					gameStore.gameState = msg.state;
					gameStore.phase = 'playing';
					break;

				case 'GAME_OVER':
					gameStore.phase = 'finished';
					break;

				case 'ERROR':
					gameStore.errorMessage = msg.message;
					setTimeout(() => (gameStore.errorMessage = null), 3000);
					break;

				case 'OPPONENT_DISCONNECTED':
					gameStore.disconnected = true;
					gameStore.errorMessage = 'Opponent disconnected';
					break;
			}
		}

		return () => {
			if (conn) conn.disconnect();
			gameStore.reset();
		};
	});

	function handleMovePiece(pieceId: string, x: number, y: number) {
		if (conn) conn.send({ type: 'MOVE_PIECE', pieceId, targetX: x, targetY: y });
	}
</script>

<div class="game-page">
	{#if gameStore.phase === 'finished'}
		<div class="overlay">
			<div class="modal">
				<h2>Game Over</h2>
				{#if gameStore.gameState}
					<p>
						{gameStore.gameState.homePlayerName}
						{gameStore.gameState.score[0]} - {gameStore.gameState.score[1]}
						{gameStore.gameState.awayPlayerName}
					</p>
				{/if}
				<button onclick={() => goto('/')}>Back to Lobby</button>
			</div>
		</div>
	{/if}

	{#if gameStore.disconnected}
		<div class="overlay">
			<div class="modal">
				<h2>Connection Lost</h2>
				<p>Your opponent has disconnected or the connection was lost.</p>
				<button onclick={() => goto('/')}>Back to Lobby</button>
			</div>
		</div>
	{/if}

	{#if gameStore.errorMessage && !gameStore.disconnected}
		<div class="toast">{gameStore.errorMessage}</div>
	{/if}

	{#if gameStore.gameState}
		<div class="scorebar">
			<span class="home"
				>{gameStore.gameState.homePlayerName} <strong>{gameStore.gameState.score[0]}</strong></span
			>
			<span class="turn-info">
				{#if gameStore.phase === 'playing'}
					{gameStore.isMyTurn ? 'Your turn' : "Opponent's turn"}
					(turn {gameStore.gameState.turnNumber})
				{/if}
			</span>
			<span class="away"
				><strong>{gameStore.gameState.score[1]}</strong> {gameStore.gameState.awayPlayerName}</span
			>
		</div>
	{/if}

	<GameBoard
		state={gameStore.gameState}
		mySide={gameStore.playerSide}
		playerCount={gameStore.playerCount}
		isMyTurn={gameStore.isMyTurn}
		onMovePiece={handleMovePiece}
	/>
</div>

<style>
	.game-page {
		position: relative;
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.scorebar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.8rem 1.5rem;
		background: #16213e;
		border-radius: 12px;
		margin-bottom: 1.5rem;
		font-size: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.home {
		color: #4fc3f7;
		font-weight: 500;
	}

	.away {
		color: #ff8a65;
		font-weight: 500;
	}

	.home strong, .away strong {
		font-size: 1.4rem;
		margin: 0 0.5rem;
	}

	.turn-info {
		color: #aaa;
		font-size: 0.9rem;
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		backdrop-filter: blur(4px);
	}

	.modal {
		background: #1a1a2e;
		padding: 2.5rem;
		border-radius: 16px;
		text-align: center;
		border: 1px solid #e94560;
		max-width: 400px;
		box-shadow: 0 20px 50px rgba(0,0,0,0.5);
	}

	.modal h2 {
		margin-bottom: 1rem;
		color: #e94560;
		font-size: 1.8rem;
	}

	.modal p {
		font-size: 1.1rem;
		margin-bottom: 2rem;
		color: #ccc;
		line-height: 1.5;
	}

	.modal button {
		background: #e94560;
		color: white;
		padding: 0.8rem 2rem;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.modal button:hover {
		transform: scale(1.05);
	}

	.toast {
		position: fixed;
		top: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background: #e94560;
		color: white;
		padding: 0.8rem 2rem;
		border-radius: 8px;
		z-index: 200;
		font-size: 1rem;
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
	}
</style>
