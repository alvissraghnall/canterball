<script lang="ts">
	import '../app.css';
	import NavBar from '$lib/components/NavBar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	let { children } = $props();
</script>

<div class="pitch-grid min-h-screen bg-surface font-space text-on-surface selection:bg-primary/30">
	<NavBar />
	<Sidebar />

	<main class="min-h-screen px-pitch-margin pt-20 pb-24 md:ml-64 md:pb-8">
		<div class="mx-auto max-w-7xl">
			{@render children()}
		</div>
	</main>

	<BottomNav />

	<!-- Background Decorative Elements -->
	<div class="fixed top-0 left-0 -z-10 h-full w-full overflow-hidden pointer-events-none">
		<div class="scanline"></div>
		<div
			class="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]"
		></div>
		<div
			class="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]"
		></div>
	</div>
</div>
