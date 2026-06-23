<script lang="ts">
	let { children } = $props();
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-white">
	<main class="flex-1 overflow-y-auto px-5 py-4 pb-8">
		{@render children()}
	</main>
</div>
