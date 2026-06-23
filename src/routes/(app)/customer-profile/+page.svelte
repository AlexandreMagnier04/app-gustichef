<script lang="ts">
	import type { PageData } from './$types';

	import imgStylo from '$lib/assets/img/stylo.png';
	import imgEngrenage from '$lib/assets/img/engrenage.png';
	import imgPing from '$lib/assets/img/ping.png';
	import imgAgendaVert from '$lib/assets/img/agenda-vert.png';
	import imgHorlogeVert from '$lib/assets/img/horloge-vert.png';
	import imgTwoUsersVert from '$lib/assets/img/two-users-vert.png';

	let { data }: { data: PageData } = $props();

	const user = $derived(data.user);
	const customer = $derived(data.customer ?? null);
	const reservations = $derived(data.reservations ?? []);

	const today = new Date().toISOString().split('T')[0];
	const upcoming = $derived(reservations.filter((r) => r.event_date >= today));
	const past = $derived(reservations.filter((r) => r.event_date < today));

	const displayLoc = $derived(
		user.localization && user.localization !== 'Non renseigné' && user.localization !== ''
			? user.localization
			: null
	);

	const initials = $derived(`${user.firstname?.[0] ?? ''}${user.name?.[0] ?? ''}`.toUpperCase());

	type Tab = 'reservations' | 'posts' | 'chefs';
	let activeTab = $state<Tab>('reservations');
	let reservationFilter = $state<'upcoming' | 'past'>('upcoming');

	const activeList = $derived(reservationFilter === 'upcoming' ? upcoming : past);

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'reservations', label: 'Réservations' },
		{ id: 'posts', label: 'Posts aimés' },
		{ id: 'chefs', label: 'Chefs favoris' }
	];
</script>

<!-- Nom centré -->
<h1 class="mb-5 text-center text-2xl font-bold text-navy">
	{user.firstname}
	{user.name}
</h1>

