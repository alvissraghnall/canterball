<script lang="ts">
	import { page } from '$app/state';
</script>

<nav
	class="fixed bottom-0 z-40 flex h-16 w-full items-stretch border-t-2 border-black/30 bg-surface/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
>
	<a
		class="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-transform active:translate-y-0.5 {page
			.url.pathname === '/stats'
			? 'bg-primary/15 text-primary'
			: 'text-on-surface-variant'}"
		href="/stats"
	>
		<span class="material-symbols-outlined text-[22px]">insights</span>
		<span class="mono-label text-[8px]">Stats</span>
	</a>
	<a
		class="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-transform active:translate-y-0.5 {page
			.url.pathname.startsWith('/lobby') || page.url.pathname.startsWith('/game')
			? 'bg-primary/15 text-primary'
			: 'text-on-surface-variant'}"
		href="/lobby"
	>
		<span class="material-symbols-outlined text-[22px]">sports_soccer</span>
		<span class="mono-label text-[8px]">Pitch</span>
	</a>
	<a
		class="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-transform active:translate-y-0.5 {page
			.url.pathname === '/history'
			? 'bg-primary/15 text-primary'
			: 'text-on-surface-variant'}"
		href="/history"
	>
		<span class="material-symbols-outlined text-[22px]">history</span>
		<span class="mono-label text-[8px]">Results</span>
	</a>
	<a
		class="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-transform active:translate-y-0.5 {page
			.url.pathname === '/settings' || page.url.pathname.startsWith('/themes')
			? 'bg-primary/15 text-primary'
			: 'text-on-surface-variant'}"
		href="/settings"
	>
		<span class="material-symbols-outlined text-[22px]">settings</span>
		<span class="mono-label text-[8px]">Team</span>
	</a>
</nav>