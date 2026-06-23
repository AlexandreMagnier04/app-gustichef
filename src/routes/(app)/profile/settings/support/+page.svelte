<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const accentColor = $derived(data.isChief ? 'bg-rust' : 'bg-navy');

	const FAQS = [
		{ q: 'Comment réserver un chef ?' },
		{ q: 'Puis-je annuler ma réservation ?' },
		{ q: 'Comment contacter mon chef ?' },
		{ q: 'Que faire en cas de problème ?' }
	];

	let openIndex = $state<number | null>(null);
</script>

<!-- En-tête -->
<div class="flex items-center justify-between pt-2 pb-4">
	<a href="/profile/settings" aria-label="Retour" class="text-navy/50 hover:text-navy">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
			<path
				fill-rule="evenodd"
				d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
				clip-rule="evenodd"
			/>
		</svg>
	</a>
	<h1 class="text-base font-semibold text-navy">Aide & support</h1>
	<div class="w-5"></div>
</div>

<!-- FAQ -->
<div class="mb-6">
	<p class="mb-2 text-sm font-semibold text-navy">Foire aux questions</p>
	<p class="mb-3 text-xs text-navy/40">Mis à jour le 1er mai 2026 · v2.4</p>

	<div class="divide-y divide-navy/8 rounded-2xl border border-navy/8">
		{#each FAQS as faq, i (faq.q)}
			<button
				type="button"
				onclick={() => (openIndex = openIndex === i ? null : i)}
				class="flex w-full items-center justify-between px-4 py-3.5 text-left"
			>
				<span class="text-sm text-navy">{faq.q}</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="h-4 w-4 shrink-0 text-navy/25 transition-transform {openIndex === i
						? 'rotate-90'
						: ''}"
				>
					<path
						fill-rule="evenodd"
						d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		{/each}
	</div>
</div>

<!-- Contact -->
<div>
	<p class="mb-2 text-sm font-semibold text-navy">Contact</p>
	<div class="mb-4 rounded-2xl border border-navy/8 px-4 py-3.5">
		<p class="text-sm text-navy/60">support@gustichef.fr</p>
	</div>
	<a
		href="mailto:support@gustichef.fr"
		class="flex w-full items-center justify-center rounded-2xl py-4 text-sm font-semibold text-white {accentColor}"
	>
		Envoyer un message
	</a>
</div>
