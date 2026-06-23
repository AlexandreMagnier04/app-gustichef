<script lang="ts">
	import type { PageData } from './$types';
	import type { Menu } from '$lib/models/chief.model';
	import NewMenuModal from '$lib/components/NewMenuModal.svelte';
	import EditMenuModal from '$lib/components/EditMenuModal.svelte';
	import NewPublicationModal from '$lib/components/NewPublicationModal.svelte';

	let { data }: { data: PageData } = $props();

	const profile = $derived(data.profile);
	const galleryImages = $derived(data.galleryImages);
	const upcomingReservations = $derived(data.upcomingReservations ?? []);
	const allReservations = $derived(data.reservations ?? []);

	// Dédoublonnage spécialités
	const uniqueSpecialties = $derived([
		...new Map((profile?.specialties ?? []).map((s) => [s.id_speciality, s])).values()
	]);

	const displayLoc = $derived(
		profile?.user.localization && profile.user.localization !== 'Non renseigné'
			? profile.user.localization
			: null
	);

	// Bannière = première image de galerie
	const bannerImage = $derived(galleryImages[0]?.url ?? null);

	type Tab = 'galerie' | 'menus' | 'réservations' | 'avis';
	type MenuTypeFilter = 'plat' | 'extra';

	let activeTab = $state<Tab>('galerie');
	let menuTypeFilter = $state<MenuTypeFilter>('plat');

	let menus = $state(data.menus);
	const filteredMenus = $derived(menus.filter((m) => m.type_menu === menuTypeFilter));

	// Modaux
	let showNewPublication = $state(false);
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

	// Couleurs de fond pour les cartes menu sans image
	const MENU_GRADIENTS = [
		'from-teal/80 to-navy',
		'from-rust/70 to-[#6b3020]',
		'from-olive/80 to-[#4a5040]',
		'from-navy to-[#0a3040]'
	];

	function menuGradient(idx: number) {
		return MENU_GRADIENTS[idx % MENU_GRADIENTS.length];
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<div class="-mx-5 -mt-3 pb-28">
	<!-- ── BANNIÈRE ─────────────────────────────── -->
	<div class="relative h-40 overflow-hidden">
		{#if bannerImage}
			<img src={bannerImage} alt="" class="h-full w-full object-cover" />
		{:else}
			<div class="h-full w-full bg-linear-to-br from-navy via-[#1e4060] to-[#b85a35]"></div>
		{/if}
		<div class="absolute inset-0 bg-linear-to-t from-cream/80 via-cream/20 to-transparent"></div>
	</div>

	<!-- ── SPÉCIALITÉS (sous la bannière) ────────── -->
	{#if uniqueSpecialties.length > 0}
		<div class="flex flex-wrap justify-end gap-2 px-5 py-3">
			{#each uniqueSpecialties.slice(0, 3) as spec, i (spec.id_speciality)}
				<span
					class="rounded-full px-3 py-1 text-xs font-medium {i === 0
						? 'bg-rust text-white'
						: 'bg-navy/15 text-navy'}"
				>
					{spec.name_speciality}
				</span>
			{/each}
		</div>
	{/if}

	<!-- ── IDENTITÉ : avatar | nom | note ─────────── -->
	<div class="flex items-center gap-4 px-5 pb-3">
		<!-- Avatar avec bouton éditer -->
		<div class="relative shrink-0">
			{#if profile?.user.image}
				<img
					src={profile.user.image}
					alt=""
					class="h-20 w-20 rounded-full object-cover shadow-md ring-2 ring-cream"
				/>
			{:else}
				<div
					class="flex h-20 w-20 items-center justify-center rounded-full bg-navy shadow-md ring-2 ring-cream"
				>
					<span class="text-xl font-bold text-cream">
						{profile?.user.firstname[0]}{profile?.user.name[0]}
					</span>
				</div>
			{/if}
			<a
				href="/profile/edit"
				class="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-rust shadow-md ring-2 ring-cream"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-3.5 w-3.5 text-white"
				>
					<path
						d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z"
					/>
					<path
						d="M4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H7A.75.75 0 0 0 7 2H4.75Z"
					/>
				</svg>
			</a>
		</div>

		<!-- Nom + sous-titre + ville -->
		<div class="min-w-0 flex-1">
			<h1 class="text-xl leading-tight font-bold text-navy">
				{profile?.user.firstname ?? ''}
				{profile?.user.name ?? ''}
			</h1>
			<p class="mt-0.5 text-sm text-navy/50">
				Chef à domicile{#if uniqueSpecialties[0]}
					· {uniqueSpecialties[0].name_speciality}{/if}
			</p>
			{#if displayLoc}
				<div class="mt-1 flex items-center gap-1 text-xs text-navy/50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3 w-3 shrink-0 text-rust"
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

		<!-- Badge note (si disponible) -->
		{#if profile?.note_chief}
			<div class="shrink-0 rounded-xl bg-navy px-3 py-2 text-center">
				<div class="flex items-center justify-center gap-1">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3.5 w-3.5 text-yellow-300"
					>
						<path
							fill-rule="evenodd"
							d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L8 11.459l-3.136 2.535a.75.75 0 0 1-1.12-.814l.853-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.665-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="text-base font-bold text-white">{profile.note_chief}</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- ── BIO + ACTIONS ────────────────────────── -->
	<div class="px-5">
		{#if profile?.bio_chief}
			<p class="mt-3 text-sm leading-relaxed text-navy/65">{profile.bio_chief}</p>
		{/if}

		<div class="mt-1 h-px bg-navy/6"></div>

		<!-- Actions rapides -->
		<div class="flex flex-col items-end gap-1">
			<a href="/profile/edit" class="flex items-center gap-2 py-1.5 text-sm font-medium text-teal">
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
			<a
				href="/profile/settings"
				class="flex items-center gap-2 py-1.5 text-sm font-medium text-teal"
			>
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

		<!-- Carte réservations à venir -->
		{#if upcomingReservations.length > 0}
			<button
				onclick={() => (activeTab = 'réservations')}
				class="mt-2 flex w-full items-center gap-3 rounded-2xl border border-teal/20 bg-teal/6 px-4 py-3.5 text-left"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="h-5 w-5 shrink-0 text-teal"
				>
					<path
						fill-rule="evenodd"
						d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
						clip-rule="evenodd"
					/>
				</svg>
				<div class="min-w-0 flex-1">
					<p class="text-sm font-semibold text-navy">
						{upcomingReservations.length} réservation{upcomingReservations.length > 1 ? 's' : ''} à venir
					</p>
					{#if upcomingReservations[0]}
						<p class="mt-0.5 truncate text-xs text-navy/50">
							Prochaine · {formatDate(upcomingReservations[0].event_date)}
						</p>
					{/if}
				</div>
				<span class="shrink-0 text-sm font-semibold text-rust">voir</span>
			</button>
		{/if}
	</div>

	<!-- ── TABS ───────────────────────────────────── -->
	<div class="mt-6 flex border-b border-navy/8">
		{#each ['galerie', 'menus', 'réservations', 'avis'] as const as tab (tab)}
			<button
				onclick={() => (activeTab = tab)}
				class="relative flex-1 py-3 text-sm font-medium transition-colors {activeTab === tab
					? 'text-navy'
					: 'text-navy/35'}"
			>
				{tab}
				{#if activeTab === tab}
					<span class="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-rust"
					></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- ── CONTENU TABS ───────────────────────────── -->
	<div class="px-5 pt-5">
		<!-- Galerie -->
		{#if activeTab === 'galerie'}
			<button
				onclick={() => (showNewPublication = true)}
				class="mb-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-rust"
			>
				<span class="flex h-7 w-7 items-center justify-center rounded-full bg-rust text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3.5 w-3.5"
					>
						<path
							d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"
						/>
					</svg>
				</span>
				Ajouter une publication
			</button>

			{#if galleryImages.length === 0}
				<p class="py-12 text-center text-sm text-navy/40">Aucune photo pour l'instant.</p>
			{:else}
				<div class="columns-2 gap-1.5">
					{#each galleryImages as img, i (img.id_image)}
						<button
							class="mb-1.5 w-full break-inside-avoid overflow-hidden rounded-xl {i % 3 === 0
								? 'aspect-3/4'
								: i % 3 === 1
									? 'aspect-square'
									: 'aspect-2/3'}"
						>
							<img src={img.url} alt="" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}

			<!-- Menus -->
		{:else if activeTab === 'menus'}
			<div class="mb-4 flex rounded-2xl bg-navy/6 p-1">
				{#each ['plat', 'extra'] as const as t (t)}
					<button
						onclick={() => (menuTypeFilter = t)}
						class="flex-1 rounded-xl py-2 text-sm font-medium transition-colors {menuTypeFilter ===
						t
							? 'bg-teal text-white shadow-sm'
							: 'text-navy/45'}"
					>
						{t === 'plat' ? 'Menus' : "L'extra"}
					</button>
				{/each}
			</div>

			<button
				onclick={() => (showNewMenu = true)}
				class="mb-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-rust"
			>
				<span class="flex h-7 w-7 items-center justify-center rounded-full bg-rust text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3.5 w-3.5"
					>
						<path
							d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"
						/>
					</svg>
				</span>
				Ajouter un menu
			</button>

			{#if filteredMenus.length === 0}
				<p class="py-12 text-center text-sm text-navy/40">
					Aucun {menuTypeFilter === 'plat' ? 'menu' : 'extra'} pour l'instant.
				</p>
			{:else}
				<div class="flex flex-col gap-4">
					{#each filteredMenus as menu, i (menu.id_menu)}
						<div class="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(5,30,35,0.08)]">
							<!-- Image propre -->
							<div class="h-36 overflow-hidden">
								{#if menu.image_url}
									<img src={menu.image_url} alt="" class="h-full w-full object-cover" />
								{:else}
									<div class="h-full w-full bg-linear-to-br {menuGradient(i)}"></div>
								{/if}
							</div>
							<!-- Infos -->
							<div class="p-3.5">
								<h3 class="text-sm font-bold text-navy">{menu.title_menu}</h3>
								<p class="mt-0.5 text-xs font-semibold text-rust">
									Dès {Math.floor(parseFloat(menu.price_menu))} € / convive
								</p>
								<p class="mt-2 line-clamp-2 text-sm leading-relaxed text-navy/60">
									{menu.description_menu}
								</p>
								<div class="mt-3 flex gap-2">
									<a
										href="/menus/{menu.id_menu}"
										class="flex flex-1 items-center justify-center rounded-xl bg-rust py-2.5 text-xs font-semibold text-white"
									>
										Découvrir le menu
									</a>
									<button
										onclick={() => openEdit(menu)}
										class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal py-2.5 text-xs font-semibold text-white"
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5">
											<path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
											<path d="M4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H7A.75.75 0 0 0 7 2H4.75Z" />
										</svg>
										Éditer
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Réservations -->
		{:else if activeTab === 'réservations'}
			{#if allReservations.length === 0}
				<p class="py-12 text-center text-sm text-navy/40">Aucune réservation pour l'instant.</p>
			{:else}
				<div class="flex flex-col gap-3">
					{#each allReservations as res (res.id_reservation)}
						<div class="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(5,30,35,0.06)]">
							<!-- Header : photo client | titre événement | badge -->
							<div class="flex items-center gap-3 px-4 pt-4 pb-3">
								{#if res.customer?.image}
									<img src={res.customer.image} alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" />
								{:else}
									<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy/50">
										{(res.customer?.firstname?.[0] ?? '?').toUpperCase()}
									</div>
								{/if}
								<div class="min-w-0 flex-1">
									<a href="/reservations/{res.id_reservation}" class="flex items-center gap-1 text-[13px] font-semibold text-navy">
										<span class="truncate">{res.title}</span>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/40"><path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
									</a>
									<p class="text-[11px] text-navy/50">{res.customer?.firstname} {res.customer?.name}</p>
								</div>
								<span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold {res.statut === 'confirme' ? 'bg-green-500/15 text-green-600' : res.statut === 'annule' ? 'bg-navy/8 text-navy/40' : 'bg-rust/10 text-rust'}">
									{res.statut === 'confirme' ? 'Confirmée' : res.statut === 'annule' ? 'Annulée' : 'En attente'}
								</span>
							</div>

							<div class="mx-4 h-px bg-navy/6"></div>

							<!-- Infos : date | heure | lieu | convives -->
							<div class="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3">
								<div class="flex items-center gap-2 text-[12px] text-navy/70">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/35"><path fill-rule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3h.25A2.75 2.75 0 0 1 15 5.75v7.5A2.75 2.75 0 0 1 12.25 16H3.75A2.75 2.75 0 0 1 1 13.25v-7.5A2.75 2.75 0 0 1 3.75 3H4V1.75ZM3.75 6a.75.75 0 0 0-.75.75v5.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-5.5a.75.75 0 0 0-.75-.75H3.75Z" clip-rule="evenodd"/></svg>
									<span class="capitalize">{formatDate(res.event_date)}</span>
								</div>
								{#if res.event_time}
									<div class="flex items-center gap-2 text-[12px] text-navy/70">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/35"><path fill-rule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7-4.75a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0V4a.75.75 0 0 0-.75-.75ZM8 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clip-rule="evenodd"/></svg>
										<span>{res.event_time}</span>
									</div>
								{/if}
								{#if res.localization}
									<div class="flex items-center gap-2 text-[12px] text-navy/70">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/35"><path fill-rule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 8c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clip-rule="evenodd"/></svg>
										<span>{res.localization}</span>
									</div>
								{/if}
								<div class="flex items-center gap-2 text-[12px] text-navy/70">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-navy/35"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"/></svg>
									<span>{res.guests} convive{res.guests > 1 ? 's' : ''}</span>
								</div>
							</div>

							<!-- Actions -->
							<div class="flex items-center justify-between border-t border-navy/6 px-4 py-3">
								<a href="/reservations/{res.id_reservation}" class="text-xs font-medium text-navy/50">
									Voir les détails
								</a>
								<a href="/messages/{res.id_conversation}" class="rounded-xl bg-rust px-4 py-2 text-xs font-semibold text-white">
									Contacter
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Avis -->
		{:else if activeTab === 'avis'}
			<p class="py-12 text-center text-sm text-navy/40">Aucun avis pour l'instant.</p>
		{/if}
	</div>
</div>

<NewPublicationModal bind:open={showNewPublication} />
<NewMenuModal bind:open={showNewMenu} onCreated={onMenuCreated} />
<EditMenuModal
	bind:open={showEditMenu}
	menu={editingMenu}
	onUpdated={onMenuUpdated}
	onDeleted={onMenuDeleted}
/>
