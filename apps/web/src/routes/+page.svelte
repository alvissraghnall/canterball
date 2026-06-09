<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { playerName } from '$lib/stores/game';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let createName = $state('');
	let joinName = $state('');
	let rooms = $derived(data.rooms || []);
	let loading = $state(false);

	$effect(() => {
		if ($playerName) {
			createName = $playerName;
			joinName = $playerName;
		}
	});

	async function createRoom() {
		const name = createName.trim() || 'Player';
		playerName.set(name);
		const server = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';
		const res = await fetch(`${server}/api/rooms`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: `${name}'s room` }),
		});
		if (res.ok) {
			const room = await res.json();
			goto(`/game/${room.id}?name=${encodeURIComponent(name)}`);
		}
	}

	function joinRoom(id: string) {
		const name = joinName.trim() || 'Player';
		playerName.set(name);
		goto(`/game/${id}?name=${encodeURIComponent(name)}`);
	}

	async function refreshRooms() {
		loading = true;
		await invalidateAll();
		loading = false;
	}
</script>

<div class="home">
	<section class="hero">
		<h2>Turn-based tabletop football</h2>
		<p>Control 11 pieces, take shots, score goals. Two players, one match.</p>
	</section>

	<div class="panels">
		<div class="panel">
			<h3>Create Room</h3>
			<input
				bind:value={createName}
				placeholder="Your name"
				onkeydown={(e) => e.key === 'Enter' && createRoom()}
			/>
			<button onclick={createRoom}>Create</button>
		</div>

		<div class="panel">
			<h3>Join Room</h3>
			<input
				bind:value={joinName}
				placeholder="Your name"
				onkeydown={(e) => e.key === 'Enter' && rooms.length > 0 && joinRoom(rooms[0].id)}
			/>
			<div class="room-list">
				{#if loading}
					<p class="muted">Loading rooms...</p>
				{:else if rooms.length === 0}
					<p class="muted">No open rooms. Create one!</p>
				{:else}
					{#each rooms as room}
						<button class="room-btn" onclick={() => joinRoom(room.id)}>
							{room.name} ({room.player_count}/2)
						</button>
					{/each}
				{/if}
			</div>
			<button class="refresh" onclick={refreshRooms}> Refresh </button>
		</div>
	</div>
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.hero {
		text-align: center;
	}

	.hero h2 {
		font-size: 1.3rem;
		margin-bottom: 0.5rem;
	}

	.hero p {
		color: #888;
		font-size: 0.9rem;
	}

	.panels {
		display: flex;
		gap: 2rem;
		width: 100%;
		max-width: 600px;
	}

	.panel {
		flex: 1;
		background: #16213e;
		padding: 1.5rem;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.panel h3 {
		font-size: 1rem;
		color: #e94560;
	}

	.room-list {
		max-height: 200px;
		overflow-y: auto;
	}

	.room-btn {
		width: 100%;
		text-align: left;
		background: #0f3460;
		margin-bottom: 0.4rem;
		font-size: 0.9rem;
	}

	.room-btn:hover {
		background: #1a4a7a;
	}

	.muted {
		color: #666;
		font-size: 0.85rem;
	}

	.refresh {
		background: transparent;
		border: 1px solid #333;
		font-size: 0.85rem;
		padding: 0.4rem 1rem;
	}
</style>
