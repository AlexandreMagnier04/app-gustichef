<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { loadStripe } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';
	import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
	import type { MessageItem } from '$lib/models/messaging.model';

	type ExtraMenu = { id_menu: number; title_menu: string; price_menu: string | null };

	const TRAVEL_FEE_PER_PERSON = 2.4;

	let { data } = $props();

	const conv = $derived(data.conv);
	const chiefExtras = $derived(data.chiefExtras);
	const menuImage = $derived(data.menuImage ?? null);

	const lastProposal = $derived(
		[...conv.messages]
			.reverse()
			.find((m: MessageItem) => m.type === 'menu_proposal' || m.type === 'payment_invitation')
	);

	let guests = $state(conv.request_guests ?? 2);
	let eventTime = $state('');
	let notes = $state('');
	let extrasQty = $state<Record<number, number>>({});

	const effectivePrice = $derived(
		Number(lastProposal?.price_per_person) || Number(lastProposal?.menu_price) || 0
	);
	const menuTotal = $derived(effectivePrice * guests);
	const extrasTotal = $derived(
		chiefExtras.reduce((sum: number, extra: ExtraMenu) => {
			const qty = extrasQty[extra.id_menu] ?? 0;
			return sum + parseFloat(extra.price_menu ?? '0') * qty * guests;
		}, 0)
	);
	const travelFee = $derived(TRAVEL_FEE_PER_PERSON * guests);
	const grandTotal = $derived(menuTotal + extrasTotal + travelFee);

	const selectedExtras = $derived(
		chiefExtras
			.filter((e: ExtraMenu) => (extrasQty[e.id_menu] ?? 0) > 0)
			.map((e: ExtraMenu) => ({
				id_menu: e.id_menu,
				title: e.title_menu,
				qty: extrasQty[e.id_menu],
				price_per_person: parseFloat(e.price_menu ?? '0')
			}))
	);

	// Stripe
	let stripe = $state<Stripe | null>(null);
	let cardElement = $state<StripeCardElement | null>(null);
	let cardError = $state('');
	let submitting = $state(false);
	let succeeded = $state(false);

	function formatDate(iso: string | null): string {
		if (!iso) return '';
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
	}

	onMount(async () => {
		const s = await loadStripe(PUBLIC_STRIPE_KEY);
		if (!s) return;
		stripe = s;
		const elements = s.elements();
		const card = elements.create('card', {
			style: {
				base: {
					fontFamily: 'Dosis, sans-serif',
					fontSize: '14px',
					color: '#0f2d3d',
					'::placeholder': { color: '#0f2d3d40' }
				}
			},
			hidePostalCode: true
		});
		card.mount('#stripe-card-element');
		card.on('change', (e) => {
			cardError = e.error?.message ?? '';
		});
		cardElement = card;
	});

	async function validate() {
		if (!stripe || !cardElement) {
			cardError = 'Stripe non chargé';
			return;
		}
		if (!data.stripeClientSecret) {
			cardError = 'Session expirée, rechargez la page';
			return;
		}
		cardError = '';
		submitting = true;

		const { setupIntent, error } = await stripe.confirmCardSetup(data.stripeClientSecret, {
			payment_method: { card: cardElement }
		});

		if (error) {
			cardError = error.message ?? 'Erreur carte';
			submitting = false;
			return;
		}

		const res = await fetch('/api/reservations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				conversationId: conv.id_conversation,
				guests,
				eventTime: eventTime || undefined,
				extras: selectedExtras,
				notes,
				stripeSetupIntentId: setupIntent!.id
			})
		});

		submitting = false;
		if (!res.ok) {
			cardError = 'Erreur lors de la validation. Réessayez.';
			return;
		}
		succeeded = true;
	}
</script>

