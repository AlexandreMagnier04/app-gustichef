<script lang="ts">
	import type { PageData } from './$types';
	import BookingWizard from '$lib/components/BookingWizard.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const profile = $derived(data.profile);
	const menus = $derived(data.menus);
	const galleryImages = $derived(data.galleryImages);
	const reviewStats = $derived(data.reviewStats);
	const notices = $derived(data.notices);

	const bannerImage = $derived(galleryImages[0]?.url ?? null);

	const uniqueSpecialties = $derived([
		...new Map((profile.specialties ?? []).map((s) => [s.id_speciality, s])).values()
	]);

	const displayLoc = $derived(
		profile.user.localization && profile.user.localization !== 'Non renseigné'
			? profile.user.localization
			: null
	);

	const platMenus = $derived(menus.filter((m) => m.type_menu === 'plat'));
	const extraMenus = $derived(menus.filter((m) => m.type_menu === 'extra'));

	type Tab = 'galerie' | 'menus' | 'avis';
	let activeTab = $state<Tab>('galerie');
	let menuTypeFilter = $state<'plat' | 'extra'>('plat');
	let bookingMenu = $state<(typeof menus)[0] | null>(null);

	function onBookingSuccess(conversationId: number) {
		bookingMenu = null;
		goto('/messages/' + conversationId);
	}

	const filteredMenus = $derived(menuTypeFilter === 'plat' ? platMenus : extraMenus);

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
			<div class="h-full w-full bg-linear-to-br from-[#0F4450] via-[#163545] to-[#6b3020]"></div>
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
		<!-- Avatar -->
		{#if profile.user.image}
			<img
				src={profile.user.image}
				alt=""
				class="h-20 w-20 shrink-0 rounded-full object-cover shadow-md ring-2 ring-cream"
			/>
		{:else}
			<div
				class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-navy shadow-md ring-2 ring-cream"
			>
				<span class="text-xl font-bold text-cream">
					{profile.user.firstname[0]}{profile.user.name[0]}
				</span>
			</div>
		{/if}

		<!-- Nom + sous-titre + ville -->
		<div class="min-w-0 flex-1">
			<h1 class="text-xl leading-tight font-bold text-navy">
				{profile.user.firstname}
				{profile.user.name}
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

		<!-- Badge note -->
		{#if reviewStats.count > 0}
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
					<span class="text-base font-bold text-white">{reviewStats.avg?.toFixed(1)}</span>
				</div>
				<p class="mt-0.5 text-[10px] text-white/70">{reviewStats.count} avis</p>
			</div>
		{/if}
	</div>

	<!-- ── BIO ──────────────────────────────────── -->
	<div class="px-5">
		{#if profile.bio_chief}
			<p class="text-sm leading-relaxed text-navy/65">{profile.bio_chief}</p>
		{/if}
	</div>

	<!-- ── TABS ───────────────────────────────────── -->
	<div class="mt-6 flex border-b border-navy/8">
		{#each ['galerie', 'menus', 'avis'] as const as tab (tab)}
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

	<!-- ── CONTENU ────────────────────────────────── -->
	<div class="px-5 pt-5">
		<!-- Galerie -->
		{#if activeTab === 'galerie'}
			{#if galleryImages.length === 0}
				<div class="flex flex-col items-center gap-3 py-16 text-navy/30">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-12 w-12"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
						/>
					</svg>
					<p class="text-sm">Aucune photo pour l'instant</p>
				</div>
			{:else}
				<div class="columns-2 gap-1.5">
					{#each galleryImages as img, i (img.id_image)}
						<div
							class="mb-1.5 w-full break-inside-avoid overflow-hidden rounded-xl {i % 3 === 0
								? 'aspect-3/4'
								: i % 3 === 1
									? 'aspect-square'
									: 'aspect-2/3'}"
						>
							<img src={img.url} alt="" class="h-full w-full object-cover" />
						</div>
					{/each}
				</div>
			{/if}
		{/if}

		<!-- Menus -->
		{#if activeTab === 'menus'}
			<!-- Toggle Plats / Extras -->
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

			{#if filteredMenus.length === 0}
				<p class="py-12 text-center text-sm text-navy/40">
					Aucun {menuTypeFilter === 'plat' ? 'menu' : 'extra'} pour l'instant.
				</p>
			{:else}
				<div class="flex flex-col gap-4">
					{#each filteredMenus as menu, i (menu.id_menu)}
						<div
							class="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(5,30,35,0.08)]"
						>
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
										onclick={() => (bookingMenu = menu)}
										class="flex flex-1 items-center justify-center rounded-xl bg-teal py-2.5 text-xs font-semibold text-white"
									>
										Réserver ce plat
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}

		<!-- Avis -->
		{#if activeTab === 'avis'}
			{#if notices.length === 0}
				<div class="flex flex-col items-center gap-3 py-16 text-navy/30">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-12 w-12"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
						/>
					</svg>
					<p class="text-sm">Aucun avis pour l'instant</p>
				</div>
			{:else}
				<div class="flex flex-col gap-3">
					{#each notices as notice (notice.id_notice)}
						<div class="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(5,30,35,0.06)]">
							<div class="flex items-center justify-between gap-3">
								<div class="flex items-center gap-3">
									{#if notice.customer.image}
										<img
											src={notice.customer.image}
											alt=""
											class="h-10 w-10 rounded-full object-cover"
										/>
									{:else}
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-navy/8 text-xs font-bold text-navy"
										>
											{notice.customer.firstname[0]}{notice.customer.name[0]}
										</div>
									{/if}
									<div>
										<p class="text-sm font-semibold text-navy">
											{notice.customer.firstname}
											{notice.customer.name}
										</p>
										<p class="text-xs text-navy/40">{formatDate(notice.date_notice)}</p>
									</div>
								</div>
								<div class="flex items-center gap-1 rounded-full bg-navy/6 px-2.5 py-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										fill="currentColor"
										class="h-3 w-3 text-yellow-400"
									>
										<path
											fill-rule="evenodd"
											d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L8 11.459l-3.136 2.535a.75.75 0 0 1-1.12-.814l.853-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.665-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="text-xs font-bold text-navy"
										>{parseFloat(notice.rating_notice).toFixed(1)}</span
									>
								</div>
							</div>
							{#if notice.comment_notice}
								<p class="mt-3 text-sm leading-relaxed text-navy/60">{notice.comment_notice}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

{#if bookingMenu}
	<BookingWizard
		menuId={bookingMenu.id_menu}
		menuTitle={bookingMenu.title_menu}
		menuImage={bookingMenu.image_url}
		pricePerPerson={parseFloat(bookingMenu.price_menu)}
		guestsMin={bookingMenu.guests_min ?? 1}
		guestsMax={bookingMenu.guests_max ?? 50}
		chiefId={profile.id_chief}
		chiefFirstname={profile.user.firstname}
		chiefExtras={extraMenus}
		onclose={() => (bookingMenu = null)}
		onsuccess={onBookingSuccess}
	/>
{/if}
