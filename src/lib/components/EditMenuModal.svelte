<script lang="ts">
	import type { Menu } from '$lib/models/chief.model';
	import imgCroix from '$lib/assets/img/croix.png';
	import imgStylo from '$lib/assets/img/stylo.png';

	let {
		open = $bindable(false),
		menu,
		onUpdated,
		onDeleted
	}: {
		open: boolean;
		menu: Menu | null;
		onUpdated?: () => void;
		onDeleted?: () => void;
	} = $props();

	type MenuType = 'plat' | 'extra';

	let typeMenu = $state<MenuType>('plat');
	let title = $state('');
	let description = $state('');
	let price = $state('');
	let guestsMin = $state('');
	let guestsMax = $state('');
	let ingredientInput = $state('');
	let ingredients = $state<string[]>([]);
	let photoPreview = $state<string | null>(null);
	let photoFile = $state<File | null>(null);
	let submitting = $state(false);
	let deleting = $state(false);
	let errors = $state<Record<string, string>>({});
	let showDeleteConfirm = $state(false);

	// Sync fields when menu prop changes
	$effect(() => {
		if (menu && open) {
			typeMenu = (menu.type_menu as MenuType) ?? 'plat';
			title = menu.title_menu;
			description = menu.description_menu;
			price = menu.price_menu;
			guestsMin = menu.guests_min ? String(menu.guests_min) : '';
			guestsMax = menu.guests_max ? String(menu.guests_max) : '';
			ingredients = menu.ingredients ? [...menu.ingredients] : [];
			photoPreview = null;
			photoFile = null;
			errors = {};
			showDeleteConfirm = false;
		}
	});

	function addIngredient() {
		const val = ingredientInput.trim();
		if (val && !ingredients.includes(val)) {
			ingredients = [...ingredients, val];
		}
		ingredientInput = '';
	}

	function removeIngredient(ing: string) {
		ingredients = ingredients.filter((i) => i !== ing);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addIngredient();
		}
	}

	function onPhotoChange(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		photoFile = file;
		photoPreview = URL.createObjectURL(file);
	}

	function close() {
		open = false;
	}

	async function submit() {
		if (!menu) return;
		errors = {};
		if (!title.trim()) errors.title = 'Nom requis';
		if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0)
			errors.price = 'Prix invalide';
		if (Object.keys(errors).length > 0) return;

		submitting = true;
		const fd = new FormData();
		fd.append('title_menu', title.trim());
		fd.append('description_menu', description.trim());
		fd.append('price_menu', price);
		fd.append('type_menu', typeMenu);
		if (guestsMin) fd.append('guests_min', guestsMin);
		if (guestsMax) fd.append('guests_max', guestsMax);
		ingredients.forEach((ing) => fd.append('ingredients[]', ing));
		if (photoFile) fd.append('photo', photoFile);

		try {
			const res = await fetch(`/api/menus/${menu.id_menu}`, { method: 'PATCH', body: fd });
			if (res.ok) {
				onUpdated?.();
				close();
			} else {
				const body = await res.json().catch(() => ({}));
				const fieldErrors = body?.errors?.fieldErrors ?? {};
				if (fieldErrors.title_menu?.[0]) errors.title = fieldErrors.title_menu[0];
				if (fieldErrors.description_menu?.[0]) errors.description = fieldErrors.description_menu[0];
				if (fieldErrors.price_menu?.[0]) errors.price = fieldErrors.price_menu[0];
				if (!Object.values(errors).some(Boolean))
					errors.global = body?.message ?? 'Erreur lors de la mise à jour';
			}
		} catch {
			errors.global = 'Erreur réseau';
		} finally {
			submitting = false;
		}
	}

	async function confirmDelete() {
		if (!menu) return;
		deleting = true;
		try {
			const res = await fetch(`/api/menus/${menu.id_menu}`, { method: 'DELETE' });
			if (res.ok) {
				onDeleted?.();
				close();
			} else {
				errors.global = 'Erreur lors de la suppression';
			}
		} catch {
			errors.global = 'Erreur réseau';
		} finally {
			deleting = false;
			showDeleteConfirm = false;
		}
	}
</script>

