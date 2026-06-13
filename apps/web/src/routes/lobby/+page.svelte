<script lang="ts">
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	import { client } from '$lib/api';

	import { getLiveRooms } from './rooms.remote';

	let { data }: { data: PageData } = $props();

	const session = authClient.useSession();
	const roomsQuery = getLiveRooms();

	let rooms = $derived(roomsQuery.current || data.rooms || []);
	let onlineCount = $state(1248);
	let tournamentTimer = $state('12:04:45');
	let newRoomName = $state('');
	let creating = $state(false);

	// Room joining logic
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

	// Browser-side simulations
	$effect(() => {
		if (!browser) return;

		const timerInterval = setInterval(() => {
			let [h, m, s] = tournamentTimer.split(':').map(Number);
			s--;
			if (s < 0) {
				s = 59;
				m--;
			}
			if (m < 0) {
				m = 59;
				h--;
			}
			if (h < 0) h = 0;
			tournamentTimer = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
		}, 1000);

		return () => {
			clearInterval(timerInterval);
		};
	});
</script>

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
											>map</span
										> Tactical Zone
									</span>
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
						<div class="flex items-center gap-8 px-4">
							<div class="text-right">
								<div
									class="font-label-caps mb-1 text-[10px] uppercase text-on-surface-variant"
								>
									Latency
								</div>
								<div class="font-jetbrains text-lg text-primary">24ms</div>
							</div>
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

		<div class="group relative mt-8 h-64 overflow-hidden border border-outline/20">
			<img
				class="h-full w-full object-cover brightness-75 contrast-125 transition-transform duration-1000 group-hover:scale-110"
				alt="A futuristic soccer stadium"
				src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOi03lQeUpN6Y5fN-PiuNjYDPzkf5vHIj7V4LwaKPeBRIXEUzzboVZUCqLEyLwUUuWV-akJwzlteicS0FlpXOiTVlVRkV1FFetL-Tn7jSW-68hK2Gi0PfOLeX_z_ZNFGxTF2qNe-d_gzpjkNLewoT914wy1n0hIGJERhIoqb-QBkgVFJEoSYqRW4J2y43b7OVY04Eh_UBvkZNg-rbuFVPmxejQ20koAxfbFgmNHVqCj2No2lruLPr4eJLTLHKeOO3JHmemV18XSAU"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"
			></div>
			<div class="absolute bottom-6 left-6">
				<div
					class="font-label-caps mb-1 text-[12px] uppercase tracking-widest text-primary"
				>
					Latest_Intel
				</div>
				<h3 class="font-display-lg text-2xl uppercase tracking-tight text-on-surface">
					The 2024 Tactical Open Starts in 4 days
				</h3>
			</div>
		</div>
	</div>

	<!-- Sidebar Stats/Leaderboard -->
	<aside class="w-full space-y-8 lg:w-80">
		<section class="glass-panel border-t-4 border-t-primary p-6">
			<h2
				class="font-display-lg text-body-md mb-6 flex items-center gap-2 border-b border-outline/20 pb-4 font-bold uppercase tracking-widest text-on-surface"
			>
				<span class="material-symbols-outlined text-primary">military_tech</span> Global Leaderboard
			</h2>
			<div class="space-y-4">
				<div class="group flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="font-jetbrains text-sm text-primary">01</span>
						<div class="w-8 h-8 rounded border border-primary/40 p-[1px]">
							<img
								alt="Top Player Avatar"
								class="h-full w-full object-cover"
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbpgT9qj2G0Xwj-eUUfDhhEi-zcnt7wKib2qOok9RSSOQRTxiW4NovQBCL_mTtsqrSRJS6LJ76G4YBnKUl2thwrSTU4tM5DKr2ZuDiemosDO1oerDsLRJIoX_5qK74ZANLSIuBiciyyCOLbYZohw6XjyLNBfM1vF5tY3uacSD88zygiQjEQyx0S6T5kv5B8bEgSWaLJlx6ZtyaxMbtOiysf65BqwpEuGEqfgg5NhYGflfdMY_ndroR2YKLWMQyPX5YTJyU4Jv9pRo"
							/>
						</div>
						<span
							class="font-body-md text-sm font-semibold text-on-surface transition-colors group-hover:text-primary"
							>TacticalMind</span
						>
					</div>
					<span class="font-jetbrains text-sm text-on-surface"
						>2,850 <span class="font-label-caps text-[10px] text-on-surface-variant"
							>LP</span
						></span
					>
				</div>
				<div class="group flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="font-jetbrains text-sm text-on-surface-variant">02</span>
						<div class="w-8 h-8 rounded border border-outline/40 p-[1px]">
							<img
								alt="Second Player Avatar"
								class="h-full w-full object-cover"
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3BWh6dDQ00nHCXAJqY_sxdxOB-Oe70sQvDfWuw6XoynA0kz2OwYQOaGFip3de4XowKCokU5ii04rhHdJgUXqD2ZSGvCQUQsF8Lw7VxR8uzdNvDFsIjYRzjBXLOSlTLw1Y_uGJpx9GfOb3DBotH8JrEa7Ih-813gLcJYXFvOL-xUpzNIFBt-M3pL5hDf-BM7G2_vbzWJzEjEuHuSgoZ3tx8ncrhcLRrIYSD9hmQhpEV4u9pgba6zzTNuFfhR_zS7WoBri81pt_0I8"
							/>
						</div>
						<span
							class="font-body-md text-sm font-semibold text-on-surface transition-colors group-hover:text-primary"
							>HexStriker</span
						>
					</div>
					<span class="font-jetbrains text-sm text-on-surface"
						>2,720 <span class="font-label-caps text-[10px] text-on-surface-variant"
							>LP</span
						></span
					>
				</div>
			</div>
			<button
				class="mt-6 w-full border border-outline/20 py-2 font-label-caps text-[10px] uppercase text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
				>View All Rankings</button
			>
		</section>

		<section class="glass-panel p-6">
			<h2
				class="font-display-lg text-body-md mb-6 border-b border-outline/20 pb-4 font-bold uppercase tracking-widest text-on-surface"
			>
				Tactical Status
			</h2>
			<div class="space-y-4">
				<div class="border-l-2 border-primary bg-surface-container p-4">
					<div class="font-label-caps text-[10px] uppercase text-on-surface-variant mb-1">
						Next Tournament
					</div>
					<div class="font-display-lg text-sm font-bold uppercase text-on-surface">
						Grand Stadium Cup
					</div>
					<div class="font-jetbrains mt-2 text-primary">{tournamentTimer}</div>
				</div>
				<div class="border-l-2 border-on-surface-variant bg-surface-container p-4">
					<div class="font-label-caps text-[10px] uppercase text-on-surface-variant mb-1">
						Server Region
					</div>
					<div class="font-display-lg text-sm font-bold uppercase text-on-surface">
						EU-CENTRAL-01
					</div>
					<div class="mt-2 flex gap-1">
						<div class="h-3 w-1 bg-primary"></div>
						<div class="h-3 w-1 bg-primary"></div>
						<div class="h-3 w-1 bg-primary"></div>
						<div class="h-3 w-1 bg-outline/40"></div>
					</div>
				</div>
			</div>
		</section>
	</aside>
</div>
