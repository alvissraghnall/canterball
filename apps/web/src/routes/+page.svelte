<script lang="ts">
	import Features from '$lib/components/Features.svelte';
	import Stats from '$lib/components/Stats.svelte';
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
	<title>Cantar Ball | Tactical Pitch Dominance</title>
</svelte:head>

<!-- Hero Section -->
<section
	class="hud-scanline relative flex min-h-[85vh] flex-col items-center justify-center px-[24px] text-center"
>
	<!-- Background Visual -->
	<div class="absolute inset-0 z-0 opacity-30">
		<div
			class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"
		></div>
		<img
			class="h-full w-full object-cover"
			alt="Futuristic digital football pitch"
			src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpOUtbr_S0EAzs45i3-M5Yante5O0rdMEW0u8Hjg4N7I5QuI3DFQZxb-hKBl8DiwmwCCgfoNDKqKxyunLx3EGt1-_4MG05iqyN4dGWp0O-srMt_EWZOIrcXxeZN5rTMk2LFkSUyFPmj_cgbn_2XdSafShOnDgGPmVJMGS4wfnIWTz7XqWpPkBZReQpMxSmSlgEi7_BvFqOSmWdmBNqOKXs6M1G8csFabCb9NRGvPmLcDtSwSN8aG8a-jyWEwyHsKv_GFd1Fl2NAKQ"
		/>
	</div>

	<div class="relative z-10 mx-auto max-w-5xl">
		<div class="mb-4 flex justify-center">
			<div class="rounded-full border border-primary/30 bg-primary/10 px-4 py-1">
				<span class="font-jetbrains text-[10px] uppercase tracking-widest text-primary"
					>Combat Sport Protocol v2.4</span
				>
			</div>
		</div>
		<h1 class="mb-4 text-5xl leading-none tracking-tighter text-white md:text-7xl">
			CANTAR BALL: <span class="text-primary">TACTICAL PITCH</span> DOMINANCE
		</h1>
		<p class="mx-auto mb-8 max-w-2xl text-lg text-on-surface-variant">
			Master the high-stakes intersection of strategic maneuvering and split-second reflexes
			in the galaxy's premier tactical ball combat arena.
		</p>

		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<button
				onclick={startSession}
				disabled={loading}
				class="group flex items-center gap-2 rounded-none bg-primary px-12 py-4 font-jetbrains text-sm font-bold text-on-primary no-underline transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
			>
				{loading ? 'INITIALIZING...' : $session.data ? 'ENTER THE ARENA' : 'PLAY AS GUEST'}
				{#if !loading}
					<span
						class="material-symbols-outlined transition-transform group-hover:translate-x-1"
						>bolt</span
					>
				{/if}
			</button>
			<button
				onclick={() => goto('/lobby')}
				class="rounded-none border border-outline-variant bg-surface-container/50 px-12 py-4 font-jetbrains text-sm text-white transition-all hover:bg-surface-container"
			>
				BROWSE LOBBY
			</button>
		</div>
	</div>

	<!-- Scroll Prompt -->
	<div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
		<span class="material-symbols-outlined text-outline">expand_more</span>
	</div>
</section>

<Features />

<Stats />

<!-- CTA Section -->
<section class="relative overflow-hidden py-24">
	<div class="absolute inset-0 z-0">
		<img
			class="h-full w-full object-cover opacity-20 grayscale"
			alt="Digital landscape"
			src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTcplLhSPjMcgKIp8eQS8tgAszPCxl58NNOUFZ8vmm1hfJ0Ssdzz3OUxv1cLasAg1q4OTSQo_FswrHkmS4ANfzLcicLaluln7-0Z8Frj59M0u1KoupV1XodNK2gIeig__xAWKiN7HyDvPap4iZy16eQcWnf-yFNgTWUReQ6IboQH74XMtjp5ANAS2mT93E_44qoNpGQwflwqrfc_Zb1AVMd9QbjOj2UWLuZtyMy8njDzzIChiXP5NQdwIh8UuTW4V-wf8FVvVWZE4"
		/>
	</div>
	<div
		class="relative z-10 mx-auto max-w-4xl border-2 border-primary bg-surface/80 p-12 text-center backdrop-blur-md"
	>
		<h2 class="mb-6 text-3xl leading-none tracking-tight text-white uppercase">
			Ready to rewrite the pitch?
		</h2>
		<p class="mx-auto mb-8 max-w-xl text-on-surface-variant">
			Join thousands of commanders in the most sophisticated tactical sports engine ever
			built. No downloads. Direct browser access.
		</p>
		<button
			onclick={startSession}
			class="rounded-none bg-primary px-16 py-5 font-jetbrains text-sm font-bold text-on-primary hover:shadow-[0_0_30px_rgba(217,249,157,0.4)]"
		>
			{$session.data ? 'ENTER THE ARENA' : 'PLAY AS GUEST'}
		</button>
	</div>
</section>