{#if open && menu}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
	>
		<div class="w-full max-w-md overflow-hidden rounded-t-3xl bg-white">
			<div class="flex justify-center pt-3 pb-1">
				<div class="h-1 w-10 rounded-full bg-navy/20"></div>
			</div>

			<div class="flex items-center justify-between px-5 pt-2 pb-4">
				<h2 class="text-base font-semibold text-navy">Modifier ce plat</h2>
				<button
					onclick={close}
					aria-label="Fermer"
					class="flex h-7 w-7 items-center justify-center rounded-full bg-navy/8"
				>
					<img src={imgCroix} alt="" class="h-4 w-4 object-contain" />
				</button>
			</div>

			<div class="max-h-[80vh] overflow-y-auto px-5 pb-8">
				<!-- Photo du menu -->
				<label class="mb-5 block cursor-pointer">
					<input type="file" accept="image/*" class="hidden" onchange={onPhotoChange} />
					<div class="relative aspect-video w-full overflow-hidden rounded-xl bg-navy/5">
						{#if photoPreview}
							<img src={photoPreview} alt="" class="h-full w-full object-cover" />
						{:else}
							<div class="flex h-full items-center justify-center text-navy/20">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1"
									stroke="currentColor"
									class="h-12 w-12"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
									/>
								</svg>
							</div>
						{/if}
						<div
							class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/30 py-2"
						>
							<img src={imgStylo} alt="" class="h-3.5 w-3.5 object-contain brightness-0 invert" />
							<span class="text-xs font-medium text-white">Modifier la photo</span>
						</div>
					</div>
				</label>

				<!-- Nom -->
				<div class="mb-4">
					<label for="emenu-title" class="mb-1.5 block text-sm font-medium text-navy"
						>Nom du plat</label
					>
					<input
						id="emenu-title"
						type="text"
						bind:value={title}
						class="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-rust/40"
					/>
					{#if errors.title}<p class="mt-1 text-xs text-rust">{errors.title}</p>{/if}
				</div>

				<!-- Description -->
				<div class="mb-4">
					<label for="emenu-description" class="mb-1.5 block text-sm font-medium text-navy"
						>Description</label
					>
					<textarea
						id="emenu-description"
						bind:value={description}
						rows="3"
						class="w-full resize-none rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-rust/40"
					></textarea>
					{#if errors.description}<p class="mt-1 text-xs text-rust">{errors.description}</p>{/if}
				</div>

				<!-- Prix -->
				<div class="mb-4">
					<label for="emenu-price" class="mb-1.5 block text-sm font-medium text-navy"
						>Prix / convive</label
					>
					<div class="relative">
						<input
							id="emenu-price"
							type="number"
							step="0.01"
							min="0"
							bind:value={price}
							class="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 pr-8 text-sm text-navy outline-none focus:border-rust/40"
						/>
						<span class="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-navy/40">€</span>
					</div>
					{#if errors.price}<p class="mt-1 text-xs text-rust">{errors.price}</p>{/if}
				</div>

				<!-- Convives -->
				<div class="mb-4 flex gap-3">
					<div class="flex-1">
						<label for="emenu-guests-min" class="mb-1.5 block text-sm font-medium text-navy"
							>Convives min</label
						>
						<input
							id="emenu-guests-min"
							type="number"
							min="1"
							bind:value={guestsMin}
							class="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-rust/40"
						/>
					</div>
					<div class="flex-1">
						<label for="emenu-guests-max" class="mb-1.5 block text-sm font-medium text-navy"
							>Convives max</label
						>
						<input
							id="emenu-guests-max"
							type="number"
							min="1"
							bind:value={guestsMax}
							class="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-rust/40"
						/>
					</div>
				</div>

				<!-- Ingrédients -->
				<div class="mb-5">
					<label for="emenu-ingredient" class="mb-1.5 block text-sm font-medium text-navy"
						>Ingrédients</label
					>
					<div class="flex gap-2">
						<input
							id="emenu-ingredient"
							type="text"
							placeholder="Ajouter un ingrédient..."
							bind:value={ingredientInput}
							onkeydown={onKeydown}
							class="flex-1 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy placeholder-navy/30 outline-none focus:border-rust/40"
						/>
						<button
							type="button"
							onclick={addIngredient}
							aria-label="Ajouter l'ingrédient"
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-rust text-white"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="h-4 w-4"
							>
								<path
									d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"
								/>
							</svg>
						</button>
					</div>
					{#if ingredients.length > 0}
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each ingredients as ing (ing)}
								<span
									class="flex items-center gap-1 rounded-full bg-navy/8 px-3 py-1 text-xs font-medium text-navy"
								>
									{ing}
									<button
										onclick={() => removeIngredient(ing)}
										aria-label="Retirer {ing}"
										class="ml-0.5 text-navy/40 hover:text-navy"
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
							{/each}
						</div>
					{/if}
					<p class="mt-2 flex items-start gap-1.5 text-xs text-navy/50">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="mt-0.5 h-3.5 w-3.5 shrink-0 text-rust/70"
						>
							<path
								fill-rule="evenodd"
								d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
								clip-rule="evenodd"
							/>
						</svg>
						Allergènes : œufs, produits laitiers, fruits à coque. Sur demande sans gluten.
					</p>
				</div>

				{#if errors.global}
					<p class="mb-4 rounded-xl bg-rust/10 px-4 py-3 text-sm text-rust">{errors.global}</p>
				{/if}

				<!-- Enregistrer -->
				<button
					onclick={submit}
					disabled={submitting}
					class="flex w-full items-center justify-center gap-2 rounded-2xl bg-rust py-4 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
				>
					{#if submitting}
						<svg
							class="h-4 w-4 animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
							></path>
						</svg>
					{:else}
						<img src={imgStylo} alt="" class="h-4 w-4 object-contain brightness-0 invert" />
					{/if}
					{submitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
				</button>

				<!-- Supprimer -->
				{#if !showDeleteConfirm}
					<button
						onclick={() => (showDeleteConfirm = true)}
						class="mt-4 w-full py-3 text-center text-sm font-medium text-rust/70 hover:text-rust"
					>
						Supprimer ce plat
					</button>
				{:else}
					<div class="mt-4 rounded-xl border border-rust/20 bg-rust/5 p-4">
						<p class="mb-3 text-center text-sm text-navy">Supprimer ce plat définitivement ?</p>
						<div class="flex gap-2">
							<button
								onclick={() => (showDeleteConfirm = false)}
								class="flex-1 rounded-xl border border-navy/20 py-2.5 text-sm font-medium text-navy/70"
							>
								Annuler
							</button>
							<button
								onclick={confirmDelete}
								disabled={deleting}
								class="flex-1 rounded-xl bg-rust py-2.5 text-sm font-semibold text-white disabled:opacity-60"
							>
								{deleting ? 'Suppression…' : 'Supprimer'}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
