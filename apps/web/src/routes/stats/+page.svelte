<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { client } from '$lib/api';

	const session = authClient.useSession();

	let stats = $state<{
		totalGames: number;
		wins: number;
		losses: number;
		goalsScored: number;
		goalsConceded: number;
	} | null>(null);
	let loading = $state(true);

	async function fetchStats() {
		if (!$session.data) return;
		try {
			const res = await client.api.stats[':playerId'].$get({
				param: { playerId: $session.data.user.id },
			});
			if (res.ok) {
				stats = await res.json();
			}
		} catch {}
		loading = false;
	}

	$effect(() => {
		fetchStats();
	});
</script>

<svelte:head>
	<title>Stats | Cantar Ball</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8">
	<header>
		<h1 class="font-display-lg text-4xl text-on-surface">Combat Statistics</h1>
		<p class="mt-2 text-on-surface-variant">Your performance across all matches.</p>
	</header>

	{#if loading}
		<div class="glass-panel p-12 text-center">
			<span class="material-symbols-outlined mb-4 animate-spin text-4xl text-primary">progress_activity</span>
			<p class="font-jetbrains text-sm text-on-surface-variant">Loading statistics...</p>
		</div>
	{:else if !stats || stats.totalGames === 0}
		<div class="glass-panel p-12 text-center">
			<span class="material-symbols-outlined mb-4 text-5xl text-on-surface-variant">query_stats</span>
			<h2 class="font-display-lg text-xl text-on-surface">No matches played yet</h2>
			<p class="mt-2 text-on-surface-variant">
				Play some games to see your statistics here.
			</p>
			<a
				href="/lobby"
				class="mt-6 inline-block bg-primary px-8 py-3 font-label-caps text-[12px] font-bold uppercase text-on-primary no-underline transition-all hover:brightness-110"
			>
				Go to Lobby
			</a>
		</div>
	{:else}
		<!-- Stat Cards -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div class="glass-panel border-t-4 border-t-primary p-6 text-center">
				<div class="font-jetbrains text-3xl font-bold text-primary">{stats.totalGames}</div>
				<div class="font-label-caps mt-2 text-[10px] uppercase text-on-surface-variant">Games Played</div>
			</div>
			<div class="glass-panel border-t-4 border-t-green-500 p-6 text-center">
				<div class="font-jetbrains text-3xl font-bold text-green-500">{stats.wins}</div>
				<div class="font-label-caps mt-2 text-[10px] uppercase text-on-surface-variant">Wins</div>
			</div>
			<div class="glass-panel border-t-4 border-t-red-500 p-6 text-center">
				<div class="font-jetbrains text-3xl font-bold text-red-500">{stats.losses}</div>
				<div class="font-label-caps mt-2 text-[10px] uppercase text-on-surface-variant">Losses</div>
			</div>
			<div class="glass-panel border-t-4 border-t-on-surface-variant p-6 text-center">
				<div class="font-jetbrains text-3xl font-bold text-on-surface">
					{stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(0) : 0}%
				</div>
				<div class="font-label-caps mt-2 text-[10px] uppercase text-on-surface-variant">Win Rate</div>
			</div>
		</div>

		<!-- Goals Section -->
		<div class="glass-panel border border-outline-variant/30 p-6">
			<h2 class="font-jetbrains mb-6 text-xs uppercase tracking-widest text-on-surface-variant">
				Goals
			</h2>
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-on-surface-variant">Goals Scored</span>
					<span class="font-jetbrains text-xl font-bold text-primary">{stats.goalsScored}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-on-surface-variant">Goals Conceded</span>
					<span class="font-jetbrains text-xl font-bold text-on-surface">{stats.goalsConceded}</span>
				</div>
				{#if stats.goalsScored + stats.goalsConceded > 0}
					<div class="flex h-2 w-full overflow-hidden bg-surface-container-highest">
						<div
							class="h-full bg-primary"
							style:width="{((stats.goalsScored / (stats.goalsScored + stats.goalsConceded)) * 100)}%"
						></div>
						<div
							class="h-full bg-on-surface-variant/30"
							style:width="{((stats.goalsConceded / (stats.goalsScored + stats.goalsConceded)) * 100)}%"
						></div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
