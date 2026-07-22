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
	<title>Match History | Cantar Ball</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8">
	<header>
		<h1 class="font-display-lg text-4xl text-on-surface">Match History</h1>
		<p class="mt-2 text-on-surface-variant">Your recent matches and results.</p>
	</header>

	{#if loading}
		<div class="glass-panel p-12 text-center">
			<span class="material-symbols-outlined mb-4 animate-spin text-4xl text-primary">progress_activity</span>
			<p class="font-jetbrains text-sm text-on-surface-variant">Loading history...</p>
		</div>
	{:else if history.length === 0}
		<div class="glass-panel p-12 text-center">
			<span class="material-symbols-outlined mb-4 text-5xl text-on-surface-variant">history</span>
			<h2 class="font-display-lg text-xl text-on-surface">No matches yet</h2>
			<p class="mt-2 text-on-surface-variant">
				Your match history will appear here once you play some games.
			</p>
			<a
				href="/lobby"
				class="mt-6 inline-block bg-primary px-8 py-3 font-label-caps text-[12px] font-bold uppercase text-on-primary no-underline transition-all hover:brightness-110"
			>
				Go to Lobby
			</a>
		</div>
	{:else}
		<div class="space-y-3">
			{#each history as entry}
				{@const result = getResult(entry)}
				<div class="glass-panel flex items-center justify-between p-4 transition-all hover:border-primary/30">
					<div class="flex items-center gap-4">
						<div
							class="flex h-10 w-10 items-center justify-center text-lg font-bold
								{result === 'win' ? 'border border-green-500/30 bg-green-500/10 text-green-500' :
								 result === 'loss' ? 'border border-red-500/30 bg-red-500/10 text-red-500' :
								 'border border-on-surface-variant/30 bg-surface-container text-on-surface-variant'}"
						>
							{result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D'}
						</div>
						<div>
							<div class="font-display-lg text-sm font-bold uppercase text-on-surface">
								vs {getOpponent(entry)}
							</div>
							<div class="font-label-caps text-[10px] uppercase text-on-surface-variant">
								{formatDate(entry.created_at)}
							</div>
						</div>
					</div>
					<div class="font-jetbrains text-lg font-bold {result === 'win' ? 'text-primary' : 'text-on-surface'}">
						{getScore(entry)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
