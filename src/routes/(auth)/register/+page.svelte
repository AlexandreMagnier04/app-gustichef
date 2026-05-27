<script lang="ts">
	import { page } from '$app/state';
	import { signUp } from '$lib/auth-client';
	import { signUpDto } from '$lib/dtos/auth.dto';

	// Rôle transmis par l'onboarding via ?role=chef|customer
	let role = $derived((page.url.searchParams.get('role') ?? 'customer') as 'chef' | 'customer');

	let name = $state('');
	let firstname = $state('');
	let email = $state('');
	let password = $state('');
	let localization = $state('');
	let errors = $state<Record<string, string>>({});
	let serverError = $state('');

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		serverError = '';

		// Validation Zod côté client avant d'envoyer
		const parsed = signUpDto.safeParse({ name, firstname, email, password, role, localization });
		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors;
			errors = Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? '']));
			return;
		}

		const result = await signUp.email({
			name: parsed.data.name,
			email: parsed.data.email,
			password: parsed.data.password,
			// Champs additionnels Better Auth
			firstname: parsed.data.firstname,
			role: parsed.data.role,
			localization: parsed.data.localization,
			callbackURL: '/'
		});

		if (result.error) {
			serverError = result.error.message ?? 'Erreur lors de la création du compte';
		}
	}
</script>

<form onsubmit={handleRegister}>
	<h1>Créer un compte</h1>
	<p>Vous rejoignez en tant que <strong>{role === 'chef' ? 'Chef' : 'Particulier'}</strong></p>

	{#if serverError}
		<p class="error">{serverError}</p>
	{/if}

	<div>
		<input type="text" bind:value={name} placeholder="Nom" required />
		{#if errors.name}<span class="error">{errors.name}</span>{/if}
	</div>

	<div>
		<input type="text" bind:value={firstname} placeholder="Prénom" required />
		{#if errors.firstname}<span class="error">{errors.firstname}</span>{/if}
	</div>

	<div>
		<input type="email" bind:value={email} placeholder="Email" required />
		{#if errors.email}<span class="error">{errors.email}</span>{/if}
	</div>

	<div>
		<input
			type="password"
			bind:value={password}
			placeholder="Mot de passe (8 caractères min)"
			required
		/>
		{#if errors.password}<span class="error">{errors.password}</span>{/if}
	</div>

	<div>
		<input type="text" bind:value={localization} placeholder="Ville / Localisation" required />
		{#if errors.localization}<span class="error">{errors.localization}</span>{/if}
	</div>

	<button type="submit">S'inscrire</button>

	<a href="/login">Déjà un compte ?</a>
</form>
