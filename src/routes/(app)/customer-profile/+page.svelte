<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// user vient du layout (app)/+layout.server.ts
	const user = $derived(data.user);
	const customer = $derived(data.customer ?? null);
	const reservations = $derived(data.reservations ?? []);

	const today = new Date().toISOString().split('T')[0];
	const upcoming = $derived(reservations.filter((r) => r.expected_date_request >= today));
	const past = $derived(reservations.filter((r) => r.expected_date_request < today));

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

	function statusBadge(statut: string): { label: string; cls: string } {
		switch (statut) {
			case 'confirmed':
				return { label: 'Confirmé', cls: 'bg-teal-50 text-teal-700 border border-teal-200' };
			case 'cancelled':
				return { label: 'Annulée', cls: 'bg-red-50 text-red-600 border border-red-200' };
			case 'completed':
			case 'done':
				return { label: 'Terminée', cls: 'bg-gray-100 text-gray-500 border border-gray-200' };
			default:
				return {
					label: 'En attente',
					cls: 'bg-orange-50 text-orange-600 border border-orange-200'
				};
		}
	}

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'reservations', label: 'Réservations' },
		{ id: 'posts', label: 'Posts aimés' },
		{ id: 'chefs', label: 'Chefs favoris' }
	];
</script>

<!-- Header info -->
<div class="mb-5">
	<div class="mb-4 flex items-start gap-4">
		<!-- Avatar -->
		<div class="relative shrink-0">
			{#if user.image}
				<img
					src={user.image}
					alt=""
					class="h-20 w-20 rounded-full object-cover ring-2 ring-cream ring-offset-2"
				/>
			{:else}
				<div
					class="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-xl font-bold text-cream ring-2 ring-cream ring-offset-2"
				>
					{initials}
				</div>
			{/if}
			<button
				class="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-rust text-white shadow"
				aria-label="Modifier la photo"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-3.5 w-3.5"
				>
					<path
						d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474ZM4.75 13.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
					/>
				</svg>
			</button>
		</div>

		<!-- Name + location -->
		<div class="flex-1 pt-1">
			<h1 class="text-xl font-bold text-navy">{user.firstname} {user.name}</h1>
			{#if displayLoc}
				<div class="mt-1 flex items-center gap-1 text-sm text-navy/50">
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
			{#if customer?.preferences_customer}
				<p class="mt-2 text-sm leading-relaxed text-navy/60">{customer.preferences_customer}</p>
			{/if}
		</div>
	</div>

	<!-- Éditer profil -->
	<div class="flex justify-end">
		<button
			class="flex items-center gap-1.5 rounded-xl bg-rust px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4"
			>
				<path
					d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474ZM4.75 13.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
				/>
			</svg>
			éditer profil
		</button>
	</div>
</div>

<!-- Tabs -->
<div class="-mx-5 mb-5 border-b border-navy/10">
	<div class="flex">
		{#each tabs as tab (tab.id)}
			<button
				onclick={() => (activeTab = tab.id)}
				class="flex-1 py-3 text-xs font-semibold transition-colors {activeTab === tab.id
					? 'border-b-2 border-rust text-navy'
					: 'text-navy/40'}"
			>
				{tab.label}
			</button>
		{/each}
	</div>
</div>

<!-- Tab: Réservations -->
{#if activeTab === 'reservations'}
	<!-- Subtabs -->
	<div class="mb-5 flex rounded-xl bg-navy/8 p-1">
		<button
			onclick={() => (reservationFilter = 'upcoming')}
			class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors {reservationFilter ===
			'upcoming'
				? 'bg-navy text-cream shadow-sm'
				: 'text-navy/50'}"
		>
			À venir
		</button>
		<button
			onclick={() => (reservationFilter = 'past')}
			class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors {reservationFilter ===
			'past'
				? 'bg-navy text-cream shadow-sm'
				: 'text-navy/50'}"
		>
			Passées
		</button>
	</div>

	<h2 class="mb-4 text-center text-base font-bold text-navy">
		Réservations {reservationFilter === 'upcoming' ? 'à venir' : 'passées'}
	</h2>

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
		<div class="flex flex-col gap-4">
			{#each activeList as reservation (reservation.id_request)}
				{@const badge = statusBadge(reservation.statut_request)}
				<div class="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(22,48,64,0.08)]">
					<!-- Chef row -->
					<div class="flex items-center justify-between px-4 pt-4 pb-3">
						<div class="flex items-center gap-3">
							{#if reservation.chief_image}
								<img
									src={reservation.chief_image}
									alt=""
									class="h-10 w-10 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy"
								>
									{reservation.chief_firstname?.[0] ?? ''}{reservation.chief_name?.[0] ?? ''}
								</div>
							{/if}
							<div>
								<div class="flex items-center gap-1">
									<span class="text-sm font-semibold text-navy"
										>{reservation.chief_firstname} {reservation.chief_name}</span
									>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										fill="currentColor"
										class="h-3.5 w-3.5 text-navy/40"
									>
										<path
											fill-rule="evenodd"
											d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								{#if reservation.chief_specialty}
									<p class="text-xs text-navy/50">
										{reservation.chief_specialty}
									</p>
								{/if}
							</div>
						</div>
						<span class="rounded-full px-2.5 py-1 text-xs font-semibold {badge.cls}">
							{badge.label}
						</span>
					</div>

					<div class="mx-4 border-t border-navy/6"></div>

					<!-- Details grid -->
					<div class="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-3">
						<div class="flex items-center gap-2 text-xs text-navy/60">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="h-3.5 w-3.5 shrink-0 text-navy/30"
							>
								<path
									fill-rule="evenodd"
									d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 7a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7Z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{formatDate(reservation.expected_date_request)}</span>
						</div>
						<div class="flex items-center gap-2 text-xs text-navy/60">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="h-3.5 w-3.5 shrink-0 text-navy/30"
							>
								<path
									fill-rule="evenodd"
									d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 8c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{reservation.localization_request}</span>
						</div>
						<div class="flex items-center gap-2 text-xs text-navy/60">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="h-3.5 w-3.5 shrink-0 text-navy/30"
							>
								<path
									d="M8 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM6.5 9.5A1.5 1.5 0 0 1 8 8a1.5 1.5 0 0 1 1.5 1.5v.5H10a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1h.5v-.5Z"
								/>
								<path
									fill-rule="evenodd"
									d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"
									clip-rule="evenodd"
								/>
							</svg>
							<span
								>{reservation.guests_request} convive{reservation.guests_request > 1
									? 's'
									: ''}</span
							>
						</div>
						{#if reservation.type_event_request}
							<div class="flex items-center gap-2 text-xs text-navy/60">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 16 16"
									fill="currentColor"
									class="h-3.5 w-3.5 shrink-0 text-navy/30"
								>
									<path
										d="M5.5 1a.5.5 0 0 0-1 0v1H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-.5V1a.5.5 0 0 0-1 0v1h-5V1Z"
									/>
								</svg>
								<span>{reservation.type_event_request}</span>
							</div>
						{/if}
					</div>

					<!-- Actions -->
					<div class="flex gap-2 px-4 pb-4">
						<button
							class="flex-1 rounded-xl border border-navy/20 py-2.5 text-xs font-semibold text-navy"
						>
							Voir les détails
						</button>
						<button class="flex-1 rounded-xl bg-navy py-2.5 text-xs font-semibold text-cream">
							Contacter
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/if}

<!-- Tab: Posts aimés -->
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

<!-- Tab: Chefs favoris -->
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
