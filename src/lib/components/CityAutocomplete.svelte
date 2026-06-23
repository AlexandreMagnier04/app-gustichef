<script lang="ts">
	import { untrack } from 'svelte';
	import { searchCommunes } from '$lib/services/geo.service';
	import imgPing from '$lib/assets/img/ping.png';

	let {
		value = '',
		onSelect,
		onClear
	}: {
		value?: string;
		onSelect: (city: string) => void;
		onClear: () => void;
	} = $props();

	const _value = untrack(() => value);
	let input = $state(_value);
	let suggestions = $state<{ nom: string; code: string }[]>([]);
	let showSuggestions = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function onInput() {
		clearTimeout(debounceTimer);
		if (!input) {
			suggestions = [];
			onClear();
			return;
		}
		debounceTimer = setTimeout(async () => {
			suggestions = await searchCommunes(input);
			showSuggestions = suggestions.length > 0;
		}, 150);
	}

	function select(nom: string) {
		input = nom;
		showSuggestions = false;
		onSelect(nom);
	}

	function clear() {
		input = '';
		suggestions = [];
		showSuggestions = false;
		onClear();
	}
</script>

<div class="relative inline-flex w-36">
	<img
		src={imgPing}
		alt=""
		class="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 object-contain"
	/>

	<input
		type="text"
		bind:value={input}
		oninput={onInput}
		onblur={() => {
			setTimeout(() => (showSuggestions = false), 150);
			if (input) onSelect(input);
		}}
		placeholder="ville"
		class="w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-7 pl-7 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy"
	/>

	{#if input}
		<button
			type="button"
			onclick={clear}
			class="absolute top-1/2 right-2 -translate-y-1/2 text-navy/30 hover:text-navy/60"
			aria-label="Effacer"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-3.5 w-3.5"
			>
				<path
					d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"
				/>
			</svg>
		</button>
	{/if}
</div>

{#if showSuggestions}
	<ul
		class="absolute top-full left-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
	>
		{#each suggestions as s (s.code)}
			<li>
				<button
					class="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-cream"
					onmousedown={() => select(s.nom)}
				>
					{s.nom}
				</button>
			</li>
		{/each}
	</ul>
{/if}
