<script lang="ts">
	import { untrack } from 'svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import { searchCommunes } from '$lib/services/geo.service';
	import imgCroix from '$lib/assets/img/croix.png';

	let localizationSuggestions = $state<{ nom: string; code: string }[]>([]);
	let showLocSuggestions = $state(false);
	let locDebounce: ReturnType<typeof setTimeout>;

	function onLocInput() {
		clearTimeout(locDebounce);
		if (localization.trim().length < 2) {
			localizationSuggestions = [];
			showLocSuggestions = false;
			return;
		}
		locDebounce = setTimeout(async () => {
			localizationSuggestions = await searchCommunes(localization);
			showLocSuggestions = localizationSuggestions.length > 0;
		}, 150);
	}

	function selectCity(nom: string) {
		localization = nom;
		showLocSuggestions = false;
	}

	const TRAVEL_FEE = 2.4;

	interface Extra {
		id_menu: number;
		title_menu: string;
		price_menu: string | null;
	}

	let {
		menuId,
		menuTitle,
		menuImage,
		pricePerPerson,
		guestsMin = 1,
		guestsMax = 50,
		chiefId,
		chiefFirstname,
		chiefExtras = [],
		onclose,
		onsuccess
	}: {
		menuId: number;
		menuTitle: string;
		menuImage: string | null;
		pricePerPerson: number;
		guestsMin?: number;
		guestsMax?: number;
		chiefId: string;
		chiefFirstname: string;
		chiefExtras: Extra[];
		onclose: () => void;
		onsuccess: (conversationId: number) => void;
	} = $props();

	let step = $state<1 | 2 | 3 | 'success'>(1);
	let submitting = $state(false);
	let convId = $state<number | null>(null);

	// Step 1
	let eventDate = $state('');
	let eventTime = $state('');
	let localization = $state('');

	// Step 2 — initialiser au minimum du menu
	const _guestsMin = untrack(() => guestsMin);
	let guests = $state(_guestsMin > 1 ? _guestsMin : 1);
	let extrasQty = $state<Record<number, number>>({});

	// Step 3
	let notes = $state('');

	// Calculs
	const menuTotal = $derived(pricePerPerson * guests);
	const extrasTotal = $derived(
		chiefExtras.reduce((sum, e) => {
			const qty = extrasQty[e.id_menu] ?? 0;
			return sum + parseFloat(e.price_menu ?? '0') * qty * guests;
		}, 0)
	);
	const travelFee = $derived(TRAVEL_FEE * guests);
	const grandTotal = $derived(menuTotal + extrasTotal + travelFee);

	const selectedExtras = $derived(
		chiefExtras
			.filter((e) => (extrasQty[e.id_menu] ?? 0) > 0)
			.map((e) => ({
				id_menu: e.id_menu,
				title: e.title_menu,
				qty: extrasQty[e.id_menu],
				price_per_person: parseFloat(e.price_menu ?? '0')
			}))
	);

	const recapTitle = $derived([menuTitle, ...selectedExtras.map((e) => e.title)].join(' + '));

	function formatDateFr(iso: string): string {
		if (!iso) return '';
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
	}

	function step1Valid() {
		return eventDate && localization.trim().length >= 2;
	}

	async function submit() {
		submitting = true;
		try {
			const res = await fetch('/api/reservations/demande', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chiefId,
					menuId,
					menuTitle,
					pricePerPerson,
					guests,
					eventDate,
					eventTime,
					localization,
					extras: selectedExtras,
					notes
				})
			});
			if (!res.ok) throw new Error('Erreur');
			const data = await res.json();
			convId = data.conversationId;
			step = 'success';
		} catch {
			// silently fail - user can retry
		} finally {
			submitting = false;
		}
	}
</script>

