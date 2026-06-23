<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let {
		open = $bindable(false),
		unreadCount = $bindable(0)
	}: {
		open?: boolean;
		unreadCount?: number;
	} = $props();

	interface Notif {
		id_notification: number;
		type: string;
		title: string;
		body: string;
		read: boolean;
		id_request: string | null;
		created_at: string;
	}

	let notifs = $state<Notif[]>([]);
	let loading = $state(false);

	$effect(() => {
		if (open) loadNotifs();
	});

	async function loadNotifs() {
		loading = true;
		const res = await fetch('/api/notifications');
		if (res.ok) notifs = await res.json();
		loading = false;
	}

	async function markAllRead() {
		await fetch('/api/notifications', { method: 'PATCH' });
		notifs = notifs.map((n) => ({ ...n, read: true }));
		unreadCount = 0;
		await invalidateAll();
	}

	function formatRelative(iso: string): string {
		const d = new Date(iso);
		const diff = Date.now() - d.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return "À l'instant";
		if (mins < 60) return `Il y a ${mins} min`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `Il y a ${hours}h`;
		const days = Math.floor(hours / 24);
		return `Il y a ${days}j`;
	}

	function close() {
		open = false;
	}
</script>

{#if open}
	<!-- Backdrop -->
	<button class="fixed inset-0 z-40 bg-black/40" onclick={close} aria-label="Fermer"></button>

	<!-- Panel bottom sheet -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-[#FDF7F4] pb-8"
		role="dialog"
		aria-modal="true"
	>
		<!-- Handle -->
		<div class="flex justify-center pt-3 pb-2">
			<div class="h-1 w-10 rounded-full bg-navy/20"></div>
		</div>

		<!-- Header -->
		<div class="flex items-center justify-between px-5 pb-3">
			<h2 class="text-base font-semibold text-navy">Notifications</h2>
			{#if unreadCount > 0}
				<button type="button" onclick={markAllRead} class="text-xs font-medium text-teal underline">
					Tout marquer comme lu
				</button>
			{/if}
		</div>

		<div class="h-px bg-navy/[0.07]"></div>

		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div
					class="h-6 w-6 animate-spin rounded-full border-2 border-navy/20 border-t-navy/60"
				></div>
			</div>
		{:else if notifs.length === 0}
			<div class="flex flex-col items-center justify-center px-8 py-14 text-center">
				<div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-navy/5">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-7 w-7 text-navy/30"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
						/>
					</svg>
				</div>
				<p class="text-sm font-medium text-navy/60">Aucune notification</p>
			</div>
		{:else}
			<ul class="divide-y divide-navy/[0.06]">
				{#each notifs as n (n.id_notification)}
					{@const href = n.id_request ? `/messages/${n.id_request}` : null}
					<li class={n.read ? 'bg-transparent' : 'bg-teal/[0.04]'}>
						<svelte:element
							this={href ? 'a' : 'div'}
							{href}
							role={href ? 'link' : undefined}
							tabindex={href ? 0 : undefined}
							onclick={href ? close : undefined}
							onkeydown={href ? (e: KeyboardEvent) => e.key === 'Enter' && close() : undefined}
							class="flex items-start gap-3 px-5 py-3.5 {href
								? 'cursor-pointer active:bg-navy/[0.04]'
								: ''}"
						>
							<!-- Icône -->
							<div
								class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full {n.read
									? 'bg-navy/8'
									: 'bg-teal/15'}"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4 {n.read ? 'text-navy/40' : 'text-teal'}"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
									/>
								</svg>
							</div>

							<!-- Texte -->
							<div class="min-w-0 flex-1">
								<p class="text-[13px] leading-snug font-semibold text-navy">{n.title}</p>
								<p class="mt-0.5 text-[12px] leading-snug text-navy/60">{n.body}</p>
								<p class="mt-1 text-[11px] text-navy/35">{formatRelative(n.created_at)}</p>
							</div>

							<!-- Point non-lu -->
							{#if !n.read}
								<div class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal"></div>
							{/if}
						</svelte:element>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
