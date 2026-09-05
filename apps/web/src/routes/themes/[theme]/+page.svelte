<script lang="ts">
	import { THEMES } from '$lib/themes';
	import ThemeShowcase from '$lib/components/ThemeShowcase.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const theme = $derived(data.theme);
	const scope = $derived(theme.id !== 'felt' ? `theme-${theme.id}` : '');
</script>

<svelte:head>
	<title>{theme.name} | Theme Lab | Cantar Ball</title>
</svelte:head>

<div class="theme-stage {scope}">
		<div class="mx-auto max-w-6xl px-6 pt-10 pb-16 md:pt-16">
			<header class="mb-8">
				<a
					href="/themes"
					class="mb-6 inline-flex items-center gap-2 font-jetbrains text-[11px] font-bold tracking-[0.12em] text-on-surface-variant uppercase transition-colors duration-200 hover:text-primary no-underline"
				>
					<span class="material-symbols-outlined text-[16px]">arrow_back</span>
					Back to Theme Lab
				</a>

				<div class="signal mb-4 w-fit">
					<span class="dot"></span>
					Dress Rehearsal · {theme.sub}
				</div>

				<h1 class="font-space text-3xl font-bold text-on-surface md:text-5xl">
					{theme.name}
				</h1>

				<p class="mt-3 max-w-2xl text-on-surface-variant">{theme.desc}</p>

				<div class="mt-5 flex flex-wrap gap-2">
					{#each theme.note as note}
						<span
							class="border border-outline/50 px-3 py-1 font-jetbrains text-[9px] tracking-[0.08em] text-on-surface-variant uppercase"
							>{note}</span
						>
					{/each}
				</div>
			</header>

			<ThemeShowcase theme={theme} />

			<div class="mt-10 panel corners flex flex-col items-center gap-4 p-8 text-center">
				<span class="mono-label text-[9px]">Making up your mind?</span>
				<p class="max-w-md text-sm text-on-surface-variant">
					This is a design preview — it doesn't change the live app. If you pick a winner,
					we'll roll it out as the real kit.
				</p>
				<div class="flex flex-wrap justify-center gap-3">
					<a href="/themes" class="btn">Keep exploring</a>
					{#each THEMES.filter((t) => t.id !== theme.id) as other}
						<a href="/themes/{other.id}" class="btn-ghost">Try {other.name}</a>
					{/each}
				</div>
			</div>
		</div>
</div>