<div class="-mx-5 -mt-3 min-h-[calc(100dvh-120px)] bg-white">
	<!-- Header -->
	<div class="flex shrink-0 items-center gap-3 border-b border-navy/8 bg-white px-4 py-3">
		<a
			href="/messages/{conv.id_conversation}"
			aria-label="Retour"
			class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-4 w-4 text-navy/70"
			>
				<path
					fill-rule="evenodd"
					d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.061.025Z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>
		<h1 class="text-sm font-bold text-navy">Sécuriser ma réservation</h1>
	</div>

	<div class="space-y-4 px-4 py-4 pb-40">
		<!-- Menu avec image -->
		<div class="overflow-hidden rounded-2xl border border-navy/8 bg-white">
			{#if menuImage}
				<img
					src={menuImage}
					alt={lastProposal?.menu_title ?? 'Menu'}
					class="h-44 w-full object-cover"
				/>
			{:else}
				<div class="flex h-32 items-center justify-center bg-navy/5">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-10 w-10 text-navy/20"
					>
						<path
							d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
						/>
					</svg>
				</div>
			{/if}
			<div class="p-4">
				<p class="text-[11px] font-semibold tracking-wide text-rust uppercase">Menu sélectionné</p>
				<p class="mt-1 font-semibold text-navy">{lastProposal?.menu_title ?? 'Menu'}</p>
				{#if lastProposal?.menu_description}
					<p class="mt-1 line-clamp-2 text-[13px] leading-snug text-navy/60">
						{lastProposal.menu_description}
					</p>
				{/if}
				{#if effectivePrice}
					<p class="mt-2 text-sm font-bold text-rust">Dès {effectivePrice} € / convive</p>
				{/if}
			</div>
		</div>

		<!-- Récap -->
		<div class="overflow-hidden rounded-2xl border border-navy/8 bg-white">
			<div
				class="bg-navy/5 px-4 py-2 text-[11px] font-semibold tracking-wide text-navy/50 uppercase"
			>
				Récapitulatif
			</div>
			<div class="divide-y divide-navy/5 px-4">
				{#if conv.request_date}
					<div class="flex items-center justify-between py-3">
						<span class="text-[13px] text-navy/60">Date</span>
						<span class="text-[13px] font-medium text-navy capitalize"
							>{formatDate(conv.request_date)}</span
						>
					</div>
				{/if}
				<div class="flex items-center justify-between py-3">
					<span class="text-[13px] text-navy/60">Heure</span>
					<input
						type="time"
						bind:value={eventTime}
						class="rounded-lg border border-navy/15 bg-white px-2 py-1 text-[13px] font-medium text-navy outline-none focus:border-navy"
					/>
				</div>
				{#if conv.request_localization}
					<div class="flex items-center justify-between py-3">
						<span class="text-[13px] text-navy/60">Lieu</span>
						<span class="text-[13px] font-medium text-navy">{conv.request_localization}</span>
					</div>
				{/if}
				<div class="flex items-center justify-between py-3">
					<span class="text-[13px] text-navy/60">Convives</span>
					<span class="text-[13px] font-medium text-navy">{guests}</span>
				</div>
			</div>
		</div>

		<!-- Extras -->
		{#if chiefExtras.length > 0}
			<div class="overflow-hidden rounded-2xl border border-navy/8 bg-white">
				<div
					class="bg-navy/5 px-4 py-2 text-[11px] font-semibold tracking-wide text-navy/50 uppercase"
				>
					Compléments <span class="font-normal normal-case">(optionnel)</span>
				</div>
				<div class="divide-y divide-navy/5">
					{#each chiefExtras as extra (extra.id_menu)}
						<div class="flex items-center gap-3 px-4 py-3">
							<div class="min-w-0 flex-1">
								<p class="text-[13px] font-semibold text-navy">{extra.title_menu}</p>
								{#if extra.price_menu}
									<p class="text-[12px] text-rust">{extra.price_menu} € / pers.</p>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={() => {
										const q = extrasQty[extra.id_menu] ?? 0;
										if (q > 0) extrasQty = { ...extrasQty, [extra.id_menu]: q - 1 };
									}}
									disabled={(extrasQty[extra.id_menu] ?? 0) === 0}
									class="flex h-7 w-7 items-center justify-center rounded-full bg-navy/8 text-sm font-bold text-navy disabled:opacity-30"
									>−</button
								>
								<span class="w-5 text-center text-[13px] font-semibold text-navy"
									>{extrasQty[extra.id_menu] ?? 0}</span
								>
								<button
									type="button"
									onclick={() => {
										const q = extrasQty[extra.id_menu] ?? 0;
										extrasQty = { ...extrasQty, [extra.id_menu]: q + 1 };
									}}
									class="flex h-7 w-7 items-center justify-center rounded-full bg-navy/8 text-sm font-bold text-navy"
									>+</button
								>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Pricing -->
		<div class="overflow-hidden rounded-2xl border border-navy/8 bg-white">
			<div class="divide-y divide-navy/5 px-4">
				<div class="flex justify-between py-2.5">
					<span class="text-[13px] text-navy/70">Menu ({guests} × {effectivePrice} €)</span>
					<span class="text-[13px] font-medium text-navy">{menuTotal.toFixed(0)} €</span>
				</div>
				{#each chiefExtras.filter((e: ExtraMenu) => (extrasQty[e.id_menu] ?? 0) > 0) as extra (extra.id_menu)}
					<div class="flex justify-between py-2.5">
						<span class="text-[13px] text-navy/70"
							>{extra.title_menu} (×{extrasQty[extra.id_menu]})</span
						>
						<span class="text-[13px] font-medium text-navy"
							>{(
								parseFloat(extra.price_menu ?? '0') *
								(extrasQty[extra.id_menu] ?? 0) *
								guests
							).toFixed(0)} €</span
						>
					</div>
				{/each}
				<div class="flex justify-between py-2.5">
					<span class="text-[13px] text-navy/70">Frais de déplacement</span>
					<span class="text-[13px] font-medium text-navy">{travelFee.toFixed(2)} €</span>
				</div>
				<div class="flex justify-between py-3">
					<span class="text-sm font-bold text-navy">Total estimé</span>
					<span class="text-sm font-bold text-navy">{grandTotal.toFixed(0)} €</span>
				</div>
			</div>
			<p class="px-4 pb-3 text-[11px] text-navy/40">
				Ce tarif est une estimation. Le prix final sera validé par le chef.
			</p>
		</div>

		<!-- Empreinte carte -->
		<div class="overflow-hidden rounded-2xl border border-navy/8 bg-white">
			<div
				class="bg-navy/5 px-4 py-2 text-[11px] font-semibold tracking-wide text-navy/50 uppercase"
			>
				Empreinte carte bancaire
			</div>
			<div class="space-y-4 p-4">
				<!-- Info -->
				<div class="flex items-start gap-2.5 rounded-xl bg-teal/8 px-3 py-2.5">
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
					<p class="text-[12px] text-teal">
						Comment fonctionne le paiement ? <strong>Aucun débit aujourd'hui</strong> — votre CB sécurise
						uniquement la réservation.
					</p>
				</div>

				<!-- Timeline -->
				<div class="space-y-3">
					<div class="flex items-start gap-3">
						<div class="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-navy"></div>
						<div>
							<p class="text-[13px] font-semibold text-navy">J-5 avant l'événement</p>
							<p class="text-[12px] text-navy/60">
								Acompte de 50 % débité — <strong class="text-navy"
									>{(grandTotal * 0.5).toFixed(0)} €</strong
								> pour l'achat des ingrédients
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-navy/30"></div>
						<div>
							<p class="text-[13px] font-semibold text-navy">Après la prestation</p>
							<p class="text-[12px] text-navy/60">
								Solde de 50 % débité — <strong class="text-navy"
									>{(grandTotal * 0.5).toFixed(0)} €</strong
								> une fois la prestation confirmée
							</p>
						</div>
					</div>
				</div>

				<!-- Annulation -->
				<div
					class="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
					>
						<path
							fill-rule="evenodd"
							d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
							clip-rule="evenodd"
						/>
					</svg>
					<p class="text-[11px] text-amber-700">
						<span class="font-semibold">Politique d'annulation :</span> Annulation gratuite jusqu'à
						J-7. Acompte non remboursable après J-7. En revanche, vous acceptez les
						<span class="underline">conditions générales de Gustichef</span>.
					</p>
				</div>

				<!-- Widget Stripe -->
				<div>
					<label class="mb-1 block text-[12px] font-medium text-navy/60">Carte bancaire</label>
					<div
						id="stripe-card-element"
						class="rounded-xl border border-navy/15 bg-white px-3 py-3.5"
					></div>
					<p class="mt-1 text-[11px] text-navy/40">
						Carte test : 4242 4242 4242 4242 — date future — CVV quelconque
					</p>
				</div>

				{#if cardError}
					<p class="text-[12px] text-rust">{cardError}</p>
				{/if}

				<!-- SSL -->
				<div
					class="flex items-center justify-center gap-1.5 rounded-xl border border-teal/30 bg-teal/5 py-2 text-[11px] font-medium text-teal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3.5 w-3.5"
					>
						<path
							fill-rule="evenodd"
							d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
							clip-rule="evenodd"
						/>
					</svg>
					Paiement 100 % sécurisé — Données chiffrées SSL
				</div>
			</div>
		</div>
	</div>

	<!-- Bouton fixe au-dessus de la nav -->
	<div class="fixed right-0 bottom-16 left-0 z-40 border-t border-navy/8 bg-white px-4 py-3">
		<button
			type="button"
			onclick={validate}
			disabled={submitting}
			class="w-full rounded-xl bg-navy py-4 text-sm font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50"
		>
			{submitting ? 'Validation en cours...' : 'Envoyer ma demande'}
		</button>
	</div>
</div>

<!-- Dialog succès -->
{#if succeeded}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
		<div class="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white pb-8">
			<div class="flex justify-center pt-3 pb-4">
				<div class="h-1 w-10 rounded-full bg-navy/20"></div>
			</div>
			<div class="px-6 text-center">
				<div
					class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal/15"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-7 w-7 text-teal"
					>
						<path
							fill-rule="evenodd"
							d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-navy">Demande envoyée !</h2>
				<p class="mt-1.5 text-[13px] leading-relaxed text-navy/60">
					Le chef <span class="font-medium text-navy">{conv.other_firstname}</span> va étudier votre demande
					et vous répondra sous 24h.
				</p>
				<div
					class="mt-3 inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-3 py-1 text-[12px] font-medium text-navy/60"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
					En attente
				</div>
				<div class="mt-4 rounded-2xl border border-navy/8 bg-cream p-4 text-left">
					<p class="text-[11px] font-semibold tracking-wide text-navy/40 uppercase">
						Votre réservation
					</p>
					<p class="mt-2 text-sm font-bold text-navy">{lastProposal?.menu_title ?? 'Prestation'}</p>
					{#if conv.request_date}
						<p class="mt-0.5 text-[12px] text-navy/60 capitalize">
							{formatDate(conv.request_date)}{eventTime ? ' à ' + eventTime : ''}
						</p>
					{/if}
					<p class="mt-0.5 text-[12px] text-navy/60">{guests} convive{guests > 1 ? 's' : ''}</p>
					{#if conv.request_localization}
						<p class="mt-0.5 text-[12px] text-navy/60">{conv.request_localization}</p>
					{/if}
				</div>
				<div class="mt-4 space-y-2.5">
					<button
						type="button"
						onclick={() => goto('/customer-profile')}
						class="w-full rounded-xl bg-navy py-3.5 text-sm font-semibold text-white transition-opacity active:opacity-80"
					>
						Voir mes réservations
					</button>
					<button
						type="button"
						onclick={() => goto(`/messages/${conv.id_conversation}`)}
						class="w-full rounded-xl bg-rust py-3.5 text-sm font-semibold text-white transition-opacity active:opacity-80"
					>
						Écrire au chef
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
