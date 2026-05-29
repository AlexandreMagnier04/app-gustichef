<script lang="ts">
	let { label, image, onSelect }: { label: string; image: string; onSelect: () => void } = $props();
</script>

<button class="flex shrink-0 flex-col items-center gap-1.5" onclick={onSelect}>
	<div class="h-17 w-17 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
		<img src={image} alt={label} class="h-full w-full object-cover" />
	</div>
	<span class="w-18 text-center text-[11px] leading-tight text-navy/80">{label}</span>
</button>
