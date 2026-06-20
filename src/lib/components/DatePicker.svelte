<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';

	let {
		value = $bindable(''),
		min = '',
		placeholder = 'Choisir une date',
		onSelect = undefined
	}: {
		value?: string;
		min?: string;
		placeholder?: string;
		onSelect?: (v: string) => void;
	} = $props();

	const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
	const MONTHS = [
		'Janvier',
		'Février',
		'Mars',
		'Avril',
		'Mai',
		'Juin',
		'Juillet',
		'Août',
		'Septembre',
		'Octobre',
		'Novembre',
		'Décembre'
	];

	let open = $state(false);

	const today = new SvelteDate();
	today.setHours(0, 0, 0, 0);

	const minDate = $derived(min ? new Date(min + 'T00:00:00') : today);
	const selected = $derived(value ? new Date(value + 'T00:00:00') : null);

	let viewYear = $state(today.getFullYear());
	let viewMonth = $state(today.getMonth());

	// Jours du mois affiché (avec padding début/fin)
	const days = $derived(() => {
		const first = new Date(viewYear, viewMonth, 1);
		// Lundi = 0
		const startPad = (first.getDay() + 6) % 7;
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		const cells: Array<{ date: Date | null; day: number | null }> = [];

		for (let i = 0; i < startPad; i++) cells.push({ date: null, day: null });
		for (let d = 1; d <= daysInMonth; d++) {
			cells.push({ date: new Date(viewYear, viewMonth, d), day: d });
		}
		return cells;
	});

	function prevMonth() {
		if (viewMonth === 0) {
			viewMonth = 11;
			viewYear--;
		} else viewMonth--;
	}

	function nextMonth() {
		if (viewMonth === 11) {
			viewMonth = 0;
			viewYear++;
		} else viewMonth++;
	}

	function select(date: Date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		const formatted = `${y}-${m}-${d}`;
		value = formatted;
		onSelect?.(formatted);
		open = false;
	}

	function isDisabled(date: Date) {
		return date < minDate;
	}

	function isSelected(date: Date) {
		return selected ? date.toDateString() === selected.toDateString() : false;
	}

	function isToday(date: Date) {
		return date.toDateString() === today.toDateString();
	}

	const displayValue = $derived(
		selected
			? selected.toLocaleDateString('fr-FR', {
					weekday: 'long',
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})
			: ''
	);
</script>

<div class="relative">
	<!-- Trigger -->
	<button
		type="button"
		onclick={() => (open = !open)}
		class="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm transition-colors {open
			? 'border-rust'
			: 'border-navy/15'}"
	>
		{#if displayValue}
			<span class="text-navy capitalize">{displayValue}</span>
		{:else}
			<span class="text-navy/30">{placeholder}</span>
		{/if}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			class="h-4 w-4 shrink-0 text-navy/40"
		>
			<path
				fill-rule="evenodd"
				d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>

	<!-- Calendrier -->
	{#if open}
		<div
			class="absolute right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-xl"
		>
			<!-- Navigation mois -->
			<div class="flex items-center justify-between border-b border-navy/8 px-4 py-3">
				<button
					type="button"
					onclick={prevMonth}
					aria-label="Mois précédent"
					class="flex h-8 w-8 items-center justify-center rounded-full text-navy/50 hover:bg-navy/8 active:bg-navy/15"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-4 w-4"
					>
						<path
							fill-rule="evenodd"
							d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<span class="text-sm font-semibold text-navy">{MONTHS[viewMonth]} {viewYear}</span>
				<button
					type="button"
					onclick={nextMonth}
					aria-label="Mois suivant"
					class="flex h-8 w-8 items-center justify-center rounded-full text-navy/50 hover:bg-navy/8 active:bg-navy/15"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-4 w-4"
					>
						<path
							fill-rule="evenodd"
							d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>

			<!-- En-têtes jours -->
			<div class="grid grid-cols-7 border-b border-navy/8 px-2 py-2">
				{#each DAYS as d (d)}
					<div class="text-center text-[11px] font-semibold text-navy/40">{d}</div>
				{/each}
			</div>

			<!-- Grille des jours -->
			<div class="grid grid-cols-7 gap-0.5 p-2">
				{#each days() as cell, i (i)}
					{#if cell.date === null}
						<div></div>
					{:else}
						{@const disabled = isDisabled(cell.date)}
						{@const sel = isSelected(cell.date)}
						{@const tod = isToday(cell.date)}
						<button
							type="button"
							onclick={() => !disabled && select(cell.date!)}
							{disabled}
							class="flex h-9 w-full items-center justify-center rounded-xl text-[13px] font-medium transition-colors
								{sel ? 'bg-rust font-semibold text-white' : ''}
								{!sel && tod ? 'border border-rust/40 text-rust' : ''}
								{!sel && !tod && !disabled ? 'text-navy hover:bg-navy/8' : ''}
								{disabled ? 'cursor-not-allowed text-navy/20' : ''}"
						>
							{cell.day}
						</button>
					{/if}
				{/each}
			</div>
			<div class="px-3 pb-3">
				<button
					type="button"
					onclick={() => (open = false)}
					class="w-full rounded-xl bg-navy/5 py-2 text-[13px] font-medium text-navy/50 hover:bg-navy/10"
				>
					Fermer
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- Fermer en cliquant ailleurs -->
{#if open}
	<button
		class="fixed inset-0 z-40"
		onclick={() => (open = false)}
		aria-label="Fermer le calendrier"
		tabindex="-1"
	></button>
{/if}
