<script lang="ts">
	import OnboardingDots from './OnboardingDots.svelte';
	import slide1 from '$lib/assets/img/slide-1.jpeg';
	import slide2 from '$lib/assets/img/slide-2.jpeg';
	import slide3 from '$lib/assets/img/slide-3.jpeg';
	import slide4 from '$lib/assets/img/slide-4.jpeg';
	import slide5 from '$lib/assets/img/slide-5.jpeg';
	import slide6 from '$lib/assets/img/slide-6.jpeg';
	import slide8 from '$lib/assets/img/slide-8.jpeg';
	import slide9 from '$lib/assets/img/slide-9.jpeg';
	import slide10 from '$lib/assets/img/slide-10.jpeg';
	import logo from '$lib/assets/img/gustichef-ecriture-orange.png';

	let { active, onNext }: { active: number; onNext: () => void } = $props();

	const all = [slide1, slide2, slide3, slide4, slide5, slide6, slide8, slide9, slide10];
	const rot = (n: number) => [...all.slice(n), ...all.slice(0, n)];
	// 4 copies : le CSS anime de 0% à -25% — le saut de boucle est 2x moins fréquent qu'avec 2 copies
	const band1 = [...rot(0), ...rot(0), ...rot(0), ...rot(0)];
	const band2 = [...rot(3), ...rot(3), ...rot(3), ...rot(3)];
	const band3 = [...rot(6), ...rot(6), ...rot(6), ...rot(6)];
</script>

<section class="flex h-dvh w-screen shrink-0 flex-col overflow-hidden bg-cream">
	<!-- Bande 1 — défile vers la gauche en 22s -->
	<div class="flex-2 overflow-hidden pt-2 pl-2">
		<div class="band-left flex h-full" style="animation-duration: 28s">
			{#each band1 as src, i (i)}
				<div class="mr-2 aspect-square h-full shrink-0 overflow-hidden rounded-2xl">
					<img {src} alt="" decoding="async" class="h-full w-full object-cover" />
				</div>
			{/each}
		</div>
	</div>

	<div class="flex shrink-0 flex-col items-center justify-center px-6 py-3 text-center">
		<img src={logo} alt="Gustichef" class="h-24 object-contain" />
		<p class="mt-1 text-[0.8rem] font-medium text-[#051E23]">Voyage culinaire pas si loin que ça</p>
	</div>

	<!-- Bande 2 — défile vers la gauche en 30s (plus lente = effet de profondeur) -->
	<div class="flex-3 overflow-hidden pl-2">
		<div class="band-left flex h-full" style="animation-duration: 38s">
			{#each band2 as src, i (i)}
				<div class="mr-2 aspect-square h-full shrink-0 overflow-hidden rounded-2xl">
					<img {src} alt="" decoding="async" class="h-full w-full object-cover" />
				</div>
			{/each}
		</div>
	</div>

	<!-- Bande 3 — défile vers la gauche en 18s (plus rapide) -->
	<div class="flex-4 overflow-hidden pb-2 pl-2">
		<div class="band-left flex h-full" style="animation-duration: 22s">
			{#each band3 as src, i (i)}
				<div class="mr-2 aspect-square h-full shrink-0 overflow-hidden rounded-2xl">
					<img {src} alt="" decoding="async" class="h-full w-full object-cover" />
				</div>
			{/each}
		</div>
	</div>

	<div class="flex shrink-0 flex-col items-center gap-3 py-4">
		<button onclick={onNext} class="rounded-full bg-navy px-14 py-3 text-sm font-medium text-white">
			Suivant
		</button>
		<OnboardingDots {active} />
	</div>
</section>

<style>
	/* translateX(-50%) = exactement une moitié du track (= un exemplaire des 9 images)
	   La bande étant doublée, le point de reprise est invisible */
	@keyframes band-left {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-25%);
		}
	}
	.band-left {
		animation: band-left linear infinite;
		will-change: transform;
	}
</style>
