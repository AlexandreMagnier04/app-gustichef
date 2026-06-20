<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { RequestWithCustomer } from '$lib/server/services/customers';

	let {
		open = $bindable(false),
		request = null
	}: {
		open?: boolean;
		request?: RequestWithCustomer | null;
	} = $props();

	const PRICE_OPTIONS = [20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100, 120, 150, 200];

	let message = $state('');
	let price = $state('');
	let submitting = $state(false);
	let errorMsg = $state('');
	let success = $state(false);

	$effect(() => {
		if (!open) {
			message = '';
			price = '';
			errorMsg = '';
			submitting = false;
			success = false;
		}
	});

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function close() {
		open = false;
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!request) return;
		if (!message || message.trim().length < 10) {
			errorMsg = 'Le message doit faire au moins 10 caractères.';
			return;
		}
		submitting = true;
		errorMsg = '';

		const res = await fetch(`/api/requests/${request.id_request}/respond`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				message: message.trim(),
				price_per_person: price ? Number(price) : null
			})
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			errorMsg = data?.error ?? 'Une erreur est survenue.';
			submitting = false;
			return;
		}

		await invalidateAll();
		success = true;
		submitting = false;
	}
</script>

{#if open && request}
	<button class="fixed inset-0 z-40 bg-black/40" onclick={close} aria-label="Fermer"></button>

	<div
		class="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-[#FDF7F4] pb-8"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex justify-center pt-3 pb-2">
			<div class="h-1 w-10 rounded-full bg-navy/20"></div>
		</div>

		<button
			class="absolute top-3 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy/70 shadow"
			onclick={close}
			aria-label="Fermer"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4"
			>
				<path
					d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"
				/>
			</svg>
		</button>

		<div class="px-6 pt-2">
			{#if success}
				<div class="flex flex-col items-center py-8 text-center">
					<div class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rust">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="h-8 w-8 text-white"
						>
							<path
								fill-rule="evenodd"
								d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<h3 class="text-xl font-bold text-navy">Proposition envoyée !</h3>
					<p class="mt-2 text-sm leading-relaxed text-navy/60">
						Votre message a été transmis au client
					</p>
					<button
						type="button"
						onclick={close}
						class="mt-8 w-full rounded-xl bg-rust py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity active:opacity-80"
					>
						Retourner aux demandes
					</button>
				</div>
			{:else}
				<h2 class="text-lg font-semibold text-navy">Répondre à la demande</h2>
				<div class="my-3 h-px bg-navy/10"></div>

				<!-- Résumé de la demande -->
				<div class="mb-4 rounded-2xl border border-navy/[0.07] bg-white p-4">
					<div class="flex items-start justify-between gap-3">
						<h3 class="text-[15px] leading-snug font-semibold text-navy">
							{request.title_request}
						</h3>
						<div class="flex shrink-0 items-center gap-1.5">
							{#if request.customer.image}
								<img
									src={request.customer.image}
									alt=""
									class="h-7 w-7 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-navy/40"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="h-4 w-4"
									>
										<path
											fill-rule="evenodd"
											d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
							{/if}
							<span class="text-xs text-navy/60"
								>{request.customer.firstname} {request.customer.name}</span
							>
						</div>
					</div>
					<div class="mt-2.5 flex flex-wrap gap-1.5">
						<span
							class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60"
						>
							{formatDate(request.expected_date_request)}
						</span>
						<span
							class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60"
						>
							{request.guests_request} pers.
						</span>
						{#if request.type_event_request}
							<span
								class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60"
							>
								{request.type_event_request}
							</span>
						{/if}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60"
						>
							{request.localization_request}
						</span>
					</div>
				</div>

				<form onsubmit={submit} class="flex flex-col gap-5">
					<div>
						<label class="mb-1.5 block text-sm font-medium text-navy">Votre message</label>
						<textarea
							bind:value={message}
							required
							rows="4"
							maxlength="2000"
							placeholder="Présentez votre approche au client…"
							class="w-full resize-none rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-rust"
						></textarea>
					</div>

					<div>
						<label class="mb-1.5 block text-sm font-medium text-navy"
							>Prix proposé / convive <span class="text-navy/40">(optionnel)</span></label
						>
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
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-navy/40"
							>
								<path
									fill-rule="evenodd"
									d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					</div>

					{#if errorMsg}
						<p class="text-sm text-rust">{errorMsg}</p>
					{/if}

					<button
						type="submit"
						disabled={submitting}
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity active:opacity-80 disabled:opacity-60"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="h-4 w-4"
						>
							<path
								d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z"
							/>
						</svg>
						{submitting ? 'Envoi...' : 'Envoyer ma proposition'}
					</button>
				</form>
			{/if}
		</div>
	</div>
{/if}
