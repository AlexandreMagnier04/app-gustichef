<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const profile = $derived(data.profile);
	const menus = $derived(data.menus);
	const galleryImages = $derived(data.galleryImages);
	const reviewStats = $derived(data.reviewStats);
	const notices = $derived(data.notices);

	const bannerImage = $derived(galleryImages[0]?.url ?? null);

	const uniqueSpecialties = $derived(
		[...new Map((profile.specialties ?? []).map((s) => [s.id_speciality, s])).values()],
	);

	const displayLoc = $derived(
		profile.user.localization && profile.user.localization !== 'Non renseigné'
			? profile.user.localization
			: null,
	);

	const subtitle = $derived.by(() => {
		return uniqueSpecialties
			.slice(0, 2)
			.map((s) => s.name_speciality)
			.join(' · ');
	});

	const platMenus = $derived(menus.filter((m) => m.type_menu === 'plat'));
	const extraMenus = $derived(menus.filter((m) => m.type_menu === 'extra'));

	type Tab = 'galerie' | 'menus' | 'avis';
	let activeTab = $state<Tab>('galerie');
	let menuTypeFilter = $state<'plat' | 'extra'>('plat');

	const filteredMenus = $derived(menuTypeFilter === 'plat' ? platMenus : extraMenus);

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<!-- Banner -->
<div class="-mx-5 -mt-3 relative h-52 overflow-hidden">
	{#if bannerImage}
		<img src={bannerImage} alt="" class="h-full w-full object-cover" />
	{:else}
		<div class="h-full w-full bg-gradient-to-br from-navy via-[#1e4060] to-[#b85a35]"></div>
	{/if}
	<div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cream/80 to-transparent"></div>
</div>

<!-- Avatar + pills row -->
<div class="-mt-12 mb-3 flex items-end gap-3 px-1">
	<div class="shrink-0">
		{#if profile.user.image}
			<img
				src={profile.user.image}
				alt=""
				class="h-20 w-20 rounded-full object-cover ring-3 ring-cream"
			/>
		{:else}
			<div
				class="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-xl font-bold text-cream ring-3 ring-cream"
			>
				{profile.user.firstname[0]}{profile.user.name[0]}
			</div>
		{/if}
	</div>
	<div class="flex flex-wrap gap-1.5 pb-1">
		{#each uniqueSpecialties.slice(0, 3) as spec (spec.id_speciality)}
			<span class="rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-cream">
				{spec.name_speciality}
			</span>
		{/each}
	</div>
</div>

<!-- Name + rating -->
<div class="mb-1 flex items-start justify-between gap-3 px-1">
	<h1 class="text-2xl font-bold leading-tight text-navy">
		{profile.user.firstname} {profile.user.name}
	</h1>
	{#if reviewStats.count > 0}
		<div class="flex shrink-0 items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-cream">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 text-yellow-300">
				<path fill-rule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L8 11.459l-3.136 2.535a.75.75 0 0 1-1.12-.814l.853-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.665-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clip-rule="evenodd" />
			</svg>
			<span class="text-sm font-bold">{reviewStats.avg?.toFixed(1)}</span>
			<span class="text-xs text-cream/70">{reviewStats.count} avis</span>
		</div>
	{/if}
</div>

<!-- Location + subtitle -->
<div class="mb-3 flex flex-col gap-0.5 px-1">
	{#if displayLoc}
		<div class="flex items-center gap-1.5 text-sm text-navy/50">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-rust">
				<path fill-rule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 8c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clip-rule="evenodd" />
			</svg>
			<span>{displayLoc}</span>
		</div>
	{/if}
	{#if subtitle}
		<p class="px-0.5 text-sm text-navy/50">{subtitle}</p>
	{/if}
</div>

<!-- Bio -->
{#if profile.bio_chief}
	<p class="mb-5 px-1 text-sm leading-relaxed text-navy/70">{profile.bio_chief}</p>
{/if}

<!-- CTA -->
<button class="mb-6 w-full rounded-2xl bg-rust py-3.5 text-sm font-semibold text-white shadow-sm">
	Contacter ce chef
</button>

<!-- Tabs -->
<div class="-mx-5 mb-5 border-b border-navy/10">
	<div class="flex">
		{#each (['galerie', 'menus', 'avis'] as const) as tab (tab)}
			<button
				onclick={() => (activeTab = tab)}
				class="flex-1 py-3 text-xs font-semibold transition-colors {activeTab === tab
					? 'border-b-2 border-rust text-navy'
					: 'text-navy/40'}"
			>
				{tab}
			</button>
		{/each}
	</div>
</div>

<!-- Tab: Galerie -->
{#if activeTab === 'galerie'}
	{#if galleryImages.length === 0}
		<div class="flex flex-col items-center gap-3 py-16 text-navy/30">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-12 w-12 opacity-40">
				<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
			</svg>
			<p class="text-sm">Aucune photo pour l'instant</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-1">
			{#each galleryImages as img (img.id_image)}
				<div class="aspect-square overflow-hidden rounded-lg">
					<img src={img.url} alt="" class="h-full w-full object-cover" />
				</div>
			{/each}
		</div>
	{/if}
{/if}

<!-- Tab: Menus -->
{#if activeTab === 'menus'}
	<div class="mb-5 flex rounded-xl bg-navy/8 p-1">
		{#each (['plat', 'extra'] as const) as type (type)}
			<button
				onclick={() => (menuTypeFilter = type)}
				class="flex-1 rounded-lg py-2 text-sm font-medium transition-colors {menuTypeFilter === type
					? 'bg-white text-navy shadow-sm'
					: 'text-navy/50'}"
			>
				{type === 'plat' ? 'Plats' : 'Extras'}
			</button>
		{/each}
	</div>

	{#if filteredMenus.length === 0}
		<div class="flex flex-col items-center gap-3 py-12 text-navy/30">
			<p class="text-sm">Aucun {menuTypeFilter === 'plat' ? 'plat' : 'extra'} pour l'instant</p>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each filteredMenus as menu (menu.id_menu)}
				<div class="overflow-hidden rounded-2xl bg-cream shadow-[0_2px_8px_rgba(22,48,64,0.08)]">
					<a href="/menus/{menu.id_menu}" class="block aspect-video w-full overflow-hidden bg-navy/5">
						<div class="flex h-full items-center justify-center text-navy/20">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-12 w-12">
								<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
							</svg>
						</div>
					</a>
					<div class="p-4">
						<h3 class="font-bold text-navy">{menu.title_menu}</h3>
						<p class="mt-0.5 text-sm font-semibold text-rust">Dès {Math.floor(parseFloat(menu.price_menu))} € / convive</p>
						<p class="mt-2 line-clamp-3 text-sm leading-relaxed text-navy/60">{menu.description_menu}</p>
						<a
							href="/menus/{menu.id_menu}"
							class="mt-4 flex w-full items-center justify-center rounded-xl bg-navy py-2.5 text-xs font-semibold text-cream"
						>
							Découvrir le menu
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/if}

<!-- Tab: Avis -->
{#if activeTab === 'avis'}
	{#if notices.length === 0}
		<div class="flex flex-col items-center gap-3 py-16 text-navy/30">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-12 w-12 opacity-40">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
			</svg>
			<p class="text-sm">Aucun avis pour l'instant</p>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each notices as notice (notice.id_notice)}
				<div class="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(22,48,64,0.08)]">
					<div class="mb-2 flex items-center justify-between">
						<div class="flex items-center gap-2.5">
							{#if notice.customer_image}
								<img src={notice.customer_image} alt="" class="h-9 w-9 rounded-full object-cover" />
							{:else}
								<div class="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
									{notice.customer_firstname[0]}{notice.customer_name[0]}
								</div>
							{/if}
							<div>
								<p class="text-sm font-semibold text-navy">{notice.customer_firstname} {notice.customer_name}</p>
								<p class="text-xs text-navy/40">{formatDate(notice.date_notice)}</p>
							</div>
						</div>
						<div class="flex items-center gap-1 rounded-full bg-navy/8 px-2.5 py-1">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3 text-yellow-400">
								<path fill-rule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L8 11.459l-3.136 2.535a.75.75 0 0 1-1.12-.814l.853-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.665-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clip-rule="evenodd" />
							</svg>
							<span class="text-xs font-bold text-navy">{parseFloat(notice.rating_notice).toFixed(1)}</span>
						</div>
					</div>
					{#if notice.comment_notice}
						<p class="text-sm leading-relaxed text-navy/60">{notice.comment_notice}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
{/if}
