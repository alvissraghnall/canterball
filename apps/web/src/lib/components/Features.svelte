<script lang="ts">
	const drills = $state([
		{
			icon: 'gamepad',
			title: 'Think. Place. Strike.',
			body: 'Plan your run during the thinking phase, then watch your piece glide across the felt and do exactly what you asked. Smooth as a well-tapped cork.',
			meter: 3,
			label: 'Push Rhythm'
		},
		{
			icon: 'shield',
			title: "The Keeper's Hour",
			body: "The goalie is on duty every rush. Time your swipe into the shot lane, deny the strike, and head back up the pitch with a clean sheet.",
			meter: 5,
			label: 'Reflex Rating',
			active: true
		},
		{
			icon: 'verified_user',
			title: 'A Fair Felt',
			body: 'Physics run on the server, so every bounce and ricochet is the same for both of you. Perfectly balanced, gloriously simple.',
			meter: 4,
			label: 'Even Ground'
		}
	]);
</script>

<section class="relative py-24 px-6 overflow-hidden">
	<div class="mx-auto max-w-6xl">
		<div class="mb-12 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
			<span class="signal w-fit shrink-0">
				<span class="dot"></span>
				The Basics
			</span>
			<div class="hazard h-[4px] min-w-6 flex-1"></div>
			<span class="mono-label hidden sm:block">Reader Card · 3 of 3</span>
		</div>

		<div class="grid grid-cols-1 gap-5 md:grid-cols-3">
			{#each drills as d, i}
				<article
					class="panel corners rise rise-{i + 1} group relative flex flex-col overflow-hidden p-7 transition-colors duration-300 hover:border-primary/50"
				>
					<div class="mono-label mb-8 text-[9px] text-primary/60">DRILL_0{i + 1}</div>

					{#if d.active}
						<div class="signal absolute right-5 top-5 gap-1.5 px-2 py-1 text-[9px]">
							<span class="dot"></span>
							On Now
						</div>
					{/if}

					<div
						class="icon-tile mb-6 transition-colors duration-300 group-hover:border-black/40 group-hover:bg-primary group-hover:text-on-primary"
					>
						<span class="material-symbols-outlined">{d.icon}</span>
					</div>

					<h3 class="mb-3 text-xl text-on-surface">{d.title}</h3>
					<p class="mb-8 flex-1 text-sm leading-relaxed text-on-surface-variant">
						{d.body}
					</p>

					<div class="pt-2">
						<div class="mb-2 flex items-center justify-between">
							<span class="mono-label text-[9px]">{d.label}</span>
							<span class="font-jetbrains text-[11px] text-primary">{d.meter}/5</span>
						</div>
						<div class="pips">
							{#each Array(5) as _, j}
								<span class={j < d.meter ? 'on' : ''}></span>
							{/each}
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>