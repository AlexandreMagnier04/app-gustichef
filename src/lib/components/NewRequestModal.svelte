<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import CityAutocomplete from './CityAutocomplete.svelte';
	import DatePicker from './DatePicker.svelte';

	import type { Request } from '$lib/models/customer.model';

	let {
		open = $bindable(false),
		initialRequest = null
	}: {
		open?: boolean;
		initialRequest?: Request | null;
	} = $props();

	const EVENT_TYPES = [
		'Dîner privé',
		'Déjeuner',
		'Brunch',
		'Anniversaire',
		'Mariage',
		'Séminaire',
		'Cocktail',
		'Barbecue',
		'Chef à domicile',
		'Autre'
	];

	const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50];

	let step = $state<1 | 2>(1);
	let guests = $state('');
	let date = $state('');
	let time = $state('');
	let eventType = $state('');
	let city = $state('');
	let title = $state('');
	let description = $state('');
	let submitting = $state(false);
	let step1Submitted = $state(false);
	let error = $state('');

	const isEdit = $derived(!!initialRequest);

	// Erreur step 1 calculée en temps réel
	const step1Error = $derived(
		step1Submitted && (!date || !guests || !city)
			? 'Veuillez renseigner la date, les convives et la ville.'
			: ''
	);

	$effect(() => {
		if (open && initialRequest) {
			guests = String(initialRequest.guests_request);
			date = initialRequest.expected_date_request;
			eventType = initialRequest.type_event_request ?? '';
			city = initialRequest.localization_request;
			title = initialRequest.title_request;
			description = initialRequest.description_request;
			step = 1;
		}
	});

	function reset() {
		step = 1;
		guests = '';
		date = '';
		time = '';
		eventType = '';
		city = '';
		title = '';
		description = '';
		error = '';
		step1Submitted = false;
		submitting = false;
	}

	function close() {
		reset();
		open = false;
	}

	function toStep2(e: Event) {
		e.preventDefault();
		step1Submitted = true;
		if (!date || !guests || !city) return;
		step = 2;
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!title) {
			error = 'Veuillez remplir tous les champs.';
			return;
		}
		error = '';
		submitting = true;

		const url = isEdit ? `/api/requests/${initialRequest!.id_request}` : '/api/requests';
		const res = await fetch(url, {
			method: isEdit ? 'PATCH' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title_request: title,
				description_request: description,
				expected_date_request: date,
				guests_request: Number(guests),
				type_event_request: eventType || undefined,
				localization_request: city
			})
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			error = data?.error ? Object.values(data.error).flat().join(' ') : 'Une erreur est survenue.';
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

	<!-- Modal bottom sheet -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white pb-8"
		role="dialog"
		aria-modal="true"
	>
		<!-- Handle -->
		<div class="flex justify-center pt-3 pb-2">
			<div class="h-1 w-10 rounded-full bg-navy/20"></div>
		</div>

		<!-- Close button -->
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

		<div class="px-6 pt-2">
			<!-- Titre + progress -->
			<h2 class="text-lg font-semibold text-navy">
				{isEdit ? 'Modifier la demande' : 'Nouvelle demande'}
			</h2>
			<div class="mt-2 flex items-center gap-1.5">
				<span class="h-2 w-6 rounded-full {step >= 1 ? 'bg-teal' : 'bg-navy/20'}"></span>
				<span class="h-2 w-2 rounded-full {step >= 2 ? 'bg-teal' : 'bg-navy/20'}"></span>
			</div>
			<p class="mt-1 text-xs text-navy/50">Étape {step}/2</p>

			<div class="my-3 h-px bg-navy/10"></div>

			{#if step === 1}
				<form onsubmit={toStep2} class="flex flex-col gap-5">
					<!-- Date + Heure côte à côte -->
					<div>
						<p class="mb-1.5 block text-sm font-medium text-navy">Date et heure</p>
						<div class="flex gap-2">
							<div class="flex-1">
								<DatePicker
									bind:value={date}
									onSelect={(v) => (date = v)}
									min={new Date().toISOString().split('T')[0]}
									placeholder="Choisir une date"
								/>
							</div>
							<input
								id="nreq-time"
								type="time"
								bind:value={time}
								class="w-28 shrink-0 rounded-full border border-navy/20 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-teal"
							/>
						</div>
					</div>

					<!-- Convives -->
					<div>
						<label for="nreq-guests" class="mb-1.5 block text-sm font-medium text-navy">Nombre de convives</label>
						<div class="relative">
							<select
								id="nreq-guests"
								bind:value={guests}
								required
								class="w-full appearance-none rounded-full border border-navy/20 bg-white py-2.5 pr-10 pl-4 text-sm text-navy outline-none focus:border-teal"
							>
								<option value="">Convives</option>
								{#each GUEST_OPTIONS as n (n)}
									<option value={String(n)}>{n} personne{n > 1 ? 's' : ''}</option>
								{/each}
							</select>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-navy/40"
							>
								<path
									fill-rule="evenodd"
									d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					</div>

					<!-- Ville -->
					<div>
						<p class="mb-1.5 block text-sm font-medium text-navy">Choisissez votre ville</p>
						{#if city}
							<div
								class="flex items-center gap-2 rounded-full border border-teal bg-white py-2.5 pr-3 pl-4"
							>
								<span class="flex-1 text-sm text-navy">{city}</span>
								<button
									type="button"
									onclick={() => (city = '')}
									class="flex h-5 w-5 items-center justify-center rounded-full bg-navy/10 text-navy/60"
									aria-label="Effacer"
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
							</div>
						{:else}
							<div class="rounded-full border border-navy/20 bg-white px-4 py-2.5">
								<CityAutocomplete
									value={city}
									onSelect={(v) => (city = v)}
									onClear={() => (city = '')}
								/>
							</div>
						{/if}
					</div>

					<!-- Type d'événement -->
					<div>
						<label for="nreq-event-type" class="mb-1.5 block text-sm font-medium text-navy">Type d'événement</label>
						<div class="relative">
							<select
								id="nreq-event-type"
								bind:value={eventType}
								class="w-full appearance-none rounded-full border border-navy/20 bg-white py-2.5 pr-10 pl-4 text-sm text-navy outline-none focus:border-teal"
							>
								<option value="">Événement</option>
								{#each EVENT_TYPES as t (t)}
									<option value={t}>{t}</option>
								{/each}
							</select>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-navy/40"
							>
								<path
									fill-rule="evenodd"
									d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					</div>

					{#if step1Error}
						<p class="text-sm text-rust">{step1Error}</p>
					{/if}

					<button
						type="submit"
						class="w-full rounded-xl bg-navy py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity active:opacity-80"
					>
						Continuer
					</button>
				</form>
			{:else}
				<form onsubmit={submit} class="flex flex-col gap-5">
					<!-- Titre -->
					<div>
						<label for="nreq-title" class="mb-1.5 block text-sm font-medium text-navy">Titre d'événement</label>
						<input
							id="nreq-title"
							type="text"
							bind:value={title}
							required
							maxlength="100"
							placeholder="Titre du post"
							class="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-teal"
						/>
					</div>

					<!-- Description -->
					<div>
						<label for="nreq-description" class="mb-1.5 block text-sm font-medium text-navy"
							>Décrivez votre événement</label
						>
						<textarea
							id="nreq-description"
							bind:value={description}
							maxlength="2000"
							rows="5"
							placeholder="Dites-nous tout ! Quel moment souhaitez-vous partager ? Décrivez l'ambiance de votre événement et vos envies gourmandes pour que nos chefs puissent vous proposer l'expérience parfaite."
							class="w-full resize-none rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-teal"
						></textarea>
					</div>

					{#if error}
						<p class="text-sm text-rust">{error}</p>
					{/if}

					<div class="flex gap-3">
						<button
							type="button"
							onclick={() => {
								step = 1;
								error = '';
							}}
							class="flex-1 rounded-xl border border-navy/20 py-3.5 text-sm font-medium text-navy/70 transition-opacity active:opacity-70"
						>
							Retour
						</button>
						<button
							type="submit"
							disabled={submitting}
							class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal py-3.5 text-sm font-semibold text-cream shadow-sm transition-opacity active:opacity-80 disabled:opacity-60"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="h-4 w-4"
							>
								<path
									d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z"
								/>
							</svg>
							{submitting ? 'Envoi...' : isEdit ? 'Enregistrer' : 'Envoyer ma proposition'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
