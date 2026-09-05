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

<div class="mx-auto max-w-2xl space-y-6">
	<header class="mb-8">
		<div class="signal mb-4 w-fit">
			<span class="dot"></span>
			Manager's Office
		</div>
		<h1 class="font-space text-4xl font-bold tracking-tighter text-on-surface">Team Setup</h1>
		<p class="mt-2 text-on-surface-variant">Tidy your kit and your account.</p>
	</header>

	<!-- Profile -->
	<section class="panel p-6">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="mono-label text-[10px]">Player Profile</h2>
			<span class="font-jetbrains text-[10px] text-on-surface-variant/70">SHIRT_001</span>
		</div>

		{#if $session.data}
			<div class="space-y-6">
				<div class="flex items-center gap-4">
					<div
						class="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary shadow-[0_0_18px_rgba(242,169,59,0.25)]"
					>
						<img
							alt="Avatar"
							class="h-full w-full object-cover"
							src={$session.data.user.image ||
								'https://lh3.googleusercontent.com/aida-public/AB6AXuDf1QewTUTyneVw6Jw71pvj4tJKEKNzDegj_t_7_AKF8iIOpC4z7GkrhwgvRCbxYMNpAl-AjnbAHiDvI_kd6kbTaAgjno8YQkfDUdKb062GdLNfTGWs3UgvHzF-bjFvq25-5bI4C8mrOZxUbO-PbcO9J9paWAXiBrYoPeNj1wwEQf2Iyy487qwEhlohxQIm_nTSvhqHkW7Wl6VZJ5kejkvklbHn9238_MzgrWe9HgumzV6fjseCTHL19dAVSwf-28dXyUwRRLkI430'}
						/>
					</div>
					<div>
						<div class="font-space text-lg font-bold text-on-surface">
							{$session.data.user.name}
						</div>
						<div class="mono-label text-[8px]">
							{$session.data.user.isAnonymous ? 'Guest Goalkeeper' : 'Registered Player'}
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<label for="name" class="mono-label block text-[8px]">Name on the Sheet</label>
					<div class="flex gap-3">
						<input
							id="name"
							bind:value={newName}
							placeholder={$session.data.user.name}
							onkeydown={(e) => e.key === 'Enter' && updateName()}
							class="min-w-0 flex-1"
						/>
						<button
							onclick={updateName}
							disabled={saving || !newName.trim()}
							class="btn shrink-0"
						>
							{saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
						</button>
					</div>
				</div>
			</div>
		{:else}
			<p class="text-on-surface-variant">Not signed in.</p>
		{/if}
	</section>

	<!-- Account -->
	<section class="panel p-6">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="mono-label text-[10px]">Account</h2>
			<span class="material-symbols-outlined text-[18px] text-on-surface-variant/70"
				>security</span
			>
		</div>
		<button
			onclick={logout}
			class="flex items-center gap-3 border border-error/30 px-6 py-3 font-jetbrains text-[11px] tracking-[0.18em] text-error uppercase transition-colors duration-200 hover:bg-error/10"
		>
			<span class="material-symbols-outlined text-[18px]">meeting_room</span>
			Head Home
		</button>
	</section>
</div>