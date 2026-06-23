<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import portrait1 from '$lib/assets/img/portrait-1.jpeg';
	import slide1 from '$lib/assets/img/slide-1.jpeg';
	import slide2 from '$lib/assets/img/slide-2.jpeg';
	import slide3 from '$lib/assets/img/slide-3.jpeg';
	import slide4 from '$lib/assets/img/slide-4.jpeg';
	import slide5 from '$lib/assets/img/slide-5.jpeg';
	import slide6 from '$lib/assets/img/slide-6.jpeg';
	import slide8 from '$lib/assets/img/slide-8.jpeg';
	import slide9 from '$lib/assets/img/slide-9.jpeg';
	import slide10 from '$lib/assets/img/slide-10.jpeg';
	import PublicationCard from '$lib/components/PublicationCard.svelte';
	import SpecialtyChip from '$lib/components/SpecialtyChip.svelte';
	import CityAutocomplete from '$lib/components/CityAutocomplete.svelte';
	import NewPublicationModal from '$lib/components/NewPublicationModal.svelte';
	import NewRequestModal from '$lib/components/NewRequestModal.svelte';
	import RespondToRequestModal from '$lib/components/RespondToRequestModal.svelte';

	let { data } = $props();

	let activeTab = $state<'decouvrir' | 'demandes'>('decouvrir');

	$effect(() => {
		activeTab = page.url.searchParams.get('tab') === 'demandes' ? 'demandes' : 'decouvrir';
	});

	function setTab(tab: 'decouvrir' | 'demandes') {
		activeTab = tab;
		replaceState(tab === 'demandes' ? '?tab=demandes' : '?', {});
	}
	let showNewPublication = $state(false);
	let showNewRequest = $state(false);
	let editingRequest = $state<import('$lib/models/customer.model').Request | null>(null);
	let showRespondModal = $state(false);
	let respondingRequest = $state<
		import('$lib/server/services/customers').RequestWithCustomer | null
	>(null);
	$effect(() => {
		if (!showNewRequest) editingRequest = null;
	});
	const isChief = $derived(data.user?.role === 'chief');

	// Filtres demandes (côté chef)
	let requestCityFilter = $state('');
	const filteredRequests = $derived(
		isChief
			? (data.requests as import('$lib/server/services/customers').RequestWithCustomer[]).filter(
					(r) =>
						!requestCityFilter ||
						r.localization_request.toLowerCase().includes(requestCityFilter.toLowerCase())
				)
			: []
	);

	// Groupement demandes client : à venir / passées
	const customerRequests = $derived(
		!isChief ? (data.requests as import('$lib/models/customer.model').Request[]) : []
	);
	const today = new Date().toISOString().split('T')[0];
	const upcomingRequests = $derived(
		customerRequests.filter((r) => r.expected_date_request >= today)
	);
	const pastRequests = $derived(customerRequests.filter((r) => r.expected_date_request < today));

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	// Mapping de secours pour spécialités sans image en DB — rotation déterministe.
	const SPECIALTY_IMAGES: Record<string, string> = {
		'chef à domicile': portrait1,
		'plats préparés': slide1,
		pâtisserie: slide3,
		nutrition: slide2,
		'dîner privé': slide4,
		anniversaire: slide5,
		mariage: slide6,
		"événement d'entreprise": slide8,
		traiteur: slide9,
		barbecue: slide10
	};
	const FALLBACK_POOL = [slide1, slide2, slide3, slide4, slide5, slide6, slide8, slide9, slide10];

	function fallbackImage(name: string): string {
		let hash = 0;
		for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) | 0;
		return FALLBACK_POOL[Math.abs(hash) % FALLBACK_POOL.length];
	}

	function specialtyImage(name: string): string {
		return SPECIALTY_IMAGES[name.toLowerCase()] ?? fallbackImage(name);
	}

	// Filtres côté client
	let selectedCity = $state('');
	let selectedPrice = $state<'' | 'low' | 'mid' | 'high'>('');
	let selectedSpecialty = $state('');
	let showCityFilter = $state(false);
	let showPriceFilter = $state(false);

	const PRICE_RANGES = {
		low: { label: '< 30 €', min: 0, max: 30 },
		mid: { label: '30 – 60 €', min: 30, max: 60 },
		high: { label: '> 60 €', min: 60, max: Infinity }
	} as const;

	const filteredPublications = $derived(
		data.publications.filter((p) => {
			if (selectedCity && !p.author.localization.toLowerCase().includes(selectedCity.toLowerCase()))
				return false;
			if (selectedPrice) {
				const price = p.price_publication ? parseFloat(p.price_publication) : null;
				if (price === null) return false;
				const range = PRICE_RANGES[selectedPrice];
				if (price < range.min || price >= range.max) return false;
			}
			if (
				selectedSpecialty &&
				!p.chiefSpecialties.map((s) => s.toLowerCase()).includes(selectedSpecialty.toLowerCase())
			)
				return false;
			return true;
		})
	);

	function onCitySelect(city: string) {
		selectedCity = city;
		showCityFilter = false;
	}

	function onCityClear() {
		selectedCity = '';
	}

	function selectPrice(p: '' | 'low' | 'mid' | 'high') {
		selectedPrice = p;
		showPriceFilter = false;
	}
