<script lang="ts">
	import logo from '$lib/assets/img/logo-gusti.png';
	import gustichefEcriture from '$lib/assets/img/gustichef-ecriture.png';

	// Génère l'URL QR code via l'API publique qrserver — pointe vers l'URL courante du site
	let siteUrl = $state('');
	let qrUrl = $derived(
		`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=051E23&bgcolor=F5EDDC&data=${encodeURIComponent(siteUrl)}`
	);

	$effect(() => {
		siteUrl = window.location.origin;
	});
</script>

<div class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-cream px-8">
	<div class="flex items-center gap-3">
		<img src={logo} alt="Gustichef" class="h-12" />
		<img src={gustichefEcriture} alt="Gustichef" class="h-10 object-contain" />
	</div>

	<p class="max-w-xs text-center text-sm leading-relaxed text-stone-500">
		Gustichef est pensé pour mobile.<br />
		Scanne le QR code avec ton téléphone pour vivre l'expérience.
	</p>

	<div class="rounded-2xl border border-stone-200 bg-cream p-4 shadow-sm">
		{#if siteUrl}
			<img src={qrUrl} alt="QR code Gustichef" class="h-[180px] w-[180px]" />
		{:else}
			<div class="h-[180px] w-[180px] animate-pulse rounded-xl bg-stone-100"></div>
		{/if}
	</div>

	<p class="text-xs text-stone-400">{siteUrl}</p>
</div>
