<script lang="ts">
	import type { ReservationDetail } from '$lib/models/reservation.model';

	const TRAVEL_FEE_PER_PERSON = 2.4;

	let { data } = $props();
	const r = $derived(data.reservation as ReservationDetail);
	const menuImage = $derived(data.menuImage as string | null);
	const isChief = $derived(data.user.id === r.id_chief);
	let cancelling = $state(false);

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	const extras = $derived(r.extras_json ?? []);
	const menuTotal = $derived(r.price_per_person * r.guests);
	const extrasTotal = $derived(
		extras.reduce((sum, e) => sum + e.price_per_person * e.qty * r.guests, 0)
	);
	const travelFee = $derived(TRAVEL_FEE_PER_PERSON * r.guests);
	const grandTotal = $derived(menuTotal + extrasTotal + travelFee);
	const acompte = $derived(Math.round(grandTotal / 2));

	async function cancelReservation() {
		if (!confirm('Annuler cette réservation ?')) return;
		cancelling = true;
		await fetch(`/api/reservations/${r.id_reservation}`, { method: 'DELETE' });
		cancelling = false;
		window.location.href = '/messages';
	}
</script>

<div class="-mx-5 -mt-3 pb-24">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-navy/8 px-4 py-3">
		<div class="flex items-center gap-3">
			<a
				href="/messages/{r.id_conversation}"
				aria-label="Messages"
				class="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="h-4 w-4 text-navy/60"
				>
					<path
						fill-rule="evenodd"
						d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 0 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
						clip-rule="evenodd"
					/>
				</svg>
			</a>
			<h1 class="text-sm font-bold text-navy">Ta réservation</h1>
		</div>
		<span
			class="rounded-full px-3 py-1 text-[11px] font-semibold {r.statut === 'confirme'
				? 'bg-green-500/15 text-green-600'
				: 'bg-rust/15 text-rust'}"
		>
			{r.statut === 'confirme' ? 'Confirmé' : 'Annulé'}
		</span>
	</div>

	<div class="space-y-5 px-4 pt-5">
		<!-- Nom du client (côté chef) -->
		{#if isChief && r.customer}
			<p class="font-semibold text-navy">{r.customer.firstname} {r.customer.name}</p>
		{/if}

		<!-- Bloc chef (côté client uniquement) -->
		{#if !isChief && r.chief}
			<a href="/chiefs/{r.id_chief}" class="flex items-center gap-3 py-2">
				<div class="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-navy/10">
					{#if r.chief.image}
						<img src={r.chief.image} alt="" class="h-full w-full object-cover" />
					{:else}
						<div class="flex h-full w-full items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="h-7 w-7 text-navy/30"
							>
								<path
									d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
								/>
							</svg>
						</div>
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1">
						<p class="font-semibold text-navy">{r.chief.firstname} {r.chief.name}</p>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="h-4 w-4 shrink-0 text-teal"
						>
							<path
								fill-rule="evenodd"
								d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<p class="text-[13px] text-navy/50">Chef à domicile</p>
					{#if r.chief.localization}
						<div class="mt-0.5 flex items-center gap-1 text-[12px] text-navy/40">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="h-3 w-3 shrink-0 text-teal"
							>
								<path
									fill-rule="evenodd"
									d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2 6a6 6 0 1 1 10.174 4.31c-.203.196-.43.37-.66.533l-3.67 2.938a.75.75 0 0 1-.936 0l-3.67-2.938a6.08 6.08 0 0 1-.66-.533A5.976 5.976 0 0 1 2 6Zm4.5.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
									clip-rule="evenodd"
								/>
							</svg>
							{r.chief.localization}
						</div>
					{/if}
				</div>
			</a>
		{/if}

		<!-- Infos événement -->
		<div class="space-y-0 divide-y divide-navy/8">
			<div class="flex items-center gap-3 py-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4 shrink-0 text-teal"
				>
					<path
						fill-rule="evenodd"
						d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3A2.5 2.5 0 0 1 14.5 5.5v6a2.5 2.5 0 0 1-2.5 2.5H4A2.5 2.5 0 0 1 1.5 11.5v-6A2.5 2.5 0 0 1 4 3V1.75ZM3 7v4.5A1 1 0 0 0 4 12.5h8a1 1 0 0 0 1-1V7H3Z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="text-[13px] text-navy capitalize">{formatDate(r.event_date)}</span>
			</div>
			{#if r.event_time}
				<div class="flex items-center gap-3 py-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-4 w-4 shrink-0 text-teal"
					>
						<path
							fill-rule="evenodd"
							d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7-4.75a.75.75 0 0 0-.75.75v4.5c0 .264.138.51.366.647l3 1.75a.75.75 0 0 0 .768-1.286L8.75 8.085V4a.75.75 0 0 0-.75-.75Z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="text-[13px] text-navy">{r.event_time}</span>
				</div>
			{/if}
			<div class="flex items-center gap-3 py-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4 shrink-0 text-teal"
				>
					<path
						fill-rule="evenodd"
						d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2 6a6 6 0 1 1 10.174 4.31c-.203.196-.43.37-.66.533l-3.67 2.938a.75.75 0 0 1-.936 0l-3.67-2.938a6.08 6.08 0 0 1-.66-.533A5.976 5.976 0 0 1 2 6Zm4.5.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="text-[13px] text-navy">Domicile client · {r.localization}</span>
			</div>
			<div class="flex items-center gap-3 py-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4 shrink-0 text-teal"
				>
					<path
						d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
					/>
				</svg>
				<span class="text-[13px] text-navy">{r.guests} convives</span>
			</div>
		</div>

		<!-- Card menu -->
		{#if r.menu_title}
			<div class="overflow-hidden rounded-2xl border border-navy/8">
				{#if menuImage}
					<img src={menuImage} alt={r.menu_title} class="h-48 w-full object-cover" />
				{/if}
				<div class="p-4">
					<h3 class="font-bold text-navy">{r.menu_title}</h3>
					{#if r.menu_price}
						<p class="mt-0.5 text-sm font-semibold text-rust">Dès {r.menu_price} € / convive</p>
					{/if}
					{#if r.menu_description}
						<p class="mt-2 text-[13px] leading-relaxed text-navy/65">{r.menu_description}</p>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Ingrédients -->
		{#if r.menu_ingredients && r.menu_ingredients.length > 0}
			<div>
				<h3 class="mb-3 font-semibold text-navy">Ingrédients</h3>
				<ul class="space-y-2">
					{#each r.menu_ingredients as ing (ing)}
						<li class="flex items-center gap-2 text-[13px] text-navy/80">
							<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-rust"></span>
							{ing}
						</li>
					{/each}
				</ul>
				<div class="mt-4 flex items-start gap-2 rounded-xl bg-rust/8 px-3 py-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="mt-0.5 h-4 w-4 shrink-0 text-rust/70"
					>
						<path
							fill-rule="evenodd"
							d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
							clip-rule="evenodd"
						/>
					</svg>
					<p class="text-xs leading-relaxed text-navy/60">
						Allergènes : œufs, produits laitiers, fruits à coque. Sur demande sans gluten.
					</p>
				</div>
			</div>
		{/if}

		<!-- Récapitulatif -->
		<div>
			<h3 class="mb-3 font-semibold text-navy">Récapitulatif de votre réservation</h3>
			<div class="space-y-2 text-[13px]">
				<div class="flex justify-between text-navy/70">
					<span>{r.menu_title ?? r.title} ({r.guests} × {r.price_per_person} €)</span>
					<span>{menuTotal} €</span>
				</div>
				{#each extras as e (e.id_menu)}
					<div class="flex justify-between text-navy/70">
						<span>{e.title} ({r.guests} × {e.qty} × {e.price_per_person} €)</span>
						<span>{e.price_per_person * e.qty * r.guests} €</span>
					</div>
				{/each}
				<div class="flex justify-between text-navy/70">
					<span>Frais de déplacement</span>
					<span>{travelFee.toFixed(1).replace('.', ',')} €</span>
				</div>
			</div>
			<div
				class="mt-3 flex justify-between border-t border-navy/8 pt-3 text-sm font-bold text-navy"
			>
				<span>Total estimé</span>
				<span>{grandTotal.toFixed(1).replace('.', ',')} €</span>
			</div>
			<p class="mt-2 text-[11px] text-navy/40">
				Ce tarif est une estimation. Le prix final sera validé par le chef.
			</p>
		</div>

		<!-- Échéancier -->
		<div class="space-y-4">
			<div class="flex items-start gap-3">
				<span class="mt-1 h-3 w-3 shrink-0 rounded-full bg-teal"></span>
				<div>
					<p class="text-[13px] font-semibold text-navy">J-5 avant l'événement</p>
					<p class="text-[13px] text-navy/60">
						Acompte de 50 % débité<br />({acompte} €) pour l'achat des ingrédients
					</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<span class="mt-1 h-3 w-3 shrink-0 rounded-full bg-navy/20"></span>
				<div>
					<p class="text-[13px] font-semibold text-navy">Après la prestation</p>
					<p class="text-[13px] text-navy/60">
						Solde de 50 % débité ({acompte} €)<br />une fois la prestation confirmée
					</p>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="space-y-3 pt-1">
			{#if r.statut === 'confirme'}
				<button
					type="button"
					onclick={cancelReservation}
					disabled={cancelling}
					class="rounded-full bg-navy/8 px-5 py-2.5 text-[13px] text-navy/50 disabled:opacity-50"
				>
					{cancelling ? '...' : 'annuler réservation'}
				</button>
			{/if}
			<a
				href="/messages/{r.id_conversation}"
				class="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-white {isChief
					? 'bg-rust'
					: 'bg-teal'}"
			>
				<i class="fa-regular fa-paper-plane text-white"></i>
				Contacter {isChief
					? (r.customer?.firstname ?? 'le client')
					: (r.chief?.firstname ?? 'le chef')}
			</a>
		</div>
	</div>
</div>
