<script lang="ts">
	import SlideIntro from '$lib/features/onboarding/SlideIntro.svelte';
	import SlideChef from '$lib/features/onboarding/SlideChef.svelte';
	import SlideRole from '$lib/features/onboarding/SlideRole.svelte';

	// slide = seul état que le parent gère — tout le reste est interne aux composants enfants
	let slide = $state(0);

	function next() {
		slide = Math.min(slide + 1, 2);
	}
	function prev() {
		slide = Math.max(slide - 1, 0);
	}

	// Swipe : PointerEvent couvre à la fois touch et souris, pas de double-fire
	let swipeStartX = 0;
	function onPointerDown(e: PointerEvent) {
		// Ignore si l'utilisateur touche un élément interactif (bouton, input...)
		if ((e.target as HTMLElement).closest('button, a, input, label')) return;
		swipeStartX = e.clientX;
	}
	function onPointerUp(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('button, a, input, label')) return;
		const delta = swipeStartX - e.clientX;
		if (Math.abs(delta) < 40) return; // seuil : évite de swiper par accident sur un tap
		if (delta > 0)
			next(); // swipe gauche → slide Suivant
		else prev(); // swipe droite → slide précédent
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="relative h-dvh w-screen overflow-hidden"
	role="region"
	aria-label="Presentation"
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
>
	<!-- Conteneur 300vw qui se translate selon l'index du slide -->
	<!-- calc(-{slide} * 100vw) : slide=0 → 0px, slide=1 → -100vw, slide=2 → -200vw -->
	<div
		class="flex h-full touch-none transition-transform duration-300 ease-out will-change-transform"
		style="width: 300vw; transform: translateX(calc(-{slide} * 100vw))"
	>
		<!-- active={slide} descend vers chaque composant pour mettre à jour les dots -->
		<!-- onNext={next} et onPrev={prev} : on passe nos fonctions locales aux enfants -->
		<SlideIntro active={slide} onNext={next} />
		<SlideChef active={slide} onNext={next} onPrev={prev} />
		<SlideRole active={slide} onPrev={prev} />
	</div>
</div>
