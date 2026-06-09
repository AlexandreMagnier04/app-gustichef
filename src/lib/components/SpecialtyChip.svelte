<script lang="ts">
	let {
		label,
		image,
		selected = false,
		onSelect
	}: {
		label: string;
		image: string;
		selected?: boolean;
		onSelect: () => void;
	} = $props();
</script>

<button class="flex shrink-0 flex-col items-center gap-1.5" onclick={onSelect}>
	<div
		class="h-17 w-17 overflow-hidden rounded-full border-2 shadow-sm transition-colors {selected
			? 'border-teal'
			: 'border-transparent'}"
	>
		<img src={image} alt={label} class="h-full w-full object-cover" />
	</div>
	<span
		class="w-18 text-center text-[11px] leading-tight transition-colors {selected
			? 'font-semibold text-navy'
			: 'text-navy/70'}"
	>
		{label}
	</span>
</button>
