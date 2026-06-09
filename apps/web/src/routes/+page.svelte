<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { playerName } from '$lib/stores/game';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { client } from '$lib/api';
	import Stats from '$lib/components/Stats.svelte';
	import Features from '$lib/components/Features.svelte';

	let { data }: { data: PageData } = $props();

	let createName = $state('');
	let joinName = $state('');
	let loading = $state(false);
	let navigating = $state(false);

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

<!-- Hero Section -->
<section
	class="hud-scanline relative flex min-h-[85vh] flex-col items-center justify-center px-[24px] text-center"
>
	<!-- Background Visual -->
	<div class="absolute inset-0 z-0 opacity-30">
		<div
			class="absolute inset-0 bg-gradient-to-t from-blue-slate-950 via-transparent to-transparent"
		></div>
		<img
			class="h-full w-full object-cover"
			alt="Futuristic digital football pitch"
			src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpOUtbr_S0EAzs45i3-M5Yante5O0rdMEW0u8Hjg4N7I5QuI3DFQZxb-hKBl8DiwmwCCgfoNDKqKxyunLx3EGt1-_4MG05iqyN4dGWp0O-srMt_EWZOIrcXxeZN5rTMk2LFkSUyFPmj_cgbn_2XdSafShOnDgGPmVJMGS4wfnIWTz7XqWpPkBZReQpMxSmSlgEi7_BvFqOSmWdmBNqOKXs6M1G8csFabCb9NRGvPmLcDtSwSN8aG8a-jyWEwyHsKv_GFd1Fl2NAKQ"
		/>
	</div>

	<div class="relative z-10 mx-auto max-w-5xl">
		<div class="mb-4 flex justify-center">
			<div class="rounded-full border border-lemon-lime/30 bg-lemon-lime/10 px-4 py-1">
				<span class="font-jetbrains text-[10px] tracking-widest text-lemon-lime uppercase"
					>Combat Sport Protocol v2.4</span
				>
			</div>
		</div>
		<h1 class="mb-4 text-5xl leading-none tracking-tighter text-white md:text-7xl">
			CANTAR BALL: <span class="text-lemon-lime">TACTICAL PITCH</span> DOMINANCE
		</h1>
		<p class="mx-auto mb-8 max-w-2xl text-lg text-on-surface-variant">
			Master the high-stakes intersection of strategic maneuvering and split-second reflexes
			in the galaxy's premier tactical ball combat arena.
		</p>

		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<a
				href="#lobby"
				class="group flex items-center gap-2 rounded-none bg-lemon-lime px-12 py-4 font-jetbrains text-sm font-bold text-black transition-all hover:brightness-110 active:scale-95 no-underline"
			>
				ENTER THE ARENA
				<span
					class="material-symbols-outlined transition-transform group-hover:translate-x-1"
					>bolt</span
				>
			</a>
			<button
				class="rounded-none border border-dusty-grape bg-blue-slate-900/50 px-12 py-4 font-jetbrains text-sm text-white transition-all hover:bg-dusty-grape/20"
			>
				VIEW TACTICS
			</button>
		</div>
	</div>

	<!-- Scroll Prompt -->
	<div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
		<span class="material-symbols-outlined text-outline">expand_more</span>
	</div>
</section>

