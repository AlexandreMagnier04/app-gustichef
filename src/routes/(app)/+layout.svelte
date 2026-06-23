<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import logoRondOrange from '$lib/assets/img/logo-gusti-rond-orange.png';
	import ecritureOrange from '$lib/assets/img/gustichef-ecriture-orange.png';
	import logoRondVert from '$lib/assets/img/logo-gusti-rond-vert.png';
	import ecritureVerte2 from '$lib/assets/img/gustichef-ecriture-verte-2.png';
	import NotificationsPanel from '$lib/components/NotificationsPanel.svelte';

	let { children, data } = $props();

	let showNotifications = $state(false);
	let unreadCount = $state(data.unreadNotificationsCount ?? 0);

	// Synchronise le badge quand les données du layout se rechargent
	$effect(() => {
		unreadCount = data.unreadNotificationsCount ?? 0;
	});

	onMount(() => {
		const es = new EventSource('/api/sse');
		es.onmessage = (e) => {
			try {
				const payload = JSON.parse(e.data) as { type: string };
				if (payload.type === 'notification') {
					unreadCount += 1;
				}
				// Rafraîchit toutes les données de la page pour que les messages et notifs s'affichent instantanément
				invalidateAll();
			} catch {
				// payload malformé, on ignore
			}
		};
		es.onerror = () => {
			// le navigateur se reconnecte automatiquement en cas d'erreur SSE
		};
		return () => es.close();
	});
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-cream py-3">
	<!-- Header -->
	<header class="shrink-0 px-5">
		<div class="relative flex items-center justify-center">
			<div class="absolute left-0">
				{#if data.user.role === 'chief'}
					<img src={logoRondOrange} alt="" class="h-9 w-9 object-contain" />
				{:else}
					<img src={logoRondVert} alt="" class="h-9 w-9 object-contain" />
				{/if}
			</div>
			<div>
				{#if data.user.role === 'chief'}
					<img src={ecritureOrange} alt="Gustichef" class="h-10 object-contain" />
				{:else}
					<img src={ecritureVerte2} alt="Gustichef" class="h-10 object-contain" />
				{/if}
			</div>
			<div class="absolute right-0 flex items-center gap-4">
				<button
					type="button"
					onclick={() => (showNotifications = true)}
					class="relative text-teal transition-colors hover:text-teal/80"
					aria-label="Notifications"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-6 w-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
						/>
					</svg>
					{#if unreadCount > 0}
						<span
							class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[9px] font-bold text-white"
						>
							{unreadCount > 9 ? '9+' : unreadCount}
						</span>
					{/if}
				</button>
				<a
					href={data.user.role === 'chief' ? '/profile' : '/customer-profile'}
					class="text-teal transition-colors hover:text-teal/80"
					aria-label="Profil"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
					</svg>
				</a>
			</div>
		</div>
	</header>

	<!-- Page content -->
	<main class="flex-1 overflow-y-auto bg-cream px-5 py-3 pb-4">
		{@render children()}
	</main>

	<NotificationsPanel bind:open={showNotifications} bind:unreadCount />

	<!-- Bottom nav -->
	<nav
		class="fixed inset-x-0 bottom-0 z-30 border-t border-white/40 bg-white/20 shadow-[0_-1px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl"
	>
		<div class="flex items-center justify-around px-4 py-3">
			<a
				href="/home"
				class="flex flex-col items-center gap-0.5 transition-colors {page.url.pathname === '/home' && !(data.user.role === 'chief' && page.url.searchParams.get('tab') === 'demandes')
					? 'text-navy'
					: 'text-navy/30'}"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-6 w-6"
				>
					<path
						d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"
					/>
					<path
						d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"
					/>
				</svg>
				<span class="text-[10px] font-medium">accueil</span>
			</a>

			{#if data.user.role === 'chief'}
				<a
					href="/clients"
					class="flex flex-col items-center gap-0.5 transition-colors {page.url.pathname.startsWith('/clients') || (page.url.pathname === '/home' && page.url.searchParams.get('tab') === 'demandes')
						? 'text-navy'
						: 'text-navy/30'}"
				>
					<!-- user-circle outline — Heroicons -->
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
					</svg>
					<span class="text-[10px] font-medium">trouve ton client</span>
				</a>
			{:else}
				<a
					href="/chiefs"
					class="flex flex-col items-center gap-0.5 transition-colors {page.url.pathname.startsWith(
						'/chiefs'
					)
						? 'text-navy'
						: 'text-navy/30'}"
				>
					<!-- chef hat outline — Lucide -->
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
						<line x1="6" x2="18" y1="17" y2="17" stroke="currentColor" stroke-width="1.5" />
					</svg>
					<span class="text-[10px] font-medium">trouve ton chef</span>
				</a>
			{/if}

			<a
				href="/messages"
				class="flex flex-col items-center gap-0.5 transition-colors {page.url.pathname.startsWith(
					'/messages'
				)
					? 'text-navy'
					: 'text-navy/30'}"
			>
				<i class="fa-regular fa-comments text-2xl leading-none"></i>
				<span class="text-[10px] font-medium">messagerie</span>
			</a>
		</div>
	</nav>
</div>
