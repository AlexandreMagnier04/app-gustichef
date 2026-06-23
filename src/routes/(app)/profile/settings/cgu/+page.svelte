<script lang="ts">
	let { data } = $props();
	let activeTab = $state<'cgu' | 'confidentialite'>('cgu');
	const btnColor = $derived(data.isChief ? 'bg-rust' : 'bg-navy');
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
	<h1 class="text-base font-semibold text-navy">Conditions d'utilisation</h1>
	<div class="w-5"></div>
</div>

<!-- Tabs -->
<div class="mb-4 flex rounded-full bg-navy/8 p-1">
	<button
		type="button"
		onclick={() => (activeTab = 'cgu')}
		class="flex-1 rounded-full py-1.5 text-sm font-medium transition-colors {activeTab === 'cgu'
			? 'bg-navy text-white'
			: 'text-navy/50'}"
	>
		CGU
	</button>
	<button
		type="button"
		onclick={() => (activeTab = 'confidentialite')}
		class="flex-1 rounded-full py-1.5 text-sm font-medium transition-colors {activeTab ===
		'confidentialite'
			? 'bg-navy text-white'
			: 'text-navy/50'}"
	>
		Confidentialité
	</button>
</div>

<p class="mb-4 text-xs text-navy/40">Mis à jour le 1er mai 2026 · v2.4</p>

{#if activeTab === 'cgu'}
	<div class="flex flex-col gap-5">
		<section>
			<h2 class="mb-1.5 text-sm font-semibold text-navy">Le service</h2>
			<p class="text-sm leading-relaxed text-navy/60">
				GustiChef met en relation clients et chefs à domicile. Nous ne sommes pas partie aux
				prestations.
			</p>
		</section>

		<section>
			<h2 class="mb-1.5 text-sm font-semibold text-navy">Le service</h2>
			<p class="text-sm leading-relaxed text-navy/60">
				Remboursement intégral si l'utilisateur est responsable de ses réservations et du respect de
				ses engagements envers le chef · 72h.
			</p>
		</section>

		<section>
			<h2 class="mb-1.5 text-sm font-semibold text-navy">Données personnelles (RGPD)</h2>
			<p class="text-sm leading-relaxed text-navy/60">
				Vos données sont traitées conformément au RGPD. Vous disposez d'un droit d'accès, de
				modification et de suppression à tout moment.
			</p>
		</section>
	</div>

	<button
		type="button"
		class="mt-8 flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-semibold text-white {btnColor}"
	>
		voir tout nos CGU
	</button>
{:else}
	<div class="flex flex-col gap-5">
		<section>
			<h2 class="mb-1.5 text-sm font-semibold text-navy">Collecte des données</h2>
			<p class="text-sm leading-relaxed text-navy/60">
				Nous collectons uniquement les données nécessaires au fonctionnement du service : nom,
				email, localisation et historique de réservations.
			</p>
		</section>

		<section>
			<h2 class="mb-1.5 text-sm font-semibold text-navy">Utilisation</h2>
			<p class="text-sm leading-relaxed text-navy/60">
				Vos données ne sont jamais revendues à des tiers. Elles sont utilisées exclusivement pour
				améliorer votre expérience sur GustiChef.
			</p>
		</section>

		<section>
			<h2 class="mb-1.5 text-sm font-semibold text-navy">Vos droits</h2>
			<p class="text-sm leading-relaxed text-navy/60">
				Conformément au RGPD, vous pouvez demander l'accès, la rectification ou la suppression de
				vos données à tout moment via support@gustichef.fr.
			</p>
		</section>
	</div>

	<button
		type="button"
		class="mt-8 flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-semibold text-white {btnColor}"
	>
		voir toute notre politique
	</button>
{/if}
