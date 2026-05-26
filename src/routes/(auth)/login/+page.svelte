<script lang="ts">
	import { signIn } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let error = $state('');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		const result = await signIn.email({ email, password, callbackURL: '/' });
		if (result.error) error = result.error.message ?? 'Erreur de connexion';
	}

	async function handleGoogle() {
		await signIn.social({ provider: 'google', callbackURL: '/' });
	}
</script>

<form onsubmit={handleLogin}>
	<h1>Connexion</h1>

	{#if error}
		<p>{error}</p>
	{/if}

	<input type="email" bind:value={email} placeholder="Email" required />
	<input type="password" bind:value={password} placeholder="Mot de passe" required />

	<button type="submit">Se connecter</button>
	<button type="button" onclick={handleGoogle}>Continuer avec Google</button>

	<a href="/forgot-password">Mot de passe oublié ?</a>
	<a href="/register">Créer un compte</a>
</form>
