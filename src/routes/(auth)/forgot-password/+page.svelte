<script lang="ts">
	import { createAuthClient } from 'better-auth/svelte';

	const { requestPasswordReset } = createAuthClient();

	let email = $state('');
	let sent = $state(false);
	let error = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const result = await requestPasswordReset({ email, redirectTo: '/reset-password' });
		if (result.error) error = result.error.message ?? 'Erreur';
		else sent = true;
	}
</script>

<form onsubmit={handleSubmit}>
	<h1>Mot de passe oublié</h1>

	{#if sent}
		<p>Email envoyé ! Vérifiez votre boîte mail.</p>
	{:else}
		{#if error}
			<p>{error}</p>
		{/if}

		<input type="email" bind:value={email} placeholder="Email" required />
		<button type="submit">Envoyer le lien</button>
	{/if}

	<a href="/login">Retour à la connexion</a>
</form>
