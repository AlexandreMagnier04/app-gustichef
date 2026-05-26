<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	// Images des bandes défilantes (slide 0) — pas de slide-7
	import slide1 from '$lib/assets/img/slide-1.jpeg';
	import slide2 from '$lib/assets/img/slide-2.jpeg';
	import slide3 from '$lib/assets/img/slide-3.jpeg';
	import slide4 from '$lib/assets/img/slide-4.jpeg';
	import slide5 from '$lib/assets/img/slide-5.jpeg';
	import slide6 from '$lib/assets/img/slide-6.jpeg';
	import slide8 from '$lib/assets/img/slide-8.jpeg';
	import slide9 from '$lib/assets/img/slide-9.jpeg';
	import slide10 from '$lib/assets/img/slide-10.jpeg';
	// Portraits chefs pour le carrousel fondu (slide 1)
	import portrait1 from '$lib/assets/img/portrait-1.jpeg';
	import portrait2 from '$lib/assets/img/portrait-2.jpeg';
	import portrait3 from '$lib/assets/img/portrait-3.jpeg';
	import portrait4 from '$lib/assets/img/portrait-4.jpeg';
	// Assets graphiques
	import logo from '$lib/assets/img/logo-gusti.png';
	import logoGusti2 from '$lib/assets/img/logo-gusti2.png';
	import gustichefEcriture from '$lib/assets/img/gustichef-ecriture.png';

	// Index du slide actif (0 = collage, 1 = chef, 2 = choix profil)
	let slide = $state(0);
	// Rôle sélectionné — null jusqu'à la soumission du formulaire
	let role = $state<'chef' | 'customer' | null>(null);
	// Index de la photo de chef affichée (change toutes les 3,5s)
	let chefPhotoIndex = $state(0);

	function next() {
		slide = Math.min(slide + 1, 2);
	}
	function prev() {
		slide = Math.max(slide - 1, 0);
	}

	// Swipe horizontal unifié avec PointerEvent (couvre touch + souris sans double-fire)
	// On ignore les cibles interactives pour ne pas bloquer boutons/labels
	let swipeStartX = 0;
	function onPointerDown(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('button, a, input, label')) return;
		swipeStartX = e.clientX;
	}
	function onPointerUp(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('button, a, input, label')) return;
		const delta = swipeStartX - e.clientX;
		if (Math.abs(delta) < 40) return; // seuil anti-tap accidentel
		if (delta > 0) next();
		else prev();
	}

	// La barre active suit directement l'index du slide
	const dotActive = $derived(slide);

	// 9 images réparties en 3 bandes décalées (rot = rotation circulaire)
	const all = [slide1, slide2, slide3, slide4, slide5, slide6, slide8, slide9, slide10];
	const rot = (n: number) => [...all.slice(n), ...all.slice(0, n)];

	// Chaque bande est doublée : le RAF déplace de 0 à -scrollWidth/2 puis repart
	// sans saut grâce au mr-2 sur chaque item (pas gap, qui décalerait le point de boucle)
	const band1 = [...rot(0), ...rot(0)];
	const band2 = [...rot(3), ...rot(3)];
	const band3 = [...rot(6), ...rot(6)];

	const chefPalette = [portrait1, portrait2, portrait3, portrait4];

	// Références DOM des 3 tracks pour le RAF (bind:this dans le template)
	let trackEls: (HTMLDivElement | null)[] = [null, null, null];
	// Vitesses en px/s : positif = gauche, négatif = droite
	const speeds = [18, -13, 22];

	onMount(() => {
		const offsets = [0, 0, 0];
		let last = performance.now();
		let raf: number;

		// RAF au lieu de CSS @keyframes : boucle vraiment continue, pas de reset visible
		function tick(now: number) {
			const dt = (now - last) / 1000;
			last = now;
			for (let i = 0; i < trackEls.length; i++) {
				const el = trackEls[i];
				if (!el) continue;
				const half = el.scrollWidth / 2; // mesuré au runtime = pixel-perfect
				offsets[i] -= speeds[i] * dt;
				if (offsets[i] <= -half) offsets[i] += half;
				if (offsets[i] > 0) offsets[i] -= half;
				el.style.transform = `translateX(${offsets[i]}px)`;
			}
			raf = requestAnimationFrame(tick);
		}

		raf = requestAnimationFrame(tick);

		// Rotation automatique des portraits (slide 1) toutes les 3,5s
		const t = setInterval(() => {
			chefPhotoIndex = (chefPhotoIndex + 1) % chefPalette.length;
		}, 3500);

		return () => {
			cancelAnimationFrame(raf);
			clearInterval(t);
		};
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="relative h-dvh w-screen overflow-hidden">
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="flex h-full touch-none transition-transform duration-300 ease-out will-change-transform"
		style="width: 300vw; transform: translateX(calc(-{slide} * 100vw))"
		role="region"
		aria-label="Presentation"
		onpointerdown={onPointerDown}
		onpointerup={onPointerUp}
	>
		<!-- SLIDE 0 : Intro collage -->
		<section class="flex h-dvh w-screen shrink-0 flex-col overflow-hidden bg-cream">
			<!-- Bande 1 -->
			<div class="flex-[2] overflow-hidden pt-2 pl-2">
				<div bind:this={trackEls[0]} class="flex h-full will-change-transform">
					{#each band1 as src, i (i)}
						<div class="mr-2 aspect-square h-full shrink-0 overflow-hidden rounded-2xl">
							<img {src} alt="" class="h-full w-full object-cover" />
						</div>
					{/each}
				</div>
			</div>

			<!-- Logo + tagline -->
			<div class="flex shrink-0 flex-col items-center justify-center px-6 py-3 text-center">
				<img src={logo} alt="Gustichef" class="" />
				<p class="mt-1 text-[0.8rem] font-medium text-[#051E23]">
					Voyage culinaire pas si loin que ça
				</p>
			</div>

			<!-- Bande 2 -->
			<div class="flex-[3] overflow-hidden pl-2">
				<div bind:this={trackEls[1]} class="flex h-full will-change-transform">
					{#each band2 as src, i (i)}
						<div class="mr-2 aspect-square h-full shrink-0 overflow-hidden rounded-2xl">
							<img {src} alt="" class="h-full w-full object-cover" />
						</div>
					{/each}
				</div>
			</div>

			<!-- Bande 3 -->
			<div class="flex-[4] overflow-hidden pb-2 pl-2">
				<div bind:this={trackEls[2]} class="flex h-full will-change-transform">
					{#each band3 as src, i (i)}
						<div class="mr-2 aspect-square h-full shrink-0 overflow-hidden rounded-2xl">
							<img {src} alt="" class="h-full w-full object-cover" />
						</div>
					{/each}
				</div>
			</div>

			<!-- Bottom -->
			<div class="flex shrink-0 flex-col items-center gap-3 py-4">
				<button
					onclick={next}
					class="rounded-full bg-navy px-14 py-3 text-sm font-medium text-white">suivant</button
				>
				<div class="flex items-center gap-1.5">
					{#each [0, 1, 2] as i (i)}
						<div
							class="h-1 w-8 rounded-full transition-colors duration-200 {i === dotActive
								? 'bg-rust'
								: 'bg-black/15'}"
						></div>
					{/each}
				</div>
			</div>
		</section>

		<!-- SLIDE 1 : Présentation chef -->
		<section class="flex h-dvh w-screen shrink-0 flex-col overflow-hidden bg-cream">
			<!-- Photo avec gradient vers crème -->
			<div class="relative min-h-0 flex-1 overflow-hidden">
				{#each chefPalette as src, ci (ci)}
					<img
						{src}
						alt=""
						class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
						style="opacity: {ci === chefPhotoIndex ? 1 : 0}"
					/>
				{/each}
				<button
					onclick={prev}
					aria-label="Retour"
					class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-white"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="size-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 19.5 8.25 12l7.5-7.5"
						/>
					</svg>
				</button>
				<!-- Gradient photo → crème -->
				<div
					class="absolute inset-x-0 bottom-0 h-36"
					style="background: linear-gradient(to top, #F5EDDC, #F5EDDC 20%, transparent)"
				></div>
			</div>

			<!-- Section crème en bas -->
			<div class="shrink-0 px-6 pb-8 pt-3 text-center">
				<img src={gustichefEcriture} alt="Gustichef" class="mx-auto mb-2 h-9 object-contain" />
				<h2 class="mb-1 text-[0.95rem] font-semibold text-navy">
					Bien plus qu'un repas, une signature culinaire.
				</h2>
				<p class="mb-5 text-[0.8rem] leading-relaxed text-stone-500">
					Trouvez l'inspiration parmi nos talents et vivez une expérience gastronomique sans quitter
					votre domicile.
				</p>
				<button onclick={next} class="rounded-full bg-navy px-14 py-3 text-sm font-medium text-white"
					>suivant</button
				>
				<div class="mt-3 flex items-center justify-center gap-1.5">
					{#each [0, 1, 2] as d (d)}
						<div
							class="h-1 w-8 rounded-full transition-colors duration-200 {d === dotActive
								? 'bg-rust'
								: 'bg-black/15'}"
						></div>
					{/each}
				</div>
			</div>
		</section>

		<!-- SLIDE 2 : Choix profil -->
		<section class="flex h-dvh w-screen shrink-0 flex-col overflow-hidden bg-cream">
			<!-- Photo avec gradient vers crème -->
			<div class="relative h-[46%] shrink-0 overflow-hidden">
				<img src={slide1} alt="" class="h-full w-full object-cover" />
				<button
					onclick={prev}
					aria-label="Retour"
					class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-white"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="size-5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
					</svg>
				</button>
				<div
					class="absolute inset-x-0 bottom-0 h-36"
					style="background: linear-gradient(to top, #F5EDDC, #F5EDDC 20%, transparent)"
				></div>
			</div>

			<form method="POST" use:enhance class="flex min-h-0 flex-1 flex-col px-6 pt-2 pb-8">
				<!-- Logo chevauche le bas de la photo -->
				<div class="mb-3 flex items-center justify-center gap-2.5">
					<img src={logoGusti2} alt="" class="h-9 w-9 object-contain" />
					<img src={gustichefEcriture} alt="Gustichef" class="h-8 object-contain" />
				</div>

				<h2 class="mb-1 text-center text-[1.05rem] font-semibold text-rust">choisissez votre profil</h2>
				<p class="mb-4 text-center text-[0.8rem] text-stone-500">
					Personnalisez votre expérience selon votre profil
				</p>

				<div class="flex flex-col gap-2.5">
					<label
						class="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 transition-colors"
						class:border-rust={role === 'chef'}
						class:border-stone-200={role !== 'chef'}
					>
						<input type="radio" name="role" value="chef" bind:group={role} class="sr-only" />
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							class="size-5 shrink-0 text-stone-500"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 1-3 0L6 18m12-3H6.75"
							/>
						</svg>
						<span class="flex-1 text-[0.95rem] text-stone-700">Chef</span>
						<div
							class="size-5 shrink-0 rounded-full border-2 transition-all"
							class:border-rust={role === 'chef'}
							class:bg-rust={role === 'chef'}
							class:shadow-[inset_0_0_0_3px_white]={role === 'chef'}
							class:border-stone-300={role !== 'chef'}
						></div>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 transition-colors"
						class:border-rust={role === 'customer'}
						class:border-stone-200={role !== 'customer'}
					>
						<input type="radio" name="role" value="customer" bind:group={role} class="sr-only" />
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							class="size-5 shrink-0 text-stone-500"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
							/>
						</svg>
						<span class="flex-1 text-[0.95rem] text-stone-700">Particulier</span>
						<div
							class="size-5 shrink-0 rounded-full border-2 transition-all"
							class:border-rust={role === 'customer'}
							class:bg-rust={role === 'customer'}
							class:shadow-[inset_0_0_0_3px_white]={role === 'customer'}
							class:border-stone-300={role !== 'customer'}
						></div>
					</label>
				</div>

				<div class="mt-auto mb-4 flex justify-center gap-1.5">
					{#each [0, 1, 2] as i (i)}
						<div
							class="h-1 w-8 rounded-full transition-colors"
							class:bg-rust={i === dotActive}
							class:bg-stone-200={i !== dotActive}
						></div>
					{/each}
				</div>

				<button
					type="submit"
					disabled={!role}
					class="rounded-full bg-navy py-3 text-sm font-medium text-white transition-opacity"
					class:opacity-40={!role}
					class:cursor-not-allowed={!role}
				>
					commencer
				</button>
			</form>
		</section>
	</div>
</div>
