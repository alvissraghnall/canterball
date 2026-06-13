<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let email = $state('');
	let loading = $state(false);
	let message = $state('');

	async function loginWithGoogle() {
		await authClient.signIn.social({ provider: 'google' });
	}

	async function loginWithGithub() {
		await authClient.signIn.social({ provider: 'github' });
	}

	async function loginWithMagicLink() {
		loading = true;
		const { error } = await authClient.signIn.magicLink({ email });
		if (error) {
			message = error.message || 'Failed to send magic link';
		} else {
			message = 'Check your email for a sign-in link!';
		}
		loading = false;
	}

	async function loginAsGuest() {
		loading = true;
		const { error } = await authClient.signIn.anonymous();
		if (!error) {
			await goto('/lobby');
		} else {
			message = error.message || 'Failed to login as guest';
		}
		loading = false;
	}
</script>

<div class="mx-auto mt-20 max-w-md border-t-4 border-primary p-8 glass-panel">
	<h1 class="mb-8 text-center font-display-lg text-3xl uppercase">Join the Arena</h1>

	<div class="space-y-4">
		<button
			onclick={loginWithGoogle}
			class="flex w-full items-center justify-center gap-3 border border-outline/30 p-3 transition-all hover:bg-surface-container"
		>
			<img src="https://www.google.com/favicon.ico" class="h-5 w-5" alt="Google" />
			Continue with Google
		</button>

		<button
			onclick={loginWithGithub}
			class="flex w-full items-center justify-center gap-3 border border-outline/30 p-3 transition-all hover:bg-surface-container"
		>
			<img src="https://github.com/favicon.ico" class="h-5 w-5" alt="GitHub" />
			Continue with GitHub
		</button>

		<div class="relative py-4">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-outline/20"></div>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-surface px-2 text-on-surface-variant">Or Magic Link</span>
			</div>
		</div>

		<input bind:value={email} placeholder="EMAIL ADDRESS" class="w-full" />
		<button
			onclick={loginWithMagicLink}
			disabled={loading || !email}
			class="w-full bg-primary p-3 font-bold uppercase text-on-primary disabled:opacity-50"
		>
			{loading ? 'Sending...' : 'Send Magic Link'}
		</button>

		{#if message}
			<p class="font-jetbrains mt-4 text-center text-sm uppercase text-primary">{message}</p>
		{/if}

		<div class="relative py-4">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-outline/20"></div>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-surface px-2 text-on-surface-variant">Jump In</span>
			</div>
		</div>

		<button
			onclick={loginAsGuest}
			disabled={loading}
			class="w-full border border-primary p-3 font-bold uppercase text-primary transition-all hover:bg-primary/10"
		>
			Play as Guest
		</button>
	</div>
</div>
