<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import BrandMark from '$lib/components/BrandMark.svelte';

	const session = authClient.useSession();

	const items = [
		{ href: '/lobby', icon: 'stadium', label: 'Matches', match: (p: string) => p === '/lobby' || p.startsWith('/game') },
		{ href: '/stats', icon: 'insights', label: 'Stats', match: (p: string) => p.startsWith('/stats') },
		{ href: '/history', icon: 'history', label: 'Results', match: (p: string) => p.startsWith('/history') }
	];

	async function logout() {
		await authClient.signOut();
	}
</script>

<nav
	class="fixed top-0 left-0 z-40 hidden h-screen w-60 flex-col border-r-2 border-black/30 bg-surface/85 backdrop-blur-md md:flex"
>
	<div class="flex items-center gap-3 px-5 py-4 pt-[5.5rem]">
		<BrandMark size={32} />
		<div class="min-w-0">
			<div class="truncate font-space text-sm text-on-surface">
				{$session.data?.user.name || 'Commander'}
			</div>
			<div class="mono-label text-[8px] text-primary">
				{$session.data?.user.isAnonymous ? 'Guest Kit' : 'First Team'}
			</div>
		</div>
	</div>

	<div class="flex-1 space-y-1.5 px-3 py-5">
		{#each items as item}
			<a
				class="flex items-center gap-3 rounded-full px-3 py-2.5 transition-colors duration-200 {item.match(
					page.url.pathname,
				)
					? 'bg-primary text-on-primary shadow-[0_2px_0_rgba(8,20,16,0.6)]'
					: 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'}"
				href={item.href}
			>
				<span class="material-symbols-outlined text-[20px]">{item.icon}</span>
				<span class="font-jetbrains text-[11px] font-semibold tracking-[0.05em] uppercase"
					>{item.label}</span
				>
			</a>
		{/each}

		<div class="pt-5">
			<a href="/lobby" class="btn block w-full text-center">Host Match</a>
		</div>
	</div>

	<div class="space-y-1.5 border-t-2 border-black/30 px-3 py-4">
		<a
			href="/themes"
			class="flex items-center gap-3 rounded-full px-3 py-2.5 text-on-surface-variant transition-colors duration-200 hover:bg-white/10 hover:text-on-surface"
		>
			<span class="material-symbols-outlined text-[20px]">music_note</span>
			<span class="font-jetbrains text-[11px] font-semibold tracking-[0.05em] uppercase"
				>Theme Lab</span
			>
		</a>
		<a
			class="flex items-center gap-3 rounded-full px-3 py-2.5 text-on-surface-variant transition-colors duration-200 hover:bg-white/10 hover:text-on-surface"
			href="/settings"
		>
			<span class="material-symbols-outlined text-[20px]">settings</span>
			<span class="font-jetbrains text-[11px] font-semibold tracking-[0.05em] uppercase"
				>Team Setup</span
			>
		</a>
		<button
			onclick={logout}
			class="flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-on-surface-variant transition-colors duration-200 hover:bg-white/10 hover:text-error"
		>
			<span class="material-symbols-outlined text-[20px]">meeting_room</span>
			<span class="font-jetbrains text-[11px] font-semibold tracking-[0.05em] uppercase"
				>Head Home</span
			>
		</button>
	</div>
</nav>