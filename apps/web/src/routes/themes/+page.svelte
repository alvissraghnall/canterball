<script lang="ts">
	import { THEMES } from '$lib/themes';
	import ThemeShowcase from '$lib/components/ThemeShowcase.svelte';

	const themes = THEMES;
</script>

<svelte:head>
	<title>Theme Lab | Cantar Ball</title>
</svelte:head>

<div class="relative overflow-hidden py-10 md:py-16">
	<div class="cork-felt absolute inset-0" aria-hidden="true"></div>

	<div class="relative z-10 mx-auto max-w-6xl px-6">
		<header class="mb-4">
			<div class="signal mb-4 w-fit">
				<span class="dot"></span>
				Theme Lab · What If?
			</div>
			<h1 class="font-space text-3xl font-bold text-on-surface md:text-5xl">
				Dress the club in a new kit
			</h1>
			<p class="mt-3 max-w-2xl text-on-surface-variant">
				Cadar Ball can be more than a felt pitch. These are three full dress-rehearsals for
				the same tiny table — pick one to walk the turnstiles.
			</p>
		</header>

		{#each themes as theme, i}
			<a
				href="/themes/{theme.id}"
				class="rise rise-{i + 1} corners panel group mt-8 block no-underline"
			>
				<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
					<div class="p-6 md:p-8">
						<div class="mb-5 flex flex-wrap items-center gap-3">
							<span class="mono-label text-primary">{theme.sub}</span>
							<span class="mono-label text-on-surface-variant/60">/</span>
							{#each theme.note as note}
								<span
									class="border border-outline/40 px-3 py-1 font-jetbrains text-[9px] tracking-[0.08em] text-on-surface-variant uppercase"
									>{note}</span
								>
							{/each}
						</div>

						<h2 class="font-space text-2xl font-bold text-on-surface md:text-3xl transition-colors duration-300 group-hover:text-primary">
							{theme.name}
						</h2>
						<p class="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-base">
							{theme.desc}
						</p>

						<div class="mt-6 flex items-center gap-3 font-jetbrains text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
							<span class="border-2 border-black/40 px-4 py-2 transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary"
								>Try it on</span
							>
							<span class="material-symbols-outlined text-[18px]">arrow_right_alt</span>
						</div>
					</div>

					<div
						class="relative hidden lg:block"
						style="background: repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 8px, transparent 8px 16px)"
					>
						<div class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
							<div class="flex gap-2">
								{#each theme.swatches.slice(0, 5) as s}
									<span
										class="h-10 w-10 border-2 border-black/40"
										style:background="{s.value}"
									></span>
								{/each}
							</div>
							<span class="mono-label text-[8px] text-on-surface-variant">kit card</span>
						</div>
					</div>
				</div>
			</a>
		{/each}

		<div class="mt-10">
			<h2 class="mb-4 mono-label text-[10px]">Reference: the current default</h2>
			<ThemeShowcase theme={themes[0]} />
		</div>
	</div>
</div>