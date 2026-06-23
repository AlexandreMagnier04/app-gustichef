<script lang="ts">
	import { onMount } from 'svelte';
	import OnboardingDots from './OnboardingDots.svelte';
	import portrait1 from '$lib/assets/img/portrait-1.jpeg';
	import portrait2 from '$lib/assets/img/portrait-2.jpeg';
	import portrait3 from '$lib/assets/img/portrait-3.jpeg';
	import portrait4 from '$lib/assets/img/portrait-4.jpeg';
	import gustichefEcriture from '$lib/assets/img/gustichef-ecriture-verte-2.png';
	let {
		active,
		onNext
	}: {
		active: number;
		onNext: () => void;
	} = $props();

	const chefPalette = [portrait1, portrait2, portrait3, portrait4];
	// chefPhotoIndex est un état LOCAL à ce composant — $state() = variable réactive
	// Le parent ne le connaît pas, c'est une implémentation interne
	let chefPhotoIndex = $state(0);

	onMount(() => {
		// Change de photo toutes les 3,5s — setInterval reste interne au composant
		const t = setInterval(() => {
			chefPhotoIndex = (chefPhotoIndex + 1) % chefPalette.length;
		}, 3500);
		return () => clearInterval(t); // ngOnDestroy : stoppe l'intervalle à la destruction
	});
</script>

<section class="flex h-dvh w-screen shrink-0 flex-col overflow-hidden bg-cream">
	<div class="relative min-h-0 flex-1 overflow-hidden">
		{#each chefPalette as src, ci (ci)}
			<!-- Toutes les photos sont empilées (absolute), seule la active a opacity:1 -->
			<img
				{src}
				alt=""
				class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
				style="opacity: {ci === chefPhotoIndex ? 1 : 0}"
			/>
		{/each}

		<div
			class="absolute inset-x-0 bottom-0 h-52"
			style="background: linear-gradient(to top, #F5EDDC 35%, transparent)"
		></div>
	</div>

	<div class="relative z-10 -mt-32 shrink-0 px-6 pt-3 pb-8 text-center">
		<img src={gustichefEcriture} alt="Gustichef" class="mx-auto mb-2 h-20 object-contain" />
		<h2 class="mb-1 text-[0.95rem] font-semibold text-navy">
			Bien plus qu'un repas, une signature culinaire.
		</h2>
		<p class="mb-5 text-[0.8rem] leading-relaxed text-stone-500">
			Trouvez l'inspiration parmi nos talents et vivez une expérience gastronomique sans quitter
			votre domicile.
		</p>
		<button onclick={onNext} class="rounded-full bg-navy px-14 py-3 text-sm font-medium text-white">
			Suivant
		</button>
		<div class="mt-3 flex justify-center">
			<OnboardingDots {active} />
		</div>
	</div>
</section>
