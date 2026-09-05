<script lang="ts">
	let { size = 36, className = '' }: { size?: number; className?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 48 48"
	fill="none"
	class={className}
	aria-hidden="true"
>
	<circle cx="24" cy="24" r="21" fill="#e29a3f" />
	<circle cx="24" cy="24" r="21" fill="url(#grain)" />

	<defs>
		<radialGradient id="grain" cx="35%" cy="30%" r="80%">
			<stop offset="0%" stop-color="#ffd691" />
			<stop offset="55%" stop-color="#e29a3f" />
			<stop offset="100%" stop-color="#b9792a" />
		</radialGradient>
	</defs>

	<circle
		cx="24"
		cy="24"
		r="15.5"
		stroke="#6e4a12"
		stroke-width="1.5"
		stroke-dasharray="2 4"
		opacity="0.55"
	/>
	<circle
		cx="24"
		cy="24"
		r="9.5"
		stroke="#6e4a12"
		stroke-width="1.5"
		stroke-dasharray="2 4"
		opacity="0.55"
	/>
	<circle cx="24" cy="24" r="21" stroke="#2b1604" stroke-width="2" opacity="0.9" />
	<circle cx="24" cy="24" r="3" fill="#2b1604" />
</svg>