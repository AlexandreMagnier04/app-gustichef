<script lang="ts">
	import type { ConversationListItem } from '$lib/models/messaging.model';

	import { untrack } from 'svelte';

	let { data } = $props();

	const pageData = untrack(() => data);
	const isChief = pageData.user?.role === 'chief';

	// Tabs differ by role
	const CHIEF_TABS = ['Tous', 'À répondre', 'Devis envoyé', 'Confirmé'] as const;
	const CUSTOMER_TABS = ['Tous', 'En attente', 'Devis reçu', 'Confirmé'] as const;
	const TABS = isChief ? CHIEF_TABS : CUSTOMER_TABS;

	const TAB_STATUT: Record<string, string | null> = isChief
		? {
				Tous: null,
				'À répondre': 'a_repondre',
				'Devis envoyé': 'devis_envoye',
				Confirmé: 'confirme'
			}
		: {
				Tous: null,
				'En attente': 'a_repondre',
				'Devis reçu': 'devis_envoye',
				Confirmé: 'confirme'
			};

	let activeTab = $state('Tous');

	const filtered = $derived(
		activeTab === 'Tous'
			? (pageData.conversations as ConversationListItem[])
			: (pageData.conversations as ConversationListItem[]).filter(
					(c) => c.statut === TAB_STATUT[activeTab]
				)
	);

	// Labels differ by role
	const STATUT_LABELS: Record<string, { label: string; color: string }> = isChief
		? {
				a_repondre: { label: 'À répondre', color: 'bg-rust/15 text-rust' },
				devis_envoye: { label: 'Devis envoyé', color: 'bg-navy/10 text-navy/70' },
				paiement_requis: { label: 'En attente', color: 'bg-olive/20 text-olive' },
				confirme: { label: 'Confirmé', color: 'bg-green-500/15 text-green-600' },
				refuse: { label: 'Refusé', color: 'bg-navy/10 text-navy/40' }
			}
		: {
				a_repondre: { label: 'En attente', color: 'bg-olive/20 text-olive' },
				devis_envoye: { label: 'Devis reçu', color: 'bg-rust/15 text-rust' },
				paiement_requis: { label: 'En attente', color: 'bg-olive/20 text-olive' },
				confirme: { label: 'Confirmé', color: 'bg-green-500/15 text-green-600' },
				refuse: { label: 'Refusé', color: 'bg-navy/10 text-navy/40' }
			};

	function formatTime(d: string | Date): string {
		const date = new Date(d);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		if (diff < 86400000)
			return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
		if (diff < 604800000)
			return ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'][date.getDay()];
		return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
	}
</script>

<div class="-mx-5 -mt-3 flex flex-col">
	<!-- Tabs -->
	<div class="scrollbar-none flex gap-2 overflow-x-auto border-b border-navy/[0.07] px-4 pt-2 pb-0">
		{#each TABS as tab (tab)}
			<button
				type="button"
				onclick={() => (activeTab = tab)}
				class="shrink-0 border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors {activeTab ===
				tab
					? 'border-rust text-navy'
					: 'border-transparent text-navy/40'}"
			>
				{tab}
			</button>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center px-8 py-20 text-center">
			<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/5">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-8 w-8 text-navy/30"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
					/>
				</svg>
			</div>
			<p class="font-medium text-navy/60">Aucune conversation</p>
		</div>
	{:else}
		<ul class="divide-y divide-navy/[0.06]">
			{#each filtered as conv (conv.id_conversation)}
				{@const statut = STATUT_LABELS[conv.statut] ?? {
					label: conv.statut,
					color: 'bg-navy/10 text-navy/50'
				}}
				<li>
					<a
						href="/messages/{conv.id_conversation}"
						class="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-navy/[0.02] active:bg-navy/[0.04]"
					>
						<!-- Avatar -->
						{#if conv.other_image}
							<img
								src={conv.other_image}
								alt=""
								class="h-12 w-12 shrink-0 rounded-full object-cover"
							/>
						{:else}
							<div
								class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream text-lg font-semibold text-navy/40"
							>
								{conv.other_firstname[0] ?? '?'}
							</div>
						{/if}

						<!-- Content -->
						<div class="min-w-0 flex-1">
							<div class="flex items-baseline justify-between gap-2">
								<span class="truncate text-[14px] font-semibold text-navy"
									>{conv.other_firstname} {conv.other_name}</span
								>
								<span class="shrink-0 text-[11px] text-navy/40"
									>{formatTime(conv.last_message_at)}</span
								>
							</div>

							<!-- Service context -->
							{#if conv.request_title}
								<p class="mt-0.5 text-[12px] text-navy/50">
									{conv.request_title}{conv.request_guests ? ` · ${conv.request_guests} pers.` : ''}
								</p>
							{/if}

							<!-- Statut badge -->
							<span
								class="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold {statut.color}"
							>
								{statut.label}
							</span>

							<!-- Last message -->
							{#if conv.last_message}
								<p class="mt-1 truncate text-[12px] text-navy/50">{conv.last_message}</p>
							{/if}
						</div>

						<!-- Unread badge -->
						{#if conv.unread_count > 0}
							<span
								class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rust text-[10px] font-bold text-white"
							>
								{conv.unread_count}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
