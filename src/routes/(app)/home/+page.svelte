<script lang="ts">
	import { goto } from '$app/navigation';
	import portrait1 from '$lib/assets/img/portrait-1.jpeg';
	import slide1 from '$lib/assets/img/slide-1.jpeg';
	import slide2 from '$lib/assets/img/slide-2.jpeg';
	import slide3 from '$lib/assets/img/slide-3.jpeg';
	import slide4 from '$lib/assets/img/slide-4.jpeg';
	import ChiefCard from '$lib/components/ChiefCard.svelte';
	import CategoryChip from '$lib/components/CategoryChip.svelte';
	import CityAutocomplete from '$lib/components/CityAutocomplete.svelte';

	let { data } = $props();

	let activeTab = $state<'decouvrir' | 'demandes'>('decouvrir');

	const CATEGORY_IMAGES: Record<string, string> = {
		'chef à domicile': portrait1,
		'plats préparés': slide1,
		pâtisserie: slide3,
		nutrition: slide2,
	};

	function categoryImage(name: string): string {
		return CATEGORY_IMAGES[name.toLowerCase()] ?? slide4;
	}

	function onCitySelect(city: string) {
		goto(`/home?city=${encodeURIComponent(city)}`, { replaceState: true });
	}

	function onCityClear() {
		goto('/home', { replaceState: true });
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
	<!-- Categories -->
	{#if data.categories.length > 0}
		<div class="scrollbar-none flex gap-3 overflow-x-auto px-4 py-4">
			{#each data.categories as cat (cat.id_category)}
				<CategoryChip
					label={cat.name_category}
					image={categoryImage(cat.name_category)}
					onSelect={() => {}}
				/>
			{/each}
		</div>
	{/if}

	<!-- City filter -->
	<div class="relative px-4 pb-3">
		<CityAutocomplete value={data.city} onSelect={onCitySelect} onClear={onCityClear} />
	</div>

	<!-- Chef cards -->
	<div class="flex flex-col gap-4 px-4 pb-6">
		{#each data.chiefs as chef (chef.id_chief)}
			<ChiefCard chief={chef} />
		{/each}

		{#if data.chiefs.length === 0}
			<div class="py-12 text-center">
				{#if data.city}
					<p class="text-sm text-navy/40">Aucun chef disponible à {data.city}.</p>
					<button class="mt-3 text-sm text-rust underline" onclick={onCityClear}>
						Voir tous les chefs
					</button>
				{:else}
					<p class="text-sm text-navy/40">Aucun chef disponible pour l'instant.</p>
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
