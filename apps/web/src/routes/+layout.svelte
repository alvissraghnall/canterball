<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<main class="mx-auto max-w-4xl p-4">
	<h1 class="mb-4 text-center text-2xl font-bold tracking-widest">
		<a href="/" class="text-primary hover:text-primary-hover no-underline transition-colors">
			Cantar Ball
		</a>
	</h1>
	{@render children()}
</main>

<style>
	:global(body) {
		font-family:
			'Segoe UI',
			system-ui,
			-apple-system,
			sans-serif;
		background: #1a1a2e;
		color: #e0e0e0;
		min-height: 100vh;
	}
</style>
