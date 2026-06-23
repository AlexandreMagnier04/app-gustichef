<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const isChief = $derived(data.user.role === 'chief');
	const accentColor = $derived(isChief ? 'bg-rust' : 'bg-teal');

	// Champs communs
	let firstname = $state(data.user.firstname ?? '');
	let name = $state(data.user.name ?? '');
	let localization = $state('');
	let bio = $state('');
	// Chef uniquement
	let specialties = $state<string[]>([]);
	let cities = $state<string[]>([]);
	let cityInput = $state('');
	let specialtyDropdownOpen = $state(false);
	let cityDropdownOpen = $state(false);

	// Previews photo
	let avatarPreview = $state<string | null>(data.user.image ?? null);
	let bannerPreview = $state<string | null>(null);
	let avatarFile = $state<File | null>(null);
	let bannerFile = $state<File | null>(null);

	// Modals
	let showConfirm = $state(false);
	let showSuccess = $state(false);
	let saving = $state(false);

	// Init données chef/client
	$effect(() => {
		if (isChief && data.profile) {
			bio = data.profile.bio_chief ?? '';
			bannerPreview = (data.profile as any).banner_chief ?? null;
			specialties = data.profile.specialties?.map((s: any) => s.name_speciality) ?? [];
			localization = data.user.localization ?? '';
			cities = localization ? localization.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
		} else {
			localization = data.user.localization ?? '';
			bio = data.customer?.preferences_customer ?? '';
		}
	});

	function pickAvatar(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		avatarFile = file;
		avatarPreview = URL.createObjectURL(file);
	}

	function pickBanner(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		bannerFile = file;
		bannerPreview = URL.createObjectURL(file);
	}

	function addCity() {
		const c = cityInput.trim();
		if (c && !cities.includes(c)) cities = [...cities, c];
		cityInput = '';
		cityDropdownOpen = false;
	}

	function removeCity(c: string) {
		cities = cities.filter((x) => x !== c);
	}

	function toggleSpecialty(name: string) {
		if (specialties.includes(name)) {
			specialties = specialties.filter((s) => s !== name);
		} else if (specialties.length < 3) {
			specialties = [...specialties, name];
		}
	}

	function removeSpecialty(name: string) {
		specialties = specialties.filter((s) => s !== name);
	}

	async function save() {
		saving = true;
		const form = new FormData();
		form.append('firstname', firstname);
		form.append('name', name);
		form.append('localization', isChief ? cities.join(', ') : localization);
		form.append('bio', bio);
		if (avatarFile) form.append('avatar', avatarFile);
		if (isChief) {
			if (bannerFile) form.append('banner', bannerFile);
			form.append('specialties', specialties.join(','));
		}

		await fetch('/api/user/profile', { method: 'POST', body: form });
		saving = false;
		showConfirm = false;
		showSuccess = true;
	}
</script>

<!-- En-tête -->
<div class="flex items-center justify-between pb-4 pt-2">
	<a href="/profile/settings" class="text-navy/50 hover:text-navy">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
			<path fill-rule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clip-rule="evenodd" />
		</svg>
	</a>
	<h1 class="text-base font-semibold text-navy">Informations personnelles</h1>
	<div class="w-5"></div>
</div>

<p class="mb-4 text-center text-xs font-medium text-navy/40">Mon compte</p>

