<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import BrandMark from '$lib/components/BrandMark.svelte';

	const session = authClient.useSession();

	const links = [
		{ href: '/', label: 'Home', match: (p: string) => p === '/' },
		{ href: '/lobby', label: 'Matches', match: (p: string) => p.startsWith('/lobby') },
		{ href: '/history', label: 'Results', match: (p: string) => p.startsWith('/history') }
	];

	async function logout() {
		await authClient.signOut();
	}
</script>

<header
	class="fixed inset-x-0 top-0 z-50 border-b-2 border-black/30 bg-surface/85 backdrop-blur-md"
>
	<div class="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-pitch-margin">
		<div class="flex items-center gap-5">
			<a href="/" class="flex items-center gap-3 no-underline">
				<BrandMark size={36} />
				<span class="leading-none">
					<span class="block font-space text-[17px] leading-none tracking-tight text-on-surface"
						>CANTAR BALL</span
					>
					<span class="mono-label mt-1 block text-[9px] text-primary"
						>Pocket Football Club</span
					>
				</span>
			</a>

			<nav class="hidden items-center gap-1.5 md:flex">
				{#each links as link}
					<a
						href={link.href}
						class="rounded-full px-4 py-1.5 font-jetbrains text-[11px] font-semibold tracking-[0.05em] uppercase no-underline transition-colors duration-200 {link.match(
							page.url.pathname,
						)
							? 'bg-primary text-on-primary shadow-[0_2px_0_rgba(8,20,16,0.6)]'
							: 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex items-center gap-3">
			{#if $session.data}
				<div class="hidden items-center gap-3 sm:flex">
					<div
						class="rounded-full border-2 border-black/40 bg-black/20 px-3 py-1.5 font-jetbrains text-[10px] tracking-[0.05em] text-primary uppercase"
					>
						<span
							class="mr-2 inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_7px_var(--color-primary)] align-middle"
						></span>
						{$session.data.user.isAnonymous ? 'Guest' : 'Pro'}
					</div>
					<div class="hidden text-right md:block">
						<div class="font-space text-[13px] text-on-surface">
							{$session.data.user.name}
						</div>
						<div class="mono-label text-[8px] text-on-surface-variant">
							Season Starter
						</div>
					</div>
				</div>
				<button
					onclick={logout}
					class="material-symbols-outlined text-lg text-on-surface-variant transition-colors duration-200 hover:text-error"
					aria-label="Sign out"
					>meeting_room</button
				>
				<div class="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-primary/60">
					<img
						alt="Avatar"
						class="h-full w-full object-cover"
						src={$session.data.user.image ||
							'https://lh3.googleusercontent.com/aida-public/AB6AXuDf1QewTUTyneVw6Jw71pvj4tJKEKNzDegj_t_7_AKF8iIOpC4z7GkrhwgvRCbxYMNpAl-AjnbAHiDvI_kd6kbTaAgjno8YQkfDUdKb062GdLNfTGWs3UgvHzF-bjFvq25-5bI4C8mrOZxUbO-PbcO9J9paWAXiBrYoPeNj1wwEQf2Iyy487qwEhlohxQIm_nTSvhqHkW7Wl6VZJ5kejkvklbHn9238_MzgrWe9HgumzV6fjseCTHL19dAVSwf-28dXyUwRRLkI430'}
					/>
				</div>
			{:else}
				<a href="/login" class="btn btn-sm no-underline">Sign In</a>
			{/if}
		</div>
	</div>
</header>