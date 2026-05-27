<script lang="ts">
	// Le parent passe "active" et ce composant l'affiche, il ne le modifie jamais
	let { active }: { active: number } = $props();
</script>

<div class="flex items-center gap-1.5">
	{#each [0, 1, 2] as i (i)}
		<div
			class="h-1 w-8 rounded-full transition-colors duration-200 {i === active
				? 'bg-rust'
				: 'bg-black/15'}"
		></div>
	{/each}
</div>
