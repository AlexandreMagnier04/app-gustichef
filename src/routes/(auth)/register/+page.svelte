<script lang="ts">
	import { createAuthClient } from 'better-auth/svelte';

	const { signUp } = createAuthClient();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		const result = await signUp.email({ name, email, password, callbackURL: '/' });
		if (result.error) error = result.error.message ?? 'Erreur lors de la création du compte';
	}
</script>

<form onsubmit={handleRegister}>
	<h1>Créer un compte</h1>

	{#if error}
		<p>{error}</p>
	{/if}

	<input type="text" bind:value={name} placeholder="Nom" required />
	<input type="email" bind:value={email} placeholder="Email" required />
	<input type="password" bind:value={password} placeholder="Mot de passe" required />

	<button type="submit">S'inscrire</button>

	<a href="/login">Déjà un compte ?</a>
</form>
