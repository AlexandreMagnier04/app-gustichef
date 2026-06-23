<script lang="ts">
	import { validateChefStep1, registerChef } from '$lib/services/auth.service';
	import type { Specialty } from '$lib/models/chief.model';
	import logoGusti from '$lib/assets/img/gustichef-ecriture-orange.png';
	import logoGustiBlanc from '$lib/assets/img/gustichef-ecriture-blanc.png';
	import bgConfirm from '$lib/assets/img/portrait-1.jpeg';

	let { data } = $props<{ data: { specialties: Specialty[] } }>();

	// Dédoublonne : la DB peut contenir des spécialités en double, ce qui casse la clé du {#each}
	let availableSpecialties = $state<string[]>([
		...new Set(data.specialties.map((s: Specialty) => s.name_speciality))
	]);
	let customSpecialtyInput = $state('');

	function addCustomSpecialty() {
		const name = customSpecialtyInput.trim();
		if (!name || availableSpecialties.includes(name)) return;
		availableSpecialties = [...availableSpecialties, name];
		if (specialties.length < 3) specialties = [...specialties, name];
		customSpecialtyInput = '';
	}

	let step = $state(1);
	let loading = $state(false);
	let error = $state('');
	let fieldErrors = $state<Record<string, string>>({});

	// Étape 1
	let firstname = $state('');
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	// Étape 2
	let profilePhotoPreview = $state<string | null>(null);
	let bio = $state('');
	let specialties = $state<string[]>([]);

	// Étape 3 (UI uniquement — MinIO requis)
	let siret = $state('');
	let idFrontPreview = $state<string | null>(null);
	let idBackPreview = $state<string | null>(null);

	// Étape 4
	let cities = $state<string[]>([]);
	let cityInput = $state('');
	let radius = $state(40);
	let minPrice = $state('');
	let minGuests = $state(4);

	function toggleSpecialty(s: string) {
		if (specialties.includes(s)) {
			specialties = specialties.filter((x) => x !== s);
		} else if (specialties.length < 3) {
			specialties = [...specialties, s];
		}
	}

	function handlePhotoChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		profilePhotoPreview = URL.createObjectURL(file);
	}

	function handleIdFront(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) idFrontPreview = URL.createObjectURL(file);
	}

	function handleIdBack(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) idBackPreview = URL.createObjectURL(file);
	}

	function addCity(e?: KeyboardEvent) {
		if (e && e.key !== 'Enter') return;
		e?.preventDefault();
		const city = cityInput.trim();
		if (city && !cities.includes(city)) {
			cities = [...cities, city];
			cityInput = '';
		}
	}

	function removeCity(c: string) {
		cities = cities.filter((x) => x !== c);
	}

	function nextStep() {
		error = '';
		fieldErrors = {};
		if (step === 1) {
			const errs = validateChefStep1({ firstname, name, email, password, confirmPassword });
			if (Object.keys(errs).length > 0) {
				fieldErrors = errs;
				return;
			}
		}
		step++;
	}

	async function handleSubmit() {
		error = '';
		loading = true;

		const result = await registerChef({
			firstname,
			name,
			email,
			password,
			cities,
			bio,
			specialties,
			siret
		});

		loading = false;
		if (result.error) {
			error = result.error;
			return;
		}
		step = 5;
	}
</script>

