<script lang="ts">
	import type { PageData } from './$types';
	import flecheRetourOrange from '$lib/assets/img/fleche-retour-orange.png';
	import flecheRetourVerte from '$lib/assets/img/fleche-retour-verte.png';
	let { data }: { data: PageData } = $props();
	const REASONS = [
		"Je n'utilise plus le service",
		'Je crée un nouveau compte',
		'Problème avec le service',
		'Préoccupations concernant la confidentialité',
		'Autre'
	];

	let reason = $state('');
	let password = $state('');
	let confirmed = $state(false);
	let deleting = $state(false);

	async function deleteAccount() {
		if (!confirmed || !password) return;
		deleting = true;
		await fetch('/api/user/delete', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password, reason })
		});
		window.location.href = '/login';
	}
</script>

<!-- En-tête -->
<div class="flex items-center justify-between pt-2 pb-5">
	<a href="/profile/settings/security" aria-label="Retour">
		<img
			src={data.isChief ? flecheRetourOrange : flecheRetourVerte}
			alt="Retour"
			class="h-5 w-5 object-contain"
		/>
	</a>
	<h1 class="text-base font-semibold text-rust">Supprimer mon compte</h1>
	<div class="w-5"></div>
</div>

<!-- Avertissement -->
<div
	class="mb-4 flex items-center gap-2 rounded-xl bg-rust/8 px-3.5 py-2.5 text-sm font-medium text-rust/70"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		class="h-4 w-4 shrink-0"
	>
		<path
			fill-rule="evenodd"
			d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
			clip-rule="evenodd"
		/>
	</svg>
	Action irréversible
</div>

<p class="mb-5 text-sm leading-relaxed text-navy/60">
	Cette action supprimera définitivement votre compte et toutes vos données associées.
</p>

<!-- Raison -->
<div class="mb-4">
	<label for="delete-reason" class="mb-1.5 block text-sm font-medium text-navy"
		>Raison de suppression (optionnel)</label
	>
	<div class="relative">
		<select
			id="delete-reason"
			bind:value={reason}
			class="w-full appearance-none rounded-xl border border-navy/15 bg-white px-3.5 py-3 text-sm outline-none {reason
				? 'text-navy'
				: 'text-navy/40'}"
		>
			<option value="">Sélectionner une raison...</option>
			{#each REASONS as r (r)}
				<option value={r}>{r}</option>
			{/each}
		</select>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 16 16"
			fill="currentColor"
			class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-navy/30"
		>
			<path
				fill-rule="evenodd"
				d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
				clip-rule="evenodd"
			/>
		</svg>
	</div>
</div>

<!-- Identité -->
<div class="mb-5">
	<p class="mb-1.5 block text-sm font-medium text-navy">Confirme votre identité</p>
	<label for="delete-password" class="mb-1 block text-xs text-navy/50">Mot de passe</label>
	<input
		type="password"
		id="delete-password"
		bind:value={password}
		placeholder="••••••••"
		class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-3 text-sm text-navy outline-none focus:border-navy/40"
	/>
</div>

<!-- Checkbox -->
<label class="mb-6 flex cursor-pointer items-start gap-3">
	<input type="checkbox" bind:checked={confirmed} class="mt-0.5 h-4 w-4 accent-rust" />
	<span class="text-sm text-navy/70">Je comprends que cette action est irréversible.</span>
</label>

<!-- Boutons -->
<a
	href="/profile/settings/security"
	class="mb-3 flex w-full items-center justify-center rounded-2xl bg-navy py-4 text-sm font-semibold text-white"
>
	Annuler
</a>
<button
	type="button"
	onclick={deleteAccount}
	disabled={!confirmed || !password || deleting}
	class="w-full rounded-2xl bg-rust py-4 text-sm font-semibold text-white disabled:opacity-40"
>
	{deleting ? '...' : 'Supprimer définitivement mon compte'}
</button>
