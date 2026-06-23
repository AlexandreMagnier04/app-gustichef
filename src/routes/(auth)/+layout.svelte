<script lang="ts">
	import { page } from '$app/state';
	import BackButton from '$lib/components/BackButton.svelte';

	let { children } = $props();

	const noBackButton = ['/login', '/onboarding'];

	let showBack = $derived(!noBackButton.includes(page.url.pathname));
	let isChief = $derived(page.url.pathname.startsWith('/chief'));
</script>

{#if showBack}
	<div class="fixed top-4 left-4 z-50">
		<BackButton {isChief} />
	</div>
{/if}

{@render children()}