<!-- Functional Lobby Section -->
<section id="lobby" class="bg-blue-slate-950 py-24 px-[24px]">
	<div class="mx-auto max-w-[1440px]">
		<div class="mb-12 flex items-center gap-4">
			<div class="h-[1px] flex-grow bg-outline-variant"></div>
			<h2 class="text-sm tracking-widest text-primary uppercase">Active Deployments</h2>
			<div class="h-[1px] flex-grow bg-outline-variant"></div>
		</div>

		<div class="mx-auto flex w-full max-w-4xl flex-col gap-8 md:flex-row">
			<div
				class="flex flex-1 flex-col gap-4 border border-outline-variant bg-blue-slate-900 p-8"
			>
				<h3 class="font-jetbrains text-base text-primary uppercase">
					Create Tactical Unit
				</h3>
				<p class="text-sm text-on-surface-variant">
					Initialize a new combat session on the grid.
				</p>
				<input
					bind:value={createName}
					placeholder="COMMANDER NAME"
					disabled={navigating}
					onkeydown={(e) => e.key === 'Enter' && createRoom()}
					class="w-full"
				/>
				<button
					onclick={createRoom}
					disabled={navigating || !createName.trim()}
					class="w-full rounded-none font-jetbrains text-sm"
				>
					{navigating ? 'INITIALIZING...' : 'START SESSION'}
				</button>
			</div>

			<div
				class="flex flex-1 flex-col gap-4 border border-outline-variant bg-blue-slate-900 p-8"
			>
				<h3 class="font-jetbrains text-base text-primary uppercase">Join Active Grid</h3>
				<p class="text-sm text-on-surface-variant">
					Deploy to an existing tactical environment.
				</p>
				<input
					bind:value={joinName}
					placeholder="COMMANDER NAME"
					disabled={navigating}
					onkeydown={(e) =>
						e.key === 'Enter' && rooms.length > 0 && joinRoom(rooms[0].id)}
					class="w-full"
				/>
				<div class="max-h-52 overflow-y-auto">
					{#if loading}
						<p class="p-4 text-center font-jetbrains text-xs text-gray-500">
							SCANNING...
						</p>
					{:else if rooms.length === 0}
						<p class="p-4 text-center font-jetbrains text-xs text-gray-500">
							NO ACTIVE GRIDS DETECTED.
						</p>
					{:else}
						{#each rooms as room}
							<button
								class="mb-2 w-full rounded-none border border-outline-variant bg-blue-slate-950 px-4 py-3 text-left font-jetbrains text-xs transition-colors hover:border-lemon-lime hover:text-lemon-lime disabled:opacity-60"
								onclick={() => joinRoom(room.id)}
								disabled={navigating}
							>
								{room.name.toUpperCase()} [{room.player_count}/2]
							</button>
						{/each}
					{/if}
				</div>
				<button
					class="mt-auto rounded-none border border-[#333] bg-transparent font-jetbrains text-xs text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
					onclick={refreshRooms}
					disabled={loading || navigating}
				>
					REFRESH SCAN
				</button>
			</div>
		</div>
	</div>
</section>

<Features />

<Stats />

<!-- CTA Section -->
<section class="relative overflow-hidden py-24 px-[24px]">
	<div class="absolute inset-0 z-0">
		<img
			class="h-full w-full object-cover opacity-20 grayscale"
			alt="Digital landscape"
			src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTcplLhSPjMcgKIp8eQS8tgAszPCxl58NNOUFZ8vmm1hfJ0Ssdzz3OUxv1cLasAg1q4OTSQo_FswrHkmS4ANfzLcicLaluln7-0Z8Frj59M0u1KoupV1XodNK2gIeig__xAWKiN7HyDvPap4iZy16eQcWnf-yFNgTWUReQ6IboQH74XMtjp5ANAS2mT93E_44qoNpGQwflwqrfc_Zb1AVMd9QbjOj2UWLuZtyMy8njDzzIChiXP5NQdwIh8UuTW4V-wf8FVvVWZE4"
		/>
	</div>
	<div
		class="relative z-10 mx-auto max-w-4xl border-2 border-lemon-lime bg-blue-slate-950/80 p-12 text-center backdrop-blur-md"
	>
		<h2 class="mb-6 text-3xl leading-none tracking-tight text-white uppercase">
			Ready to rewrite the pitch?
		</h2>
		<p class="mx-auto mb-8 max-w-xl text-on-surface-variant">
			Join thousands of commanders in the most sophisticated tactical sports engine ever
			built. No downloads. Direct browser access.
		</p>
		<button
			class="rounded-none bg-lemon-lime px-16 py-5 font-jetbrains text-sm font-bold text-black hover:shadow-[0_0_30px_rgba(217,255,0,0.4)]"
		>
			START MATCHMAKING
		</button>
	</div>
</section>
