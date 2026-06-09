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

<button
	class="flex w-20 shrink-0 flex-col items-center gap-2 rounded-2xl border-b-2 bg-white py-2.5 transition-colors {selected
		? 'border-rust'
		: 'border-transparent'}"
	onclick={onSelect}
>
	<div class="h-14 w-14 overflow-hidden rounded-full">
		<img src={image} alt={label} class="h-full w-full object-cover" />
	</div>
	<span
		class="w-full px-1 text-center text-[10px] leading-tight {selected
			? 'font-semibold text-navy'
			: 'text-navy/65'}"
	>
		{label}
	</span>
</button>