{#if step <= 4}
	<div class="flex min-h-dvh flex-col bg-cream px-6 pt-10 pb-12">
		<!-- Header logo -->
		<div class="mb-6 flex flex-col items-center gap-2">
			{#if step === 1}
				<p class="text-sm text-rust/80">Bienvenue sur</p>
			{/if}
			<img src={logoGusti} alt="Gustichef" class="{step === 1 ? 'h-12' : 'h-8'} object-contain" />
		</div>

		<!-- Dots de progression -->
		<div class="mb-6 flex items-center justify-center gap-2">
			{#each [1, 2, 3, 4, 5] as i (i)}
				<div
					class="rounded-full transition-all duration-200 {i < step
						? 'h-2 w-2 bg-rust'
						: i === step
							? 'h-3 w-3 bg-rust'
							: 'h-2 w-2 bg-gray-300'}"
				></div>
			{/each}
		</div>

		{#if error}
			<p class="mb-4 text-sm text-rust">{error}</p>
		{/if}

		<!-- Étape 1 — Informations de compte -->
		{#if step === 1}
			<h2 class="mb-1 text-base font-semibold text-navy">Créer mon compte Chef</h2>
			<p class="mb-6 text-xs text-gray-500">Étape 1/5 — Informations de compte</p>

			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Prénom</label>
					<input
						type="text"
						bind:value={firstname}
						placeholder="ex : Marie"
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
					/>
					{#if fieldErrors.firstname}<p class="text-xs text-rust">{fieldErrors.firstname}</p>{/if}
				</div>
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Nom</label>
					<input
						type="text"
						bind:value={name}
						placeholder="ex : Dupont"
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
					/>
					{#if fieldErrors.name}<p class="text-xs text-rust">{fieldErrors.name}</p>{/if}
				</div>
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Adresse mail</label>
					<input
						type="email"
						bind:value={email}
						placeholder="votre adresse mail"
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
					/>
					{#if fieldErrors.email}<p class="text-xs text-rust">{fieldErrors.email}</p>{/if}
				</div>
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Mot de passe</label>
					<input
						type="password"
						bind:value={password}
						placeholder="••••••••"
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
					/>
					{#if fieldErrors.password}<p class="text-xs text-rust">{fieldErrors.password}</p>{/if}
				</div>
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Confirmer le mot de passe</label>
					<input
						type="password"
						bind:value={confirmPassword}
						placeholder="••••••••"
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
					/>
					{#if fieldErrors.confirmPassword}<p class="text-xs text-rust">
							{fieldErrors.confirmPassword}
						</p>{/if}
				</div>
			</div>

			<button
				type="button"
				onclick={nextStep}
				class="mt-6 w-full rounded-xl bg-rust py-3 text-sm font-medium text-white"
			>
				Continuer
			</button>

			<p class="mt-5 text-center text-xs text-gray-500">
				Déjà inscrit ?
				<a href="/login" class="font-medium text-navy">Se connecter</a>
			</p>
		{:else if step === 2}
			<!-- Étape 2 — Profil professionnel -->
			<h2 class="mb-1 text-base font-semibold text-navy">Profil professionnel</h2>
			<p class="mb-6 text-xs text-gray-500">Étape 2/5 — Personnalise ton profil</p>

			<div class="flex flex-col gap-5">
				<div class="flex flex-col items-center gap-2">
					<label class="text-xs font-medium text-navy/70">Photo de profil</label>
					<label
						class="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-rust/50 bg-white hover:bg-rust/5"
					>
						{#if profilePhotoPreview}
							<img
								src={profilePhotoPreview}
								alt=""
								class="h-full w-full rounded-full object-cover"
							/>
						{:else}
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								class="h-8 w-8 text-rust/50"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M12 4v16m8-8H4"
								/>
							</svg>
						{/if}
						<input type="file" accept="image/*" onchange={handlePhotoChange} class="hidden" />
					</label>
					<span class="text-xs text-gray-400">Ajouter une photo</span>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Titre professionnel (optionnel)</label>
					<input
						type="text"
						bind:value={bio}
						placeholder="ex : Chef pâtissier, Traiteur..."
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-xs font-medium text-navy/70"
						>Spécialités <span class="text-gray-400">(3 max)</span></label
					>
					<div class="flex flex-wrap gap-2">
						{#each availableSpecialties as s (s)}
							<button
								type="button"
								onclick={() => toggleSpecialty(s)}
								class="rounded-full border px-3 py-1 text-xs transition-colors {specialties.includes(
									s
								)
									? 'border-rust bg-rust text-white'
									: 'border-gray-200 bg-white text-navy/70'}"
							>
								{s}
							</button>
						{/each}
					</div>
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={customSpecialtyInput}
							placeholder="Ajouter une spécialité..."
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSpecialty())}
							class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rust"
						/>
						<button
							type="button"
							onclick={addCustomSpecialty}
							class="rounded-lg bg-rust px-4 text-sm font-medium text-white"
						>
							+
						</button>
					</div>
				</div>
			</div>

			<div class="mt-8 flex gap-3">
				<button
					type="button"
					onclick={() => step--}
					class="flex-1 rounded-xl border border-rust py-3 text-sm font-medium text-rust"
				>
					Précédent
				</button>
				<button
					type="button"
					onclick={nextStep}
					class="flex-1 rounded-xl bg-rust py-3 text-sm font-medium text-white"
				>
					Continuer
				</button>
			</div>
		{:else if step === 3}
			<!-- Étape 3 — Vérification identité -->
			<h2 class="mb-1 text-base font-semibold text-navy">Vérification identité</h2>
			<p class="mb-6 text-xs text-gray-500">Étape 3/5 — Sécurisez votre compte</p>

			<div class="flex flex-col gap-5">
				<div class="flex flex-col gap-2">
					<label class="text-xs font-medium text-navy/70">Pièce d'identité</label>
					<div class="flex gap-3">
						<label
							class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-5 text-xs text-gray-400 hover:border-rust/40"
						>
							{#if idFrontPreview}
								<img src={idFrontPreview} alt="" class="h-16 w-full rounded-lg object-cover" />
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
									<rect x="3" y="3" width="18" height="18" rx="2" stroke-width="1.5" />
									<path d="M9 9h6M9 12h6M9 15h3" stroke-linecap="round" stroke-width="1.5" />
								</svg>
							{/if}
							<span class="font-medium text-rust">+ Ajouter</span>
							<span>Recto</span>
							<input type="file" accept="image/*" onchange={handleIdFront} class="hidden" />
						</label>
						<label
							class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-5 text-xs text-gray-400 hover:border-rust/40"
						>
							{#if idBackPreview}
								<img src={idBackPreview} alt="" class="h-16 w-full rounded-lg object-cover" />
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
									<rect x="3" y="3" width="18" height="18" rx="2" stroke-width="1.5" />
									<path d="M9 9h6M9 12h6M9 15h3" stroke-linecap="round" stroke-width="1.5" />
								</svg>
							{/if}
							<span class="font-medium text-rust">+ Ajouter</span>
							<span>Verso</span>
							<input type="file" accept="image/*" onchange={handleIdBack} class="hidden" />
						</label>
					</div>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Numéro SIRET (optionnel)</label>
					<input
						type="text"
						bind:value={siret}
						placeholder="ex : 123 456 789 00010"
						class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-xs font-medium text-navy/70">Certificat HACCP (optionnel)</label>
					<label
						class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-5 text-xs text-gray-400 hover:border-rust/40"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
							<path
								d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75a2.25 2.25 0 0 0-.1-.664"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
						<span class="font-medium text-rust">+ Ajouter</span>
						<span>Recto</span>
						<input type="file" accept="image/*,.pdf" class="hidden" />
					</label>
				</div>
			</div>

			<div class="mt-8 flex gap-3">
				<button
					type="button"
					onclick={() => step--}
					class="flex-1 rounded-xl border border-rust py-3 text-sm font-medium text-rust"
				>
					Précédent
				</button>
				<button
					type="button"
					onclick={nextStep}
					class="flex-1 rounded-xl bg-rust py-3 text-sm font-medium text-white"
				>
					Continuer
				</button>
			</div>
		{:else if step === 4}
			<!-- Étape 4 — Zone & Tarifs -->
			<h2 class="mb-1 text-base font-semibold text-navy">Zone & Tarifs</h2>
			<p class="mb-6 text-xs text-gray-500">Étape 4/5 — Définis ta zone et tes prix</p>

			<div class="flex flex-col gap-5">
				<div class="flex flex-col gap-2">
					<label class="text-xs font-medium text-navy/70">Villes d'intervention</label>
					<p class="text-xs text-gray-400">Ajoute toutes les villes où tu peux intervenir</p>
					<div class="flex flex-wrap gap-2">
						{#each cities as city (city)}
							<span
								class="flex items-center gap-1 rounded-full bg-navy/10 px-3 py-1 text-xs text-navy"
							>
								{city}
								<button
									type="button"
									onclick={() => removeCity(city)}
									class="text-navy/50 hover:text-navy"
								>
									×
								</button>
							</span>
						{/each}
					</div>
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={cityInput}
							placeholder="ex : Marseille, Bordeaux..."
							onkeydown={addCity}
							class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
						/>
						<button
							type="button"
							onclick={() => addCity()}
							class="rounded-lg bg-rust px-4 text-sm font-medium text-white"
						>
							+ Ajouter
						</button>
					</div>
				</div>

				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<label class="text-xs font-medium text-navy/70">Rayon de déplacement</label>
						<span class="text-xs font-semibold text-rust">{radius} km</span>
					</div>
					<div class="flex items-center gap-2 text-xs text-gray-400">
						<span>10 km</span>
						<input
							type="range"
							bind:value={radius}
							min="10"
							max="100"
							step="5"
							class="flex-1 accent-rust"
						/>
						<span>100 km</span>
					</div>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium text-navy/70">Prix minimum / convive</label>
					<div class="flex items-center gap-2">
						<input
							type="number"
							bind:value={minPrice}
							placeholder="ex : 45"
							min="0"
							class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rust"
						/>
						<span class="text-sm text-navy/50">€ par personne</span>
					</div>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-xs font-medium text-navy/70">Nombre minimum de convives</label>
					<div class="flex items-center gap-4">
						<button
							type="button"
							onclick={() => (minGuests = Math.max(1, minGuests - 1))}
							class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-navy"
						>
							−
						</button>
						<span class="w-8 text-center text-sm font-semibold text-navy">{minGuests}</span>
						<button
							type="button"
							onclick={() => (minGuests = minGuests + 1)}
							class="flex h-9 w-9 items-center justify-center rounded-full bg-rust text-lg text-white"
						>
							+
						</button>
					</div>
				</div>
			</div>

			<p class="mt-6 text-center text-xs text-gray-400">
				En créant votre compte, vous acceptez les
				<a href="/cgu" class="underline">Conditions d'utilisation</a>
				et la
				<a href="/confidentialite" class="underline">Politique de confidentialité</a>
				de l'application.
			</p>

			<div class="mt-4 flex gap-3">
				<button
					type="button"
					onclick={() => step--}
					disabled={loading}
					class="flex-1 rounded-xl border border-rust py-3 text-sm font-medium text-rust disabled:opacity-60"
				>
					Précédent
				</button>
				<button
					type="button"
					onclick={handleSubmit}
					disabled={loading}
					class="flex-1 rounded-xl bg-rust py-3 text-sm font-medium text-white disabled:opacity-60"
				>
					{loading ? 'Création...' : 'Continuer'}
				</button>
			</div>

			{#if error}
				<p class="mt-3 text-sm text-rust">{error}</p>
			{/if}
		{/if}
	</div>

	<!-- Étape 5 — Confirmation -->
{:else}
	<div class="relative flex h-dvh flex-col overflow-hidden">
		<img src={bgConfirm} alt="" class="absolute inset-0 h-full w-full object-cover" />
		<div class="absolute inset-0 bg-navy/70"></div>

		<div class="relative z-10 flex h-full flex-col">
			<div class="flex flex-1 flex-col items-center justify-end pb-8">
				<img src={logoGustiBlanc} alt="Gustichef" class="h-14 object-contain" />

				<div class="mt-8 flex gap-2">
					{#each [1, 2, 3, 4, 5] as i (i)}
						<div class="rounded-full {i === 5 ? 'h-3 w-3 bg-rust' : 'h-2 w-2 bg-white/30'}"></div>
					{/each}
				</div>
			</div>

			<div class="rounded-t-3xl bg-cream px-6 pt-8 pb-10 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rust">
					<svg viewBox="0 0 24 24" fill="none" class="h-8 w-8" aria-hidden="true">
						<path
							d="M5 13l4 4L19 7"
							stroke="white"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>
				<h2 class="mb-1 text-base font-semibold text-navy">Profil en cours de vérification</h2>
				<p class="mb-4 text-sm font-medium text-rust">(24-48h)</p>
				<div class="mb-6 h-px w-full bg-gray-200"></div>
				<p class="mb-8 text-sm text-gray-500">
					Vous recevrez un email dès validation de votre profil chef.
				</p>
				<a href="/login" class="block w-full rounded-xl bg-rust py-3 text-sm font-medium text-white"
					>Retour à la connexion
				</a>
			</div>
		</div>
	</div>
{/if}
