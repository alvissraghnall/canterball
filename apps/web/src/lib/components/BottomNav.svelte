<script lang="ts">
	import { page } from '$app/state';
</script>

<nav
	class="fixed bottom-0 z-40 flex h-20 w-full items-center justify-around border-t border-outline/20 bg-surface/90 px-4 pb-2 shadow-[0_-4px_12px_rgba(0,0,0,0.5)] backdrop-blur-xl md:hidden"
>
	<a
		class="flex flex-col items-center justify-center px-4 py-1 transition-transform active:scale-90 {page
			.url.pathname === '/chat'
			? 'text-primary'
			: 'text-on-surface-variant'}"
		href="/chat"
	>
		<span class="material-symbols-outlined">forum</span>
		<span class="font-label-caps text-[10px] uppercase">Chat</span>
	</a>
	<a
		class="flex flex-col items-center justify-center px-4 py-1 transition-transform active:scale-90 {page
			.url.pathname === '/stats'
			? 'text-primary'
			: 'text-on-surface-variant'}"
		href="/stats"
	>
		<span class="material-symbols-outlined">query_stats</span>
		<span class="font-label-caps text-[10px] uppercase">Stats</span>
	</a>
	<a
		class="flex flex-col items-center justify-center rounded px-4 py-1 transition-transform active:scale-90 {page
			.url.pathname === '/lobby'
			? 'bg-tertiary-container/30 border border-primary/20 text-primary'
			: 'text-on-surface-variant'}"
		href="/lobby"
	>
		<span class="material-symbols-outlined">stadium</span>
		<span class="font-label-caps text-[10px] uppercase">Lobby</span>
	</a>
	<a
		class="flex flex-col items-center justify-center px-4 py-1 transition-transform active:scale-90 {page
			.url.pathname === '/settings'
			? 'text-primary'
			: 'text-on-surface-variant'}"
		href="/settings"
	>
		<span class="material-symbols-outlined">settings</span>
		<span class="font-label-caps text-[10px] uppercase">Settings</span>
	</a>
</nav>
