<script lang="ts">
	import type { PageData } from './$types';
	import { signOut } from '$lib/auth-client';
	import { goto } from '$app/navigation';

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
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-3.5 w-3.5 text-white"
			>
				<path
					d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474ZM4.75 13.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
				/>
			</svg>
		</button>
	</div>

	<!-- Préférences + localisation -->
	<div class="flex-1 pt-2">
		{#if customer?.preferences_customer}
			<p class="text-sm font-medium text-navy/70">{customer.preferences_customer}</p>
		{/if}
		{#if displayLoc}
			<div class="mt-1.5 flex items-center gap-1 text-sm text-navy/50">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-3.5 w-3.5 shrink-0 text-rust"
				>
					<path
						fill-rule="evenodd"
						d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 8c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
						clip-rule="evenodd"
					/>
				</svg>
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
	<a href="/customer-profile/edit" class="flex items-center gap-2 py-1.5 text-sm font-medium text-teal">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 16 16"
			fill="currentColor"
			class="h-4 w-4 text-teal"
		>
			<path
				d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z"
			/>
			<path
				d="M4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H7A.75.75 0 0 0 7 2H4.75Z"
			/>
		</svg>
		Éditer profil
	</a>
	<a href="/customer-profile/settings" class="flex items-center gap-2 py-1.5 text-sm font-medium text-teal">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			class="h-4 w-4 text-teal"
		>
			<path
				fill-rule="evenodd"
				d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .205 1.251l-1.18 2.044a1 1 0 0 1-1.186.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
				clip-rule="evenodd"
			/>
		</svg>
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
								<img src={reservation.chief.image} alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" />
							{:else}
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy/50">
									{(reservation.chief?.firstname?.[0] ?? '?').toUpperCase()}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<a href="/reservations/{reservation.id_reservation}" class="flex items-center gap-1 text-[13px] font-semibold text-navy">
									<span class="truncate">{reservation.chief?.firstname} {reservation.chief?.name}</span>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/40"><path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
								</a>
								{#if reservation.menu_title}
									<p class="text-[11px] text-navy/50">{reservation.menu_title}</p>
								{/if}
							</div>
							<span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold {reservation.statut === 'confirme' ? 'bg-green-500/15 text-green-600' : reservation.statut === 'annule' ? 'bg-navy/8 text-navy/40' : 'bg-rust/10 text-rust'}">
								{reservation.statut === 'confirme' ? 'Confirmé' : reservation.statut === 'annule' ? 'Annulée' : 'En attente'}
							</span>
						</div>

						<div class="mx-4 h-px bg-navy/6"></div>

						<!-- Infos : date | heure | lieu | convives -->
						<div class="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3">
							<div class="flex items-center gap-2 text-[12px] text-navy/70">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/35"><path fill-rule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3h.25A2.75 2.75 0 0 1 15 5.75v7.5A2.75 2.75 0 0 1 12.25 16H3.75A2.75 2.75 0 0 1 1 13.25v-7.5A2.75 2.75 0 0 1 3.75 3H4V1.75ZM3.75 6a.75.75 0 0 0-.75.75v5.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-5.5a.75.75 0 0 0-.75-.75H3.75Z" clip-rule="evenodd"/></svg>
								<span class="capitalize">{formatDate(reservation.event_date)}</span>
							</div>
							{#if reservation.event_time}
								<div class="flex items-center gap-2 text-[12px] text-navy/70">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/35"><path fill-rule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7-4.75a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0V4a.75.75 0 0 0-.75-.75ZM8 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clip-rule="evenodd"/></svg>
									<span>{reservation.event_time}</span>
								</div>
							{/if}
							{#if reservation.localization}
								<div class="flex items-center gap-2 text-[12px] text-navy/70">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/35"><path fill-rule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 8c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clip-rule="evenodd"/></svg>
									<span>{reservation.localization}</span>
								</div>
							{/if}
							<div class="flex items-center gap-2 text-[12px] text-navy/70">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/35"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"/></svg>
								<span>{reservation.guests} convive{reservation.guests > 1 ? 's' : ''}</span>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex items-center justify-between border-t border-navy/6 px-4 py-3">
							<a href="/reservations/{reservation.id_reservation}" class="text-xs font-medium text-navy/50">
								Voir les détails
							</a>
							<a href="/messages/{reservation.id_conversation}" class="rounded-xl bg-teal px-4 py-2 text-xs font-semibold text-white">
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

	<!-- Déconnexion -->
	<div class="mt-6 pb-10">
		<button
			type="button"
			onclick={async () => {
				await signOut();
				goto('/login');
			}}
			class="flex w-full items-center justify-center gap-2 rounded-2xl border border-navy/10 bg-white py-3.5 text-sm font-semibold text-navy/60 transition-opacity active:opacity-70"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-4 w-4"
			>
				<path
					fill-rule="evenodd"
					d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
					clip-rule="evenodd"
				/>
				<path
					fill-rule="evenodd"
					d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.08a.75.75 0 1 0-1.004-1.114l-2.5 2.5a.75.75 0 0 0 0 1.087l2.5 2.5a.75.75 0 1 0 1.004-1.114l-1.048-1.08h9.546A.75.75 0 0 0 19 10Z"
					clip-rule="evenodd"
				/>
			</svg>
			Se déconnecter
		</button>
	</div>
</div>
