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

<div class="mx-auto max-w-4xl space-y-6">
	<header class="mb-8">
		<div class="signal mb-4 w-fit">
			<span class="dot"></span>
			Match Form Guide
		</div>
		<h1 class="font-space text-4xl font-bold tracking-tighter text-on-surface">
			Season so far
		</h1>
		<p class="mt-2 text-on-surface-variant">Your run of form across every pitch you've played.</p>
	</header>

	{#if loading}
		<div class="panel corners flex flex-col items-center gap-4 p-14 text-center">
			<span
				class="material-symbols-outlined animate-spin text-4xl text-primary"
				style="animation-duration: 1s"
				>progress_activity</span
			>
			<p class="mono-label text-[10px] text-on-surface-variant">Filling in the form guide…</p>
		</div>
	{:else if !stats || stats.totalGames === 0}
		<div class="panel corners flex flex-col items-center gap-3 p-14 text-center">
			<span class="material-symbols-outlined text-5xl text-outline">query_stats</span>
			<h2 class="mt-2 font-space text-xl font-bold text-on-surface">Sheet's still blank</h2>
			<p class="max-w-sm text-on-surface-variant">
				Play a few pickup matches and your runs, shutouts, and hat-tricks will show up here.
			</p>
			<a href="/lobby" class="btn mt-4 no-underline">Go to the Fishbowl</a>
		</div>
	{:else}
		<!-- Stat Cards -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div class="panel relative overflow-hidden p-6 text-center">
				<div class="absolute inset-x-0 top-0 h-[3px] bg-primary"></div>
				<div class="mt-3 font-jetbrains text-3xl font-bold text-primary">
					{stats.totalGames}
				</div>
				<div class="mono-label mt-2 text-[8px]">Matches Played</div>
			</div>
			<div class="panel relative overflow-hidden p-6 text-center">
				<div class="absolute inset-x-0 top-0 h-[3px] bg-home"></div>
				<div class="mt-3 font-jetbrains text-3xl font-bold text-home">{stats.wins}</div>
				<div class="mono-label mt-2 text-[8px]">Wins</div>
			</div>
			<div class="panel relative overflow-hidden p-6 text-center">
				<div class="absolute inset-x-0 top-0 h-[3px] bg-away"></div>
				<div class="mt-3 font-jetbrains text-3xl font-bold text-away">{stats.losses}</div>
				<div class="mono-label mt-2 text-[8px]">Losses</div>
			</div>
			<div class="panel relative overflow-hidden p-6 text-center">
				<div class="absolute inset-x-0 top-0 h-[3px] bg-on-surface-variant/50"></div>
				<div class="mt-3 font-jetbrains text-3xl font-bold text-on-surface">
					{stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(0) : 0}%
				</div>
				<div class="mono-label mt-2 text-[8px]">Win Rate</div>
			</div>
		</div>

		<!-- Goals -->
		<div class="panel p-6">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="mono-label text-[10px]">Goal Tally</h2>
				<span class="mono-label text-[8px] text-primary/70">FULL-TIME</span>
			</div>
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-on-surface-variant">Goals For</span>
					<span class="font-jetbrains text-xl font-bold text-primary"
						>{stats.goalsScored}</span
					>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-on-surface-variant">Goals Against</span>
					<span class="font-jetbrains text-xl font-bold text-away"
						>{stats.goalsConceded}</span
					>
				</div>
				{#if stats.goalsScored + stats.goalsConceded > 0}
					<div class="flex h-2 w-full overflow-hidden bg-surface-container-highest">
						<div
							class="h-full bg-primary"
							style:width="{((stats.goalsScored / (stats.goalsScored + stats.goalsConceded)) * 100)}%"
						></div>
						<div
							class="h-full bg-away/40"
							style:width="{((stats.goalsConceded / (stats.goalsScored + stats.goalsConceded)) * 100)}%"
						></div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>