<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';

	const session = authClient.useSession();

	async function logout() {
		await authClient.signOut();
	}
</script>

<nav
	class="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-outline/20 bg-surface transition-all duration-300 ease-in-out md:flex"
>
	<div class="p-6 pt-24">
		<div class="mb-8 flex items-center gap-3 px-4">
			<div
				class="flex h-10 w-10 items-center justify-center rounded border border-primary/10 bg-tertiary-container/20"
			>
				<span
					class="material-symbols-outlined text-primary"
					style="font-variation-settings: 'FILL' 1;">shield</span
				>
			</div>
			<div>
				<div class="font-display-lg text-body-md font-bold text-on-surface">
					{$session.data?.user.name || 'Commander'}
				</div>
				<div class="font-label-caps text-primary text-[10px] uppercase tracking-widest">
					Rank: {$session.data?.user.isAnonymous ? 'Guest' : 'Elite'}
				</div>
			</div>
		</div>
		<div class="space-y-2">
			<a
				class="group flex items-center gap-4 p-4 transition-all {page.url.pathname ===
				'/lobby'
					? 'bg-tertiary-container/30 border-r-4 border-primary text-primary'
					: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}"
				href="/lobby"
			>
				<span class="material-symbols-outlined">stadium</span>
				<span class="font-label-caps text-[12px] font-medium tracking-widest uppercase"
					>Lobby</span
				>
			</a>
			<a
				class="group flex items-center gap-4 p-4 transition-all {page.url.pathname === '/stats'
					? 'bg-tertiary-container/30 border-r-4 border-primary text-primary'
					: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}"
				href="/stats"
			>
				<span class="material-symbols-outlined">query_stats</span>
				<span class="font-label-caps text-[12px] font-medium tracking-widest uppercase"
					>Stats</span
				>
			</a>
			<a
				class="group flex items-center gap-4 p-4 transition-all {page.url.pathname ===
				'/history'
					? 'bg-tertiary-container/30 border-r-4 border-primary text-primary'
					: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}"
				href="/history"
			>
				<span class="material-symbols-outlined">history</span>
				<span class="font-label-caps text-[12px] font-medium tracking-widest uppercase"
					>History</span
				>
			</a>
		</div>
		<div class="mt-12">
			<a
				href="/lobby"
				class="font-display-lg text-body-md block w-full bg-primary px-2 py-4 text-center font-bold uppercase tracking-tighter text-on-primary no-underline transition-all hover:brightness-110 active:scale-95"
			>
				Create Room
			</a>
		</div>
	</div>
	<div class="mt-auto space-y-2 border-t border-outline/10 p-6">
		<a
			class="flex items-center gap-4 p-4 text-on-surface-variant transition-all hover:text-on-surface"
			href="/settings"
		>
			<span class="material-symbols-outlined">settings</span>
			<span class="font-label-caps text-[12px] font-medium tracking-widest uppercase"
				>Settings</span
			>
		</a>
		<button
			onclick={logout}
			class="flex w-full items-center gap-4 p-4 text-on-surface-variant transition-all hover:text-error cursor-pointer"
		>
			<span class="material-symbols-outlined">logout</span>
			<span class="font-label-caps text-[12px] font-medium tracking-widest uppercase"
				>Exit</span
			>
		</button>
	</div>
</nav>
