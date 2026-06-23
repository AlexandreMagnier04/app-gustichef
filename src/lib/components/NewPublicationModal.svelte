<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { createPublication } from '$lib/services/publication.service';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const CUISINE_OPTIONS = [
		'Française',
		'Italienne',
		'Japonaise',
		'Mexicaine',
		'Indienne',
		'Méditerranéenne',
		'Végétarienne',
		'Sans gluten'
	];

	let title = $state('');
	let description = $state('');
	let price = $state<string>('');
	let guestsMin = $state<string>('');
	let guestsMax = $state<string>('');
	let selectedCuisines = $state<string[]>([]);
	let cuisineSelectValue = $state('');
	let customCuisine = $state('');
	let showCustomInput = $state(false);
	let file = $state<File | null>(null);
	let preview = $state<string | null>(null);
	let submitting = $state(false);
	let error = $state('');

	function reset() {
		title = '';
		description = '';
		price = '';
		guestsMin = '';
		guestsMax = '';
		selectedCuisines = [];
		cuisineSelectValue = '';
		customCuisine = '';
		showCustomInput = false;
		if (preview) URL.revokeObjectURL(preview);
		file = null;
		preview = null;
		error = '';
		submitting = false;
	}

	function close() {
		reset();
		open = false;
	}

	function onFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const selected = target.files?.[0];
		if (!selected) return;
		if (preview) URL.revokeObjectURL(preview);
		file = selected;
		preview = URL.createObjectURL(selected);
	}

	function addCuisine() {
		if (cuisineSelectValue === '__autre__') {
			showCustomInput = true;
			cuisineSelectValue = '';
			return;
		}
		if (!cuisineSelectValue) return;
		if (!selectedCuisines.includes(cuisineSelectValue)) {
			selectedCuisines = [...selectedCuisines, cuisineSelectValue];
		}
		cuisineSelectValue = '';
	}

	function addCustomCuisine() {
		const val = customCuisine.trim();
		if (!val) return;
		if (!selectedCuisines.includes(val)) {
			selectedCuisines = [...selectedCuisines, val];
		}
		customCuisine = '';
		showCustomInput = false;
	}

	function removeCuisine(c: string) {
		selectedCuisines = selectedCuisines.filter((x) => x !== c);
	}

	async function submit(e: Event) {
		e.preventDefault();
		error = '';

		if (!file) {
			error = 'Ajoute une photo de ton plat';
			return;
		}

		submitting = true;
		const res = await createPublication({
			title,
			description,
			price: price ? Number(price) : undefined,
			guestsMin: guestsMin ? Number(guestsMin) : undefined,
			guestsMax: guestsMax ? Number(guestsMax) : undefined,
			tags: selectedCuisines,
			file
		});

		if (!res.ok) {
			error = res.error;
			submitting = false;
			return;
		}

		await invalidateAll();
		close();
	}
</script>

