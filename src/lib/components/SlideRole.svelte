<script lang="ts">
	import { enhance } from '$app/forms';
	import OnboardingDots from './OnboardingDots.svelte';
	import slide1 from '$lib/assets/img/slide-1.jpeg';
	import logoGusti2 from '$lib/assets/img/logo-gusti2.png';
	import gustichefEcriture from '$lib/assets/img/gustichef-ecriture-verte.png';

	let { active, onPrev }: { active: number; onPrev: () => void } = $props();

	// État local : rôle sélectionné par l'utilisateur
	// null = rien sélectionné, le bouton submit est désactivé
	let role = $state<'chief' | 'customer' | null>(null);
</script>

<section class="flex h-dvh w-screen shrink-0 flex-col overflow-hidden bg-cream">
	<div class="relative h-[46%] shrink-0 overflow-hidden">
		<img src={slide1} alt="" class="h-full w-full object-cover" />
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

	<!-- use:enhance : intercepte le submit natif du formulaire pour l'envoyer en fetch (sans rechargement de page) -->
	<!-- method="POST" + +page.server.ts = l'action SvelteKit reçoit les données -->
	<form method="POST" use:enhance class="flex min-h-0 flex-1 flex-col px-6 pt-2 pb-8">
		<div class="mb-3 flex items-center justify-center gap-2.5">
			<img src={logoGusti2} alt="" class="h-9 w-9 object-contain" />
			<img src={gustichefEcriture} alt="Gustichef" class="h-8 object-contain" />
		</div>

		<h2 class="mb-1 text-center text-[1.05rem] font-semibold text-rust">Choisissez votre profil</h2>
		<p class="mb-4 text-center text-[0.8rem] text-stone-500">
			Personnalisez votre expérience selon votre profil
		</p>

		<div class="flex flex-col gap-2.5">
			<label
				class="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 transition-colors"
				class:border-rust={role === 'chief'}
				class:border-stone-200={role !== 'chief'}
			>
				<!-- bind:group={role} : lie les radios à la variable role — quand on coche "chief", role = 'chief' -->
				<!-- sr-only : le vrai input radio est invisible, c'est le label entier qui est cliquable -->
				<input type="radio" name="role" value="chief" bind:group={role} class="sr-only" />
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5 shrink-0 text-stone-500">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V15h12v-1.5M8.5 13.5V11a3.5 3.5 0 0 1 2-3.15A3 3 0 1 1 14 7.85 3.5 3.5 0 0 1 15.5 11v2.5M9 16.5v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1" />
				</svg>
				<span class="flex-1 text-[0.95rem] text-stone-700">Chef</span>
				<!-- Indicateur visuel custom du radio — change de style selon role -->
				<div
					class="size-5 shrink-0 rounded-full border-2 transition-all"
					class:border-rust={role === 'chief'}
					class:bg-rust={role === 'chief'}
					class:shadow-[inset_0_0_0_3px_white]={role === 'chief'}
					class:border-stone-300={role !== 'chief'}
				></div>
			</label>

			<label
				class="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 transition-colors"
				class:border-rust={role === 'customer'}
				class:border-stone-200={role !== 'customer'}
			>
				<input type="radio" name="role" value="customer" bind:group={role} class="sr-only" />
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5 shrink-0 text-stone-500">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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

		<div class="mt-auto mb-4 flex justify-center">
			<OnboardingDots {active} />
		</div>

		<!-- disabled={!role} : le bouton est désactivé tant que rien n'est sélectionné -->
		<button
			type="submit"
			disabled={!role}
			class="rounded-full bg-navy py-3 text-sm font-medium text-white transition-opacity"
			class:opacity-40={!role}
			class:cursor-not-allowed={!role}
		>
			Commencer
		</button>
	</form>
</section>
