<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	const session = authClient.useSession();
	let newName = $state('');
	let saving = $state(false);
	let saved = $state(false);

	async function updateName() {
		if (!newName.trim() || saving || !$session.data) return;
		saving = true;
		try {
			await authClient.updateUser({ name: newName.trim() });
			saved = true;
			setTimeout(() => (saved = false), 2000);
		} catch (e) {
			console.error('Failed to update name:', e);
		} finally {
			saving = false;
		}
	}

	async function logout() {
		await authClient.signOut();
		await goto('/');
	}
</script>

<svelte:head>
	<title>Settings | Cantar Ball</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-8">
	<header>
		<h1 class="font-display-lg text-4xl text-on-surface">Settings</h1>
		<p class="mt-2 text-on-surface-variant">Manage your account and preferences.</p>
	</header>

	<!-- Profile Section -->
	<section class="glass-panel border border-outline-variant/30 p-6">
		<h2 class="font-jetbrains mb-6 text-xs uppercase tracking-widest text-on-surface-variant">
			Profile
		</h2>

		{#if $session.data}
			<div class="space-y-6">
				<div class="flex items-center gap-4">
					<div class="h-16 w-16 overflow-hidden rounded-full border-2 border-primary">
						<img
							alt="Avatar"
							class="h-full w-full object-cover"
							src={$session.data.user.image ||
								'https://lh3.googleusercontent.com/aida-public/AB6AXuDf1QewTUTyneVw6Jw71pvj4tJKEKNzDegj_t_7_AKF8iIOpC4z7GkrhwgvRCbxYMNpAl-AjnbAHiDvI_kd6kbTaAgjno8YQkfDUdKb062GdLNfTGWs3UgvHzF-bjFvq25-5bI4C8mrOZxUbO-PbcO9J9paWAXiBrYoPeNj1wwEQf2Iyy487qwEhlohxQIm_nTSvhqHkW7Wl6VZJ5kejkvklbHn9238_MzgrWe9HgumzV6fjseCTHL19dAVSwf-28dXyUwRRLkI430'}
						/>
					</div>
					<div>
						<div class="font-display-lg text-lg font-bold text-on-surface">
							{$session.data.user.name}
						</div>
						<div class="font-label-caps text-[10px] uppercase text-on-surface-variant">
							{$session.data.user.isAnonymous ? 'Guest Account' : 'Registered'}
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<label for="name" class="font-label-caps text-[10px] uppercase text-on-surface-variant">
						Display Name
					</label>
					<div class="flex gap-3">
						<input
							id="name"
							bind:value={newName}
							placeholder={$session.data.user.name}
							onkeydown={(e) => e.key === 'Enter' && updateName()}
							class="flex-grow"
						/>
						<button
							onclick={updateName}
							disabled={saving || !newName.trim()}
							class="bg-primary px-6 py-2 font-label-caps text-[12px] font-bold uppercase text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
						>
							{saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
						</button>
					</div>
				</div>
			</div>
		{:else}
			<p class="text-on-surface-variant">Not signed in.</p>
		{/if}
	</section>

	<!-- Account Section -->
	<section class="glass-panel border border-outline-variant/30 p-6">
		<h2 class="font-jetbrains mb-6 text-xs uppercase tracking-widest text-on-surface-variant">
			Account
		</h2>
		<button
			onclick={logout}
			class="flex items-center gap-3 border border-error/30 px-6 py-3 font-label-caps text-[12px] uppercase text-error transition-all hover:bg-error/10 cursor-pointer"
		>
			<span class="material-symbols-outlined text-[18px]">logout</span>
			Sign Out
		</button>
	</section>
</div>
