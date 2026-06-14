<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ReservationDetail } from '$lib/server/services/reservations';

	let { data } = $props();
	const r = $derived(data.reservation as ReservationDetail);
	const isChief = $derived(data.user?.role === 'chief');
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

	const total = $derived(r.price_per_person * r.guests);
	const acompte = $derived(Math.round(total / 2));

	async function cancelReservation() {
		if (!confirm('Annuler cette réservation ?')) return;
		cancelling = true;
		await fetch(`/api/reservations/${r.id_reservation}`, { method: 'DELETE' });
		cancelling = false;
		await goto('/messages');
	}
</script>

<div class="-mx-5 -mt-3 pb-10">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-navy/[0.07] px-4 py-3">
		<div class="flex items-center gap-3">
			<a
				href="/messages/{r.id_conversation}"
				class="flex h-8 w-8 items-center justify-center rounded-full text-navy/60"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="h-5 w-5"
				>
					<path
						fill-rule="evenodd"
						d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 0 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
						clip-rule="evenodd"
					/>
				</svg>
			</a>
			<h1 class="text-base font-semibold text-navy">Ta réservation</h1>
		</div>
		<span
			class="rounded-full px-3 py-1 text-[11px] font-semibold {r.statut === 'confirme'
				? 'bg-teal/15 text-teal'
				: 'bg-rust/15 text-rust'}"
		>
			{r.statut === 'confirme' ? 'Confirmée' : 'Annulée'}
		</span>
	</div>

	<div class="space-y-5 px-4 pt-5">
		<!-- Event info -->
		<div>
			<h2 class="text-lg font-bold text-navy">{r.title}</h2>
			<p class="mt-0.5 text-sm text-navy/60">{r.chief_firstname} {r.chief_name}</p>
		</div>

		<div class="space-y-2.5">
			<div class="flex items-center gap-2.5 text-sm text-navy/70">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4 shrink-0 text-navy/40"
				>
					<path
						fill-rule="evenodd"
						d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3A2.5 2.5 0 0 1 14.5 5.5v6a2.5 2.5 0 0 1-2.5 2.5H4A2.5 2.5 0 0 1 1.5 11.5v-6A2.5 2.5 0 0 1 4 3V1.75ZM3 7v4.5A1 1 0 0 0 4 12.5h8a1 1 0 0 0 1-1V7H3Z"
						clip-rule="evenodd"
					/>
				</svg>
				{formatDate(r.event_date)}
			</div>
			<div class="flex items-center gap-2.5 text-sm text-navy/70">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4 shrink-0 text-navy/40"
				>
					<path
						fill-rule="evenodd"
						d="M8 1a5 5 0 0 0-5 5c0 3.234 2.75 6.56 4.4 8.318a.8.8 0 0 0 1.2 0C10.25 12.56 13 9.234 13 6a5 5 0 0 0-5-5Zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
						clip-rule="evenodd"
					/>
				</svg>
				Domicile client · {r.localization}
			</div>
			<div class="flex items-center gap-2.5 text-sm text-navy/70">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4 shrink-0 text-navy/40"
				>
					<path
						d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
					/>
				</svg>
				{r.guests} convives
			</div>
		</div>

		<!-- Menu card -->
		{#if r.menu_title}
			<div class="overflow-hidden rounded-2xl border border-navy/[0.07] bg-white">
				<div class="p-4">
					<p class="text-[11px] font-semibold tracking-wider text-rust uppercase">Menu proposé</p>
					<h3 class="mt-1 text-base font-bold text-navy">{r.menu_title}</h3>
					{#if r.menu_price}
						<p class="text-sm font-semibold text-rust">Dès {r.menu_price} € / convive</p>
					{/if}
					{#if r.menu_description}
						<p class="mt-2 text-sm leading-relaxed text-navy/65">{r.menu_description}</p>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Récapitulatif -->
		<div class="rounded-2xl border border-navy/[0.07] bg-white p-4">
			<h3 class="mb-3 text-sm font-semibold text-navy">Récapitulatif de votre réservation</h3>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between text-navy/70">
					<span>{r.title} ({r.guests} × {r.price_per_person} €)</span>
					<span>{total} €</span>
				</div>
			</div>
			<div
				class="mt-3 flex justify-between border-t border-navy/[0.07] pt-3 text-sm font-bold text-navy"
			>
				<span>Total estimé</span>
				<span>{total} €</span>
			</div>
		</div>

		<!-- Payment stages -->
		<div class="space-y-3">
			<div class="flex items-start gap-3">
				<span class="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-teal"></span>
				<div>
					<p class="text-sm font-semibold text-navy">J-5 avant l'événement</p>
					<p class="text-sm text-navy/60">
						Acompte de 50 % débité ({acompte} €) pour l'achat des ingrédients
					</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<span class="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-navy/30"></span>
				<div>
					<p class="text-sm font-semibold text-navy">Après la prestation</p>
					<p class="text-sm text-navy/60">
						Solde de 50 % débité ({acompte} €) une fois la prestation confirmée
					</p>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="space-y-3 pt-2">
			{#if r.statut === 'confirme'}
				<button
					type="button"
					onclick={cancelReservation}
					disabled={cancelling}
					class="rounded-full border border-navy/20 px-5 py-2 text-sm text-navy/60 disabled:opacity-50"
				>
					{cancelling ? '...' : 'annuler réservation'}
				</button>
			{/if}
			<a
				href="/messages/{r.id_conversation}"
				class="flex w-full items-center justify-center rounded-xl bg-rust py-3.5 text-sm font-semibold text-white transition-opacity active:opacity-80"
			>
				Contacter {r.chief_firstname}
			</a>
		</div>
	</div>
</div>
