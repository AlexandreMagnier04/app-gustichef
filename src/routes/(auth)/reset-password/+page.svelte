<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import logoBlancImg from '$lib/assets/img/gustichef-ecriture-blanc.png';
	import bg from '$lib/assets/img/slide-1.jpeg';

	let token = $derived(page.url.searchParams.get('token') ?? '');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let success = $state(false);
	let error = $state('');
	let loading = $state(false);

	let hasLength = $derived(newPassword.length >= 8);
	let hasUpper = $derived(/[A-Z]/.test(newPassword));
	let hasDigit = $derived(/[0-9]/.test(newPassword));
	let hasSpecial = $derived(/[@#$!%*?&]/.test(newPassword));

	async function handleReset(e: SubmitEvent) {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			error = 'Les mots de passe ne correspondent pas';
			return;
		}
		loading = true;
		error = '';
		const result = await authClient.resetPassword({ newPassword, token });
		if (result.error) {
			error = result.error.message ?? 'Erreur lors de la réinitialisation';
			loading = false;
		} else {
			success = true;
		}
	}
</script>

<div class="relative flex h-dvh flex-col overflow-hidden">
	<img src={bg} alt="" class="absolute inset-0 h-full w-full object-cover" />
	<div class="absolute inset-0 bg-navy/60"></div>

	<div class="relative z-10 flex h-full flex-col">
		<div class="flex flex-1 flex-col items-center justify-end pb-10">
			<img src={logoBlancImg} alt="Gustichef" class="h-14 object-contain" />
		</div>

		<div class="rounded-t-3xl bg-cream px-6 pt-8 pb-10">
			{#if error}
				<p class="mb-4 text-sm text-rust">{error}</p>
			{/if}

			<form onsubmit={handleReset} class="flex flex-col gap-4">
				<div class="flex flex-col gap-1">
					<label for="reset-password" class="text-xs font-medium text-navy/70">Nouveau mot de passe</label>
					<input
						id="reset-password"
						type="password"
						bind:value={newPassword}
						placeholder="••••••••"
						required
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
					/>
				</div>

				<div class="flex flex-col gap-1">
					<label for="reset-confirm" class="text-xs font-medium text-navy/70">Confirmer le mot de passe</label>
					<input
						id="reset-confirm"
						type="password"
						bind:value={confirmPassword}
						placeholder="••••••••"
						required
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
					/>
				</div>

				<div class="rounded-lg bg-white/70 p-4 text-xs">
					<p class="mb-2 font-medium text-navy/70">Ton mot de passe doit contenir au moins :</p>
					<ul class="flex flex-col gap-1">
						<li class={hasLength ? 'text-green-600' : 'text-rust'}>
							{hasLength ? '✓' : '✗'} 8 caractères minimum
						</li>
						<li class={hasUpper ? 'text-green-600' : 'text-rust'}>
							{hasUpper ? '✓' : '✗'} 1 lettre majuscule (A-Z)
						</li>
						<li class={hasDigit ? 'text-green-600' : 'text-rust'}>
							{hasDigit ? '✓' : '✗'} 1 chiffre (0-9)
						</li>
						<li class={hasSpecial ? 'text-green-600' : 'text-rust'}>
							{hasSpecial ? '✓' : '✗'} 1 caractère spécial (@ # $ ...)
						</li>
					</ul>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="mt-2 w-full rounded-xl bg-navy py-3 text-sm font-medium text-cream disabled:opacity-60"
				>
					{loading ? 'Réinitialisation...' : 'Réinitialiser mon mot de passe'}
				</button>
			</form>
		</div>
	</div>
</div>

{#if success}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
		<div class="w-full max-w-xs rounded-2xl bg-white p-8 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy">
				<svg viewBox="0 0 24 24" fill="none" class="h-8 w-8" aria-hidden="true">
					<path
						d="M5 13l4 4L19 7"
						stroke="white"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<h2 class="mb-2 text-lg font-semibold text-navy">Mot de passe mis à jour !</h2>
			<p class="mb-6 text-sm text-gray-500">
				Tu peux maintenant te connecter avec ton nouveau mot de passe.
			</p>
			<a href="/login" class="block w-full rounded-xl bg-navy py-3 text-sm font-medium text-cream">
				Retour à la connexion
			</a>
		</div>
	</div>
{/if}
