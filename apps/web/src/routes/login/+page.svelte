<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import BrandMark from '$lib/components/BrandMark.svelte';

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

<svelte:head>
	<title>Join the Club | Cantar Ball</title>
</svelte:head>

<div class="mx-auto mt-4 max-w-md">
	<div class="corners panel p-8">
		<div class="mb-8 flex flex-col items-center gap-3 text-center">
			<BrandMark size={44} />
			<h1 class="font-space text-2xl font-bold tracking-tight text-on-surface uppercase">
				Join the Club
			</h1>
			<p class="mono-label text-[8px] text-primary/80">Roll Call · Manager's Office</p>
		</div>

		<div class="space-y-3">
			<button onclick={loginWithGoogle} class="btn-ghost w-full justify-start py-3">
				<img src="https://www.google.com/favicon.ico" class="h-4 w-4" alt="Google" />
				Continue with Google
			</button>

			<button onclick={loginWithGithub} class="btn-ghost w-full justify-start py-3">
				<img src="https://github.com/favicon.ico" class="h-4 w-4" alt="GitHub" />
				Continue with GitHub
			</button>

			<div class="relative py-3">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-outline/20"></div>
				</div>
				<div class="relative flex justify-center">
					<span class="mono-label bg-surface px-3 text-[8px]">Or Magic Link</span>
				</div>
			</div>

			<input bind:value={email} placeholder="Email address" class="w-full" />
			<button onclick={loginWithMagicLink} disabled={loading || !email} class="btn w-full">
				{loading ? 'Sending…' : 'Send Magic Link'}
			</button>

			{#if message}
				<p class="mono-label mt-4 text-center text-[10px] normal-case text-primary">
					{message}
				</p>
			{/if}

			<div class="relative py-3">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-outline/20"></div>
				</div>
				<div class="relative flex justify-center">
					<span class="mono-label bg-surface px-3 text-[8px]">Jump In</span>
				</div>
			</div>

			<button onclick={loginAsGuest} disabled={loading} class="btn-ghost w-full">
				<span class="material-symbols-outlined text-[18px] text-primary">bolt</span>
				Play as Guest
			</button>
		</div>
	</div>
</div>