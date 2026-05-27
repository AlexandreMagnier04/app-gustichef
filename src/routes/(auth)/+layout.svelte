<script lang="ts">
	import { page } from '$app/state';
	import BackButton from '$lib/components/BackButton.svelte';

	let { children } = $props();

	const noBackButton = ['/login', '/onboarding'];
	const lightPages = ['/register', '/chief/register'];

	let showBack = $derived(!noBackButton.includes(page.url.pathname));
	let isLight = $derived(lightPages.some((p) => page.url.pathname.startsWith(p)));
</script>

{#if showBack}
	<div class="fixed top-4 left-4 z-50">
		<BackButton
			class={isLight
				? 'rounded-full bg-navy/10 px-3 py-1.5 text-navy'
				: 'rounded-full bg-white/20 px-3 py-1.5 text-white backdrop-blur-sm'}
		/>
	</div>
{/if}

{@render children()}
