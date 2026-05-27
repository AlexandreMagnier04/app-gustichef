<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import DesktopBlock from '$lib/components/DesktopBlock.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- Mobile : affiche l'app normalement -->
<div class="md:hidden">
	{@render children()}
</div>

<!-- Desktop : bloque l'accès et invite à scanner le QR code -->
<div class="hidden md:block">
	<DesktopBlock />
</div>
