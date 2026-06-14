<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { ConversationDetail, MessageItem } from '$lib/server/services/messaging';

	let { data } = $props();

	const conv = $derived(data.conv as ConversationDetail);
	const isChief = $derived(data.user?.role === 'chief');
	const myId = $derived(data.user?.id ?? '');

	let messageText = $state('');
	let sending = $state(false);
	let showMenuPicker = $state(false);
	let accepting = $state(false);
	let refusing = $state(false);

	onMount(() => {
		scrollToBottom();
	});

	function scrollToBottom() {
		setTimeout(() => {
			const el = document.getElementById('msg-list');
			if (el) el.scrollTop = el.scrollHeight;
		}, 50);
	}

	$effect(() => {
		if (conv.messages) scrollToBottom();
	});

	function formatTime(d: string | Date): string {
		return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
	}

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	async function sendMessage(e: Event) {
		e.preventDefault();
		if (!messageText.trim() || sending) return;
		sending = true;
		await fetch(`/api/conversations/${conv.id_conversation}/messages`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content: messageText.trim() })
		});
		messageText = '';
		sending = false;
		await invalidateAll();
	}

	async function proposeMenu(menuId: number) {
		showMenuPicker = false;
		await fetch(`/api/conversations/${conv.id_conversation}/propose-menu`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id_menu: menuId })
		});
		await invalidateAll();
	}

	async function acceptProposal() {
		accepting = true;
		const res = await fetch(`/api/conversations/${conv.id_conversation}/accept`, {
			method: 'POST'
		});
		if (res.ok) {
			const { id_reservation } = await res.json();
			await goto(`/reservations/${id_reservation}`);
		}
		accepting = false;
	}

	async function refuseProposal() {
		refusing = true;
		await fetch(`/api/conversations/${conv.id_conversation}/refuse`, { method: 'POST' });
		refusing = false;
		await invalidateAll();
	}

	const hasMenuProposal = $derived(
		conv.messages.some((m: MessageItem) => m.type === 'menu_proposal')
	);
	const canAccept = $derived(!isChief && conv.statut === 'devis_envoye' && hasMenuProposal);
</script>

