<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { client } from '$lib/api';
	import { getLiveRooms } from './rooms.remote';

	let { data }: { data: PageData } = $props();

	const session = authClient.useSession();
	const roomsQuery = getLiveRooms();

	let rooms = $derived(roomsQuery.current || data.rooms || []);
	let onlineCount = $state(0);
	let leaderboard = $state<{ playerId: string; playerName: string; wins: number }[]>([]);
	let newRoomName = $state('');
	let creating = $state(false);

	async function joinRoom(id: string) {
		const name = $session.data?.user.name || 'Commander';
		await goto(`/game/${id}?name=${encodeURIComponent(name)}`);
	}

	async function createRoom() {
		if (creating || !$session.data) return;
		creating = true;
		const name = $session.data.user.name;
		const roomName = newRoomName.trim() || `${name}'s Tactical Grid`;

		try {
			const res = await client.api.rooms.$post({
				json: { name: roomName },
			});
			if (res.ok) {
				const room = await res.json();
				await goto(`/game/${room.id}?name=${encodeURIComponent(name)}`);
			}
		} catch (e) {
			console.error('Error creating room:', e);
		} finally {
			creating = false;
		}
	}

	async function fetchOnlineCount() {
		try {
			const res = await client.api['online-count'].$get();
			if (res.ok) {
				const data = await res.json();
				onlineCount = data.count;
			}
		} catch {}
	}

	async function fetchLeaderboard() {
		try {
			const res = await client.api.leaderboard.$get();
			if (res.ok) {
				leaderboard = await res.json();
			}
		} catch {}
	}

	$effect(() => {
		fetchOnlineCount();
		fetchLeaderboard();
		const interval = setInterval(() => {
			fetchOnlineCount();
			fetchLeaderboard();
		}, 10000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Lobby | Cantar Ball</title>
</svelte:head>

<div class="flex flex-col gap-8 lg:flex-row">
	<!-- Room List Section -->
	<div class="flex-grow">
		<header class="mb-8 flex items-end justify-between">
			<div>
				<div
					class="mb-2 inline-block border-l-2 border-primary bg-surface-container px-3 py-1"
				>
					<span
						class="status-blink font-label-caps text-[12px] uppercase tracking-[0.2em] text-primary"
						>Live_Server_Synced</span
					>
				</div>
				<h1 class="font-display-lg text-4xl text-on-surface md:text-5xl">Tactical Lobby</h1>
			</div>
			<div class="hidden gap-4 md:flex">
				<div class="glass-panel flex flex-col items-center px-6 py-2">
					<span class="font-label-caps text-[10px] uppercase text-on-surface-variant"
						>Online</span
					>
					<span class="font-jetbrains text-xl text-primary"
						>{onlineCount.toLocaleString()}</span
					>
				</div>
				<div class="glass-panel flex flex-col items-center px-6 py-2">
					<span class="font-label-caps text-[10px] uppercase text-on-surface-variant"
						>Rooms</span
					>
					<span class="font-jetbrains text-xl text-primary">{rooms.length}</span>
				</div>
			</div>
		</header>

		<div class="space-y-4">
			<!-- Create Room Section -->
			<div class="glass-panel border-l-4 border-primary bg-surface-container/30 p-6">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="font-display-lg text-lg uppercase tracking-tight text-on-surface">
						Initialize New Tactical Grid
					</h3>
					<span class="font-label-caps text-[10px] uppercase text-primary"
						>Priority_Alpha</span
					>
				</div>
				<div class="flex flex-col gap-4 md:flex-row">
					<input
						bind:value={newRoomName}
						placeholder="ENTER GRID IDENTIFIER..."
						onkeydown={(e) => e.key === 'Enter' && createRoom()}
						class="flex-grow"
					/>
					<button
						onclick={createRoom}
						disabled={creating}
						class="bg-primary px-10 py-3 font-display-lg text-sm font-bold uppercase tracking-tighter text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
					>
						{creating ? 'Initializing...' : 'Start Session'}
					</button>
				</div>
			</div>

			{#each rooms as room}
				<div
					onclick={() => joinRoom(room.id)}
					onkeydown={(e) => e.key === 'Enter' && joinRoom(room.id)}
					role="button"
					tabindex="0"
					class="glass-panel group relative cursor-pointer overflow-hidden p-1 transition-all hover:border-primary/50"
				>
					<div
						class="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"
					></div>
					<div
						class="relative z-10 flex flex-col gap-4 p-4 md:flex-row md:items-center justify-between"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center border border-outline/30 bg-surface-container-high"
							>
								<span
									class="material-symbols-outlined text-on-surface-variant transition-colors group-hover:text-primary"
									>sports_soccer</span
								>
							</div>
							<div>
								<div
									class="font-display-lg text-body-md font-bold uppercase tracking-tight text-on-surface"
								>
									{room.name}
								</div>
								<div class="mt-1 flex gap-4">
									<span
										class="font-label-caps flex items-center gap-1 text-[10px] uppercase text-on-surface-variant"
									>
										<span class="material-symbols-outlined text-[14px]"
											>person</span
										>
										{room.player_count}/2
									</span>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-4 px-4">
							<button
								class="border border-outline bg-transparent px-8 py-3 font-label-caps text-[12px] uppercase text-on-surface transition-all hover:bg-primary hover:text-on-primary"
							>
								Join
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="glass-panel p-8 text-center font-jetbrains text-on-surface-variant">
					NO ACTIVE GRIDS DETECTED. INITIALIZE A NEW COMBAT SESSION.
				</div>
			{/each}
		</div>
	</div>

	<!-- Sidebar Leaderboard -->
	<aside class="w-full space-y-8 lg:w-80">
		<section class="glass-panel border-t-4 border-t-primary p-6">
			<h2
				class="font-display-lg text-body-md mb-6 flex items-center gap-2 border-b border-outline/20 pb-4 font-bold uppercase tracking-widest text-on-surface"
			>
				<span class="material-symbols-outlined text-primary">military_tech</span> Leaderboard
			</h2>
			{#if leaderboard.length > 0}
				<div class="space-y-4">
					{#each leaderboard as entry, i}
						<div class="group flex items-center justify-between">
							<div class="flex items-center gap-3">
								<span class="font-jetbrains text-sm {i === 0 ? 'text-primary' : 'text-on-surface-variant'}">
									{String(i + 1).padStart(2, '0')}
								</span>
								<span
									class="font-body-md text-sm font-semibold text-on-surface transition-colors group-hover:text-primary"
									>{entry.playerName}</span
								>
							</div>
							<span class="font-jetbrains text-sm text-on-surface"
								>{entry.wins} <span class="font-label-caps text-[10px] text-on-surface-variant"
									>W</span
								></span
							>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center text-sm text-on-surface-variant">
					No matches played yet.
				</p>
			{/if}
		</section>
	</aside>
</div>
