<script lang="ts">
	import Features from '$lib/components/Features.svelte';
	import Stats from '$lib/components/Stats.svelte';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	const session = authClient.useSession();
	let loading = $state(false);

	async function startSession() {
		if ($session.data) {
			await goto('/lobby');
		} else {
			loading = true;
			const { error } = await authClient.signIn.anonymous();
			if (!error) {
				await goto('/lobby');
			}
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Cantar Ball | Pocket Football Club</title>
</svelte:head>

<!-- Hero -->
<section
	class="cork-felt relative flex min-h-[94vh] flex-col items-center justify-center overflow-hidden px-6 text-center"
>
	<div class="hero-glow pointer-events-none absolute inset-0" aria-hidden="true"></div>

	<!-- Cork on the centre circle -->
	<div class="emblem pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
		<svg viewBox="0 0 900 900" fill="none">
			<circle cx="450" cy="450" r="420" stroke="rgba(255,255,255,0.14)" stroke-width="2" />
			<circle
				cx="450"
				cy="450"
				r="330"
				stroke="rgba(246,236,212,0.4)"
				stroke-width="2"
				stroke-dasharray="1 14"
				class="drift"
			/>
			<circle cx="450" cy="450" r="120" stroke="rgba(242,169,59,0.18)" stroke-width="2" stroke-dasharray="1 10" />
		</svg>
		<div class="emblem-cork-wrap">
			<BrandMark size={300} className="emblem-cork-brand" />
		</div>
	</div>

	<div class="relative z-10 mx-auto max-w-4xl py-28">
		<div class="signal mx-auto mb-8 w-fit">
			<span class="dot"></span>
			Kickoff Time · Est. 1967
		</div>

		<h1 class="text-[3.4rem] leading-[0.85] tracking-tight md:text-[7rem]">
			<span class="block text-on-surface">CANTAR</span>
			<span class="block text-primary">BALL</span>
		</h1>
		<p class="text-outline mt-3 font-space text-lg font-bold uppercase md:text-3xl">
			Mini pitch. Full heart.
		</p>

		<p class="mx-auto mt-8 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
			Two players, one felt pitch, and a couple of bottle corks. Plan your push in the quiet
			phase, then watch the silly, brilliant physics do their thing.
		</p>

		<div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
			<button onclick={startSession} disabled={loading} class="btn btn-lg">
				{loading ? 'Setting up…' : $session.data ? 'Take the Pitch' : 'Play as Guest'}
				{#if !loading}
					<span class="material-symbols-outlined text-[18px]">sports_soccer</span>
				{/if}
			</button>
			<button onclick={() => goto('/lobby')} class="btn-ghost btn-ghost-lg">
				Browse Pickup Games
			</button>
		</div>
	</div>

	<div class="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
		<span class="mono-label block text-center text-[9px]">Scroll to the touchline</span>
		<div class="scroll-cue mx-auto mt-2"></div>
	</div>

	<div class="mono-label pointer-events-none absolute top-24 left-6 hidden text-[9px] lg:block">
		Felt Side A1 · Pocket Pitch
	</div>
	<div class="mono-label pointer-events-none absolute right-6 bottom-24 hidden text-[9px] lg:block">
		Two Corks · No Refs · All Trust
	</div>
</section>

<Features />

<Stats />

<!-- CTA -->
<section class="relative overflow-hidden py-28">
	<div class="pitch-bg absolute inset-0" aria-hidden="true"></div>
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface"
		aria-hidden="true"
	></div>

	<div class="corners panel relative z-10 mx-auto max-w-3xl p-10 text-center md:p-14">
		<div class="signal mx-auto mb-10 w-fit">
			<span class="dot"></span>
			The Fishbowl Is Open
		</div>
		<h2 class="mb-6 font-space text-2xl font-bold text-on-surface md:text-4xl">
			Bring your corks. Stay for the rematch.
		</h2>
		<p class="mx-auto mb-10 max-w-md text-on-surface-variant">
			No downloads, no sign-up needed. Just pick a pitch, take a side, and give the old
			tabletop tradition a proper run-around.
		</p>
		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<button onclick={startSession} class="btn btn-lg">
				{$session.data ? 'Take the Pitch' : 'Play as Guest'}
				<span class="material-symbols-outlined text-[18px]">sports_soccer</span>
			</button>
			<a href="/login" class="btn-ghost btn-ghost-lg no-underline">Claim a Name</a>
		</div>
	</div>
</section>

<style>
	.hero-glow {
		background: radial-gradient(60% 50% at 50% 44%, rgba(242, 169, 59, 0.12), transparent 62%);
	}

	.emblem {
		transform: translate(-50%, -50%);
		opacity: 0.5;
	}

	.emblem svg {
		width: min(108vw, 860px);
		height: auto;
		overflow: visible;
	}

	.emblem-cork-wrap {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 34%;
		transform: translate(-50%, -50%);
	}

	.emblem-cork-wrap :global(.emblem-cork-brand) {
		width: 100%;
		height: auto;
		margin: 0;
		display: block;
	}

	.drift {
		transform-origin: 450px 450px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.drift {
			animation: drift 70s linear infinite;
		}
	}
</style>