<div class="-mx-5 -mt-3 flex h-[calc(100dvh-120px)] flex-col">
	<!-- Header -->
	<div class="flex shrink-0 items-center gap-3 border-b border-navy/[0.07] bg-cream px-4 py-3">
		<a href="/messages" class="flex h-8 w-8 items-center justify-center rounded-full text-navy/60">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-5 w-5"
			>
				<path
					fill-rule="evenodd"
					d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>
		{#if conv.other_image}
			<img src={conv.other_image} alt="" class="h-9 w-9 rounded-full object-cover" />
		{:else}
			<div
				class="flex h-9 w-9 items-center justify-center rounded-full bg-cream font-semibold text-navy/40"
			>
				{conv.other_firstname[0] ?? '?'}
			</div>
		{/if}
		<div class="flex-1">
			<p class="text-sm font-semibold text-navy">{conv.other_firstname} {conv.other_name}</p>
			<p class="flex items-center gap-1 text-[11px] text-navy/50">
				<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
				En ligne
			</p>
		</div>
	</div>

	<!-- Request context card -->
	{#if conv.request_title}
		<div class="mx-4 mt-3 shrink-0 overflow-hidden rounded-xl border border-navy/[0.08] bg-white">
			<div class="flex items-center gap-3 px-3 py-2.5">
				<div class="h-1 w-1 shrink-0 rounded-full bg-rust"></div>
				<div class="min-w-0 flex-1">
					<p class="truncate text-[12px] font-semibold text-navy">{conv.request_title}</p>
					{#if conv.request_date || conv.request_guests}
						<p class="text-[11px] text-navy/50">
							{conv.request_guests ? `${conv.request_guests} pers.` : ''}
							{conv.request_date ? ' · ' + formatDate(conv.request_date) : ''}
						</p>
					{/if}
				</div>
				<a href="/home" class="shrink-0 text-[11px] font-medium text-rust"
					>Voir le détail &rsaquo;</a
				>
			</div>
		</div>
	{/if}

	<!-- Messages -->
	<div id="msg-list" class="flex-1 space-y-3 overflow-y-auto px-4 py-3">
		{#each conv.messages as msg (msg.id_message)}
			{@const isMine = msg.id_sender === myId}

			{#if msg.type === 'system'}
				<div class="flex justify-center">
					<span class="rounded-full bg-navy/8 px-3 py-1 text-[11px] text-navy/50"
						>{msg.content_message}</span
					>
				</div>
			{:else if msg.type === 'menu_proposal'}
				{@const isRefused = conv.statut === 'refuse'}
				<!-- Menu proposal card -->
				<div class="flex {isMine ? 'justify-end' : 'justify-start'}">
					<div
						class="relative max-w-[80%] overflow-hidden rounded-2xl border {isRefused
							? 'border-navy/[0.05] opacity-50'
							: 'border-navy/[0.08]'} bg-white shadow-sm"
					>
						{#if isRefused}
							<div
								class="absolute top-2 right-2 rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-navy/40 uppercase"
							>
								Refusé
							</div>
						{/if}
						<div
							class="bg-rust/10 px-4 py-2 text-[11px] font-semibold tracking-wide text-rust uppercase"
						>
							Menu proposé
						</div>
						<div class="p-3">
							<p class="text-sm font-semibold text-navy">{msg.menu_title ?? 'Menu'}</p>
							{#if msg.menu_price}
								<p class="mt-0.5 text-[12px] font-medium text-rust">
									Dès {msg.menu_price} € / convive
								</p>
							{/if}
							{#if msg.menu_description}
								<p class="mt-1.5 line-clamp-3 text-[12px] leading-snug text-navy/60">
									{msg.menu_description}
								</p>
							{/if}
							{#if msg.price_per_person}
								<p class="mt-2 rounded-lg bg-cream px-2 py-1.5 text-[12px] text-navy/70">
									Prix proposé : <span class="font-semibold text-rust"
										>{msg.price_per_person} € / convive</span
									>
								</p>
							{/if}
							{#if msg.id_menu}
								<a
									href="/menus/{msg.id_menu}"
									class="mt-2.5 flex items-center gap-1 text-[12px] font-medium text-teal"
								>
									Voir le menu complet
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										fill="currentColor"
										class="h-3.5 w-3.5"
									>
										<path
											fill-rule="evenodd"
											d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
											clip-rule="evenodd"
										/>
									</svg>
								</a>
							{/if}
						</div>

						<!-- Accept/Refuse (customer only, when status is devis_envoye) -->
						{#if canAccept}
							<div class="flex border-t border-navy/[0.06]">
								<button
									type="button"
									onclick={refuseProposal}
									disabled={refusing}
									class="flex-1 py-3 text-sm font-medium text-navy/50 transition-colors hover:text-rust active:bg-rust/5 disabled:opacity-50"
								>
									Refuser
								</button>
								<div class="w-px bg-navy/[0.06]"></div>
								<button
									type="button"
									onclick={acceptProposal}
									disabled={accepting}
									class="flex-1 py-3 text-sm font-semibold text-teal transition-colors hover:bg-teal/5 active:bg-teal/10 disabled:opacity-50"
								>
									{accepting ? '...' : 'Accepter ✓'}
								</button>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<!-- Text message -->
				<div class="flex {isMine ? 'justify-end' : 'justify-start'}">
					<div class="max-w-[78%]">
						<div
							class="rounded-2xl px-3.5 py-2.5 text-sm leading-snug {isMine
								? 'rounded-br-sm bg-teal text-white'
								: 'rounded-bl-sm border border-navy/[0.07] bg-white text-navy shadow-sm'}"
						>
							{msg.content_message}
						</div>
						<p class="mt-1 text-[10px] {isMine ? 'text-right text-navy/30' : 'text-navy/30'}">
							{formatTime(msg.created_at)}
						</p>
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Bottom actions -->
	<div class="shrink-0 border-t border-navy/[0.07] bg-cream px-4 py-3">
		{#if isChief && conv.statut !== 'confirme'}
			<!-- Chef actions: propose menu + text input -->
			{#if conv.statut === 'a_repondre' || conv.statut === 'devis_envoye' || conv.statut === 'refuse'}
				<div class="mb-2.5 flex gap-2">
					<button
						type="button"
						onclick={() => (showMenuPicker = !showMenuPicker)}
						class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rust py-2.5 text-[13px] font-semibold text-white transition-opacity active:opacity-80"
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
						Envoyer un devis
					</button>
				</div>
			{/if}

			<!-- Menu picker -->
			{#if showMenuPicker}
				<div class="relative z-20 mb-2.5 overflow-hidden rounded-xl border border-navy/10 bg-white">
					{#if data.chiefMenus.length === 0}
						<p class="px-4 py-3 text-sm text-navy/50">
							Aucun menu créé. <a href="/profile" class="text-rust underline">Créer un menu</a>
						</p>
					{:else}
						{#each data.chiefMenus as menu (menu.id_menu)}
							<button
								type="button"
								onclick={() => proposeMenu(menu.id_menu)}
								class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-cream active:bg-cream/70 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-navy/[0.06]"
							>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-semibold text-navy">{menu.title_menu}</p>
									{#if menu.price_menu}
										<p class="text-[12px] text-rust">Dès {menu.price_menu} € / convive</p>
									{/if}
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 16 16"
									fill="currentColor"
									class="mt-0.5 h-4 w-4 shrink-0 text-navy/30"
								>
									<path
										fill-rule="evenodd"
										d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		{/if}

		<!-- Text input (both roles, unless confirmed) -->
		{#if conv.statut !== 'confirme'}
			<form onsubmit={sendMessage} class="flex items-center gap-2">
				<input
					type="text"
					bind:value={messageText}
					placeholder="Écrire un message..."
					class="flex-1 rounded-full border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-navy/40"
				/>
				<button
					type="submit"
					disabled={sending || !messageText.trim()}
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rust text-white transition-opacity active:opacity-80 disabled:opacity-40"
					aria-label="Envoyer"
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
				</button>
			</form>
		{:else}
			<p class="text-center text-sm text-navy/40">✓ Réservation confirmée</p>
		{/if}
	</div>
</div>

<!-- Menu picker backdrop -->
{#if showMenuPicker}
	<button class="fixed inset-0 z-10" onclick={() => (showMenuPicker = false)} aria-label="Fermer"
	></button>
{/if}
