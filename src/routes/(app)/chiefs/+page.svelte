<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();

	let searchInput = $state('');
	let selectedCity = $state('');
	let selectedCuisine = $state('');
	let selectedPrice = $state<'' | 'low' | 'mid' | 'high'>('');
	let showCuisineFilter = $state(false);
	let showPriceFilter = $state(false);
	let showVilleFilter = $state(false);

	const PRICE_RANGES = {
		low: { label: '< 30 €', min: 0, max: 30 },
		mid: { label: '30 – 60 €', min: 30, max: 60 },
		high: { label: '> 60 €', min: 60, max: Infinity }
	} as const;

	const GRADIENTS = [
		'from-teal/80 to-navy',
		'from-rust/70 to-[#6b3020]',
		'from-olive/80 to-[#4a5040]',
		'from-navy to-[#0a3040]'
	];

	const filteredChiefs = $derived(
		data.chiefs.filter((c) => {
			if (selectedCity && !c.localization.toLowerCase().includes(selectedCity.toLowerCase()))
				return false;
			if (
				selectedCuisine &&
				!c.specialties.map((s) => s.toLowerCase()).includes(selectedCuisine.toLowerCase())
			)
				return false;
			if (selectedPrice) {
				const price = c.min_price ? parseFloat(c.min_price) : null;
				if (price === null) return false;
				const range = PRICE_RANGES[selectedPrice];
				if (price < range.min || price >= range.max) return false;
			}
			return true;
		})
	);

	function handleSearch() {
		selectedCity = searchInput.trim();
		showVilleFilter = false;
	}

	function clearCity() {
		selectedCity = '';
		searchInput = '';
	}

	function selectPrice(p: '' | 'low' | 'mid' | 'high') {
		selectedPrice = p;
		showPriceFilter = false;
	}

	function selectCuisine(name: string) {
		selectedCuisine = selectedCuisine === name ? '' : name;
		showCuisineFilter = false;
	}

	// Remplit jusqu'au prochain multiple de 3
	function padTo3(n: number): number {
		return n === 0 ? 3 : n % 3 === 0 ? 0 : 3 - (n % 3);
	}
</script>

