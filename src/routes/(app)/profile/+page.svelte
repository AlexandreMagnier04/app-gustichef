<script lang="ts">
	import type { PageData } from './$types';
	import type { Menu } from '$lib/models/chief.model';
	import NewMenuModal from '$lib/components/NewMenuModal.svelte';
	import EditMenuModal from '$lib/components/EditMenuModal.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const profile = $derived(data.profile);
	const galleryImages = $derived(data.galleryImages);

	// Dédoublonnage spécialités
	const uniqueSpecialties = $derived(
		[...new Map((profile?.specialties ?? []).map((s) => [s.id_speciality, s])).values()]
	);

	const tagPills = $derived(
		uniqueSpecialties.slice(0, 3).map((s) => ({ label: s.name_speciality }))
	);

	const displayLoc = $derived(
		profile?.user.localization && profile.user.localization !== 'Non renseigné'
			? profile.user.localization
			: null
	);

	// Bannière = première image de galerie (publication)
	const bannerImage = $derived(galleryImages[0]?.url ?? null);

	type Tab = 'galerie' | 'menus' | 'réservations' | 'avis';
	type MenuTypeFilter = 'plat' | 'extra';

	let activeTab = $state<Tab>('galerie');
	let menuTypeFilter = $state<MenuTypeFilter>('plat');

	// Menus filtrés par type
	let menus = $state(data.menus);
	const filteredMenus = $derived(menus.filter((m) => m.type_menu === menuTypeFilter));

	// Modaux
	let showNewMenu = $state(false);
	let showEditMenu = $state(false);
	let editingMenu = $state<Menu | null>(null);

	function openEdit(menu: Menu) {
		editingMenu = menu;
		showEditMenu = true;
	}

	async function refreshMenus() {
		const res = await fetch('/api/menus/mine');
		if (res.ok) menus = await res.json();
	}

	function onMenuCreated() {
		showNewMenu = false;
		refreshMenus();
	}

	function onMenuUpdated() {
		showEditMenu = false;
		refreshMenus();
	}

	function onMenuDeleted() {
		showEditMenu = false;
		refreshMenus();
	}
</script>

