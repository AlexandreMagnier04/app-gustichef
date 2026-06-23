<script lang="ts">
	import type { PageData } from './$types';
	import { signOut } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import flecheRetourOrange from '$lib/assets/img/fleche-retour-orange.png';
	import flecheRetourVerte from '$lib/assets/img/fleche-retour-verte.png';
	import imgStylo from '$lib/assets/img/stylo.png';
	import imgUser from '$lib/assets/img/user.png';
	import imgCheck from '$lib/assets/img/check.png';
	import imgBell from '$lib/assets/img/bell.png';
	import imgDollar from '$lib/assets/img/dollar.png';
	import imgFile from '$lib/assets/img/file.png';
	import imgQuestion from '$lib/assets/img/question.png';

	async function logout() {
		await signOut();
		goto('/');
	}

	let { data }: { data: PageData } = $props();
	const user = $derived(data.user);
	const isChief = $derived(user.role === 'chief');

	const backHref = $derived(isChief ? '/profile' : '/customer-profile');
	const editHref = $derived(isChief ? '/profile/edit' : '/customer-profile/edit');
	const accentColor = $derived(isChief ? 'bg-rust' : 'bg-teal');

	const menuItems = [
		{
			img: imgUser,
			label: 'Informations personnelles',
			sub: 'Nom, photo de profil',
			href: '/profile/settings/infos'
		},
		{
			img: imgCheck,
			label: 'Connexion & sécurité',
			sub: 'Mot de passe, 2FA',
			href: '/profile/settings/security'
		},
		{ img: imgBell, label: 'Notifications', sub: 'Push, email, SMS', href: '#notifications' },
		{
			img: imgDollar,
			label: 'Paiements & conditions',
			sub: 'Cartes, annulation',
			href: '#paiements'
		},
		{
			img: imgFile,
			label: "Conditions d'utilisation",
			sub: 'CGU, RGPD',
			href: '/profile/settings/cgu'
		},
		{
			img: imgQuestion,
			label: 'Aide & support',
			sub: 'FAQ, nous contacter',
			href: '/profile/settings/support'
		}
	];
</script>

<!-- En-tête -->
<div class="flex items-center justify-between pt-2 pb-4">
	<a href={backHref} data-sveltekit-reload aria-label="Retour">
		<img
			src={isChief ? flecheRetourOrange : flecheRetourVerte}
			alt="Retour"
			class="h-5 w-5 object-contain"
		/>
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
		class="{accentColor} flex h-8 w-8 items-center justify-center rounded-xl"
	>
		<img src={imgStylo} alt="" class="h-4 w-4 object-contain brightness-0 invert" />
	</a>
</div>

<!-- Section Mon compte -->
<div class="mb-1">
	<p class="text-center text-xs font-medium text-navy/40">Mon compte</p>
</div>

<div class="divide-y divide-navy/8 rounded-2xl border border-navy/8">
	{#each menuItems as item (item.href)}
		<a href={item.href} class="flex items-center gap-3 px-4 py-3.5">
			{#if item.img}
				<img src={item.img} alt="" class="h-5 w-5 shrink-0 object-contain" />
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 shrink-0 text-navy/40"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
			{/if}
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

<button
	onclick={logout}
	class="mt-6 w-full rounded-2xl bg-rust py-3.5 text-sm font-semibold text-white transition-opacity active:opacity-70"
>
	Se déconnecter
</button>
