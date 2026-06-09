<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { GameConnection } from '$lib/game/ws';
  import {
    gameState,
    playerId,
    playerSide,
    playerName,
    phase,
    shotPath,
    shotAnimating,
    goalieWindowActive,
    errorMessage,
    isMyTurn,
    resetStores,
  } from '$lib/stores/game';
  import type { ServerOutMessage, GameState, Team } from '@canterball/shared';
  import GameBoard from '$lib/components/GameBoard.svelte';

  let conn: GameConnection;

  $: roomId = $page.params.id || '';
  $: playerNameVal = $page.url.searchParams.get('name') || 'Player';

  onMount(() => {
    if (!roomId) return;
    playerName.set(playerNameVal);
    conn = new GameConnection();
    conn.connect(roomId, playerNameVal);
    conn.onMessage(handleMessage);
  });

  onDestroy(() => {
    conn?.disconnect();
    resetStores();
  });

  function handleMessage(msg: ServerOutMessage) {
    switch (msg.type) {
      case 'ROOM_JOINED':
        playerId.set(msg.playerId);
        playerSide.set(msg.playerSide);
        break;

      case 'STATE_UPDATE':
        gameState.set(msg.state);
        phase.set('playing');
        break;

      case 'GOALIE_WINDOW':
        goalieWindowActive.set(true);
        setTimeout(() => goalieWindowActive.set(false), msg.durationMs);
        break;

      case 'SHOT_RESOLVED': {
        const path = msg.path.map((p) => p);
        shotPath.set(path);
        shotAnimating.set(true);
        setTimeout(() => {
          shotAnimating.set(false);
          shotPath.set([]);
        }, 2000);
        break;
      }

      case 'GAME_OVER':
        phase.set('finished');
        break;

      case 'ERROR':
        errorMessage.set(msg.message);
        setTimeout(() => errorMessage.set(null), 3000);
        break;

      case 'OPPONENT_DISCONNECTED':
        errorMessage.set('Opponent disconnected');
        setTimeout(() => goto('/'), 3000);
        break;
    }
  }

  function handleMovePiece(pieceId: string, x: number, y: number) {
    conn.send({ type: 'MOVE_PIECE', pieceId, targetX: x, targetY: y });
  }

  function handleDeclareShot(pieceId: string, targetX: number, targetY: number, power: number) {
    conn.send({ type: 'DECLARE_SHOT', pieceId, targetX, targetY, power });
  }

  function handleRepositionGoalie(x: number, y: number) {
    conn.send({ type: 'REPOSITION_GOALIE', x, y });
  }
</script>

<div class="game-page">
  {#if $phase === 'finished'}
    <div class="overlay">
      <div class="modal">
        <h2>Game Over</h2>
        {#if $gameState}
          <p>{$gameState.homePlayerName} {$gameState.score[0]} - {$gameState.score[1]} {$gameState.awayPlayerName}</p>
        {/if}
        <button onclick={() => goto('/')}>Back to Lobby</button>
      </div>
    </div>
  {/if}

  {#if $errorMessage}
    <div class="toast">{$errorMessage}</div>
  {/if}

  {#if $gameState}
    <div class="scorebar">
      <span class="home">{$gameState.homePlayerName} <strong>{$gameState.score[0]}</strong></span>
      <span class="turn-info">
        {#if $goalieWindowActive}
          <span class="goalie-hint">Goalie window!</span>
        {:else if $shotAnimating}
          <span class="shot-hint">Shot in flight...</span>
        {:else if $phase === 'playing'}
          {$isMyTurn ? 'Your turn' : 'Opponent\'s turn'}
          (turn {$gameState.turnNumber})
        {/if}
      </span>
      <span class="away"><strong>{$gameState.score[1]}</strong> {$gameState.awayPlayerName}</span>
    </div>
  {/if}

  <GameBoard
    state={$gameState}
    mySide={$playerSide}
    isMyTurn={$isMyTurn}
    shotPath={$shotPath}
    shotAnimating={$shotAnimating}
    goalieWindowActive={$goalieWindowActive}
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
    from { opacity: 0.5; }
    to { opacity: 1; }
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
