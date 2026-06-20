<script lang="ts">
	import { loadStripe } from '@stripe/stripe-js';
	import { onMount } from 'svelte';
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';
	import type { Menu } from '$lib/models/chief.model';

	interface Props {
		conversationId: number;
		menuId: number;
		menuTitle: string;
		menuDescription: string;
		menuImage: string | null;
		pricePerPerson: number;
		guestsDefault: number;
		eventDate: string | null;
		localization: string | null;
		chiefExtras: Menu[];
		onclose: () => void;
		onsuccess: (reservationId: number) => void;
	}

	let {
		conversationId,
		menuId,
		menuTitle,
		menuDescription,
		menuImage,
		pricePerPerson,
		guestsDefault,
		eventDate,
		localization,
		chiefExtras,
		onclose,
		onsuccess
	}: Props = $props();

	const TRAVEL_FEE_PER_PERSON = 2.4;

	let step = $state(1);
	let guests = $state(guestsDefault || 2);
	let notes = $state('');
	let submitting = $state(false);
	let errorMsg = $state('');

	// Extras : { id_menu, title, qty, price_per_person }
	let extrasQty = $state<Record<number, number>>(
		Object.fromEntries(chiefExtras.map((e) => [e.id_menu, 0]))
	);

	// Stripe
	let stripe: Awaited<ReturnType<typeof loadStripe>> = $state(null);
	let stripeElements: ReturnType<NonNullable<typeof stripe>['elements']> | null = $state(null);
	let cardEl: HTMLDivElement | null = $state(null);

	const menuTotal = $derived(pricePerPerson * guests);
	const extrasTotal = $derived(
		chiefExtras.reduce((sum, e) => sum + Number(e.price_menu) * (extrasQty[e.id_menu] ?? 0), 0)
	);
	const travelFee = $derived(Math.round(TRAVEL_FEE_PER_PERSON * guests * 10) / 10);
	const grandTotal = $derived(menuTotal + extrasTotal + travelFee);
	const acompte = $derived(Math.round(grandTotal * 50) / 100);

	const selectedExtras = $derived(
		chiefExtras
			.filter((e) => (extrasQty[e.id_menu] ?? 0) > 0)
			.map((e) => ({
				id_menu: e.id_menu,
				title: e.title_menu,
				qty: extrasQty[e.id_menu],
				price_per_person: Number(e.price_menu)
			}))
	);

	function formatDate(iso: string | null): string {
		if (!iso) return '';
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
	}

	function nextStep() {
		if (step < 4) step++;
	}

	function prevStep() {
		if (step > 1) step--;
	}

	async function initStripe() {
		if (stripe || !cardEl) return;
		stripe = await loadStripe(PUBLIC_STRIPE_KEY);
		if (!stripe) return;
		stripeElements = stripe.elements();
		const card = stripeElements.create('card', {
			style: {
				base: {
					fontSize: '15px',
					color: '#1a2332',
					fontFamily: 'system-ui, sans-serif',
					'::placeholder': { color: '#b0b9c6' }
				}
			},
			hidePostalCode: true
		});
		card.mount(cardEl!);
	}

	$effect(() => {
		if (step === 4) initStripe();
	});

	async function confirm() {
		if (!stripe || !stripeElements || submitting) return;
		submitting = true;
		errorMsg = '';

		// 1. Créer le PaymentIntent (acompte en centimes)
		const piRes = await fetch('/api/stripe/payment-intent', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount: Math.round(acompte * 100) })
		});
		if (!piRes.ok) {
			errorMsg = 'Erreur lors de la création du paiement.';
			submitting = false;
			return;
		}
		const { clientSecret } = await piRes.json();

		// 2. Confirmer le paiement avec Stripe
		const cardElement = stripeElements.getElement('card');
		if (!cardElement) {
			errorMsg = 'Erreur interne.';
			submitting = false;
			return;
		}
		const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
			payment_method: { card: cardElement }
		});

		if (stripeError) {
			errorMsg = stripeError.message ?? 'Paiement refusé.';
			submitting = false;
			return;
		}

		// 3. Créer la réservation en base
		const res = await fetch('/api/reservations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				conversationId,
				guests,
				extras: selectedExtras,
				notes,
				stripePaymentIntentId: paymentIntent!.id
			})
		});

		if (!res.ok) {
			errorMsg = 'Erreur lors de la création de la réservation.';
			submitting = false;
			return;
		}

		const { id_reservation } = await res.json();
		onsuccess(id_reservation);
	}
</script>

<!-- Backdrop -->
<button class="fixed inset-0 z-40 bg-black/40" onclick={onclose} aria-label="Fermer"></button>

<!-- Sheet -->
<div
	class="fixed inset-x-0 bottom-0 z-50 flex max-h-[95dvh] flex-col rounded-t-2xl bg-[#f5f1eb] shadow-2xl"
