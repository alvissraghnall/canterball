<script lang="ts">
	import NavBar from '$lib/components/NavBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<div
	class="min-h-screen bg-blue-slate-950 font-space text-on-surface selection:bg-lemon-lime selection:text-black"
>
	<NavBar />
	<main class="relative overflow-hidden">
		{@render children()}
	</main>
	<Footer />
</div>