<div class="flex h-full flex-col">
	<!-- Header fixe -->
	<div class="-mx-5 flex-none bg-cream">
		<!-- Barre de recherche -->
		<div class="flex items-center gap-2 px-4 pt-2 pb-3">
			<input
				type="text"
				bind:value={searchInput}
				onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				placeholder="ex : Marseille, Bordeaux..."
				class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy/40"
			/>
			<button
				type="button"
				onclick={handleSearch}
				class="shrink-0 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-opacity active:opacity-80"
			>
				Chercher
			</button>
		</div>

		<!-- Compteur -->
		<p class="px-4 pb-2 text-xs text-navy/50">
			{filteredChiefs.length} chef{filteredChiefs.length > 1 ? 's' : ''} trouvé{filteredChiefs.length >
			1
				? 's'
				: ''} près de vous
		</p>

		<!-- Chips filtres -->
		<div class="flex items-center gap-2 px-4 pb-3">
			<!-- Ville -->
			<div class="relative">
				<button
					type="button"
					onclick={() => {
						showVilleFilter = !showVilleFilter;
						showCuisineFilter = false;
						showPriceFilter = false;
					}}
					class="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-white px-3.5 py-1.5 text-sm text-navy/80"
				>
					{selectedCity || 'Ville'}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 text-navy/40">
						<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
					</svg>
				</button>
				{#if showVilleFilter}
					<div class="absolute top-full left-0 z-30 mt-2 flex w-56 items-center gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
						<input
							type="text"
							bind:value={searchInput}
							onkeydown={(e) => e.key === 'Enter' && handleSearch()}
							placeholder="Ville..."
							class="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-navy outline-none placeholder:text-navy/40"
						/>
						<button onclick={handleSearch} class="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white">OK</button>
						{#if selectedCity}
							<button onclick={clearCity} class="text-xs text-navy/40 underline">Effacer</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Cuisine -->
			<div class="relative">
				<button
					type="button"
					onclick={() => {
						showCuisineFilter = !showCuisineFilter;
						showVilleFilter = false;
						showPriceFilter = false;
					}}
					class="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-white px-3.5 py-1.5 text-sm {selectedCuisine ? 'font-medium text-navy' : 'text-navy/80'}"
				>
					{selectedCuisine || 'Cuisine'}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 text-navy/40">
						<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
					</svg>
				</button>
				{#if showCuisineFilter}
					<ul class="absolute top-full left-0 z-30 mt-2 max-h-56 w-48 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
						<li>
							<button class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-cream" onclick={() => selectCuisine('')}>Toutes</button>
						</li>
						{#each data.specialties as s (s.id_speciality)}
							<li>
								<button class="w-full px-4 py-2.5 text-left text-sm hover:bg-cream {selectedCuisine === s.name_speciality ? 'font-semibold text-navy' : 'text-navy/80'}" onclick={() => selectCuisine(s.name_speciality)}>
									{s.name_speciality}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- Prix -->
			<div class="relative">
				<button
					type="button"
					onclick={() => {
						showPriceFilter = !showPriceFilter;
						showVilleFilter = false;
						showCuisineFilter = false;
					}}
					class="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-white px-3.5 py-1.5 text-sm {selectedPrice ? 'font-medium text-navy' : 'text-navy/80'}"
				>
					{selectedPrice ? PRICE_RANGES[selectedPrice].label : 'Prix'}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 text-navy/40">
						<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
					</svg>
				</button>
				{#if showPriceFilter}
					<ul class="absolute top-full left-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
						<li>
							<button class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-cream" onclick={() => selectPrice('')}>Tous les prix</button>
						</li>
						{#each Object.entries(PRICE_RANGES) as [key, range] (key)}
							<li>
								<button class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-cream" onclick={() => selectPrice(key as 'low' | 'mid' | 'high')}>
									{range.label}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>

	<!-- Feed scrollant -->
	<div class="-mx-5 flex-1 overflow-y-auto">
		<div class="flex flex-col gap-3 px-4 pb-28 pt-2">
			{#each filteredChiefs as chief (chief.id_chief)}
				<article class="overflow-hidden rounded-2xl border border-navy/[0.07] bg-cream shadow-sm">

					<!-- Infos chef → profil -->
					<button
						type="button"
						onclick={() => goto('/chiefs/' + chief.id_chief)}
						class="flex w-full items-center gap-3 p-4 pb-3 text-left transition-opacity active:opacity-70"
					>
						{#if chief.image}
							<img src={chief.image} alt="" class="h-12 w-12 shrink-0 rounded-full object-cover" />
						{:else}
							<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/8 text-navy/30">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-6 w-6">
									<path fill-rule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z" clip-rule="evenodd" />
								</svg>
							</div>
						{/if}

						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-1">
								<span class="text-[15px] font-semibold text-navy">{chief.firstname} {chief.name}</span>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 shrink-0 text-navy/35">
									<path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
								</svg>
							</div>
							{#if chief.specialties.length > 0}
								<p class="mt-0.5 truncate text-[12px] text-navy/50">{chief.specialties.slice(0, 2).join(' · ')}</p>
							{/if}
							<div class="mt-1 flex items-center gap-1 text-[11px] text-navy/40">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3 shrink-0">
									<path fill-rule="evenodd" d="M8 1a5 5 0 0 0-5 5c0 3.234 2.75 6.56 4.4 8.318a.8.8 0 0 0 1.2 0C10.25 12.56 13 9.234 13 6a5 5 0 0 0-5-5Zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" />
								</svg>
								{chief.localization}
							</div>
						</div>

						{#if chief.review_count > 0}
							<div class="shrink-0 rounded-xl bg-navy px-2.5 py-2 text-center">
								<div class="flex items-center gap-1 text-[13px] font-bold text-white">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3 text-amber-400">
										<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
									</svg>
									{parseFloat(chief.avg_rating ?? '0').toFixed(1)}
								</div>
								<div class="text-[10px] leading-tight text-white/60">{chief.review_count} avis</div>
							</div>
						{/if}
					</button>

						<!-- Carousel photos — 2 visibles à la fois, scroll horizontal -->
					<div class="overflow-x-auto pb-3" style="scrollbar-width:none;">
						<div class="flex gap-2.5 px-4">
							{#each chief.menuImages as img (img.id_menu)}
								<button
									type="button"
									onclick={() => goto('/menus/' + img.id_menu)}
									class="relative h-32 w-[52%] shrink-0 overflow-hidden rounded-2xl transition-opacity active:opacity-80"
								>
									<img src={img.url} alt={img.title} class="h-full w-full object-cover" />
									<div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent p-2">
										<p class="truncate text-[11px] font-semibold leading-tight text-white">{img.title}</p>
										<p class="text-[10px] text-white/75">{parseFloat(img.price).toFixed(0)}€</p>
									</div>
								</button>
							{/each}
							{#each Array(padTo3(chief.menuImages.length)) as _, i (i)}
								<div class="h-32 w-[52%] shrink-0 rounded-2xl bg-linear-to-br {GRADIENTS[(chief.menuImages.length + i) % GRADIENTS.length]}"></div>
							{/each}
						</div>
					</div>
				</article>
			{/each}

			{#if filteredChiefs.length === 0}
				<div class="flex flex-col items-center justify-center py-20 text-center">
					<p class="font-medium text-navy">Aucun chef trouvé</p>
					<p class="mt-1 text-sm text-navy/50">Essayez avec d'autres filtres.</p>
				</div>
			{/if}
		</div>
	</div>
</div>
