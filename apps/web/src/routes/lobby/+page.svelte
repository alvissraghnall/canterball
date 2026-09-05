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
	<title>Pickup Matches | Cantar Ball</title>
</svelte:head>

<div class="flex flex-col gap-8 lg:flex-row">
	<!-- Match List -->
	<div class="min-w-0 flex-grow">
		<header class="mb-8 flex items-end justify-between gap-6">
			<div>
				<div class="signal mb-4 w-fit">
					<span class="dot"></span>
					The Fishbowl · Match Day
				</div>
				<h1 class="font-space text-3xl font-bold text-on-surface md:text-5xl">
					Pickup Matches
				</h1>
			</div>
			<div class="hidden gap-4 md:flex">
				<div class="panel corners flex flex-col items-center px-6 py-3">
					<span class="mono-label text-[8px]">On the Pitch</span>
					<span class="mt-1 font-jetbrains text-xl text-primary"
						>{onlineCount.toLocaleString()}</span
					>
				</div>
				<div class="panel corners flex flex-col items-center px-6 py-3">
					<span class="mono-label text-[8px]">Open Games</span>
					<span class="mt-1 font-jetbrains text-xl text-primary">{rooms.length}</span>
				</div>
			</div>
		</header>

		<div class="space-y-4">
			<!-- Host a match -->
			<div class="panel border-primary/60 p-6">
				<div class="mb-4 flex items-center justify-between gap-4">
					<h3 class="font-space text-lg font-bold text-on-surface">
						Host a Pickup Match
					</h3>
					<span class="mono-label text-[8px] text-primary/80">Host's Honour</span>
				</div>
				<div class="flex flex-col gap-4 md:flex-row">
					<input
						bind:value={newRoomName}
						placeholder="Name your pitch…"
						onkeydown={(e) => e.key === 'Enter' && createRoom()}
						class="min-w-0 flex-1"
					/>
					<button onclick={createRoom} disabled={creating} class="btn md:shrink-0">
						{creating ? 'Laying the felt…' : 'Stick the Cones'}
						<span class="material-symbols-outlined text-[18px]">sports_soccer</span>
					</button>
				</div>
			</div>

			{#each rooms as room}
				<div
					onclick={() => joinRoom(room.id)}
					onkeydown={(e) => e.key === 'Enter' && joinRoom(room.id)}
					role="button"
					tabindex="0"
					class="panel corners group flex cursor-pointer flex-col gap-4 p-5 transition-colors duration-300 hover:border-primary/40 sm:flex-row sm:items-center"
				>
					<div class="flex min-w-0 items-center gap-4">
						<div
							class="icon-tile shrink-0 transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary"
						>
							<span class="material-symbols-outlined">sports_soccer</span>
						</div>
						<div class="min-w-0">
							<div
								class="truncate font-space text-base font-bold tracking-tight text-on-surface uppercase transition-colors duration-300 group-hover:text-primary"
							>
								{room.name}
							</div>
							<div class="mt-1 flex items-center gap-4">
								<span
									class="mono-label flex items-center gap-1.5 text-[9px] normal-case"
								>
									<span class="material-symbols-outlined text-[13px]">person</span>
									{room.player_count}/2
								</span>
								<span class="mono-label hidden items-center gap-1.5 text-[9px] normal-case sm:flex">
									<span class="material-symbols-outlined text-[13px]">flag</span>
									PITCH-{room.id.slice(0, 6)}
								</span>
							</div>
						</div>
					</div>

					<span
						class="mono-label flex items-center justify-center gap-1.5 border border-outline/40 px-6 py-3 text-[10px] transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary sm:ml-auto"
					>
						Join
						<span class="material-symbols-outlined text-[15px]">arrow_right_alt</span>
					</span>
				</div>
			{:else}
				<div class="panel flex flex-col items-center gap-3 border-dashed p-10 text-center">
					<span class="material-symbols-outlined text-3xl text-on-surface-variant/70"
						>corners</span
					>
					<p class="mono-label mt-2 text-[11px] text-on-surface-variant">
						No pickup games yet
					</p>
					<p class="text-sm text-on-surface-variant">
						Lay the felt and be the first to host a match tonight.
					</p>
					<button onclick={createRoom} class="btn btn-sm mt-2">Host the First Match</button>
				</div>
			{/each}
		</div>
	</div>

	<!-- Local Legends -->
	<aside class="w-full space-y-8 lg:w-80">
		<section class="panel corners overflow-hidden">
			<header
				class="flex items-center justify-between border-b border-outline/20 bg-primary/5 px-6 py-4"
			>
				<h2 class="font-space text-sm font-bold tracking-widest text-on-surface uppercase">
					Local Legends
				</h2>
				<span class="material-symbols-outlined text-primary">military_tech</span>
			</header>

			{#if leaderboard.length > 0}
				<ol class="divide-y divide-outline/10">
					{#each leaderboard as entry, i}
						<li
							class="flex items-center justify-between px-6 py-4 transition-colors duration-200 hover:bg-surface-container/60"
						>
							<div class="flex items-center gap-4">
								<span
									class="font-jetbrains text-sm {i === 0
										? 'text-primary'
										: 'text-on-surface-variant/70'}"
									>{String(i + 1).padStart(2, '0')}</span
								>
								<span class="text-sm font-medium text-on-surface"
									>{entry.playerName}</span
								>
							</div>
							<span class="font-jetbrains text-sm text-on-surface"
								>{entry.wins}<span class="mono-label ml-1 text-[8px] text-on-surface-variant/70"
									>W</span
								></span
							>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="px-6 py-10 text-center text-sm text-on-surface-variant">
					No matches played yet.
				</p>
			{/if}
		</section>
	</aside>
</div>