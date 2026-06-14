<script lang="ts">
	import type { PublicationCard } from '$lib/models/publication.model';

	let { publication }: { publication: PublicationCard } = $props();

	const firstImage = $derived(publication.images[0]);

	function formatPrice(raw: string | null): string | null {
		if (!raw) return null;
		const n = parseFloat(raw);
		return isNaN(n) ? null : String(Math.floor(n));
	}

	const TAG_COLORS = ['bg-teal', 'bg-olive', 'bg-rust'] as const;

	const visibleTags = $derived(
		publication.chiefSpecialties.slice(0, 3).map((s, i) => ({
			label: s,
			color: TAG_COLORS[i % TAG_COLORS.length]
		}))
	);
</script>

<article class="overflow-hidden bg-[#FDF7F4]/30">
	<div class="relative aspect-square w-full">
		{#if firstImage}
			<img
				src={firstImage.url}
				alt={publication.title_publication}
				class="absolute inset-0 h-full w-full object-cover"
			/>
		{:else}
			<div class="absolute inset-0 flex items-center justify-center bg-cream">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1"
					stroke="currentColor"
					class="h-16 w-16 text-navy/20"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
					/>
				</svg>
			</div>
		{/if}

		<!-- Badge prix : top-right, rectangle collé au bord -->
		{#if formatPrice(publication.price_publication)}
			<div class="absolute top-4 right-0 rounded-l-[5px] bg-teal px-3 py-1.5">
				<span class="text-[11px] font-medium text-cream">
					Dès {formatPrice(publication.price_publication)} € / personne.
				</span>
			</div>
		{/if}

		<!-- Gradient doux sur le tiers inférieur, sert de fond à l'auteur -->
		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/55 via-black/15 to-transparent"
		></div>

		<!-- Auteur : ancré bas-gauche, sans bandeau, juste posé sur le gradient -->
		<a
			href="/chiefs/{publication.author.id}"
			class="absolute right-3 bottom-3 left-3 flex items-center gap-2"
		>
			{#if publication.author.image}
				<img
					src={publication.author.image}
					alt=""
					class="h-8 w-8 rounded-full border border-white/80 object-cover"
				/>
			{:else}
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-cream/90 text-navy/40"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-4 w-4"
					>
						<path
							fill-rule="evenodd"
							d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
			{/if}
			<span class="truncate text-sm font-semibold text-white drop-shadow-sm">
				{publication.author.firstname}
				{publication.author.name}
			</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="ml-0.5 h-3 w-3 shrink-0 text-white/80"
			>
				<path
					fill-rule="evenodd"
					d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>
	</div>

	<!-- Section info -->
	<div class="space-y-2.5 px-4 pt-3 pb-3.5">
		<!-- Tags : pills plus petites et discrètes -->
		{#if visibleTags.length > 0}
			<div class="flex flex-wrap gap-1.5">
				{#each visibleTags as t (t.label)}
					<span
						class="rounded-full {t.color} px-2.5 py-1 text-[10px] font-medium tracking-wide text-white"
					>
						{t.label}
					</span>
				{/each}
			</div>
		{/if}

		<!-- Description -->
		<p class="line-clamp-3 text-[13px] leading-snug text-navy/65">
			{publication.content_publication}
		</p>

		<!-- Footer : localisation + actions -->
		<div class="flex items-center justify-between pt-1">
			{#if publication.author.localization}
				<div class="flex items-center gap-1 text-[11px] text-navy/50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.8"
						stroke="currentColor"
						class="h-3.5 w-3.5 text-navy/40"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
						/>
					</svg>
					{publication.author.localization}
				</div>
			{:else}
				<span></span>
			{/if}

			<div class="flex items-center gap-3 text-navy/35">
				<button class="transition-colors hover:text-rust" aria-label="Aimer">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-[18px] w-[18px]"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
						/>
					</svg>
				</button>
				<button class="transition-colors hover:text-navy" aria-label="Commenter">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-[18px] w-[18px]"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</article>
