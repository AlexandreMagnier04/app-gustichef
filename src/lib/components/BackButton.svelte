<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<button
	type="button"
	onclick={() => history.back()}
	class="flex items-center gap-1 text-xs {className}"
>
	<svg viewBox="0 0 20 20" fill="currentColor" class="h-3 w-3" aria-hidden="true">
		<path
			fill-rule="evenodd"
			d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
			clip-rule="evenodd"
		/>
	</svg>
	Retour
</button>