{#if open}
	<!-- Backdrop -->
	<button class="fixed inset-0 z-40 bg-black/40" onclick={close} aria-label="Fermer"></button>

	<!-- Modal -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white pb-8"
		role="dialog"
		aria-modal="true"
	>
		<!-- Handle -->
		<div class="flex justify-center pt-3 pb-2">
			<div class="h-1 w-10 rounded-full bg-navy/20"></div>
		</div>

		<button
			class="absolute top-3 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy/70 shadow"
			onclick={close}
			aria-label="Fermer"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4"
			>
				<path
					d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"
				/>
			</svg>
		</button>

		<form onsubmit={submit} class="px-6 pt-2">
			<h2 class="text-lg font-medium text-navy">Nouvelle publication</h2>
			<div class="my-3 h-px bg-navy/10"></div>

			<!-- Photo -->
			<label class="mb-1.5 block text-sm font-medium text-navy">Photo de ton plat</label>
			<label
				class="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 bg-white"
			>
				{#if preview}
					<img src={preview} alt="Aperçu" class="h-full w-full rounded-2xl object-cover" />
				{:else}
					<div class="flex h-11 w-11 items-center justify-center rounded-full bg-rust text-white">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="h-5 w-5"
						>
							<path
								d="M12 3a1 1 0 0 1 .78.375l4 5a1 1 0 1 1-1.56 1.25L13 6.85V15a1 1 0 1 1-2 0V6.85L8.78 9.625a1 1 0 1 1-1.56-1.25l4-5A1 1 0 0 1 12 3Zm-7 14a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1a1 1 0 0 1 1-1Z"
							/>
						</svg>
					</div>
					<span class="text-xs text-navy/50">Ajouter une photo</span>
				{/if}
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					class="hidden"
					onchange={onFileChange}
				/>
			</label>
			<p class="mt-2 rounded-lg bg-navy/5 px-3 py-2 text-center text-[11px] text-navy/60">
				Une belle photo attire 3x plus de clients ! Montrez votre talent en image
			</p>

			<!-- Nom -->
			<label class="mt-4 mb-1.5 block text-sm font-medium text-navy">Nom du plat</label>
			<input
				type="text"
				bind:value={title}
				required
				maxlength="100"
				placeholder="Ex : Poulet rôti aux herbes de Provence"
				class="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy"
			/>

			<!-- Description -->
			<label class="mt-4 mb-1.5 block text-sm font-medium text-navy">Description</label>
			<textarea
				bind:value={description}
				required
				maxlength="2000"
				rows="3"
				placeholder="Décrivez votre plat, ses saveurs, son origine..."
				class="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy"
			></textarea>

			<!-- Prix -->
			<label class="mt-4 mb-1.5 block text-sm font-medium text-navy">Prix par personne</label>
			<div class="relative inline-flex w-28">
				<input
					type="number"
					bind:value={price}
					min="0"
					step="0.01"
					placeholder="Prix"
					class="w-full rounded-full border border-navy/15 bg-white py-2 pr-7 pl-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy"
				/>
				<span class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-navy/40"
					>€</span
				>
			</div>

			<!-- Type de cuisine -->
			<label class="mt-4 mb-1.5 block text-sm font-medium text-navy">Type de cuisine</label>
			<div class="flex flex-wrap items-center gap-2">
				{#if !showCustomInput}
					<select
						bind:value={cuisineSelectValue}
						onchange={addCuisine}
						class="rounded-full border border-navy/15 bg-white py-2 pr-8 pl-4 text-sm text-navy outline-none focus:border-navy"
					>
						<option value="">Cuisine</option>
						{#each CUISINE_OPTIONS.filter((c) => !selectedCuisines.includes(c)) as c (c)}
							<option value={c}>{c}</option>
						{/each}
						<option value="__autre__">Autre...</option>
					</select>
				{:else}
					<div class="flex items-center gap-1.5">
						<input
							type="text"
							bind:value={customCuisine}
							placeholder="Ex : Péruvienne"
							maxlength="40"
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCuisine())}
							class="rounded-full border border-navy/15 bg-white py-2 px-4 text-sm text-navy outline-none focus:border-navy"
						/>
						<button
							type="button"
							onclick={addCustomCuisine}
							class="rounded-full bg-rust px-3 py-2 text-xs font-medium text-white"
						>
							Ajouter
						</button>
						<button
							type="button"
							onclick={() => { showCustomInput = false; customCuisine = ''; }}
							class="text-xs text-navy/40"
						>
							Annuler
						</button>
					</div>
				{/if}
				{#each selectedCuisines as c (c)}
					<span
						class="inline-flex items-center gap-1 rounded-full bg-navy/70 px-3 py-1.5 text-xs text-cream"
					>
						{c}
						<button type="button" onclick={() => removeCuisine(c)} aria-label="Retirer">
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

			<!-- Convives -->
			<label class="mt-4 mb-1.5 block text-sm font-medium text-navy">Nombre de convives</label>
			<div class="flex gap-3">
				<div class="flex-1">
					<label class="mb-1 block text-xs text-navy/60">Minimum</label>
					<input
						type="number"
						bind:value={guestsMin}
						min="1"
						placeholder="Min : 2"
						class="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy"
					/>
				</div>
				<div class="flex-1">
					<label class="mb-1 block text-xs text-navy/60">Maximum</label>
					<input
						type="number"
						bind:value={guestsMax}
						min="1"
						placeholder="Max : 12"
						class="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy"
					/>
				</div>
			</div>

			{#if error}
				<p class="mt-3 text-sm text-rust">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={submitting}
				class="mt-6 w-full rounded-xl bg-rust py-3.5 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-60"
			>
				{submitting ? 'Publication...' : 'Publier mon plat'}
			</button>
		</form>
	</div>
{/if}