</script>

<!-- Conteneur principal : header fixe + zone scrollante séparée -->
<div class="flex h-full flex-col">
	<!-- Header non-scrollant : tabs + chips + filtres -->
	<div class="-mx-5 flex-none bg-cream">
		<!-- Tabs -->
		<div class="flex border-y border-navy/[0.07]">
			<button
				class="relative flex-1 py-3 text-sm font-semibold transition-colors {activeTab ===
				'decouvrir'
					? 'text-navy'
					: 'text-navy/40'}"
				onclick={() => setTab('decouvrir')}
			>
				Découvrir
				{#if activeTab === 'decouvrir'}
					<span class="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-rust"
					></span>
				{/if}
			</button>
			<button
				class="relative flex-1 py-3 text-sm font-semibold transition-colors {activeTab ===
				'demandes'
					? 'text-navy'
					: 'text-navy/40'}"
				onclick={() => setTab('demandes')}
			>
				{isChief ? 'Demandes' : 'Mes demandes'}
				{#if activeTab === 'demandes'}
					<span class="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-rust"
					></span>
				{/if}
			</button>
		</div>

		{#if activeTab === 'decouvrir'}
			<!-- Chips spécialités -->
			{#if data.specialties.length > 0}
				<div class="flex justify-center gap-3 px-4 py-3">
					{#each data.specialties.slice(0, 4) as s (s.id_speciality)}
						<SpecialtyChip
							label={s.name_speciality}
							image={specialtyImage(s.name_speciality)}
							selected={selectedSpecialty === s.name_speciality}
							onSelect={() => {
								selectedSpecialty =
									selectedSpecialty === s.name_speciality ? '' : s.name_speciality;
							}}
						/>
					{/each}
				</div>
			{/if}

			<!-- Filtres ville + prix -->
			<div class="flex items-center gap-3 px-4 pb-3">
				<div class="relative">
					<button
						type="button"
						onclick={() => (showCityFilter = !showCityFilter)}
						class="inline-flex items-center gap-2 rounded-full border border-teal bg-[#FDF7F4] px-4 py-1.5 text-sm text-navy/80"
					>
						{selectedCity || 'Ville'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="h-3.5 w-3.5 text-navy/50"
						>
							<path
								fill-rule="evenodd"
								d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
					{#if showCityFilter}
						<div class="absolute top-full left-0 z-30 mt-2">
							<CityAutocomplete
								value={selectedCity}
								onSelect={onCitySelect}
								onClear={onCityClear}
							/>
						</div>
					{/if}
				</div>

				<div class="relative">
					<button
						type="button"
						onclick={() => (showPriceFilter = !showPriceFilter)}
						class="inline-flex items-center gap-2 rounded-full border border-teal bg-[#FDF7F4] px-4 py-1.5 text-sm text-teal"
					>
						{selectedPrice ? PRICE_RANGES[selectedPrice].label : 'Prix'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="h-3.5 w-3.5 text-navy/50"
						>
							<path
								fill-rule="evenodd"
								d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
					{#if showPriceFilter}
						<ul
							class="absolute top-full left-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
						>
							<li>
								<button
									class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-[#FDF7F4]"
									onclick={() => selectPrice('')}
								>
									Tous les prix
								</button>
							</li>
							{#each Object.entries(PRICE_RANGES) as [key, range] (key)}
								<li>
									<button
										class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-[#FDF7F4]"
										onclick={() => selectPrice(key as 'low' | 'mid' | 'high')}
									>
										{range.label}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Zone scrollante -->
	{#if activeTab === 'decouvrir'}
		<div class="-mx-5 flex-1 overflow-y-auto">
			<div class="flex flex-col gap-2.5 pb-10">
				{#each filteredPublications as publication (publication.id_publication)}
					<PublicationCard {publication} />
				{/each}

				{#if filteredPublications.length === 0}
					<div class="py-12 text-center">
						{#if selectedCity}
							<p class="text-sm text-navy/40">Aucune publication à {selectedCity}.</p>
							<button class="mt-3 text-sm text-rust underline" onclick={onCityClear}>
								Voir toutes les publications
							</button>
						{:else}
							<p class="text-sm text-navy/40">Aucune publication pour l'instant.</p>
						{/if}
					</div>
				{/if}

				{#if isChief}
					<button
						onclick={() => (showNewPublication = true)}
						class="mx-auto flex items-center gap-3 py-4 transition-opacity active:opacity-70"
					>
						<span
							class="flex h-10 w-10 items-center justify-center rounded-full bg-rust text-white"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="h-5 w-5"
							>
								<path
									d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
								/>
							</svg>
						</span>
						<span class="text-sm font-semibold text-rust">Ajouter une publication</span>
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- ===== DEMANDES — VUE CHEF ===== -->
		{#if isChief}
			<div class="-mx-5 flex-1 overflow-y-auto">
				<!-- Filtre ville -->
				<div class="flex items-center gap-3 border-b border-navy/[0.07] px-4 py-3">
					{#if requestCityFilter}
						<span
							class="inline-flex items-center gap-2 rounded-full border border-teal bg-[#FDF7F4] px-4 py-1.5 text-sm text-navy/80"
						>
							{requestCityFilter}
							<button
								type="button"
								onclick={() => (requestCityFilter = '')}
								aria-label="Effacer"
								class="text-navy/40"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 16 16"
									fill="currentColor"
									class="h-3 w-3"
								>
									<path
										d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"
									/>
								</svg>
							</button>
						</span>
					{:else}
						<input
							type="text"
							placeholder="Filtrer par ville…"
							bind:value={requestCityFilter}
							class="flex-1 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-teal"
						/>
					{/if}
				</div>

				<div class="flex flex-col gap-2.5 pt-2.5 pb-10">
					{#each filteredRequests as r (r.id_request)}
						<article
							class="mx-4 overflow-hidden rounded-2xl border border-navy/[0.07] bg-white shadow-sm"
						>
							<div class="p-4">
								<!-- Header : titre + client -->
								<div class="flex items-start justify-between gap-3">
									<h3 class="text-[15px] leading-snug font-semibold text-navy">
										{r.title_request}
									</h3>
									<div class="flex shrink-0 items-center gap-1.5">
										{#if r.customer.image}
											<img
												src={r.customer.image}
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
											>{r.customer.firstname} {r.customer.name}</span
										>
									</div>
								</div>

								<!-- Chips : date, convives, type, ville -->
								<div class="mt-2.5 flex flex-wrap gap-1.5">
									<span
										class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 16 16"
											fill="currentColor"
											class="h-3 w-3"
										>
											<path
												fill-rule="evenodd"
												d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3A2.5 2.5 0 0 1 14.5 5.5v6a2.5 2.5 0 0 1-2.5 2.5H4A2.5 2.5 0 0 1 1.5 11.5v-6A2.5 2.5 0 0 1 4 3V1.75ZM3 7v4.5A1 1 0 0 0 4 12.5h8a1 1 0 0 0 1-1V7H3Z"
												clip-rule="evenodd"
											/>
										</svg>
										{formatDate(r.expected_date_request)}
									</span>
									<span
										class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 16 16"
											fill="currentColor"
											class="h-3 w-3"
										>
											<path
												d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
											/>
										</svg>
										{r.guests_request}
									</span>
									{#if r.type_event_request}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 16 16"
												fill="currentColor"
												class="h-3 w-3"
											>
												<path
													fill-rule="evenodd"
													d="M4.5 2A2.5 2.5 0 0 0 2 4.5v2.879a2.5 2.5 0 0 0 .732 1.767l4.5 4.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-4.5-4.5A2.5 2.5 0 0 0 7.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
													clip-rule="evenodd"
												/>
											</svg>
											{r.type_event_request}
										</span>
									{/if}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] text-navy/60"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 16 16"
											fill="currentColor"
											class="h-3 w-3"
										>
											<path
												fill-rule="evenodd"
												d="M8 1a5 5 0 0 0-5 5c0 3.234 2.75 6.56 4.4 8.318a.8.8 0 0 0 1.2 0C10.25 12.56 13 9.234 13 6a5 5 0 0 0-5-5Zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
												clip-rule="evenodd"
											/>
										</svg>
										{r.localization_request}
									</span>
								</div>

								<!-- Description -->
								<p class="mt-2.5 line-clamp-3 text-[13px] leading-snug text-navy/65">
									{r.description_request}
								</p>

								<!-- CTA -->
								<button
									type="button"
									onclick={() => {
										respondingRequest = r;
										showRespondModal = true;
									}}
									class="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3 text-sm font-semibold text-white transition-opacity active:opacity-80"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="h-4 w-4"
									>
										<path
											fill-rule="evenodd"
											d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM6 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8-1a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"
											clip-rule="evenodd"
										/>
									</svg>
									répondre à la demande
								</button>
							</div>
						</article>
					{/each}

					{#if filteredRequests.length === 0}
						<div class="flex flex-col items-center justify-center px-8 py-16 text-center">
							<div
								class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDF7F4]"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-8 w-8 text-navy/40"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
									/>
								</svg>
							</div>
							<p class="font-medium text-navy">Aucune demande ouverte</p>
							<p class="mt-1 text-sm text-navy/50">Les demandes des clients apparaîtront ici.</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- ===== DEMANDES — VUE CLIENT ===== -->
		{:else}
			<div class="-mx-5 flex-1 overflow-y-auto">
				<div class="flex flex-col pb-10">
					{#if customerRequests.length === 0}
						<div class="flex flex-col items-center justify-center px-8 py-16 text-center">
							<div
								class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDF7F4]"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-8 w-8 text-navy/40"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
									/>
								</svg>
							</div>
							<p class="font-medium text-navy">Aucune demande pour l'instant</p>
							<p class="mt-1 text-sm text-navy/50">
								Appuyez sur + pour envoyer votre première demande !
							</p>
						</div>
					{:else}
						<!-- Section : demandes à venir -->
						{#if upcomingRequests.length > 0}
							<p class="px-4 pt-3 pb-2 text-sm font-semibold text-navy">Mes demandes</p>
							<div class="flex flex-col gap-2.5 px-4">
								{#each upcomingRequests as r (r.id_request)}
									{@render requestCard(r, true)}
								{/each}
							</div>
						{/if}

						<!-- Section : demandes passées -->
						{#if pastRequests.length > 0}
							<p class="px-4 pt-4 pb-2 text-sm font-semibold text-navy/50">Mois dernière</p>
							<div class="flex flex-col gap-2.5 px-4">
								{#each pastRequests as r (r.id_request)}
									{@render requestCard(r, false)}
								{/each}
							</div>
						{/if}

						<!-- Bouton bas de feed -->
						<button
							onclick={() => (showNewRequest = true)}
							class="mx-auto flex items-center gap-3 py-4 transition-opacity active:opacity-70"
						>
							<span
								class="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-white"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="h-5 w-5"
								>
									<path
										d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
									/>
								</svg>
							</span>
							<span class="text-sm font-semibold text-navy">Ajouter une demande</span>
						</button>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- FAB chef : publication (onglet découvrir) ou demandes (onglet demandes selon rôle) -->
{#if isChief && activeTab === 'decouvrir'}
	<button
		onclick={() => (showNewPublication = true)}
		class="fixed right-4 bottom-20 z-20 flex h-13 w-13 items-center justify-center rounded-full bg-rust text-white shadow-lg transition-transform active:scale-95"
		aria-label="Ajouter une publication"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-6 w-6">
			<path
				d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
			/>
		</svg>
	</button>
	<NewPublicationModal bind:open={showNewPublication} />
{/if}

{#if !isChief && activeTab === 'demandes'}
	<button
		onclick={() => (showNewRequest = true)}
		class="fixed right-4 bottom-20 z-20 flex h-13 w-13 items-center justify-center rounded-full bg-teal text-white shadow-lg transition-transform active:scale-95"
		aria-label="Nouvelle demande"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-6 w-6">
			<path
				d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
			/>
		</svg>
	</button>
	<NewRequestModal bind:open={showNewRequest} initialRequest={editingRequest} />
{/if}

<RespondToRequestModal bind:open={showRespondModal} request={respondingRequest} />

{#snippet requestCard(r: import('$lib/models/customer.model').Request, editable: boolean)}
	<article class="overflow-hidden rounded-2xl border border-navy/[0.07] bg-white shadow-sm">
		<div class="p-4">
			<!-- Header : titre + (nom + modifier) -->
			<div class="flex items-start justify-between gap-3">
				<h3 class="text-[15px] leading-snug font-semibold text-navy">{r.title_request}</h3>
				{#if editable}
					<div class="flex shrink-0 flex-col items-end gap-0.5">
						<span class="text-xs font-medium text-navy/70"
							>{data.user.firstname} {data.user.name}</span
						>
						<button
							type="button"
							class="text-[11px] text-rust underline"
							onclick={() => {
								editingRequest = r;
								showNewRequest = true;
							}}>modifier demande</button
						>
					</div>
				{/if}
			</div>

			<!-- Chips + bouton édition -->
			<div class="mt-2.5 flex flex-wrap items-center gap-1.5">
				<span
					class="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3 w-3 opacity-70"
					>
						<path
							fill-rule="evenodd"
							d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3A2.5 2.5 0 0 1 14.5 5.5v6a2.5 2.5 0 0 1-2.5 2.5H4A2.5 2.5 0 0 1 1.5 11.5v-6A2.5 2.5 0 0 1 4 3V1.75ZM3 7v4.5A1 1 0 0 0 4 12.5h8a1 1 0 0 0 1-1V7H3Z"
							clip-rule="evenodd"
						/>
					</svg>
					{formatDate(r.expected_date_request)}
				</span>
				<span
					class="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3 w-3 opacity-70"
					>
						<path
							d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
						/>
					</svg>
					{r.guests_request}
				</span>
				{#if r.type_event_request}
					<span
						class="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="h-3 w-3 opacity-70"
						>
							<path
								fill-rule="evenodd"
								d="M4.5 2A2.5 2.5 0 0 0 2 4.5v2.879a2.5 2.5 0 0 0 .732 1.767l4.5 4.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-4.5-4.5A2.5 2.5 0 0 0 7.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
								clip-rule="evenodd"
							/>
						</svg>
						{r.type_event_request}
					</span>
				{/if}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3 w-3 opacity-70"
					>
						<path
							fill-rule="evenodd"
							d="M8 1a5 5 0 0 0-5 5c0 3.234 2.75 6.56 4.4 8.318a.8.8 0 0 0 1.2 0C10.25 12.56 13 9.234 13 6a5 5 0 0 0-5-5Zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
							clip-rule="evenodd"
						/>
					</svg>
					{r.localization_request}
				</span>
			</div>

			<p class="mt-2.5 line-clamp-3 text-[13px] leading-snug text-navy/65">
				{r.description_request}
			</p>
		</div>
	</article>
{/snippet}
