<script lang="ts">
	import { signIn } from '$lib/auth-client';
	import logoBlancImg from '$lib/assets/img/logo-gusti-blanc.png';
	import bg from '$lib/assets/img/slide-1.jpeg';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';
		const result = await signIn.email({ email, password, callbackURL: '/dashboard' });
		if (result.error) {
			error = result.error.message ?? 'Email ou mot de passe incorrect';
			loading = false;
		}
	}

	async function handleGoogle() {
		await signIn.social({ provider: 'google', callbackURL: '/dashboard' });
	}
</script>

<div class="relative flex h-dvh flex-col overflow-hidden">
	<img src={bg} alt="" class="absolute inset-0 h-full w-full object-cover" />
	<div class="absolute inset-0 bg-navy/55"></div>

	<div class="relative z-10 flex h-full flex-col">
		<div class="flex flex-1 flex-col items-center justify-end pb-10">
			<p class="mb-3 text-sm text-white/70">Bienvenue sur</p>
			<img src={logoBlancImg} alt="Gustichef" class="h-12 object-contain" />
		</div>

		<div class="rounded-t-3xl bg-cream px-6 pt-8 pb-10">
			{#if error}
				<p class="mb-4 text-sm text-rust">{error}</p>
			{/if}

			<form onsubmit={handleLogin} class="flex flex-col gap-4">
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Adresse mail</label>
					<input
						type="email"
						bind:value={email}
						placeholder="ton adresse mail"
						required
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
					/>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Mot de passe</label>
					<input
						type="password"
						bind:value={password}
						placeholder="••••••••"
						required
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
					/>
					<a href="/forgot-password" class="self-end text-xs text-rust">Mot de passe oublié ?</a>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="mt-2 w-full rounded-xl bg-navy py-3 text-sm font-medium text-cream disabled:opacity-60"
				>
					{loading ? 'Connexion...' : 'se connecter'}
				</button>
			</form>

			<div class="my-5 flex items-center gap-3">
				<div class="h-px flex-1 bg-gray-200"></div>
				<span class="text-xs text-gray-400">ou</span>
				<div class="h-px flex-1 bg-gray-200"></div>
			</div>

			<button
				type="button"
				onclick={handleGoogle}
				class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm text-navy"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true">
					<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
					<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
					<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
					<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
				</svg>
				Continuer avec Google
			</button>

			<p class="mt-6 text-center text-xs text-gray-500">
				Pas encore inscrit ?
				<a href="/register" class="font-medium text-navy">S'inscrire</a>
			</p>
		</div>
	</div>
</div>
