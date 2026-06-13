<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';

	const session = authClient.useSession();

	async function logout() {
		await authClient.signOut();
	}
</script>

<header
	class="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline/20 bg-surface/80 px-pitch-margin shadow-sm backdrop-blur-md"
>
	<div class="flex items-center gap-8">
		<a
			href="/"
			class="font-display-lg text-2xl font-bold tracking-tighter text-primary no-underline"
			>Cantar Ball</a
		>

		<nav class="hidden items-center gap-6 md:flex">
			<a
				href="/"
				class="font-label-caps border-b-2 py-1 text-[12px] font-medium tracking-widest uppercase transition-all {page
					.url.pathname === '/'
					? 'border-primary text-primary'
					: 'border-transparent text-on-surface-variant hover:text-on-surface'}"
			>
				Home
			</a>
			<a
				href="/lobby"
				class="font-label-caps border-b-2 py-1 text-[12px] font-medium tracking-widest uppercase transition-all {page.url.pathname.startsWith(
					'/lobby',
				)
					? 'border-primary text-primary'
					: 'border-transparent text-on-surface-variant hover:text-on-surface'}"
			>
				Lobby
			</a>
			<a
				href="/history"
				class="font-label-caps border-b-2 py-1 text-[12px] font-medium tracking-widest uppercase transition-all {page.url.pathname.startsWith(
					'/history',
				)
					? 'border-primary text-primary'
					: 'border-transparent text-on-surface-variant hover:text-on-surface'}"
			>
				History
			</a>
		</nav>
	</div>

	<div class="flex items-center gap-4">
		{#if $session.data}
			<div class="flex items-center gap-4">
				<div class="hidden text-right sm:block">
					<div class="font-label-caps text-[10px] text-primary uppercase tracking-widest">
						Rank: {$session.data.user.isAnonymous ? 'Guest' : 'Elite'}
					</div>
					<div class="font-display-lg text-sm font-bold text-on-surface uppercase">
						{$session.data.user.name}
					</div>
				</div>
				<button
					onclick={logout}
					class="material-symbols-outlined cursor-pointer text-on-surface-variant transition-colors hover:text-error"
				>
					logout
				</button>
				<div class="h-8 w-8 overflow-hidden rounded-full border border-primary/50">
					<img
						alt="User Avatar"
						class="h-full w-full object-cover"
						src={$session.data.user.image ||
							'https://lh3.googleusercontent.com/aida-public/AB6AXuDf1QewTUTyneVw6Jw71pvj4tJKEKNzDegj_t_7_AKF8iIOpC4z7GkrhwgvRCbxYMNpAl-AjnbAHiDvI_kd6kbTaAgjno8YQkfDUdKb062GdLNfTGWs3UgvHzF-bjFvq25-5bI4C8mrOZxUbO-PbcO9J9paWAXiBrYoPeNj1wwEQf2Iyy487qwEhlohxQIm_nTSvhqHkW7Wl6VZJ5kejkvklbHn9238_MzgrWe9HgumzV6fjseCTHL19dAVSwf-28dXyUwRRLkI430'}
					/>
				</div>
			</div>
		{:else}
			<a
				href="/login"
				class="bg-primary/10 border border-primary/30 px-4 py-2 font-label-caps text-[12px] text-primary hover:bg-primary hover:text-on-primary transition-all no-underline"
			>
				Sign In
			</a>
		{/if}
	</div>
</header>
