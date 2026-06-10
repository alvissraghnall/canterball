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

<section class="border-y border-outline-variant bg-surface-container-low py-20">
	<div class="mx-auto grid max-w-360 grid-cols-1 gap-8 px-6 md:grid-cols-2 lg:grid-cols-4">
		<div class="p-6 text-center">
			<p class="mb-2 font-jetbrains text-xs tracking-widest text-tertiary uppercase">
				Active Matches
			</p>
			<p class="text-3xl font-bold text-white">{matches.toLocaleString()}</p>
			<div class="mx-auto mt-4 h-1 w-12 bg-lemon-lime"></div>
		</div>
		<div class="p-6 text-center">
			<p class="mb-2 font-jetbrains text-xs tracking-widest text-tertiary uppercase">
				Players Online
			</p>
			<p class="text-3xl font-bold text-white">{players.toLocaleString()}</p>
			<div class="mx-auto mt-4 h-1 w-12 bg-dusty-grape"></div>
		</div>
		<div class="p-6 text-center">
			<p class="mb-2 font-jetbrains text-xs tracking-widest text-tertiary uppercase">
				Global Rank Avg
			</p>
			<p class="text-3xl font-bold text-white">ELITE II</p>
			<div class="mx-auto mt-4 h-1 w-12 bg-outline"></div>
		</div>
		<div class="p-6 text-center">
			<p class="mb-2 font-jetbrains text-xs tracking-widest text-tertiary uppercase">
				Server Latency
			</p>
			<p class="text-3xl font-bold text-lemon-lime">14ms</p>
			<div class="mx-auto mt-4 h-1 w-12 bg-lemon-lime"></div>
		</div>
	</div>
</section>
