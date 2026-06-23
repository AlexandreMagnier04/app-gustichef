<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const user = $derived(data.user);
	const isChief = $derived(user.role === 'chief');

	const backHref = $derived(isChief ? '/profile' : '/customer-profile');
	const editHref = $derived(isChief ? '/profile/edit' : '/customer-profile/edit');
	const accentColor = $derived(isChief ? 'bg-rust' : 'bg-teal');

	const menuItems = [
		{
			icon: 'user',
			label: 'Informations personnelles',
			sub: 'Nom, photo de profil',
			href: '/profile/settings/infos'
		},
		{
			icon: 'check',
			label: 'Connexion & sécurité',
			sub: 'Mot de passe, 2FA',
			href: '/profile/settings/security'
		},
		{ icon: 'bell', label: 'Notifications', sub: 'Push, email, SMS', href: '#' },
		{ icon: 'money', label: 'Paiements & conditions', sub: 'Cartes, annulation', href: '#' },
		{
			icon: 'file',
			label: "Conditions d'utilisation",
			sub: 'CGU, RGPD',
			href: '/profile/settings/cgu'
		}
	];
</script>

<!-- En-tête -->
<div class="flex items-center justify-between pt-2 pb-4">
	<a href={backHref} aria-label="Retour aux paramètres" class="text-navy/50 hover:text-navy">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
			<path
				fill-rule="evenodd"
				d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
				clip-rule="evenodd"
			/>
		</svg>
	</a>
	<h1 class="text-base font-semibold text-navy">Paramètres</h1>
	<div class="w-5"></div>
</div>

<!-- Carte utilisateur -->
<div class="mb-4 flex items-center gap-3 rounded-2xl border border-navy/8 px-4 py-3">
	{#if user.image}
		<img src={user.image} alt="avatar" class="h-12 w-12 rounded-full object-cover" />
	{:else}
		<div
			class="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy"
		>
			{(user.firstname?.[0] ?? '') + (user.name?.[0] ?? '')}
		</div>
	{/if}
	<div class="min-w-0 flex-1">
		<p class="truncate font-semibold text-navy">{user.firstname} {user.name}</p>
		<p class="truncate text-xs text-navy/40">{user.email}</p>
	</div>
	<a
		href={editHref}
		aria-label="Modifier le profil"
		class="{accentColor} flex h-8 w-8 items-center justify-center rounded-full text-white"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
			<path
				d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z"
			/>
			<path
				d="M4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H7A.75.75 0 0 0 7 2H4.75Z"
			/>
		</svg>
	</a>
</div>

<!-- Section Mon compte -->
<div class="mb-1">
	<p class="text-center text-xs font-medium text-navy/40">Mon compte</p>
</div>

<div class="divide-y divide-navy/8 rounded-2xl border border-navy/8">
	{#each menuItems as item (item.href)}
		<a href={item.href} class="flex items-center gap-3 px-4 py-3.5">
			<span class="flex h-5 w-5 shrink-0 items-center justify-center text-teal">
				{#if item.icon === 'user'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4 w-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
					</svg>
				{:else if item.icon === 'bell'}
					<i class="fa-solid fa-bell text-xs"></i>
				{:else if item.icon === 'check'}
					<i class="fa-solid fa-check text-xs"></i>
				{:else if item.icon === 'money'}
					<i class="fa-solid fa-money-bill text-xs"></i>
				{:else if item.icon === 'file'}
					<i class="fa-regular fa-file text-xs"></i>
				{/if}
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium text-navy">{item.label}</p>
				<p class="text-xs text-navy/40">{item.sub}</p>
			</div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-4 w-4 shrink-0 text-navy/25"
			>
				<path
					fill-rule="evenodd"
					d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>
	{/each}
</div>

<!-- Aide & support -->
<div class="mt-4 divide-y divide-navy/8 rounded-2xl border border-navy/8">
	<a href="/profile/settings/support" class="flex items-center gap-3 px-4 py-3.5">
		<span class="flex h-5 w-5 shrink-0 items-center justify-center text-teal">
			<i class="fa-solid fa-question text-xs"></i>
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-sm font-medium text-navy">Aide & support</p>
			<p class="text-xs text-navy/40">FAQ, nous contacter</p>
		</div>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			class="h-4 w-4 shrink-0 text-navy/25"
		>
			<path
				fill-rule="evenodd"
				d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
				clip-rule="evenodd"
			/>
		</svg>
	</a>
</div>
