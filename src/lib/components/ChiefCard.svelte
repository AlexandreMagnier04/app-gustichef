<script lang="ts">
	import type { ChiefCard } from '$lib/models/chief.model';

	let { chief }: { chief: ChiefCard } = $props();

	function formatRating(raw: string | null): string {
		if (!raw) return '—';
		return parseFloat(raw).toFixed(1);
	}

	function formatPrice(raw: string | null): string | null {
		if (!raw) return null;
		const n = parseFloat(raw);
		return isNaN(n) ? null : String(Math.floor(n));
	}
</script>

<a href="/chiefs/{chief.id_chief}" class="block overflow-hidden rounded-2xl shadow-sm">
	<div class="relative">
		{#if chief.image}
			<img
				src={chief.image}
				alt="{chief.firstname} {chief.name}"
				class="h-64 w-full object-cover"
			/>
		{:else}
			<div class="flex h-64 w-full items-center justify-center bg-cream">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1"
					stroke="currentColor"
					class="h-20 w-20 text-navy/20"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
					/>
				</svg>
			</div>
		{/if}

		{#if formatPrice(chief.min_price)}
			<div class="absolute top-3 right-0 rounded-l-full bg-navy/90 px-3 py-1 backdrop-blur-sm">
				<span class="text-xs font-medium text-cream">
					Dès {formatPrice(chief.min_price)} € / personne.
				</span>
			</div>
		{/if}
	</div>

	<div class="bg-white px-4 py-3">
		<div class="flex items-start justify-between">
			<p class="font-medium text-navy">{chief.firstname} {chief.name}</p>
			{#if chief.review_count > 0}
				<div class="flex items-center gap-1 text-sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-4 w-4 text-rust"
					>
						<path
							fill-rule="evenodd"
							d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="font-medium text-navy">{formatRating(chief.avg_rating)}</span>
					<span class="text-navy/40">({chief.review_count})</span>
				</div>
			{/if}
		</div>
		{#if chief.localization}
			<div class="mt-1.5 flex items-center gap-1 text-xs text-navy/40">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-3.5 w-3.5"
				>
					<path
						fill-rule="evenodd"
						d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
						clip-rule="evenodd"
					/>
				</svg>
				{chief.localization}
			</div>
		{/if}
	</div>
</a>
