<script lang="ts">
	import { page } from '$app/state';
	import logoImg from '$lib/assets/img/logo-gusti.png';
	import gustichefEcriture from '$lib/assets/img/gustichef-ecriture.png';

	let { children, data } = $props();
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-cream py-3">
	<!-- Header -->
	<header class="shrink-0 px-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2.5">
				<img src={logoImg} alt="" class="h-9 w-9 object-contain" />
				<img src={gustichefEcriture} alt="Gustichef" class="h-7 object-contain" />
			</div>
			<div class="flex items-center gap-4">
				<button class="text-navy/60 transition-colors hover:text-navy" aria-label="Favoris">
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
							d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
						/>
					</svg>
				</button>
				<a
					href={data.user.role === 'chief' ? '/profile' : '/customer-profile'}
					class="text-navy/60 transition-colors hover:text-navy"
					aria-label="Profil"
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
							d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
						/>
					</svg>
				</a>
			</div>
		</div>
	</header>

	<!-- Page content -->
	<main class="flex-1 overflow-y-auto bg-cream px-5 py-3 pb-20">
		{@render children()}
	</main>

	<!-- Bottom nav -->
	<nav class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-cream">
		<div class="flex items-center justify-around px-4 py-3">
			<a
				href="/home"
				class="flex flex-col items-center gap-0.5 transition-colors {page.url.pathname === '/home'
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
				class="flex flex-col items-center gap-0.5 transition-colors {page.url.pathname.startsWith(
					'/clients'
				)
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
						d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"
					/>
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
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-6 w-6"
				>
					<path
						d="M12 3a5 5 0 0 0-4.546 2.916A4.002 4.002 0 0 0 8 14v1h8v-1a4 4 0 0 0 .546-7.084A5 5 0 0 0 12 3ZM7 17v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2H7Z"
					/>
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
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-6 w-6"
				>
					<path
						fill-rule="evenodd"
						d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="text-[10px] font-medium">messagerie</span>
			</a>
		</div>
	</nav>
</div>
