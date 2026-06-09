<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { RequestWithCustomer } from '$lib/server/services/customers';

	let {
		open = $bindable(false),
		request = null,
	}: {
		open?: boolean;
		request?: RequestWithCustomer | null;
	} = $props();

	const PRICE_OPTIONS = [20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100, 120, 150, 200];

	let step = $state<1 | 2 | 'success'>(1);
	let message = $state('');
	let price = $state('');
	let pdfFile = $state<File | null>(null);
	let pdfInput = $state<HTMLInputElement | null>(null);
	let submitting = $state(false);
	let errorMsg = $state('');

	$effect(() => {
		if (!open) {
			step = 1;
			message = '';
			price = '';
			pdfFile = null;
			errorMsg = '';
			submitting = false;
		}
	});

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function close() {
		open = false;
	}

	function toStep2(e: Event) {
		e.preventDefault();
		if (!message || message.trim().length < 10) {
			errorMsg = 'Décrivez votre approche en au moins 10 caractères.';
			return;
		}
		errorMsg = '';
		step = 2;
	}

	function onPdfChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		pdfFile = input.files?.[0] ?? null;
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!request) return;
		submitting = true;
		errorMsg = '';

		const fd = new FormData();
		fd.set('message', message.trim());
		if (price) fd.set('price_per_person', price);
		if (pdfFile) fd.set('pdf', pdfFile);

		const res = await fetch(`/api/requests/${request.id_request}/respond`, {
			method: 'POST',
			body: fd,
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			errorMsg = data?.error ?? 'Une erreur est survenue.';
			submitting = false;
			return;
		}

		await invalidateAll();
		step = 'success';
		submitting = false;
	}
</script>