<!-- Overlay -->
<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
	<div
		class="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white"
		style="max-height: 92dvh; overflow-y: auto;"
	>
		{#if step === 'success'}
			<!-- Succès -->
			<div class="flex flex-col items-center px-5 pt-8 pb-10 text-center">
				<div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal/15">
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
				<p class="mt-2 text-sm leading-relaxed text-navy/60">
					{chiefFirstname} va étudier votre demande et vous répondra sous 24h.
				</p>
				<span
					class="mt-3 rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-700"
					>En attente</span
				>

				<div class="mt-6 w-full rounded-2xl border border-navy/8 bg-white p-4 text-left">
					<p class="text-xs font-semibold tracking-wide text-navy/40 uppercase">
						Votre réservation
					</p>
					<p class="mt-2 text-sm font-semibold text-navy">{recapTitle}</p>
					<p class="mt-0.5 text-[12px] text-navy/60 capitalize">
						{formatDateFr(eventDate)}{eventTime ? ' · ' + eventTime : ''}
					</p>
					<p class="mt-0.5 text-[12px] text-navy/60">{guests} convive{guests > 1 ? 's' : ''}</p>
					<p class="mt-0.5 text-[12px] text-navy/60">
						{localization} · Frais de déplacement inclus
					</p>
				</div>

				<div class="mt-4 w-full space-y-3">
					<button
						type="button"
						onclick={() => {
							if (convId) onsuccess(convId);
						}}
						class="w-full rounded-xl bg-navy py-3.5 text-sm font-semibold text-white transition-opacity active:opacity-80"
					>
						Écrire au chef
					</button>
					<button
						type="button"
						onclick={onclose}
						class="w-full rounded-xl bg-rust/10 py-3.5 text-sm font-semibold text-rust transition-opacity active:opacity-80"
					>
						Fermer
					</button>
				</div>
			</div>
		{:else}
			<!-- Header avec progression -->
			<div class="flex justify-center pt-3 pb-1">
				<div class="h-1 w-10 rounded-full bg-navy/20"></div>
			</div>
			<div class="flex items-center justify-between px-5 py-3">
				<div>
					<h2 class="text-base font-semibold text-navy">
						{#if step === 1}Date & Heure de l'événement
						{:else if step === 2}Ton menu & compléments
						{:else}Notes & récapitulatif
						{/if}
					</h2>
					<p class="text-[11px] text-navy/40">Étape {step}/3</p>
				</div>
				<button
					type="button"
					onclick={onclose}
					aria-label="Fermer"
					class="flex h-8 w-8 items-center justify-center rounded-full bg-navy/8"
				>
					<img src={imgCroix} alt="" class="h-4 w-4 object-contain" />
				</button>
			</div>
			<!-- Points de progression -->
			<div class="flex justify-center gap-1.5 pb-4">
				{#each [1, 2, 3] as s (s)}
					<div
						class="h-1.5 rounded-full transition-all {step >= s
							? 'w-6 bg-rust'
							: 'w-1.5 bg-navy/20'}"
					></div>
				{/each}
			</div>

			<div class="px-5 pb-8">
				{#if step === 1}
					<!-- Étape 1 : Date & Heure -->
					<div class="space-y-4">
						<div>
							<p class="mb-1.5 block text-[12px] font-semibold text-navy/60">Date de l'événement</p>
							<DatePicker
								bind:value={eventDate}
								min={new Date().toISOString().split('T')[0]}
								placeholder="Choisir la date"
							/>
						</div>
						<div>
							<label
								for="bwiz-event-time"
								class="mb-1.5 block text-[12px] font-semibold text-navy/60">Heure de début</label
							>
							<input
								id="bwiz-event-time"
								type="time"
								bind:value={eventTime}
								class="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-rust"
							/>
						</div>
						<div class="relative">
							<label
								for="bwiz-localization"
								class="mb-1.5 block text-[12px] font-semibold text-navy/60">Localisation</label
							>
							<input
								id="bwiz-localization"
								type="text"
								bind:value={localization}
								oninput={onLocInput}
								onblur={() => setTimeout(() => (showLocSuggestions = false), 150)}
								placeholder="ex : Paris, Lyon..."
								autocomplete="off"
								class="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-rust"
							/>
							{#if showLocSuggestions}
								<ul
									class="absolute top-full left-0 z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
								>
									{#each localizationSuggestions as s (s.code)}
										<li>
											<button
												type="button"
												class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-cream"
												onmousedown={() => selectCity(s.nom)}
											>
												{s.nom}
											</button>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
					<button
						type="button"
						onclick={() => step1Valid() && (step = 2)}
						disabled={!step1Valid()}
						class="mt-6 w-full rounded-xl bg-navy py-4 text-sm font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-40"
					>
						Continuer
					</button>
				{:else if step === 2}
					<!-- Étape 2 : Menu & compléments -->

					<!-- Menu card -->
					<div class="overflow-hidden rounded-xl border border-navy/8 bg-white">
						{#if menuImage}
							<img src={menuImage} alt="" class="h-32 w-full object-cover" />
						{/if}
						<div class="p-3">
							<p class="font-semibold text-navy">{menuTitle}</p>
							<p class="text-[12px] text-rust">
								Menu sélectionné · Dès {pricePerPerson} € / convive
							</p>
						</div>
					</div>

					<!-- Convives -->
					<div class="mt-4">
						<p class="mb-2 text-[13px] font-semibold text-navy">Nombre de convives</p>
						<div class="flex overflow-hidden rounded-xl border border-navy/10">
							<button
								type="button"
								onclick={() => {
									if (guests > guestsMin) guests--;
								}}
								disabled={guests <= guestsMin}
								aria-label="Diminuer"
								class="flex h-12 w-14 shrink-0 items-center justify-center bg-teal text-xl font-bold text-white disabled:opacity-30"
								>−</button
							>
							<span
								class="flex flex-1 items-center justify-center bg-cream text-xl font-bold text-navy"
								>{guests}</span
							>
							<button
								type="button"
								onclick={() => {
									if (guests < guestsMax) guests++;
								}}
								disabled={guests >= guestsMax}
								aria-label="Augmenter"
								class="flex h-12 w-14 shrink-0 items-center justify-center bg-rust text-xl font-bold text-white disabled:opacity-30"
								>+</button
							>
						</div>
						<p class="mt-1.5 text-[12px] text-navy/40">Sous-total menu : {menuTotal} €</p>
					</div>

					<!-- Extras -->
					{#if chiefExtras.length > 0}
						<div class="mt-4">
							<p class="mb-2 text-[13px] font-semibold text-navy">Ajouter des compléments</p>
							<div class="space-y-2">
								{#each chiefExtras as extra (extra.id_menu)}
									<div class="flex items-center gap-3 rounded-xl border border-navy/8 bg-white p-3">
										<div
											class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream text-2xl"
										>
											🍽
										</div>
										<div class="min-w-0 flex-1">
											<p class="text-[13px] font-semibold text-navy">{extra.title_menu}</p>
											{#if extra.price_menu}
												<p class="text-[12px] text-rust">Dès {extra.price_menu} €/convive</p>
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
												class="flex h-7 w-7 items-center justify-center rounded-full bg-rust text-sm font-bold text-white"
												>+</button
											>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Total estimation -->
					<div class="mt-4 rounded-xl border border-navy/8 bg-white px-4 py-3">
						<div class="flex justify-between text-[13px] text-navy/60">
							<span>Menu ({guests} × {pricePerPerson} €)</span>
							<span>{menuTotal} €</span>
						</div>
						{#each chiefExtras.filter((e) => (extrasQty[e.id_menu] ?? 0) > 0) as extra (extra.id_menu)}
							<div class="mt-1 flex justify-between text-[13px] text-navy/60">
								<span>{extra.title_menu} ({guests} × {extra.price_menu} €)</span>
								<span
									>{(
										parseFloat(extra.price_menu ?? '0') *
										(extrasQty[extra.id_menu] ?? 0) *
										guests
									).toFixed(0)} €</span
								>
							</div>
						{/each}
						<div class="mt-1 flex justify-between text-[13px] text-navy/60">
							<span>Frais de déplacement</span>
							<span>{travelFee.toFixed(1)} €</span>
						</div>
						<div
							class="mt-2 flex justify-between border-t border-navy/8 pt-2 text-sm font-bold text-navy"
						>
							<span>Total estimé</span>
							<span>{grandTotal.toFixed(1)} €</span>
						</div>
					</div>

					<div class="mt-6 flex gap-3">
						<button
							type="button"
							onclick={() => (step = 1)}
							class="flex-1 rounded-xl border border-navy/15 py-3.5 text-sm font-medium text-navy"
							>Retour</button
						>
						<button
							type="button"
							onclick={() => (step = 3)}
							class="flex-1 rounded-xl bg-navy py-3.5 text-sm font-semibold text-white"
							>Continuer</button
						>
					</div>
				{:else if step === 3}
					<!-- Étape 3 : Notes & récap -->
					<div class="space-y-4">
						<div>
							<label for="bwiz-notes" class="mb-1.5 block text-[13px] font-semibold text-navy"
								>Notes ou préférences</label
							>
							<textarea
								id="bwiz-notes"
								bind:value={notes}
								placeholder="Occasion spéciale, allergies, préférences particulières..."
								rows="3"
								class="w-full resize-none rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-rust"
							></textarea>
						</div>

						<div class="rounded-xl border border-navy/8 bg-white p-4">
							<p class="text-[12px] font-semibold tracking-wide text-navy/40 uppercase">
								Récapitulatif de votre réservation
							</p>
							<div class="mt-2 space-y-1 text-[13px] text-navy/70">
								<p class="capitalize">
									{formatDateFr(eventDate)}{eventTime ? ' · ' + eventTime : ''}
								</p>
								<p>{guests} convive{guests > 1 ? 's' : ''}</p>
								<p class="font-medium text-navy">{recapTitle}</p>
								<p>{localization} · Frais de déplacement inclus</p>
							</div>
							<div class="mt-3 space-y-1 border-t border-navy/8 pt-3">
								<div class="flex justify-between text-[12px] text-navy/60">
									<span>Menu ({guests} × {pricePerPerson} €)</span>
									<span>{menuTotal} €</span>
								</div>
								{#each chiefExtras.filter((e) => (extrasQty[e.id_menu] ?? 0) > 0) as extra (extra.id_menu)}
									<div class="flex justify-between text-[12px] text-navy/60">
										<span>{extra.title_menu} ({guests} × {extra.price_menu} €)</span>
										<span
											>{(
												parseFloat(extra.price_menu ?? '0') *
												(extrasQty[extra.id_menu] ?? 0) *
												guests
											).toFixed(0)} €</span
										>
									</div>
								{/each}
								<div class="flex justify-between text-[12px] text-navy/60">
									<span>Frais de déplacement</span>
									<span>{travelFee.toFixed(1)} €</span>
								</div>
								<div
									class="flex justify-between border-t border-navy/8 pt-2 text-sm font-bold text-navy"
								>
									<span>Total estimé</span>
									<span>{grandTotal.toFixed(1)} €</span>
								</div>
							</div>
							<p class="mt-2 text-[11px] text-navy/40">
								* Ce tarif est une estimation. Le prix final sera validé par le chef
							</p>
						</div>
					</div>

					<div class="mt-6 flex gap-3">
						<button
							type="button"
							onclick={() => (step = 2)}
							class="flex-1 rounded-xl border border-navy/15 py-3.5 text-sm font-medium text-navy"
							>Retour</button
						>
						<button
							type="button"
							onclick={submit}
							disabled={submitting}
							class="flex-1 rounded-xl bg-navy py-3.5 text-sm font-semibold text-white disabled:opacity-50"
						>
							{submitting ? 'Envoi...' : 'Envoyer ma demande'}
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
