<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const accentColor = $derived(data.isChief ? 'bg-rust' : 'bg-teal');

	let email = $state(data.email ?? '');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let googleLinked = $state(false);

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
		await fetch('/api/user/security', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
<div class="flex items-center justify-between pb-4 pt-2">
	<a href="/profile/settings" class="text-navy/50 hover:text-navy">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
			<path fill-rule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clip-rule="evenodd" />
		</svg>
	</a>
	<h1 class="text-base font-semibold text-navy">Connexion & sécurité</h1>
	<div class="w-5"></div>
</div>

<!-- Identifiants -->
<div class="mb-6 rounded-2xl border border-navy/8 divide-y divide-navy/8">
	<div class="px-4 py-3">
		<p class="mb-2 text-xs font-semibold text-navy/40 uppercase tracking-wide">Identifiants et connexions</p>
	</div>
	<div class="px-4 py-3.5">
		<label class="mb-1 block text-xs font-medium text-navy/60">Adresse email</label>
		<input
			type="email"
			bind:value={email}
			class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy/40"
		/>
	</div>
	<div class="px-4 py-3.5">
		<label class="mb-1 block text-xs font-medium text-navy/60">Mot de passe actuel</label>
		<input
			type="password"
			bind:value={currentPassword}
			placeholder="••••••••"
			class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy/40"
		/>
	</div>
	<div class="px-4 py-3.5">
		<label class="mb-1 block text-xs font-medium text-navy/60">Nouveau mot de passe</label>
		<input
			type="password"
			bind:value={newPassword}
			placeholder="••••••••"
			class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy/40"
		/>
	</div>
	{#if newPassword}
		<div class="px-4 py-3.5">
			<label class="mb-1 block text-xs font-medium text-navy/60">Confirmer le nouveau mot de passe</label>
			<input
				type="password"
				bind:value={confirmPassword}
				placeholder="••••••••"
				class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy/40 {confirmPassword && confirmPassword !== newPassword ? 'border-red-400 text-red-500' : 'text-navy'}"
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
	<a href="/profile/settings/security/delete" class="text-sm text-rust underline underline-offset-2">
		Supprimer mon compte
	</a>
</div>