>
	<!-- Handle + header -->
	<div class="shrink-0 px-5 pt-3 pb-4">
		<div class="mx-auto mb-4 h-1 w-10 rounded-full bg-navy/20"></div>
		<div class="flex items-start justify-between">
			<div>
				<h2 class="text-[17px] font-semibold text-navy">
					{#if step === 1}Ton menu & compléments
					{:else if step === 2}Ajouter des compléments
					{:else if step === 3}Notes & récapitulatif
					{:else}Sécuriser ma réservation
					{/if}
				</h2>
				<p class="mt-0.5 text-[12px] text-navy/50">Étape {step}/4</p>
			</div>
			<button
				type="button"
				onclick={onclose}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-navy/8 text-navy/50"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="h-4 w-4"
				>
					<path
						d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
					/>
				</svg>
			</button>
		</div>

		<!-- Progress dots -->
		<div class="mt-3 flex gap-1.5">
			{#each [1, 2, 3, 4] as s}
				<div
					class="h-1.5 flex-1 rounded-full transition-colors {step === s
						? 'bg-rust'
						: step > s
							? 'bg-teal'
							: 'bg-navy/15'}"
				></div>
			{/each}
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto px-5 pb-6">
		{#if step === 1}
			<!-- Menu card -->
			<div class="overflow-hidden rounded-2xl bg-white shadow-sm">
				{#if menuImage}
					<img src={menuImage} alt={menuTitle} class="h-36 w-full object-cover" />
				{/if}
				<div class="p-4">
					<p class="font-semibold text-navy">{menuTitle}</p>
					<p class="mt-0.5 text-[12px] font-medium text-rust">
						Menu sélectionné · Dès {pricePerPerson} € / convive
					</p>
					{#if menuDescription}
						<p class="mt-2 line-clamp-2 text-[12px] leading-snug text-navy/60">{menuDescription}</p>
					{/if}
				</div>
			</div>

			<!-- Guests counter -->
			<div class="mt-5">
				<p class="mb-3 text-[13px] font-semibold text-navy">Nombre de convives</p>
				<div class="flex items-center gap-4">
					<button
						type="button"
						onclick={() => (guests = Math.max(1, guests - 1))}
						class="flex h-11 w-11 items-center justify-center rounded-xl bg-teal text-white text-lg font-bold"
					>
						−
					</button>
					<span class="flex-1 text-center text-xl font-semibold text-navy">{guests}</span>
					<button
						type="button"
						onclick={() => guests++}
						class="flex h-11 w-11 items-center justify-center rounded-xl bg-rust text-white text-lg font-bold"
					>
						+
					</button>
				</div>
				<p class="mt-2 text-[12px] text-navy/50">
					Sous-total menu : <span class="font-medium text-navy">{menuTotal} €</span>
				</p>
			</div>

		{:else if step === 2}
			<!-- Extras -->
			{#if chiefExtras.length === 0}
				<div class="rounded-2xl bg-white p-5 text-center text-sm text-navy/50 shadow-sm">
					Ce chef n'a pas encore ajouté de compléments.
				</div>
			{:else}
				<div class="space-y-3">
					{#each chiefExtras as extra (extra.id_menu)}
						<div class="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
							<div
								class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cream text-2xl"
							>
								🍽
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-[13px] font-semibold text-navy">{extra.title_menu}</p>
								{#if extra.description_menu}
									<p class="line-clamp-2 text-[11px] leading-snug text-navy/55">
										{extra.description_menu}
									</p>
								{/if}
								<p class="mt-1 text-[12px] font-medium text-rust">
									Dès {extra.price_menu} €/convive
								</p>
							</div>
							<div class="flex shrink-0 items-center gap-2">
								<button
									type="button"
									onclick={() =>
										(extrasQty[extra.id_menu] = Math.max(0, (extrasQty[extra.id_menu] ?? 0) - 1))}
									class="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/8 text-navy font-semibold"
								>
									−
								</button>
								<span class="w-6 text-center text-sm font-semibold text-navy">
									{extrasQty[extra.id_menu] ?? 0}
								</span>
								<button
									type="button"
									onclick={() =>
										(extrasQty[extra.id_menu] = (extrasQty[extra.id_menu] ?? 0) + 1)}
									class="flex h-8 w-8 items-center justify-center rounded-lg bg-rust/15 text-rust font-semibold"
								>
									+
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}

		{:else if step === 3}
			<!-- Notes -->
			<div class="mb-5">
				<p class="mb-2 text-[13px] font-semibold text-navy">Notes ou préférences</p>
				<textarea
					bind:value={notes}
					placeholder="Occasion spéciale, allergies, préférences particulières..."
					rows="3"
					class="w-full resize-none rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/35 focus:border-navy/35"
				></textarea>
			</div>

			<!-- Récap -->
			<div class="rounded-2xl bg-white p-4 shadow-sm">
				<p class="mb-3 text-[13px] font-semibold text-navy">Récapitulatif de votre réservation</p>
				{#if eventDate || localization}
					<div class="mb-3 space-y-1 text-[13px] text-navy/70">
						{#if eventDate}
							<p>{formatDate(eventDate)}</p>
						{/if}
						<p>{guests} convives</p>
						<p>{menuTitle}{selectedExtras.length ? ' + ' + selectedExtras.map((e) => e.title).join(', ') : ''}</p>
						{#if localization}
							<p>{localization}</p>
						{/if}
					</div>
					<div class="border-t border-navy/[0.07] pt-3"></div>
				{/if}

				<div class="space-y-1.5">
					<div class="flex justify-between text-[13px] text-navy/60">
						<span>Menu ({guests} × {pricePerPerson} €)</span>
						<span>{menuTotal} €</span>
					</div>
					{#each selectedExtras as e}
						<div class="flex justify-between text-[13px] text-navy/60">
							<span>{e.title} ({e.qty} × {e.price_per_person} €)</span>
							<span>{e.qty * e.price_per_person} €</span>
						</div>
					{/each}
					<div class="flex justify-between text-[13px] text-navy/60">
						<span>Frais de déplacement</span>
						<span>{travelFee} €</span>
					</div>
					<div class="border-t border-navy/[0.07] pt-2">
						<div class="flex justify-between text-[14px] font-bold text-navy">
							<span>Total estimé</span>
							<span>{grandTotal} €</span>
						</div>
					</div>
				</div>
				<p class="mt-2 text-[11px] text-navy/40">
					* Ce tarif est une estimation. Le prix final sera validé par le chef.
				</p>
			</div>

		{:else if step === 4}
			<!-- Info paiement -->
			<div class="mb-4 flex gap-2.5 rounded-xl bg-teal/10 p-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="mt-0.5 h-4 w-4 shrink-0 text-teal"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
						clip-rule="evenodd"
					/>
				</svg>
				<p class="text-[12px] leading-snug text-teal/90">
					Comment fonctionne le paiement ? Aucun débit aujourd'hui — votre CB sécurise uniquement la réservation.
				</p>
			</div>

			<div class="mb-4 space-y-3">
				<div class="flex items-start gap-3">
					<div class="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-navy"></div>
					<div>
						<p class="text-[13px] font-semibold text-navy">J-5 avant l'événement</p>
						<p class="text-[12px] text-navy/60">
							Acompte de 50 % débité ({acompte} €) pour l'achat des ingrédients
						</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div class="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-navy/30"></div>
					<div>
						<p class="text-[13px] font-semibold text-navy">Après la prestation</p>
						<p class="text-[12px] text-navy/60">
							Solde de 50 % débité ({acompte} €) une fois la prestation confirmée
						</p>
					</div>
				</div>
			</div>

			<!-- Politique annulation -->
			<div class="mb-4 rounded-xl border border-rust/25 bg-rust/5 p-3">
				<div class="flex gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="mt-0.5 h-4 w-4 shrink-0 text-rust"
					>
						<path
							fill-rule="evenodd"
							d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
							clip-rule="evenodd"
						/>
					</svg>
					<p class="text-[12px] leading-snug text-rust/80">
						Politique d'annulation — Annulation gratuite avant J-7 · Acompte non remboursable après J-7
					</p>
				</div>
			</div>

			<!-- Stripe card element -->
			<div class="mb-4">
				<p class="mb-2 text-[13px] font-semibold text-navy">
					Paiement sécurisé — {acompte} €
				</p>
				<div
					bind:this={cardEl}
					class="rounded-xl border border-navy/15 bg-white px-4 py-3.5 shadow-sm"
				></div>
			</div>

			<!-- Sécurité -->
			<div class="flex items-center justify-center gap-1.5 text-[11px] text-navy/40">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-3.5 w-3.5"
				>
					<path
						fill-rule="evenodd"
						d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
						clip-rule="evenodd"
					/>
				</svg>
				Paiement 100 % sécurisé · Données chiffrées SSL
			</div>

			{#if errorMsg}
				<p class="mt-3 rounded-lg bg-rust/10 px-3 py-2 text-center text-[12px] text-rust">
					{errorMsg}
				</p>
			{/if}
		{/if}
	</div>

	<!-- Footer CTA -->
	<div class="shrink-0 border-t border-navy/[0.07] px-5 py-4">
		<div class="flex gap-3">
			{#if step > 1}
				<button
					type="button"
					onclick={prevStep}
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-navy/15 text-navy/60"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-5 w-5"
					>
						<path
							fill-rule="evenodd"
							d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}

			{#if step < 4}
				<button
					type="button"
					onclick={nextStep}
					class="flex-1 rounded-xl bg-navy py-3.5 text-[14px] font-semibold text-white transition-opacity active:opacity-80"
				>
					Continuer
				</button>
			{:else}
				<button
					type="button"
					onclick={confirm}
					disabled={submitting}
					class="flex-1 rounded-xl bg-navy py-3.5 text-[14px] font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50"
				>
					{submitting ? 'Traitement en cours...' : 'Envoyer ma demande'}
				</button>
			{/if}
		</div>
	</div>
</div>