<!-- Photos -->
<div class="mb-5 flex {isChief ? 'gap-6' : 'justify-start'}">
	<!-- Avatar -->
	<div>
		<p class="mb-2 text-xs font-medium text-navy/60">Photo de profil</p>
		<label class="cursor-pointer">
			<input type="file" accept="image/*" class="hidden" onchange={pickAvatar} />
			{#if avatarPreview}
				<img src={avatarPreview} alt="" class="h-16 w-16 rounded-full object-cover ring-2 ring-cream ring-offset-2" />
			{:else}
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-navy/10 text-navy/30">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-7 w-7">
						<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
					</svg>
				</div>
			{/if}
			<p class="mt-1.5 text-center text-[11px] text-navy/40">Ajouter une photo +</p>
		</label>
	</div>

	<!-- Banner (chef uniquement) -->
	{#if isChief}
		<div>
			<p class="mb-2 text-xs font-medium text-navy/60">Banner</p>
			<label class="cursor-pointer">
				<input type="file" accept="image/*" class="hidden" onchange={pickBanner} />
				{#if bannerPreview}
					<img src={bannerPreview} alt="" class="h-16 w-28 rounded-xl object-cover" />
				{:else}
					<div class="flex h-16 w-28 items-center justify-center rounded-xl bg-navy/10 text-navy/30">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
						</svg>
					</div>
				{/if}
				<p class="mt-1.5 text-center text-[11px] text-navy/40">Ajouter une photo +</p>
			</label>
		</div>
	{/if}
</div>

<!-- Champs -->
<div class="flex flex-col gap-4">
	<div>
		<label class="mb-1 block text-xs font-medium text-navy/70">{isChief ? 'Nom et prénom du chef' : 'Nom et prénom'}</label>
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={firstname}
				placeholder="Prénom"
				class="flex-1 rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy/40"
			/>
			<input
				type="text"
				bind:value={name}
				placeholder="Nom"
				class="flex-1 rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy/40"
			/>
		</div>
	</div>

	<div>
		<label class="mb-1 block text-xs font-medium text-navy/70">Bio</label>
		<textarea
			bind:value={bio}
			rows="3"
			placeholder={isChief ? 'Passionnée par la pâtisserie moderne, je réalise...' : 'Passionné de gastronomie et avide d\'expériences'}
			class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy/40 resize-none"
		></textarea>
	</div>

	{#if isChief}
		<!-- Spécialités -->
		<div>
			<label class="mb-1 block text-xs font-medium text-navy/70">Spécialités <span class="text-navy/40">(3 max)</span></label>
			<div class="relative">
				<button
					type="button"
					onclick={() => (specialtyDropdownOpen = !specialtyDropdownOpen)}
					class="flex w-full items-center justify-between rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy/50"
				>
					Spécialités
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 text-navy/30">
						<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
					</svg>
				</button>
				{#if specialtyDropdownOpen}
					<ul class="absolute top-full left-0 z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-navy/10 bg-white shadow-lg">
						{#each data.specialties as s}
							<li>
								<button
									type="button"
									onclick={() => toggleSpecialty(s.name_speciality)}
									class="flex w-full items-center justify-between px-4 py-2.5 text-sm text-navy hover:bg-cream {specialties.includes(s.name_speciality) ? 'font-semibold' : ''}"
								>
									{s.name_speciality}
									{#if specialties.includes(s.name_speciality)}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 text-teal">
											<path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" />
										</svg>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			{#if specialties.length > 0}
				<div class="mt-2 flex flex-wrap gap-2">
					{#each specialties as s}
						<span class="flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1 text-xs font-medium text-teal">
							{s}
							<button type="button" onclick={() => removeSpecialty(s)} class="text-teal/60 hover:text-teal">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5">
									<path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
								</svg>
							</button>
						</span>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Villes -->
		<div>
			<label class="mb-0.5 block text-xs font-medium text-navy/70">Villes d'intervention</label>
			<p class="mb-1.5 text-[11px] text-navy/40">Ajoute toutes les villes où tu peux intervenir</p>
			<div class="relative">
				<button
					type="button"
					onclick={() => (cityDropdownOpen = !cityDropdownOpen)}
					class="flex w-full items-center justify-between rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy/50"
				>
					Ville
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 text-navy/30">
						<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
					</svg>
				</button>
				{#if cityDropdownOpen}
					<div class="absolute top-full left-0 z-20 mt-1 w-full rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
						<div class="flex gap-2">
							<input
								type="text"
								bind:value={cityInput}
								onkeydown={(e) => e.key === 'Enter' && addCity()}
								placeholder="Paris, Lyon..."
								class="flex-1 rounded-lg border border-navy/15 px-3 py-1.5 text-sm text-navy outline-none placeholder:text-navy/30"
							/>
							<button type="button" onclick={addCity} class="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white">OK</button>
						</div>
					</div>
				{/if}
			</div>
			{#if cities.length > 0}
				<div class="mt-2 flex flex-wrap gap-2">
					{#each cities as c}
						<span class="flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1 text-xs font-medium text-teal">
							{c}
							<button type="button" onclick={() => removeCity(c)} class="text-teal/60 hover:text-teal">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5">
									<path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
								</svg>
							</button>
						</span>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<!-- Ville (client) -->
		<div>
			<label class="mb-1 block text-xs font-medium text-navy/70">Ville</label>
			<input
				type="text"
				bind:value={localization}
				placeholder="Lille, 59000"
				class="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy/40"
			/>
		</div>
	{/if}

</div>

<button
	type="button"
	onclick={() => (showConfirm = true)}
	class="mt-6 w-full rounded-2xl py-4 text-sm font-semibold text-white {accentColor}"
>
	Enregistrer
</button>

<!-- Modal confirmation -->
{#if showConfirm}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/30 pb-6" onclick={() => (showConfirm = false)}>
		<div class="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl" onclick={(e) => e.stopPropagation()}>
			<div class="mb-1 flex justify-center">
				<div class="h-1 w-10 rounded-full bg-navy/20"></div>
			</div>
			<button type="button" onclick={() => (showConfirm = false)} class="absolute top-4 right-4 text-navy/40 hover:text-navy">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
					<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
				</svg>
			</button>
			<h2 class="mt-4 text-center text-lg font-bold text-navy">Confirmer les modifications ?</h2>
			<p class="mt-1 text-center text-sm text-navy/50">Vos informations de profil<br />seront mises à jour.</p>
			<button
				type="button"
				onclick={save}
				disabled={saving}
				class="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold text-white disabled:opacity-60 {accentColor}"
			>
				{saving ? '...' : 'Enregistrer'}
			</button>
			<button type="button" onclick={() => (showConfirm = false)} class="mt-3 w-full py-2 text-sm text-navy/50">
				Annuler
			</button>
		</div>
	</div>
{/if}

<!-- Modal succès -->
{#if showSuccess}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/30 pb-6">
		<div class="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
			<div class="mb-1 flex justify-center">
				<div class="h-1 w-10 rounded-full bg-navy/20"></div>
			</div>
			<button type="button" onclick={() => (showSuccess = false)} class="absolute top-4 right-4 text-navy/40 hover:text-navy">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
					<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
				</svg>
			</button>
			<div class="mt-4 flex justify-center">
				<div class="flex h-14 w-14 items-center justify-center rounded-full {accentColor}">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-7 w-7 text-white">
						<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
					</svg>
				</div>
			</div>
			<h2 class="mt-4 text-center text-lg font-bold text-navy">Profil mis à jour avec succès</h2>
			<p class="mt-1 text-center text-sm text-navy/50">Vos informations ont bien été enregistrées.</p>
			<a
				href="/profile/settings"
				class="mt-5 flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-semibold text-white {accentColor}"
			>
				Retour aux paramètres
			</a>
		</div>
	</div>
{/if}
