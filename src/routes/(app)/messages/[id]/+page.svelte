<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { ConversationDetail, MessageItem } from '$lib/models/messaging.model';

	let { data } = $props();

	const conv = $derived(data.conv as ConversationDetail);
	const isChief = $derived(data.user?.role === 'chief');
	const myId = $derived(data.user?.id ?? '');

	let messageText = $state('');
	let sending = $state(false);
	let showMenuPicker = $state(false);
	let refusing = $state(false);
	let menuDetailMsg = $state<MessageItem | null>(null);
	let menuDetailFull = $state<{
		menu: { ingredients: string[] | null };
		images: { url: string }[];
	} | null>(null);
	let menuDetailLoading = $state(false);

	$effect(() => {
		if (menuDetailMsg?.id_menu) {
			menuDetailLoading = true;
			menuDetailFull = null;
			fetch(`/api/menus/${menuDetailMsg.id_menu}`)
				.then((r) => r.json())
				.then((d) => {
					menuDetailFull = d;
					menuDetailLoading = false;
				})
				.catch(() => {
					menuDetailLoading = false;
				});
		} else {
			menuDetailFull = null;
		}
	});
	let finalPrice = $state(0);
	let inviting = $state(false);
	let inviteError = $state('');

	const isProfileBooking = $derived(
		conv.messages.some((m: MessageItem) => m.type === 'booking_request')
	);
	const bookingRequest = $derived(
		conv.messages.find((m: MessageItem) => m.type === 'booking_request')
	);
	const canInvitePayment = $derived(isChief && conv.statut === 'a_repondre' && isProfileBooking);

	$effect(() => {
		if (bookingRequest?.price_per_person && !finalPrice) {
			finalPrice = bookingRequest.price_per_person;
		}
	});

	async function invitePayment() {
		const price = Number(finalPrice);
		if (inviting || !price || price <= 0) return;
		inviting = true;
		inviteError = '';
		const res = await fetch(`/api/conversations/${conv.id_conversation}/invite-payment`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ pricePerPerson: price, menuId: bookingRequest?.id_menu ?? null })
		});
		inviting = false;
		if (!res.ok) {
			const d = await res.json().catch(() => ({}));
			inviteError = d?.message ?? 'Une erreur est survenue.';
			return;
		}
		await invalidateAll();
	}

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

	function acceptProposal() {
		goto(`/commande/${conv.id_conversation}`);
	}

	async function refuseProposal() {
		refusing = true;
		await fetch(`/api/conversations/${conv.id_conversation}/refuse`, { method: 'POST' });
		refusing = false;
		await invalidateAll();
	}

	async function refuseBooking() {
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
		<a
			href="/messages"
			aria-label="Retour"
			class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-4 w-4 text-navy/70"
			>
				<path
					fill-rule="evenodd"
					d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.061.025Z"
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
			{:else if msg.type === 'booking_request'}
				{@const bd = (() => {
					try {
						return JSON.parse(msg.content_message);
					} catch {
						return null;
					}
				})()}
				<!-- Carte de demande de prestation (depuis profil chef) -->
				<div class="mx-auto w-[90%] max-w-sm">
					<div class="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-sm">
						<div
							class="bg-navy/5 px-4 py-2 text-[11px] font-semibold tracking-wide text-navy/50 uppercase"
						>
							Demande de prestation
						</div>
						{#if bd}
							<div class="divide-y divide-navy/5">
								<!-- Date -->
								<div class="flex items-center gap-3 px-4 py-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="h-4 w-4 shrink-0 text-teal"
									>
										<path
											fill-rule="evenodd"
											d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="text-[13px] text-navy capitalize"
										>{new Date(bd.date + 'T00:00:00').toLocaleDateString('fr-FR', {
											weekday: 'long',
											day: 'numeric',
											month: 'long',
											year: 'numeric'
										})}{bd.time ? ' à ' + bd.time : ''}</span
									>
								</div>
								<!-- Convives -->
								<div class="flex items-center gap-3 px-4 py-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="h-4 w-4 shrink-0 text-teal"
									>
										<path
											d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 17a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.575.8.8 0 0 1-.372.575A6.957 6.957 0 0 1 14.5 16Z"
										/>
									</svg>
									<span class="text-[13px] text-navy"
										>{bd.guests} convive{bd.guests > 1 ? 's' : ''}</span
									>
								</div>
								<!-- Lieu -->
								<div class="flex items-center gap-3 px-4 py-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="h-4 w-4 shrink-0 text-teal"
									>
										<path
											fill-rule="evenodd"
											d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="text-[13px] text-navy">{bd.location}</span>
								</div>
								<!-- Extras -->
								{#if bd.extras?.length}
									<div class="flex items-start gap-3 px-4 py-3">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											class="mt-0.5 h-4 w-4 shrink-0 text-teal"
										>
											<path
												d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z"
											/>
										</svg>
										<div class="space-y-0.5">
											{#each bd.extras as e, i (i)}
												<p class="text-[13px] text-navy">{e.title} ×{e.qty}</p>
											{/each}
										</div>
									</div>
								{/if}
								<!-- Notes -->
								{#if bd.notes}
									<div class="flex items-start gap-3 px-4 py-3">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											class="mt-0.5 h-4 w-4 shrink-0 text-teal"
										>
											<path
												fill-rule="evenodd"
												d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z"
												clip-rule="evenodd"
											/>
										</svg>
										<span class="text-[13px] text-navy/70 italic">{bd.notes}</span>
									</div>
								{/if}
							</div>
							{#if msg.price_per_person}
								<div
									class="border-t border-navy/5 bg-navy/2 px-4 py-2.5 text-right text-[12px] text-navy/40"
								>
									Estimation : {msg.price_per_person} €/pers
								</div>
							{/if}
						{:else}
							<div class="p-4">
								<p class="text-[13px] leading-relaxed whitespace-pre-wrap text-navy/80">
									{msg.content_message}
								</p>
							</div>
						{/if}
					</div>
				</div>
			{:else if msg.type === 'payment_invitation'}
				<!-- Invitation au paiement (envoyée par le chef) -->
				<div class="mx-auto w-[90%] max-w-sm">
					<div class="overflow-hidden rounded-2xl border border-teal/30 bg-teal/5 shadow-sm">
						<div
							class="bg-teal/15 px-4 py-2 text-[11px] font-semibold tracking-wide text-teal uppercase"
						>
							Invitation au paiement
						</div>
						<div class="p-4">
							<p class="text-[13px] font-medium text-navy">{msg.content_message}</p>
							{#if msg.price_per_person}
								<p class="mt-2 text-sm font-bold text-rust">{msg.price_per_person} € / convive</p>
							{/if}
							{#if !isChief}
								<button
									type="button"
									onclick={() => goto(`/commande/${conv.id_conversation}`)}
									class="mt-3 w-full rounded-xl bg-teal py-3 text-sm font-semibold text-white transition-opacity active:opacity-80"
								>
									Sécuriser ma réservation →
								</button>
							{/if}
						</div>
					</div>
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
							{#if msg.id_menu && !isChief}
								<button
									type="button"
									onclick={() => (menuDetailMsg = msg)}
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
								</button>
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
									class="flex-1 py-3 text-sm font-semibold text-teal transition-colors hover:bg-teal/5 active:bg-teal/10"
								>
									Accepter ✓
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
			<!-- Chef actions -->
			{#if canInvitePayment}
				<!-- Demande depuis profil : valider et inviter au paiement -->
				<div class="mb-2.5 overflow-hidden rounded-xl border border-teal/30 bg-teal/5">
					<div class="px-3 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide text-teal uppercase">
						Valider la demande
					</div>
					<div class="flex items-center gap-2 px-3 pb-3">
						<div class="relative flex-1">
							<input
								type="number"
								bind:value={finalPrice}
								min="1"
								placeholder="Prix / convive (€)"
								class="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-teal"
							/>
							<span class="absolute top-1/2 right-3 -translate-y-1/2 text-[12px] text-navy/40"
								>€/pers</span
							>
						</div>
						<button
							type="button"
							onclick={invitePayment}
							disabled={inviting || !Number(finalPrice) || Number(finalPrice) <= 0}
							class="shrink-0 rounded-xl bg-teal px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
						>
							{inviting ? '...' : 'Inviter au paiement'}
						</button>
					</div>
					{#if inviteError}
						<p class="px-3 pb-2 text-[12px] text-rust">{inviteError}</p>
					{/if}
					<!-- Refus de la demande -->
					<div class="border-t border-navy/5 px-3 pt-2 pb-3">
						<button
							type="button"
							onclick={refuseBooking}
							disabled={refusing}
							class="w-full rounded-xl border border-navy/15 py-2.5 text-[13px] font-medium text-navy/50 transition-colors hover:border-rust/40 hover:text-rust disabled:opacity-40"
						>
							{refusing ? '...' : 'Refuser la demande'}
						</button>
					</div>
				</div>
			{:else if conv.statut === 'a_repondre' || conv.statut === 'devis_envoye' || conv.statut === 'refuse'}
				<!-- Demande classique : envoyer un devis -->
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

		<!-- Bannière si confirmé -->
		{#if conv.statut === 'confirme'}
			<div
				class="mb-2.5 rounded-xl bg-teal/10 px-3 py-2 text-center text-[12px] font-medium text-teal"
			>
				✓ Réservation confirmée — la conversation reste ouverte
			</div>
		{/if}

		<!-- Text input (toujours visible pour collaboration future) -->
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
	</div>
</div>

<!-- Menu picker backdrop -->
{#if showMenuPicker}
	<button class="fixed inset-0 z-10" onclick={() => (showMenuPicker = false)} aria-label="Fermer"
	></button>
{/if}

<!-- Dialog détail menu -->
{#if menuDetailMsg}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 pb-0">
		<div
			class="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white"
			style="max-height: 90dvh; display: flex; flex-direction: column;"
		>
			<!-- Handle -->
			<div class="flex shrink-0 justify-center pt-3 pb-1">
				<div class="h-1 w-10 rounded-full bg-navy/20"></div>
			</div>
			<!-- Header -->
			<div class="flex shrink-0 items-center justify-between px-5 py-2">
				<h2 class="text-base font-semibold text-navy">Détail du menu</h2>
				<button
					type="button"
					aria-label="Fermer"
					onclick={() => (menuDetailMsg = null)}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-navy/8 text-navy/50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-4 w-4"
					>
						<path
							d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
						/>
					</svg>
				</button>
			</div>

			<!-- Scrollable content -->
			<div class="pb-safe overflow-y-auto">
				<!-- Image -->
				{#if menuDetailFull?.images?.[0]?.url}
					<img
						src={menuDetailFull.images[0].url}
						alt={menuDetailMsg.menu_title ?? 'Menu'}
						class="h-44 w-full object-cover"
					/>
				{/if}

				{#if menuDetailLoading}
					<div class="flex items-center justify-center py-10">
						<div
							class="h-6 w-6 animate-spin rounded-full border-2 border-navy/20 border-t-navy"
						></div>
					</div>
				{:else}
					<div class="space-y-4 px-5 py-4">
						<!-- Titre + prix -->
						<div>
							<p class="text-xl font-bold text-navy">{menuDetailMsg.menu_title ?? 'Menu'}</p>
							{#if menuDetailMsg.price_per_person}
								<p class="mt-1 text-sm font-semibold text-rust">
									Dès {menuDetailMsg.price_per_person} € / convive
								</p>
							{:else if menuDetailMsg.menu_price}
								<p class="mt-1 text-sm font-semibold text-rust">
									Dès {menuDetailMsg.menu_price} € / convive
								</p>
							{/if}
						</div>

						<!-- Description -->
						{#if menuDetailMsg.menu_description}
							<div>
								<p class="mb-1.5 text-[11px] font-semibold tracking-wide text-navy/40 uppercase">
									Description du plat
								</p>
								<p class="text-[13px] leading-relaxed text-navy/70">
									{menuDetailMsg.menu_description}
								</p>
							</div>
						{/if}

						<!-- Ingrédients -->
						{#if menuDetailFull?.menu?.ingredients?.length}
							<div>
								<p class="mb-2 text-[11px] font-semibold tracking-wide text-navy/40 uppercase">
									Ingrédients
								</p>
								<ul class="space-y-1">
									{#each menuDetailFull.menu.ingredients as ing, i (i)}
										<li class="flex items-start gap-2 text-[13px] text-navy/70">
											<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rust"></span>
											{ing}
										</li>
									{/each}
								</ul>
							</div>
						{/if}

						<!-- Prix proposition -->
						{#if menuDetailMsg.price_per_person && menuDetailMsg.menu_price && menuDetailMsg.price_per_person !== Number(menuDetailMsg.menu_price)}
							<div class="rounded-xl bg-cream px-4 py-3">
								<p class="text-[12px] text-navy/60">Prix proposé pour cette prestation</p>
								<p class="text-lg font-bold text-rust">
									{menuDetailMsg.price_per_person} €
									<span class="text-sm font-normal text-navy/40">/ convive</span>
								</p>
							</div>
						{/if}

						<!-- Bouton accepter -->
						{#if canAccept}
							<button
								type="button"
								onclick={() => {
									menuDetailMsg = null;
									acceptProposal();
								}}
								class="w-full rounded-xl bg-teal py-3.5 text-sm font-semibold text-white transition-opacity active:opacity-80"
							>
								Accepter ce menu ✓
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