<!-- -mx-5 compense le px-5 du <main> -->
<div class="-mx-5 flex flex-col">

	<!-- ── BANNIÈRE ───────────────────────────────── -->
	<div class="relative h-40 w-full overflow-hidden">
		{#if bannerImage}
			<img src={bannerImage} alt="" class="h-full w-full object-cover" />
			<div class="absolute inset-0 bg-black/20"></div>
		{:else}
			<div class="h-full w-full bg-linear-to-br from-navy via-[#1e4060] to-[#b85a35]"></div>
		{/if}
	</div>

	<!-- ── AVATAR + PILLS + RATING ──────────────── -->
	<div class="px-5">
		<div class="flex items-end gap-3 -mt-10">
			<!-- Avatar -->
			<div class="relative shrink-0">
				{#if profile?.user.image}
					<img src={profile.user.image} alt="" class="h-20 w-20 rounded-full border-4 border-cream object-cover shadow-md" />
				{:else}
					<div class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-cream bg-navy/10 shadow-md">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-9 w-9 text-navy/30">
							<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
						</svg>
					</div>
				{/if}
			</div>

			<!-- Pills spécialités -->
			{#if tagPills.length > 0}
				<div class="mb-1 flex flex-wrap items-center gap-2">
					{#each tagPills as tag (tag.label)}
						<span class="rounded-full bg-navy/85 px-3 py-1 text-xs font-medium text-cream">
							{tag.label}
						</span>
					{/each}
				</div>
			{/if}

			<!-- Rating badge -->
			{#if profile?.note_chief}
				<div class="mb-1 ml-auto flex shrink-0 flex-col items-center rounded-xl bg-rust px-3 py-1.5">
					<div class="flex items-center gap-1">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3 text-white">
							<path fill-rule="evenodd" d="M8 1.25a.75.75 0 0 1 .692.462l1.35 3.185 3.456.407a.75.75 0 0 1 .422 1.296l-2.537 2.35.716 3.41a.75.75 0 0 1-1.095.806L8 11.274l-3.004 1.892a.75.75 0 0 1-1.095-.806l.716-3.41-2.537-2.35a.75.75 0 0 1 .422-1.296l3.456-.407 1.35-3.185A.75.75 0 0 1 8 1.25Z" clip-rule="evenodd" />
						</svg>
						<span class="text-sm font-bold text-white">{profile.note_chief}</span>
					</div>
					<span class="text-[10px] text-white/80">avis</span>
				</div>
			{/if}
		</div>

		<!-- Nom -->
		<h1 class="mt-3 text-xl font-semibold text-navy">
			{profile?.user.firstname ?? ''} {profile?.user.name ?? ''}
		</h1>

		<!-- Localisation + catégorie + bouton éditer -->
		<div class="mt-0.5 flex items-center justify-between">
			<p class="text-xs text-navy/50">
				{#if displayLoc}
					<span class="inline-flex items-center gap-1">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3 shrink-0">
							<path fill-rule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" />
						</svg>
						{displayLoc}
					</span>
				{/if}
				{#if displayLoc && uniqueSpecialties[0]} · {/if}
				{#if uniqueSpecialties[0]}{uniqueSpecialties[0].name_speciality}{/if}
			</p>

			<a
				href="/profile/edit"
				class="flex items-center gap-1.5 rounded-full bg-rust px-3 py-1.5 text-xs font-medium text-white shadow-sm"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5">
					<path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
					<path d="M4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H7A.75.75 0 0 0 7 2H4.75Z" />
				</svg>
				éditer profil
			</a>
		</div>

		<!-- Bio -->
		{#if profile?.bio_chief}
			<p class="mt-3 text-sm leading-relaxed text-navy/70">{profile.bio_chief}</p>
		{/if}
	</div>

	<!-- ── TABS ───────────────────────────────────── -->
	<div class="mt-5 flex border-b border-navy/10 px-5">
		{#each (['galerie', 'menus', 'réservations', 'avis'] as const) as tab (tab)}
			<button
				class="relative mr-6 pb-2.5 text-sm transition-colors {activeTab === tab
					? 'font-medium text-navy'
					: 'text-navy/40'}"
				onclick={() => (activeTab = tab)}
			>
				{tab}
				{#if activeTab === tab}
					<span class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-rust"></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- ── CONTENU TABS ───────────────────────────── -->
	<div class="px-5 pt-4 pb-24">

		{#if activeTab === 'galerie'}
			<!-- Bouton ajouter recette = ouvre modal création menu -->
			<button
				onclick={() => (showNewMenu = true)}
				class="mb-4 flex items-center gap-2 text-sm font-medium text-navy/70"
			>
				<span class="flex h-7 w-7 items-center justify-center rounded-full bg-rust text-white">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5">
						<path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
					</svg>
				</span>
				Ajouter une recette
			</button>

			<!-- Grid images publications — clic → onglet menus -->
			{#if galleryImages.length > 0}
				<div class="grid grid-cols-3 gap-1">
					{#each galleryImages as img (img.id_image)}
						<button
							onclick={() => (activeTab = 'menus')}
							class="aspect-square overflow-hidden rounded-sm"
						>
							<img src={img.url} alt="" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{:else}
				<p class="py-8 text-center text-sm text-navy/40">Aucune photo pour l'instant.</p>
			{/if}

		{:else if activeTab === 'menus'}
			<!-- Toggle Plats / Extras -->
			<div class="mb-4 flex rounded-xl bg-navy/8 p-1">
				{#each (['plat', 'extra'] as const) as t (t)}
					<button
						class="flex-1 rounded-lg py-2 text-sm font-medium transition-colors {menuTypeFilter === t ? 'bg-white text-navy shadow-sm' : 'text-navy/50'}"
						onclick={() => (menuTypeFilter = t)}
					>
						{t === 'plat' ? 'Menus' : 'Extras'}
					</button>
				{/each}
			</div>

			<!-- Bouton ajouter un plat -->
			<button
				onclick={() => (showNewMenu = true)}
				class="mb-4 flex items-center gap-2 text-sm font-medium text-navy/70"
			>
				<span class="flex h-7 w-7 items-center justify-center rounded-full bg-rust text-white">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5">
						<path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
					</svg>
				</span>
				Ajouter une recette
			</button>

			<div class="flex flex-col gap-4">
				{#each filteredMenus as menu (menu.id_menu)}
					<div class="overflow-hidden rounded-2xl bg-cream shadow-[0_2px_8px_rgba(22,48,64,0.08)]">
						<!-- Image cliquable → page détail -->
						<a href="/menus/{menu.id_menu}" class="block aspect-video w-full overflow-hidden bg-navy/5">
							<div class="flex h-full items-center justify-center text-navy/20">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-12 w-12">
									<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
								</svg>
							</div>
						</a>
						<div class="p-4">
							<h3 class="font-bold text-navy">{menu.title_menu}</h3>
							<p class="mt-0.5 text-sm font-semibold text-rust">
								Dès {Math.floor(parseFloat(menu.price_menu))} € / convive
							</p>
							<p class="mt-2 text-sm leading-relaxed text-navy/60 line-clamp-3">{menu.description_menu}</p>
							<div class="mt-4 flex gap-2">
								<a
									href="/menus/{menu.id_menu}"
									class="flex-1 rounded-xl bg-navy py-2.5 text-center text-xs font-semibold text-cream"
								>
									Découvrir le menu
								</a>
								<button
									onclick={() => openEdit(menu)}
									class="flex items-center gap-1.5 rounded-xl bg-rust px-4 py-2.5 text-xs font-semibold text-white"
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5">
										<path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
										<path d="M4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H7A.75.75 0 0 0 7 2H4.75Z" />
									</svg>
									éditer
								</button>
							</div>
						</div>
					</div>
				{/each}
				{#if filteredMenus.length === 0}
					<p class="py-8 text-center text-sm text-navy/40">
						Aucun {menuTypeFilter === 'plat' ? 'menu' : 'extra'} pour l'instant.
					</p>
				{/if}
			</div>

		{:else if activeTab === 'réservations'}
			<p class="py-8 text-center text-sm text-navy/40">Aucune réservation pour l'instant.</p>

		{:else if activeTab === 'avis'}
			<p class="py-8 text-center text-sm text-navy/40">Aucun avis pour l'instant.</p>
		{/if}
	</div>
</div>

<NewMenuModal bind:open={showNewMenu} onCreated={onMenuCreated} />
<EditMenuModal bind:open={showEditMenu} menu={editingMenu} onUpdated={onMenuUpdated} onDeleted={onMenuDeleted} />