<!-- Ligne : avatar | préférences + localisation -->
<div class="mb-4 flex items-start gap-4">
	<!-- Avatar avec bouton éditer -->
	<div class="relative shrink-0">
		{#if user.image}
			<img
				src={user.image}
				alt=""
				class="h-24 w-24 rounded-full object-cover ring-2 ring-cream ring-offset-2"
			/>
		{:else}
			<div
				class="flex h-24 w-24 items-center justify-center rounded-full bg-teal text-2xl font-bold text-cream ring-2 ring-cream ring-offset-2"
			>
				{initials}
			</div>
		{/if}
		<button
			class="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-rust shadow ring-2 ring-cream"
			aria-label="Modifier la photo"
		>
			<img src={imgStylo} alt="" class="h-3.5 w-3.5 object-contain brightness-0 invert" />
		</button>
	</div>

	<!-- Préférences + localisation -->
	<div class="flex-1 pt-2">
		{#if customer?.preferences_customer}
			<p class="text-sm font-medium text-navy/70">{customer.preferences_customer}</p>
		{/if}
		{#if displayLoc}
			<div class="mt-1.5 flex items-center gap-1 text-sm text-navy/50">
				<img src={imgPing} alt="" class="h-3.5 w-3.5 shrink-0 object-contain" />
				<span>{displayLoc}</span>
			</div>
		{/if}
	</div>
</div>

<!-- Bio longue (si différente des préférences courtes) -->
{#if customer?.preferences_customer && customer.preferences_customer.length > 60}
	<p class="mb-4 text-sm leading-relaxed text-navy/65">{customer.preferences_customer}</p>
{/if}

<!-- Actions rapides - alignées à droite -->
<div class="mb-5 flex flex-col items-end gap-1">
	<a
		href="/customer-profile/edit"
		class="flex items-center gap-2 py-1.5 text-sm font-medium text-teal"
	>
		<img src={imgStylo} alt="" class="h-4 w-4 object-contain" />
		Éditer profil
	</a>
	<a
		href="/customer-profile/settings"
		data-sveltekit-reload
		class="flex items-center gap-2 py-1.5 text-sm font-medium text-teal"
	>
		<img src={imgEngrenage} alt="" class="h-4 w-4 object-contain" />
		Paramètres
	</a>
</div>

<!-- Divider -->
<div class="-mx-5 h-px bg-navy/8"></div>

<!-- Tabs -->
<div class="-mx-5 flex border-b border-navy/8">
	{#each tabs as tab (tab.id)}
		<button
			onclick={() => (activeTab = tab.id)}
			class="relative flex-1 py-3 text-xs font-semibold transition-colors {activeTab === tab.id
				? 'text-navy'
				: 'text-navy/40'}"
		>
			{tab.label}
			{#if activeTab === tab.id}
				<span class="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-rust"
				></span>
			{/if}
		</button>
	{/each}
</div>

<!-- Contenu tabs -->
<div class="pt-5">
	<!-- Réservations -->
	{#if activeTab === 'reservations'}
		<div class="mb-5 flex rounded-full bg-navy/8 p-1">
			<button
				onclick={() => (reservationFilter = 'upcoming')}
				class="flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors {reservationFilter ===
				'upcoming'
					? 'bg-teal text-white shadow-sm'
					: 'text-navy/50'}"
			>
				À venir
			</button>
			<button
				onclick={() => (reservationFilter = 'past')}
				class="flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors {reservationFilter ===
				'past'
					? 'bg-teal text-white shadow-sm'
					: 'text-navy/50'}"
			>
				Passées
			</button>
		</div>

		{#if activeList.length === 0}
			<div class="flex flex-col items-center gap-3 py-12 text-navy/40">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-12 w-12 opacity-40"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
					/>
				</svg>
				<p class="text-sm">
					Aucune réservation {reservationFilter === 'upcoming' ? 'à venir' : 'passée'}
				</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each activeList as reservation (reservation.id_reservation)}
					<div class="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(22,48,64,0.08)]">
						<!-- Header : photo chef | nom chef | badge -->
						<div class="flex items-center gap-3 px-4 pt-4 pb-3">
							{#if reservation.chief?.image}
								<img
									src={reservation.chief.image}
									alt=""
									class="h-10 w-10 shrink-0 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy/50"
								>
									{(reservation.chief?.firstname?.[0] ?? '?').toUpperCase()}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<a
									href="/reservations/{reservation.id_reservation}"
									class="flex items-center gap-1 text-[13px] font-semibold text-navy"
								>
									<span class="truncate"
										>{reservation.chief?.firstname} {reservation.chief?.name}</span
									>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										fill="currentColor"
										class="h-3.5 w-3.5 shrink-0 text-navy/40"
										><path
											fill-rule="evenodd"
											d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
											clip-rule="evenodd"
										/></svg
									>
								</a>
								{#if reservation.menu_title}
									<p class="text-[11px] text-navy/50">{reservation.menu_title}</p>
								{/if}
							</div>
							<span
								class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold {reservation.statut ===
								'confirme'
									? 'bg-green-500/15 text-green-600'
									: reservation.statut === 'annule'
										? 'bg-navy/8 text-navy/40'
										: 'bg-rust/10 text-rust'}"
							>
								{reservation.statut === 'confirme'
									? 'Confirmé'
									: reservation.statut === 'annule'
										? 'Annulée'
										: 'En attente'}
							</span>
						</div>

						<div class="mx-4 h-px bg-navy/6"></div>

						<!-- Infos : date | heure | lieu | convives -->
						<div class="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3">
							<div class="flex items-center gap-2 text-[12px] text-navy/70">
								<img src={imgAgendaVert} alt="" class="h-3.5 w-3.5 shrink-0 object-contain" />
								<span class="capitalize">{formatDate(reservation.event_date)}</span>
							</div>
							<div class="flex items-center gap-2 text-[12px] text-navy/70">
								<img src={imgHorlogeVert} alt="" class="h-3.5 w-3.5 shrink-0 object-contain" />
								<span>{reservation.event_time ?? '—'}</span>
							</div>
							<div class="flex items-center gap-2 text-[12px] text-navy/70">
								<img src={imgPing} alt="" class="h-3.5 w-3.5 shrink-0 object-contain" />
								<span>{reservation.localization ?? '—'}</span>
							</div>
							<div class="flex items-center gap-2 text-[12px] text-navy/70">
								<img src={imgTwoUsersVert} alt="" class="h-3.5 w-3.5 shrink-0 object-contain" />
								<span>{reservation.guests} convive{reservation.guests > 1 ? 's' : ''}</span>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex items-center justify-between border-t border-navy/6 px-4 py-3">
							<a
								href="/reservations/{reservation.id_reservation}"
								class="text-xs font-medium text-navy/50"
							>
								Voir les détails
							</a>
							<a
								href="/messages/{reservation.id_conversation}"
								class="rounded-xl bg-teal px-4 py-2 text-xs font-semibold text-white"
							>
								Contacter
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	<!-- Posts aimés -->
	{#if activeTab === 'posts'}
		<div class="flex flex-col items-center gap-3 py-16 text-navy/40">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-12 w-12 opacity-40"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
				/>
			</svg>
			<p class="text-sm">Bientôt disponible</p>
		</div>
	{/if}

	<!-- Chefs favoris -->
	{#if activeTab === 'chefs'}
		<div class="flex flex-col items-center gap-3 py-16 text-navy/40">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-12 w-12 opacity-40"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
				/>
			</svg>
			<p class="text-sm">Bientôt disponible</p>
		</div>
	{/if}
</div>
