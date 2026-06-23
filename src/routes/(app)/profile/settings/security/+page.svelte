<script lang="ts">
	import { untrack } from 'svelte';
	import type { PageData } from './$types';
	import flecheRetourOrange from '$lib/assets/img/fleche-retour-orange.png';
	import flecheRetourVerte from '$lib/assets/img/fleche-retour-verte.png';

	let { data }: { data: PageData } = $props();

	const initialEmail = untrack(() => data.email);
	let email = $state(initialEmail ?? '');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let saving = $state(false);
	let saveSuccess = $state(false);

	async function save() {
		if (newPassword && newPassword !== confirmPassword) return;
		saving = true;
		const body: Record<string, string> = { email };
		if (newPassword && currentPassword) {
			body.currentPassword = currentPassword;
			body.newPassword = newPassword;
		}
		await fetch('/api/user/security', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		saving = false;
		saveSuccess = true;
		setTimeout(() => (saveSuccess = false), 3000);
	}

	async function logout() {
		await fetch('/api/auth/sign-out', { method: 'POST' });
		window.location.href = '/login';
	}
</script>

<!-- En-tête -->
<div class="flex items-center justify-between pt-2 pb-4">
	<a href="/profile/settings" aria-label="Retour">
		<img
			src={data.isChief ? flecheRetourOrange : flecheRetourVerte}
			alt="Retour"
			class="h-5 w-5 object-contain"
		/>
	</a>
	<h1 class="text-base font-semibold text-navy">Connexion & sécurité</h1>
	<div class="w-5"></div>
</div>

<!-- Identifiants -->
<div class="mb-6 divide-y divide-navy/8 rounded-2xl border border-navy/8">
	<div class="px-4 py-3">
		<p class="mb-2 text-xs font-semibold tracking-wide text-navy/40 uppercase">
			Identifiants et connexions
		</p>
	</div>
	<div class="px-4 py-3.5">
		<label for="sec-email" class="mb-1 block text-xs font-medium text-navy/60">Adresse email</label>
		<input
			type="email"
			id="sec-email"
			bind:value={email}
			class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy/40"
		/>
	</div>
	<div class="px-4 py-3.5">
		<label for="sec-current-pwd" class="mb-1 block text-xs font-medium text-navy/60"
			>Mot de passe actuel</label
		>
		<input
			type="password"
			id="sec-current-pwd"
			bind:value={currentPassword}
			placeholder="••••••••"
			class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy/40"
		/>
	</div>
	<div class="px-4 py-3.5">
		<label for="sec-new-pwd" class="mb-1 block text-xs font-medium text-navy/60"
			>Nouveau mot de passe</label
		>
		<input
			type="password"
			id="sec-new-pwd"
			bind:value={newPassword}
			placeholder="••••••••"
			class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy/40"
		/>
	</div>
	{#if newPassword}
		<div class="px-4 py-3.5">
			<label for="sec-confirm-pwd" class="mb-1 block text-xs font-medium text-navy/60"
				>Confirmer le nouveau mot de passe</label
			>
			<input
				type="password"
				id="sec-confirm-pwd"
				bind:value={confirmPassword}
				placeholder="••••••••"
				class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy/40 {confirmPassword &&
				confirmPassword !== newPassword
					? 'border-red-400 text-red-500'
					: 'text-navy'}"
			/>
			{#if confirmPassword && confirmPassword !== newPassword}
				<p class="mt-1 text-xs text-red-400">Les mots de passe ne correspondent pas</p>
			{/if}
		</div>
	{/if}
</div>

<button
	type="button"
	onclick={save}
	disabled={saving || (!!newPassword && newPassword !== confirmPassword)}
	class="w-full rounded-2xl bg-navy py-3.5 text-sm font-semibold text-white disabled:opacity-60"
>
	{#if saveSuccess}
		✓ Enregistré
	{:else}
		{saving ? '...' : 'Enregistrer'}
	{/if}
</button>

<!-- Déconnexion -->
<div class="mt-6">
	<div class="relative flex items-center py-3">
		<div class="flex-1 border-t border-dashed border-navy/20"></div>
		<span class="mx-4 text-sm text-navy/40">Déconnexion</span>
		<div class="flex-1 border-t border-dashed border-navy/20"></div>
	</div>
	<button
		type="button"
		onclick={logout}
		class="w-full rounded-2xl bg-rust py-3.5 text-sm font-semibold text-white"
	>
		Se déconnecter
	</button>
</div>

<!-- Supprimer mon compte -->
<div class="mt-4 text-center">
	<a
		href="/profile/settings/security/delete"
		class="text-sm text-rust underline underline-offset-2"
	>
		Supprimer mon compte
	</a>
</div>
