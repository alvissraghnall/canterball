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
				<span class="mono-label">Full-Time Whistle</span>
				<h2>That's the game</h2>
				{#if gameStore.gameState}
					<p class="scoreline">
						<span>{gameStore.gameState.homePlayerName}</span>
						<strong
							>{gameStore.gameState.score[0]} &nbsp;–&nbsp; {gameStore.gameState.score[1]}</strong
						>
						<span>{gameStore.gameState.awayPlayerName}</span>
					</p>
				{/if}
				<button onclick={() => goto('/lobby')}>Head to the Clubhouse</button>
			</div>
		</div>
	{/if}

	{#if gameStore.disconnected}
		<div class="overlay">
			<div class="modal">
				<span class="mono-label warn">Signal Lost</span>
				<h2>Man Down</h2>
				<p class="note">Your opponent left the pitch or the channel dropped.</p>
				<button onclick={() => goto('/lobby')}>Head to the Clubhouse</button>
			</div>
		</div>
	{/if}

	{#if gameStore.errorMessage && !gameStore.disconnected}
		<div class="toast">{gameStore.errorMessage}</div>
	{/if}

	{#if gameStore.gameState}
		<div class="scorebar">
			<span class="home"
				>{gameStore.gameState.homePlayerName}
				<strong>{gameStore.gameState.score[0]}</strong></span
			>
			<span class="turn-info">
				<span class="mark"></span>
				{#if gameStore.phase === 'playing'}
					{gameStore.isMyTurn ? 'Your turn' : "Opponent's turn"} · T{gameStore.gameState.turnNumber}
				{/if}
			</span>
			<span class="away"
				><strong>{gameStore.gameState.score[1]}</strong>
				{gameStore.gameState.awayPlayerName}</span
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
		max-width: 820px;
		margin: 0 auto;
	}

	.scorebar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.9rem 1.5rem;
		margin-bottom: 1.5rem;
		background: linear-gradient(180deg, rgba(13, 51, 38, 0.88), rgba(9, 29, 22, 0.96));
		border: 2px solid rgba(246, 236, 212, 0.14);
		box-shadow: 0 10px 28px -18px rgba(0, 0, 0, 0.85);
		font-family: var(--font-jetbrains);
		font-size: 0.8rem;
	}

	.home {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--color-home);
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.away {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--color-away);
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.home strong,
	.away strong {
		font-size: 1.5rem;
	}

	.turn-info {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-on-surface-variant);
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.turn-info .mark {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: var(--color-primary);
		box-shadow: 0 0 8px var(--color-primary);
		animation: turn 1.4s ease-in-out infinite;
	}

	@keyframes turn {
		50% {
			opacity: 0.3;
		}
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(8, 20, 16, 0.82);
		backdrop-filter: blur(6px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal {
		position: relative;
		background: linear-gradient(180deg, rgba(13, 51, 38, 0.92), rgba(9, 29, 22, 0.98));
		border: 1px solid rgba(242, 169, 59, 0.35);
		box-shadow: 0 0 0 16px rgba(9, 29, 22, 0.4), 0 24px 60px -20px rgba(0, 0, 0, 0.9);
		padding: 3rem 2.5rem;
		text-align: center;
		max-width: 480px;
		width: calc(100% - 3rem);
	}

	.modal::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(to right, #f2a93b, #f2a93b) top left / 18px 1px,
			linear-gradient(to bottom, #f2a93b, #f2a93b) top left / 1px 18px,
			linear-gradient(to right, #f2a93b, #f2a93b) top right / 18px 1px,
			linear-gradient(to bottom, #f2a93b, #f2a93b) top right / 1px 18px;
		background-repeat: no-repeat;
	}

	.modal .mono-label {
		font-size: 9px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--color-primary);
	}

	.modal .mono-label.warn {
		color: var(--color-away);
	}

	.modal h2 {
		margin-top: 0.4rem;
		font-family: var(--font-space);
		font-size: 2rem;
		color: var(--color-on-surface);
		text-transform: uppercase;
		letter-spacing: -0.02em;
	}

	.scoreline {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin: 1.5rem 0 2rem;
		color: var(--color-on-surface-variant);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.scoreline strong {
		font-family: var(--font-jetbrains);
		font-size: 1.8rem;
		color: var(--color-primary);
	}

	.note {
		margin: 1rem 0 2rem;
		color: var(--color-on-surface-variant);
		line-height: 1.6;
	}

	.modal button {
		font-family: var(--font-jetbrains);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-on-primary);
		background: var(--color-primary);
		border: 1px solid var(--color-primary);
		padding: 0.85rem 2rem;
		transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), filter 200ms ease;
	}

	.modal button:hover {
		filter: brightness(1.08);
	}

	.modal button:active {
		transform: scale(0.96);
	}

	.toast {
		position: fixed;
		top: 5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 200;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.7rem 1.2rem;
		font-family: var(--font-jetbrains);
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-error);
		background: rgba(9, 29, 22, 0.92);
		border: 1px solid rgba(248, 113, 113, 0.4);
		border-left: 3px solid var(--color-error);
		backdrop-filter: blur(8px);
		box-shadow: 0 12px 30px -16px rgba(0, 0, 0, 0.9);
	}
</style>