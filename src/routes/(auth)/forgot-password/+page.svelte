<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import ecriture from '$lib/assets/img/gustichef-ecriture-verte.png';
	import bg from '$lib/assets/img/slide-1.jpeg';

	let email = $state('');
	let sent = $state(false);
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';
		const result = await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' });
		if (result.error) {
			error = result.error.message ?? 'Erreur';
			loading = false;
		} else {
			sent = true;
		}
	}
</script>

<div class="relative flex h-dvh flex-col overflow-hidden">
	<img src={bg} alt="" class="absolute inset-0 h-full w-full object-cover" />
	<div class="absolute inset-0 bg-navy/60"></div>

	<div class="relative z-10 flex h-full flex-col">
		<div class="flex flex-1 flex-col items-center justify-end pb-10">
			<img src={ecriture} alt="Gustichef" class="h-14 object-contain brightness-0 invert" />
		</div>

		<div class="rounded-t-3xl bg-cream px-6 pt-8 pb-10">
			<h1 class="mb-2 text-lg font-semibold text-navy">Mot de passe oublié</h1>
			<p class="mb-6 text-sm text-gray-500">
				Saisis ton adresse email et on t'envoie un lien pour réinitialiser ton mot de passe.
			</p>

			{#if error}
				<p class="mb-4 text-sm text-rust">{error}</p>
			{/if}

			<form onsubmit={handleSubmit} class="flex flex-col gap-4">
				<div class="flex flex-col gap-1">
					<label for="email" class="text-xs font-medium text-navy/70">Adresse mail</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="utilisateurmail@email.com"
						required
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-xl bg-navy py-3 text-sm font-medium text-cream disabled:opacity-60"
				>
					{loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
				</button>
			</form>

			<a href="/login" class="mt-5 flex items-center justify-center gap-1 text-xs text-navy/60">
				<svg viewBox="0 0 20 20" fill="currentColor" class="h-3 w-3" aria-hidden="true">
					<path
						fill-rule="evenodd"
						d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
						clip-rule="evenodd"
					/>
				</svg>
				Retour à la connexion
			</a>
		</div>
	</div>
</div>

{#if sent}
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
			<h2 class="mb-2 text-lg font-semibold text-navy">Email envoyé !</h2>
			<p class="mb-3 text-sm text-gray-500">
				Un lien de réinitialisation a été envoyé à
				<span class="font-medium text-navy">{email}</span>
			</p>
			<p class="text-xs text-gray-400">
				Vérifie également ton dossier spam.<br />Le lien expire dans 30 minutes.
			</p>
		</div>
	</div>
{/if}
