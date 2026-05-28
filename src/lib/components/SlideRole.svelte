<script lang="ts">
	import { enhance } from '$app/forms';
	import OnboardingDots from './OnboardingDots.svelte';
	import slide1 from '$lib/assets/img/slide-1.jpeg';
	import logoGusti2 from '$lib/assets/img/logo-gusti2.png';
	import gustichefEcriture from '$lib/assets/img/gustichef-ecriture.png';

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
				<span class="flex-1 text-[0.95rem] text-stone-700">chief</span>
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