{#if open && request}
	<!-- Backdrop -->
	<button class="fixed inset-0 z-40 bg-black/40" onclick={close} aria-label="Fermer"></button>

	<!-- Modal bottom sheet -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-[#FDF7F4] pb-8"
		role="dialog"
		aria-modal="true"
	>
		<!-- Handle -->
		<div class="flex justify-center pt-3 pb-2">
			<div class="h-1 w-10 rounded-full bg-navy/20"></div>
		</div>

		<!-- Close button -->
		<button
			class="absolute top-3 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy/70 shadow"
			onclick={close}
			aria-label="Fermer"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
				<path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
			</svg>
		</button>

		<div class="px-6 pt-2">
			{#if step !== 'success'}
				<!-- Titre + progress -->
				<h2 class="text-lg font-semibold text-navy">Répondre à la demande</h2>
				<div class="mt-2 flex items-center gap-1.5">
					<span class="h-2 w-6 rounded-full {step === 1 || step === 2 ? 'bg-rust' : 'bg-navy/20'}"></span>
					<span class="h-2 w-2 rounded-full {step === 2 ? 'bg-rust' : 'bg-navy/20'}"></span>
				</div>
				<p class="mt-1 text-xs text-navy/50">Étape {step}/2</p>

				<div class="my-3 h-px bg-navy/10"></div>
			{/if}

			{#if step === 'success'}
			<div class="flex flex-col items-center py-8 text-center">
				<div class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rust">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-8 w-8 text-white">
						<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-xl font-bold text-navy">Proposition envoyée !</h3>
				<p class="mt-2 text-sm leading-relaxed text-navy/60">Votre devis et votre menu ont été transmis au client</p>
				<button
					type="button"
					onclick={close}
					class="mt-8 w-full rounded-xl bg-rust py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity active:opacity-80"
				>
					Retourner aux demandes
				</button>
			</div>
		{:else if step === 1}
				<!-- Résumé de la demande -->
				<div class="mb-4 rounded-2xl border border-navy/[0.07] bg-white p-4">
					<div class="flex items-start justify-between gap-3">
						<h3 class="text-[15px] font-semibold leading-snug text-navy">{request.title_request}</h3>
						<div class="flex shrink-0 items-center gap-1.5">
							{#if request.customer_image}
								<img src={request.customer_image} alt="" class="h-7 w-7 rounded-full object-cover" />
							{:else}
								<div class="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-navy/40">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
										<path fill-rule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z" clip-rule="evenodd" />
									</svg>
								</div>
							{/if}
							<span class="text-xs text-navy/60">{request.customer_firstname} {request.customer_name}</span>
						</div>
					</div>

					<div class="mt-2.5 flex flex-wrap gap-1.5">
						<span class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3">
								<path fill-rule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3A2.5 2.5 0 0 1 14.5 5.5v6a2.5 2.5 0 0 1-2.5 2.5H4A2.5 2.5 0 0 1 1.5 11.5v-6A2.5 2.5 0 0 1 4 3V1.75ZM3 7v4.5A1 1 0 0 0 4 12.5h8a1 1 0 0 0 1-1V7H3Z" clip-rule="evenodd" />
							</svg>
							{formatDate(request.expected_date_request)}
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3">
								<path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
							</svg>
							{request.guests_request}
						</span>
						{#if request.type_event_request}
							<span class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3">
									<path fill-rule="evenodd" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v2.879a2.5 2.5 0 0 0 .732 1.767l4.5 4.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-4.5-4.5A2.5 2.5 0 0 0 7.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
								</svg>
								{request.type_event_request}
							</span>
						{/if}
						<span class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3">
								<path fill-rule="evenodd" d="M8 1a5 5 0 0 0-5 5c0 3.234 2.75 6.56 4.4 8.318a.8.8 0 0 0 1.2 0C10.25 12.56 13 9.234 13 6a5 5 0 0 0-5-5Zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" />
							</svg>
							{request.localization_request}
						</span>
					</div>

					<p class="mt-2.5 line-clamp-4 text-[13px] leading-snug text-navy/65">{request.description_request}</p>
				</div>

				<form onsubmit={toStep2} class="flex flex-col gap-5">
					<div>
						<label class="mb-1.5 block text-sm font-medium text-navy">Votre message</label>
						<textarea
							bind:value={message}
							required
							rows="5"
							maxlength="2000"
							placeholder="Présentez votre menu et votre approche au client"
							class="w-full resize-none rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-navy/30 outline-none focus:border-rust"
						></textarea>
					</div>

					{#if errorMsg}
						<p class="text-sm text-rust">{errorMsg}</p>
					{/if}

					<button
						type="submit"
						class="w-full rounded-xl bg-rust py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity active:opacity-80"
					>
						Continuer
					</button>
				</form>

			{:else}
				<form onsubmit={submit} class="flex flex-col gap-5">
					<!-- Upload PDF -->
					<div>
						<!-- Zone d'upload cliquable -->
						<button
							type="button"
							onclick={() => pdfInput?.click()}
							class="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-navy/20 bg-white py-6 transition-colors hover:border-rust/40"
						>
							<span class="flex h-12 w-12 items-center justify-center rounded-full bg-rust text-white">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
									<path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
									<path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
								</svg>
							</span>
							<span class="text-sm font-semibold text-navy">télécharger menu</span>
							<span class="text-xs text-navy/50">Sélectionnez un fichier PDF à télécharger</span>
						</button>
						<input
							bind:this={pdfInput}
							type="file"
							accept="application/pdf"
							onchange={onPdfChange}
							class="sr-only"
						/>
					</div>

					<!-- Nom du fichier sélectionné -->
					<div>
						<label class="mb-1.5 block text-sm font-medium text-navy">PDF</label>
						<div class="rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy/40">
							{pdfFile ? pdfFile.name : 'Fichier sélectionné : aucun fichier sélectionné'}
						</div>
					</div>

					<!-- Prix proposé / convive -->
					<div>
						<label class="mb-1.5 block text-sm font-medium text-navy">Prix proposé / convive</label>
						<div class="relative">
							<select
								bind:value={price}
								class="w-full appearance-none rounded-full border border-navy/20 bg-white py-2.5 pr-10 pl-4 text-sm text-navy outline-none focus:border-rust"
							>
								<option value="">Prix</option>
								{#each PRICE_OPTIONS as p (p)}
									<option value={p}>{p} €</option>
								{/each}
							</select>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-navy/40">
								<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
							</svg>
						</div>
					</div>

					{#if errorMsg}
						<p class="text-sm text-rust">{errorMsg}</p>
					{/if}

					<div class="flex gap-3">
						<button
							type="button"
							onclick={() => { step = 1; errorMsg = ''; }}
							class="flex-1 rounded-xl border border-navy/20 py-3.5 text-sm font-medium text-navy/70 transition-opacity active:opacity-70"
						>
							Retour
						</button>
						<button
							type="submit"
							disabled={submitting}
							class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rust py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60 active:opacity-80"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
								<path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
							</svg>
							{submitting ? 'Envoi...' : 'Envoyer ma proposition'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
