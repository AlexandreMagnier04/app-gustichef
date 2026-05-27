<script lang="ts">
	import { onMount } from 'svelte';
	import OnboardingDots from './OnboardingDots.svelte';
	import portrait1 from '$lib/assets/img/portrait-1.jpeg';
	import portrait2 from '$lib/assets/img/portrait-2.jpeg';
	import portrait3 from '$lib/assets/img/portrait-3.jpeg';
	import portrait4 from '$lib/assets/img/portrait-4.jpeg';
	import gustichefEcriture from '$lib/assets/img/gustichef-ecriture.png';

	// Ce composant a besoin de 3 props :
	// - active : index du slide (pour les dots)
	// - onNext / onPrev : callbacks vers le parent
	let {
		active,
		onNext,
		onPrev
	}: {
		active: number;
		onNext: () => void;
		onPrev: () => void;
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
		<button
			onclick={onPrev}
			aria-label="Retour"
			class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-white"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
			</svg>
		</button>
		<div
			class="absolute inset-x-0 bottom-0 h-36"
			style="background: linear-gradient(to top, #F5EDDC, #F5EDDC 20%, transparent)"
		></div>
	</div>

	<div class="shrink-0 px-6 pt-3 pb-8 text-center">
		<img src={gustichefEcriture} alt="Gustichef" class="mx-auto mb-2 h-9 object-contain" />
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
