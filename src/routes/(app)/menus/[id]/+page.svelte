<script lang="ts">
	import type { PageData } from './$types';
	import EditMenuModal from '$lib/components/EditMenuModal.svelte';
	import BookingWizard from '$lib/components/BookingWizard.svelte';
	import { goto } from '$app/navigation';
	import flecheRetourOrange from '$lib/assets/img/fleche-retour-orange.png';
	import flecheRetourVerte from '$lib/assets/img/fleche-retour-verte.png';
	import imgStylo from '$lib/assets/img/stylo.png';

	let { data }: { data: PageData } = $props();

	const menu = $derived(data.menu);
	const images = $derived(data.images);
	const coverImage = $derived(images[0]?.url ?? null);
	const isOwner = $derived(data.user?.id === menu.id_chief);
	const isCustomer = $derived(data.user?.role === 'customer');

	let showEdit = $state(false);
	let showBooking = $state(false);

	function onUpdated() {
		showEdit = false;
		window.location.reload();
	}

	function onDeleted() {
		goto('/profile');
	}

	function onBookingSuccess(conversationId: number) {
		showBooking = false;
		goto('/messages/' + conversationId);
	}
</script>

<div class="-mx-5 flex flex-col pb-24">
	<!-- Bannière photo -->
	<div class="relative h-52 w-full overflow-hidden">
		{#if coverImage}
			<img src={coverImage} alt="" class="h-full w-full object-cover" />
		{:else}
			<div class="h-full w-full bg-linear-to-br from-navy via-[#1e4060] to-[#b85a35]"></div>
		{/if}
		<div class="absolute inset-0 bg-linear-to-t from-cream/90 via-cream/20 to-transparent"></div>
	</div>

	<div class="px-5">
		<button onclick={() => history.back()} aria-label="Retour" class="mt-4">
			<img
				src={isCustomer ? flecheRetourVerte : flecheRetourOrange}
				alt="Retour"
				class="h-5 w-5 object-contain"
			/>
		</button>

		<!-- Titre -->
		<h1 class="mt-4 text-2xl leading-tight font-bold text-navy">{menu.title_menu}</h1>

		<!-- Prix + convives -->
		<p class="mt-1 text-sm font-medium text-rust">
			Dès {Math.floor(parseFloat(menu.price_menu))} € / convive
			{#if menu.guests_min || menu.guests_max}
				<span class="font-normal text-navy/50">
					({menu.guests_min ?? '?'}-{menu.guests_max ?? '?'} pers.)
				</span>
			{/if}
		</p>

		<!-- Description -->
		<div class="mt-6">
			<h2 class="mb-2 text-sm font-semibold tracking-wider text-navy/40 uppercase">
				Description du plat
			</h2>
			<p class="text-sm leading-relaxed text-navy/80">{menu.description_menu}</p>
		</div>

		<!-- Ingrédients -->
		{#if menu.ingredients && menu.ingredients.length > 0}
			<div class="mt-6">
				<h2 class="mb-3 text-sm font-semibold tracking-wider text-navy/40 uppercase">
					Ingrédients
				</h2>
				<ul class="space-y-2">
					{#each menu.ingredients as ing (ing)}
						<li class="flex items-center gap-2 text-sm text-navy/80">
							<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-rust"></span>
							{ing}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Allergènes notice (placeholder) -->
		<div class="mt-6 flex items-start gap-2 rounded-xl bg-rust/8 px-4 py-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="mt-0.5 h-4 w-4 shrink-0 text-rust/70"
			>
				<path
					fill-rule="evenodd"
					d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
					clip-rule="evenodd"
				/>
			</svg>
			<p class="text-xs leading-relaxed text-rust">
				Allergènes : œufs, produits laitiers, fruits à coque. Sur demande sans gluten.
			</p>
		</div>

		<!-- Bouton éditer (chef propriétaire) ou Réserver ce plat (client) -->
		{#if isOwner}
			<button
				onclick={() => (showEdit = true)}
				class="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-rust py-4 text-sm font-semibold text-white shadow-sm"
			>
				<img src={imgStylo} alt="" class="h-4 w-4 object-contain brightness-0 invert" />
				Éditer ce plat
			</button>
		{:else if isCustomer && menu.type_menu !== 'extra'}
			<button
				onclick={() => (showBooking = true)}
				class="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-semibold text-white shadow-sm"
			>
				Réserver ce plat
			</button>
		{/if}
	</div>
</div>

{#if isOwner}
	<EditMenuModal bind:open={showEdit} {menu} {onUpdated} {onDeleted} />
{/if}

{#if showBooking}
	<BookingWizard
		menuId={menu.id_menu}
		menuTitle={menu.title_menu}
		menuImage={coverImage}
		pricePerPerson={Math.floor(parseFloat(menu.price_menu))}
		guestsMin={menu.guests_min ?? 1}
		guestsMax={menu.guests_max ?? 50}
		chiefId={menu.id_chief}
		chiefFirstname={data.chiefUser?.firstname ?? 'Le chef'}
		chiefExtras={data.chiefExtras}
		onclose={() => (showBooking = false)}
		onsuccess={onBookingSuccess}
	/>
{/if}
