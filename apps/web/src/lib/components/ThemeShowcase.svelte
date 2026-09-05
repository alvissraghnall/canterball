<script lang="ts">
	import type { ThemeDef } from '$lib/themes';

	let { theme }: { theme: ThemeDef } = $props();
</script>

<div class="space-y-8">
	<!-- Scoreline bar -->
	<div
		class="flex items-center justify-between gap-3 border-2 border-black/30 bg-surface/85 px-4 py-3 font-jetbrains text-[11px] tracking-[0.06em] uppercase shadow-[0_3px_0_rgba(8,20,16,0.5)]"
	>
		<span class="min-w-0 truncate text-home">Union Corkers <strong class="text-[1.2rem]">2</strong></span>
		<span class="inline-flex shrink-0 items-center gap-2 text-on-surface-variant">
			<span class="h-[7px] w-[7px] rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"></span>
			Your turn · T4
		</span>
		<span class="min-w-0 truncate text-away"
			><strong class="text-[1.2rem]">1</strong> The Felt Cobblers</span
		>
	</div>

	<!-- Pitch preview -->
	<div class="demo-pitch aspect-[16/9] w-full">
		<div class="line-v"></div>
		<div class="midline-h"></div>
		<div class="ring"></div>
		<div class="goal home-goal"></div>
		<div class="goal away-goal"></div>

		{#each [
			{ left: 14, top: 30 },
			{ left: 12, top: 55 },
			{ left: 17, top: 40 }
		] as pos}
			<span class="demo-cork home" style:left="{pos.left + '%'}" style:top="{pos.top + '%'}"></span>
		{/each}
		{#each [
			{ left: 5, top: 46 },
			{ left: 8, top: 60 }
		] as pos}
			<span class="demo-cork home" style:left="{pos.left + '%'}" style:top="{pos.top + '%'}"></span>
		{/each}
		{#each [
			{ left: 72, top: 32 },
			{ left: 80, top: 58 },
			{ left: 76, top: 44 }
		] as pos}
			<span class="demo-cork away" style:left="{pos.left + '%'}" style:top="{pos.top + '%'}"></span>
		{/each}
		{#each [
			{ left: 88, top: 50 },
			{ left: 91, top: 34 }
		] as pos}
			<span class="demo-cork away" style:left="{pos.left + '%'}" style:top="{pos.top + '%'}"></span>
		{/each}

		<span class="demo-ball"></span>

		<span
			class="absolute left-2 top-1.5 font-jetbrains text-[9px] tracking-[0.14em] uppercase"
			style="color: var(--demo-line)"
			>Home end</span
		>
		<span
			class="absolute right-2 top-1.5 font-jetbrains text-[9px] tracking-[0.14em] uppercase"
			style="color: var(--demo-line)"
			>Away end</span
		>
	</div>

	<!-- Controls -->
	<div class="panel corners p-6">
		<div class="mb-5 flex items-center justify-between gap-4">
			<span class="mono-label text-[9px]">Match Controls</span>
			<span class="mono-label text-[9px] normal-case">{theme.sub}</span>
		</div>

		<div class="flex flex-col gap-4 sm:flex-row">
			<button class="btn flex-1">
				Take the Pitch
				<span class="material-symbols-outlined text-[18px]">sports_soccer</span>
			</button>
			<button class="btn-ghost flex-1">Browse Fixtures</button>
			<div class="flex flex-col gap-2 sm:flex-1">
				<input placeholder="Name your club…" class="w-full" disabled />
			</div>
		</div>

		<div class="mt-5 flex items-center gap-4">
			<span class="signal">
				<span class="dot"></span>
				Kickoff time
			</span>
			<div class="pips w-32">
				{#each Array(5) as _, j}
					<span class={j < 4 ? 'on' : ''}></span>
				{/each}
			</div>
		</div>
	</div>

	<!-- Mini cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		{#each [
			{ t: 'Think. Place. Strike.', d: 'Plan in the quiet phase, then glide across the felt.' },
			{ t: "The Keeper's Hour", d: 'Deny the shot lane and head upfield with a clean sheet.' },
			{ t: 'A Fair Felt', d: 'Server physics mean every bounce is the same for both.' }
		] as card, i}
			<article class="panel corners p-5">
				<div class="demo-chip mb-4">
					<span class="material-symbols-outlined">sports_soccer</span>
				</div>
				<h3 class="text-sm">{card.t}</h3>
				<p class="mt-2 text-xs leading-relaxed text-on-surface-variant">{card.d}</p>
			</article>
		{/each}
	</div>

	<!-- Swatches -->
	<div class="panel p-6">
		<div class="mb-5 flex items-center justify-between gap-4">
			<span class="mono-label text-[9px]">Colour Card</span>
			<span class="mono-label text-[9px]">6 of 6</span>
		</div>
		<div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
			{#each theme.swatches as s}
				<div>
					<div
						class="aspect-square w-full border-2 border-black/30"
						style:background="{s.value}"
						style:box-shadow="inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.3)"
					></div>
					<div class="mono-label mt-1.5 text-[8px] normal-case">{s.name}</div>
				</div>
			{/each}
		</div>
	</div>
</div>