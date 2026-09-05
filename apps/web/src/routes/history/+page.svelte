<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { client } from '$lib/api';
	import type { MatchResult } from '@canterball/shared';

	const session = authClient.useSession();

	let history = $state<MatchResult[]>([]);
	let loading = $state(true);

	async function fetchHistory() {
		if (!$session.data) return;
		try {
			const res = await client.api.history[':playerId'].$get({
				param: { playerId: $session.data.user.id },
			});
			if (res.ok) {
				history = await res.json();
			}
		} catch {}
		loading = false;
	}

	function getResult(entry: MatchResult): 'win' | 'loss' | 'draw' {
		const isHome = entry.home_player_id === $session.data?.user.id;
		if (entry.winner === 'DRAW') return 'draw';
		if (entry.winner === 'HOME' && isHome) return 'win';
		if (entry.winner === 'AWAY' && !isHome) return 'win';
		return 'loss';
	}

	function getOpponent(entry: MatchResult): string {
		const isHome = entry.home_player_id === $session.data?.user.id;
		return isHome ? entry.away_player_name : entry.home_player_name;
	}

	function getScore(entry: MatchResult): string {
		const isHome = entry.home_player_id === $session.data?.user.id;
		const myScore = isHome ? entry.home_score : entry.away_score;
		const theirScore = isHome ? entry.away_score : entry.home_score;
		return `${myScore} - ${theirScore}`;
	}

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	$effect(() => {
		fetchHistory();
	});
</script>

<svelte:head>
	<title>Results | Cantar Ball</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<header class="mb-8">
		<div class="signal mb-4 w-fit">
			<span class="dot"></span>
			The Record Books
		</div>
		<h1 class="font-space text-4xl font-bold tracking-tighter text-on-surface">
			Match Results
		</h1>
		<p class="mt-2 text-on-surface-variant">Every cork, every goal, every full-time whistle.</p>
	</header>

	{#if loading}
		<div class="panel corners flex flex-col items-center gap-4 p-14 text-center">
			<span
				class="material-symbols-outlined animate-spin text-4xl text-primary"
				style="animation-duration: 1s"
				>progress_activity</span
			>
			<p class="mono-label text-[10px] text-on-surface-variant">Flipping to full-time…</p>
		</div>
	{:else if history.length === 0}
		<div class="panel corners flex flex-col items-center gap-3 p-14 text-center">
			<span class="material-symbols-outlined text-5xl text-outline">history</span>
			<h2 class="mt-2 font-space text-xl font-bold text-on-surface">No results on the board</h2>
			<p class="max-w-sm text-on-surface-variant">
				Play a couple of pickup matches and your scorelines will land here in print.
			</p>
			<a href="/lobby" class="btn mt-4 no-underline">Go to the Fishbowl</a>
		</div>
	{:else}
		<div class="space-y-3">
			{#each history as entry}
				{@const result = getResult(entry)}
				<div
					class="panel corners group flex items-center justify-between gap-4 p-4 transition-colors duration-300 hover:border-primary/40"
				>
					<div class="flex min-w-0 items-center gap-4">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center text-lg font-bold
								{result === 'win'
									? 'border border-home/40 bg-home/10 text-home'
									: result === 'loss'
										? 'border border-away/40 bg-away/10 text-away'
										: 'border border-on-surface-variant/30 bg-surface-container text-on-surface-variant'}"
						>
							{result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D'}
						</div>
						<div class="min-w-0">
							<div
								class="truncate font-space text-sm font-bold uppercase text-on-surface transition-colors duration-300 group-hover:text-primary"
							>
								vs {getOpponent(entry)}
							</div>
							<div class="mono-label mt-0.5 text-[8px] normal-case">
								{formatDate(entry.created_at)}
							</div>
						</div>
					</div>
					<div
						class="shrink-0 font-jetbrains text-lg font-bold {result === 'win'
							? 'text-primary'
							: 'text-on-surface'}"
					>
						{getScore(entry)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>