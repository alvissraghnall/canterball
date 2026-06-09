<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { playerName } from '$lib/stores/game';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { client } from '$lib/api';

	let { data }: { data: PageData } = $props();

	let createName = $state('');
	let joinName = $state('');
	let loading = $state(false);
	let navigating = $state(false);

	// Derived rooms from props data
	let rooms = $derived(data.rooms || []);

	onMount(() => {
		const savedName = get(playerName);
		if (savedName) {
			createName = savedName;
			joinName = savedName;
		}
	});

	async function createRoom() {
		if (navigating) return;
		const name = createName.trim() || 'Player';
		playerName.set(name);
		navigating = true;

		try {
			const res = await client.api.rooms.$post({
				json: { name: `${name}'s room` },
			});
			if (res.ok) {
				const room = await res.json();
				await goto(`/game/${room.id}?name=${encodeURIComponent(name)}`);
			}
		} catch (e) {
			console.error('Error creating room:', e);
		} finally {
			navigating = false;
		}
	}

	async function joinRoom(id: string) {
		if (navigating) return;
		const name = joinName.trim() || 'Player';
		playerName.set(name);
		navigating = true;
		try {
			await goto(`/game/${id}?name=${encodeURIComponent(name)}`);
		} catch (e) {
			console.error('Error joining room:', e);
		} finally {
			navigating = false;
		}
	}

	async function refreshRooms() {
		loading = true;
		try {
			await invalidateAll();
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex flex-col items-center gap-8">
	<section class="text-center">
		<h2 class="mb-2 text-xl font-semibold">Turn-based tabletop football</h2>
		<p class="text-sm text-gray-400">
			Control 11 pieces, take shots, score goals. Two players, one match.
		</p>
	</section>

	<div class="flex w-full max-w-2xl gap-8">
		<div class="flex flex-1 flex-col gap-3 rounded-lg bg-panel-dark p-6">
			<h3 class="text-base font-bold text-primary">Create Room</h3>
			<input
				bind:value={createName}
				placeholder="Your name"
				disabled={navigating}
				onkeydown={(e) => e.key === 'Enter' && createRoom()}
				class="w-full"
			/>
			<button onclick={createRoom} disabled={navigating || !createName.trim()} class="w-full">
				{navigating ? 'Creating...' : 'Create'}
			</button>
		</div>

		<div class="flex flex-1 flex-col gap-3 rounded-lg bg-panel-dark p-6">
			<h3 class="text-base font-bold text-primary">Join Room</h3>
			<input
				bind:value={joinName}
				placeholder="Your name"
				disabled={navigating}
				onkeydown={(e) => e.key === 'Enter' && rooms.length > 0 && joinRoom(rooms[0].id)}
				class="w-full"
			/>
			<div class="max-h-52 overflow-y-auto">
				{#if loading}
					<p class="p-4 text-center text-sm text-gray-500">Loading rooms...</p>
				{:else if rooms.length === 0}
					<p class="p-4 text-center text-sm text-gray-500">No open rooms. Create one!</p>
				{:else}
					{#each rooms as room}
						<button
							class="mb-2 w-full rounded bg-[#0f3460] px-4 py-2 text-left text-sm transition-colors hover:bg-[#1a4a7a] disabled:opacity-60"
							onclick={() => joinRoom(room.id)}
							disabled={navigating}
						>
							{room.name} ({room.player_count}/2)
						</button>
					{/each}
				{/if}
			</div>
			<button
				class="mt-auto border border-[#333] bg-transparent text-sm text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
				onclick={refreshRooms}
				disabled={loading || navigating}
			>
				Refresh
			</button>
		</div>
	</div>
</div>
