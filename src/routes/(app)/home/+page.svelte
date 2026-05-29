<script lang="ts">
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
	import CategoryChip from '$lib/components/CategoryChip.svelte';
	import CityAutocomplete from '$lib/components/CityAutocomplete.svelte';
	import NewPublicationModal from '$lib/components/NewPublicationModal.svelte';

	let { data } = $props();

	let activeTab = $state<'decouvrir' | 'demandes'>('decouvrir');
	let showNewPublication = $state(false);
	const isChief = $derived(data.user?.role === 'chief');

	// Mapping de secours pour catégories sans image_url en DB.
	// Cas connus mappés explicitement, sinon rotation déterministe sur les slides locaux.
	const CATEGORY_IMAGES: Record<string, string> = {
		'chef à domicile': portrait1,
		'plats préparés': slide1,
		pâtisserie: slide3,
		nutrition: slide2,
		'dîner privé': slide4,
		anniversaire: slide5,
		mariage: slide6,
		"événement d'entreprise": slide8,
		traiteur: slide9,
		barbecue: slide10,
	};
	const FALLBACK_POOL = [slide1, slide2, slide3, slide4, slide5, slide6, slide8, slide9, slide10];

	function fallbackImage(name: string): string {
		// Hash simple pour avoir la même image à chaque rendu pour un nom donné
		let hash = 0;
		for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) | 0;
		return FALLBACK_POOL[Math.abs(hash) % FALLBACK_POOL.length];
	}

	function categoryImage(cat: { name_category: string; image_url: string | null }): string {
		if (cat.image_url) return cat.image_url;
		return CATEGORY_IMAGES[cat.name_category.toLowerCase()] ?? fallbackImage(cat.name_category);
	}

	// Filtres côté client — à terme push DB pour scalabilité
	let selectedCity = $state('');
	let selectedPrice = $state<'' | 'low' | 'mid' | 'high'>('');
	let showCityFilter = $state(false);
	let showPriceFilter = $state(false);

	const PRICE_RANGES = {
		low: { label: '< 30 €', min: 0, max: 30 },
		mid: { label: '30 – 60 €', min: 30, max: 60 },
		high: { label: '> 60 €', min: 60, max: Infinity },
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
			return true;
		}),
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

<!-- Tabs -->
<div class="sticky top-0 z-10 flex">
	<button
		class="relative flex-1 py-3 text-sm font-medium transition-colors {activeTab === 'decouvrir'
			? 'text-navy'
			: 'text-navy/40'}"
		onclick={() => (activeTab = 'decouvrir')}
	>
		découvrir
		{#if activeTab === 'decouvrir'}
			<span class="absolute bottom-0 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-rust"></span>
		{/if}
	</button>
	<button
		class="relative flex-1 py-3 text-sm font-medium transition-colors {activeTab === 'demandes'
			? 'text-navy'
			: 'text-navy/40'}"
		onclick={() => (activeTab = 'demandes')}
	>
		demandes
		{#if activeTab === 'demandes'}
			<span class="absolute bottom-0 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-rust"></span>
		{/if}
	</button>
</div>

{#if activeTab === 'decouvrir'}
	<!-- Bouton "Ajouter un nouveau post" — chef uniquement, en haut du feed -->
	{#if isChief}
		<div class="px-3 pt-3">
			<button
				onclick={() => (showNewPublication = true)}
				class="flex w-full items-center justify-center gap-3 rounded-full bg-rust py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
			>
				Ajouter un nouveau post
				<span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5">
						<path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
					</svg>
				</span>
			</button>
		</div>
	{/if}

	<!-- Categories -->
	{#if data.categories.length > 0}
		<div class="scrollbar-none flex gap-3 overflow-x-auto px-4 py-3">
			{#each data.categories as cat (cat.id_category)}
				<CategoryChip label={cat.name_category} image={categoryImage(cat)} onSelect={() => {}} />
			{/each}
		</div>
	{/if}

	<!-- Filtres ville + prix (deux pills) -->
	<div class="relative flex items-center gap-3 px-4 pb-3">
		<!-- Pill ville -->
		<div class="relative">
			<button
				type="button"
				onclick={() => (showCityFilter = !showCityFilter)}
				class="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-1.5 text-sm text-navy/80"
			>
				{selectedCity || 'Ville'}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 text-navy/50">
					<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
				</svg>
			</button>
			{#if showCityFilter}
				<div class="absolute top-full left-0 z-30 mt-2">
					<CityAutocomplete value={selectedCity} onSelect={onCitySelect} onClear={onCityClear} />
				</div>
			{/if}
		</div>

		<!-- Pill prix -->
		<div class="relative">
			<button
				type="button"
				onclick={() => (showPriceFilter = !showPriceFilter)}
				class="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-1.5 text-sm text-navy/80"
			>
				{selectedPrice ? PRICE_RANGES[selectedPrice].label : 'Prix'}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 text-navy/50">
					<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
				</svg>
			</button>
			{#if showPriceFilter}
				<ul class="absolute top-full left-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
					<li>
						<button class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-cream" onclick={() => selectPrice('')}>
							Tous les prix
						</button>
					</li>
					{#each Object.entries(PRICE_RANGES) as [key, range] (key)}
						<li>
							<button
								class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-cream"
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

	<!-- Feed des publications — pleine largeur : casse le px-5 du layout (app) -->
	<div class="-mx-5 flex flex-col gap-4 pb-10">
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
					{#if isChief}
						<p class="mt-1 text-xs text-navy/40">Sois le premier à publier !</p>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
{:else}
	<!-- Demandes tab -->
	<div class="flex flex-col items-center justify-center px-8 py-20 text-center">
		<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream">
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
			Trouve un chef et envoie ta première demande de prestation.
		</p>
		<a
			href="/chefs"
			class="mt-6 rounded-xl bg-navy px-6 py-3 text-sm font-medium text-cream transition-opacity hover:opacity-90"
		>
			Trouver un chef
		</a>
	</div>
{/if}

{#if isChief}
	<NewPublicationModal bind:open={showNewPublication} />
{/if}
