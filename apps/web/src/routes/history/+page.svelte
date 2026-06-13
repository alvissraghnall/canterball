<script lang="ts">
	import { onMount } from 'svelte';

	let xpWidth = $state(0);

	onMount(() => {
		// Animate XP bar after a short delay
		setTimeout(() => {
			xpWidth = 85;
		}, 500);
	});
</script>

<svelte:head>
	<title>Match History | Cantar Ball</title>
</svelte:head>

<div class="relative z-10 flex flex-col items-center justify-center">
	<!-- Result Header -->
	<div class="mb-8 text-center">
		<span class="font-jetbrains mb-2 block text-xs tracking-[0.2em] text-primary"
			>MATCH CONCLUDED</span
		>
		<div class="flex items-center justify-center gap-gutter md:gap-16">
			<div class="flex flex-col items-center">
				<div
					class="glass-panel mb-4 flex h-20 w-20 items-center justify-center border-2 border-primary/20 md:h-24 md:w-24"
				>
					<span class="material-symbols-outlined text-4xl text-primary">shield</span>
				</div>
				<span class="font-space text-2xl font-semibold text-primary">ATHLETI</span>
			</div>
			<div class="flex flex-col items-center">
				<div class="font-space flex items-baseline gap-4 text-3xl font-bold md:text-5xl">
					<span class="text-primary drop-shadow-[0_0_15px_rgba(217,249,157,0.4)]">2</span>
					<span class="text-on-surface-variant text-3xl opacity-30">-</span>
					<span class="text-on-surface opacity-80">1</span>
				</div>
				<div
					class="font-jetbrains mt-2 bg-primary-container px-3 py-1 text-[10px] text-on-primary-container"
				>
					VICTORY
				</div>
			</div>
			<div class="flex flex-col items-center">
				<div
					class="glass-panel mb-4 flex h-20 w-20 items-center justify-center border-2 border-on-surface-variant/10 md:h-24 md:w-24"
				>
					<span class="material-symbols-outlined text-4xl text-on-surface-variant"
						>swords</span
					>
				</div>
				<span class="font-space text-2xl font-semibold text-on-surface-variant">VULCAN</span
				>
			</div>
		</div>
	</div>

	<!-- Bento Grid Layout -->
	<div class="grid w-full max-w-6xl grid-cols-1 gap-gutter md:grid-cols-12">
		<!-- MVP Card -->
		<div
			class="glass-panel group relative flex flex-col overflow-hidden border border-outline-variant/30 p-gutter md:col-span-4"
		>
			<div class="absolute right-0 top-0 p-2 opacity-10">
				<span class="material-symbols-outlined rotate-12 text-6xl text-primary"
					>workspace_premium</span
				>
			</div>
			<h3 class="font-jetbrains mb-6 flex items-center gap-2 text-xs text-on-surface-variant">
				<span class="material-symbols-outlined text-sm text-primary">star</span>
				MATCH MVP
			</h3>
			<div class="flex flex-grow flex-col items-center justify-center py-4">
				<div class="relative mb-4">
					<div class="absolute inset-0 scale-125 bg-primary/10 blur-xl"></div>
					<img
						alt="MVP Avatar"
						class="relative z-10 h-32 w-32 border-4 border-primary"
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN6o31lqgUa399Yy7iTAIvOIQFWDRXql-Gn8W-p9EgbqTS0PicHMfDz_mutb_xNMPrtRrMjh1AjWs2F6uv_C1waueYgzDQX8LzTgKZQJg-F_Ehbv35DkQ2Er03gzcsAGCXnJeMClw1ulhe0MQIibS7SNnUoAyZgMJ5fTCEUt9aQFlJ8fYZSSJOuINV_N91Lp1ARmEzku9uzF8ia_GkFHpPE9NWprnoQEj45w3OrP0qRvF5ANAWRBCURZuMNp-rbin39M7s_IKXll4"
					/>
					<div
						class="absolute bottom-0 right-0 z-20 rounded-full border-2 border-surface bg-primary p-1 text-on-primary"
					>
						<span class="material-symbols-outlined text-sm">check_circle</span>
					</div>
				</div>
				<span class="font-space mb-1 text-2xl font-semibold text-on-surface"
					>Cpt. Sterling</span
				>
				<span class="font-jetbrains text-[10px] text-primary">MIDFIELD MAESTRO</span>
				<div class="mt-6 grid w-full grid-cols-2 gap-2">
					<div
						class="border border-outline-variant/20 bg-surface-container-low p-2 text-center"
					>
						<span class="font-jetbrains block text-xl font-bold text-on-surface"
							>02</span
						>
						<span class="font-jetbrains text-[8px] text-on-surface-variant">GOALS</span>
					</div>
					<div
						class="border border-outline-variant/20 bg-surface-container-low p-2 text-center"
					>
						<span class="font-jetbrains block text-xl font-bold text-on-surface"
							>94%</span
						>
						<span class="font-jetbrains text-[8px] text-on-surface-variant">PASSES</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Stats & Progress -->
		<div class="flex flex-col gap-gutter md:col-span-8">
			<!-- Match Statistics -->
			<div class="glass-panel border border-outline-variant/30 p-gutter">
				<h3 class="font-jetbrains mb-6 text-xs text-on-surface-variant">
					STATISTICAL DOMINANCE
				</h3>
				<div class="space-y-6">
					<!-- Stat Row -->
					<div class="space-y-2">
						<div
							class="font-jetbrains flex justify-between text-[10px] text-on-surface-variant"
						>
							<span>62% POSSESSION</span>
							<span>POSSESSION</span>
							<span>38%</span>
						</div>
						<div class="flex h-1.5 w-full bg-surface-container-highest">
							<div
								class="h-full bg-primary shadow-[0_0_8px_rgba(217,249,157,0.4)]"
								style:width="62%"
							></div>
							<div class="h-full bg-on-surface-variant/10" style:width="38%"></div>
						</div>
					</div>
					<!-- Stat Row -->
					<div class="space-y-2">
						<div
							class="font-jetbrains flex justify-between text-[10px] text-on-surface-variant"
						>
							<span>14 SHOTS</span>
							<span>PRECISION</span>
							<span>08</span>
						</div>
						<div class="flex h-1.5 w-full bg-surface-container-highest">
							<div class="h-full bg-primary/80" style:width="70%"></div>
							<div class="h-full bg-on-surface-variant/10" style:width="30%"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- XP Gained Progress Bar -->
			<div class="glass-panel border border-outline-variant/30 p-gutter">
				<div class="mb-4 flex items-end justify-between">
					<div>
						<h3 class="font-jetbrains mb-1 text-xs text-on-surface-variant">
							CAREER PROGRESSION
						</h3>
						<span class="font-space text-2xl font-semibold text-primary">+1,240 XP</span
						>
					</div>
					<div class="text-right">
						<span class="font-jetbrains text-[10px] text-on-surface-variant"
							>RANK: ELITE I</span
						>
						<div class="font-jetbrains text-xl font-bold text-on-surface">
							14,240 <span class="text-sm text-on-surface-variant/40">/ 15,000</span>
						</div>
					</div>
				</div>
				<div
					class="h-3 w-full border border-outline-variant/30 bg-surface-container-highest p-[2px]"
				>
					<div
						class="h-full bg-gradient-to-r from-primary to-primary-container shadow-[0_0_12px_rgba(217,249,157,0.2)] transition-all duration-[2000ms] ease-out"
						style:width="{xpWidth}%"
					></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Action Tray -->
	<div class="mt-8 flex w-full max-w-6xl flex-col gap-4 md:flex-row">
		<button
			class="group flex flex-1 items-center justify-center gap-3 bg-primary py-4 font-space text-2xl font-semibold text-on-primary transition-all hover:brightness-110"
		>
			<span
				class="material-symbols-outlined transition-transform duration-500 group-hover:rotate-180"
				>replay</span
			>
			REMATCH
		</button>
		<a
			href="/lobby"
			class="glass-panel flex flex-1 items-center justify-center gap-3 py-4 font-space text-2xl font-semibold text-on-surface no-underline transition-all hover:bg-surface-container-highest"
		>
			<span class="material-symbols-outlined text-2xl">grid_view</span>
			BACK TO LOBBY
		</a>
	</div>
</div>
