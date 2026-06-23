<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { RequestWithCustomer } from '$lib/server/services/customers';
	import imgCroix from '$lib/assets/img/croix.png';
	import imgAvion from '$lib/assets/img/avion.png';
	import imgAgenda from '$lib/assets/img/agenda.png';
	import imgTwoUser from '$lib/assets/img/two-user.png';
	import imgTag from '$lib/assets/img/tag.png';
	import imgPing from '$lib/assets/img/ping.png';

	let {
		open = $bindable(false),
		request = null
	}: {
		open?: boolean;
		request?: RequestWithCustomer | null;
	} = $props();

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
		if (!message || message.trim().length < 1) {
			errorMsg = 'Le message ne peut pas être vide.';
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
		class="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white pb-8"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex justify-center pt-3 pb-2">
			<div class="h-1 w-10 rounded-full bg-navy/20"></div>
		</div>

		<button
			class="absolute top-3 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow"
			onclick={close}
			aria-label="Fermer"
		>
			<img src={imgCroix} alt="" class="h-4 w-4 object-contain" />
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
							class="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] text-white"
						>
							<img src={imgAgenda} alt="" class="h-3 w-3 object-contain brightness-0 invert" />
							{formatDate(request.expected_date_request)}
						</span>
						<span
							class="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] text-white"
						>
							<img src={imgTwoUser} alt="" class="h-3 w-3 object-contain brightness-0 invert" />
							{request.guests_request} pers.
						</span>
						{#if request.type_event_request}
							<span
								class="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] text-white"
							>
								<img src={imgTag} alt="" class="h-3 w-3 object-contain brightness-0 invert" />
								{request.type_event_request}
							</span>
						{/if}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] text-white"
						>
							<img src={imgPing} alt="" class="h-3 w-3 object-contain brightness-0 invert" />
							{request.localization_request}
						</span>
					</div>
				</div>

				<form onsubmit={submit} class="flex flex-col gap-5">
					<div>
						<label for="rreq-message" class="mb-1.5 block text-sm font-medium text-navy"
							>Votre message</label
						>
						<textarea
							id="rreq-message"
							bind:value={message}
							required
							rows="4"
							maxlength="2000"
							placeholder="Présentez votre approche au client…"
							class="w-full resize-none rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-rust"
						></textarea>
					</div>

					{#if errorMsg}
						<p class="text-sm text-rust">{errorMsg}</p>
					{/if}

					<button
						type="submit"
						disabled={submitting}
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity active:opacity-80 disabled:opacity-60"
					>
						<img src={imgAvion} alt="" class="h-4 w-4 object-contain brightness-0 invert" />
						{submitting ? 'Envoi...' : 'Envoyer ma proposition'}
					</button>
				</form>
			{/if}
		</div>
	</div>
{/if}
