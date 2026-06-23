<script lang="ts">
	import flecheRetourOrange from '$lib/assets/img/fleche-retour-orange.png';
	import flecheRetourVerte from '$lib/assets/img/fleche-retour-verte.png';
	let { isChief = false }: { isChief?: boolean } = $props();
</script>

<button type="button" onclick={() => history.back()} aria-label="Retour">
	<img
		src={isChief ? flecheRetourOrange : flecheRetourVerte}
		alt="Retour"
		class="h-5 w-5 object-contain"
	/>
</button>
