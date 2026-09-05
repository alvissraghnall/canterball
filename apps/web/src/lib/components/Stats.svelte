<script lang="ts">
	import { onMount } from 'svelte';

	let matches = $state(1100);
	let players = $state(23000);

	onMount(() => {
		const duration = 2000;
		const targetMatches = 1248;
		const targetPlayers = 24592;

		const startTime = Date.now();

		const interval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			matches = Math.round(progress * (targetMatches - 1100) + 1100);
			players = Math.round(progress * (targetPlayers - 23000) + 23000);

			if (progress === 1) clearInterval(interval);
		}, 16);

		const jitterInterval = setInterval(() => {
			players += Math.floor(Math.random() * 21) - 10;
		}, 3000);

		return () => {
			clearInterval(interval);
			clearInterval(jitterInterval);
		};
	});
</script>

<section class="relative border-y-2 border-black/30 bg-surface-container/60 py-16 overflow-hidden">
	<div class="hazard absolute inset-x-0 top-0"></div>

	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-10 flex items-center gap-4">
			<span class="mono-label text-primary">Scoreboard</span>
			<div class="hazard h-[4px] flex-1"></div>
			<span class="mono-label hidden sm:block">League Telemetry · Live</span>
		</div>

		<div class="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
			<div class="relative px-4 text-center">
				<div class="mono-label text-[9px]">Matches This Week</div>
				<div class="mt-3 font-space text-4xl font-bold text-on-surface md:text-5xl">
					{matches.toLocaleString()}
				</div>
				<div class="mx-auto mt-4 h-[4px] w-12 rounded-full bg-on-surface-variant/40"></div>
			</div>

			<div class="relative px-4 text-center">
				<div class="mono-label text-[9px]">Players Kicking About</div>
				<div
					class="mt-3 font-space text-4xl font-bold text-primary drop-shadow-[0_0_16px_rgba(242,169,59,0.35)] md:text-5xl"
				>
					{players.toLocaleString()}
				</div>
				<div class="mx-auto mt-4 h-[4px] w-12 rounded-full bg-primary"></div>
			</div>

			<div class="relative px-4 text-center">
				<div class="mono-label text-[9px]">Average Form</div>
				<div class="mt-3 font-space text-4xl font-bold text-away md:text-5xl">
					SECOND-HALF HERO
				</div>
				<div class="mx-auto mt-4 h-[4px] w-12 rounded-full bg-away/60"></div>
			</div>

			<div class="relative px-4 text-center">
				<div class="mono-label text-[9px]">Server Ping</div>
				<div
					class="mt-3 font-space text-4xl font-bold text-primary drop-shadow-[0_0_16px_rgba(242,169,59,0.35)] md:text-5xl"
				>
					14ms
				</div>
				<div class="mx-auto mt-4 h-[4px] w-12 rounded-full bg-primary"></div>
			</div>
		</div>
	</div>
</section>