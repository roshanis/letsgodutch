<script lang="ts">
	import type { SplitType } from '$lib/types';

	interface Props {
		value: SplitType;
		onChange: (mode: SplitType) => void;
	}

	let { value, onChange }: Props = $props();

	const modes: { value: SplitType; label: string; icon: string; desc: string }[] = [
		{ value: 'equal', label: 'Equal', icon: '⚖️', desc: 'Split evenly' },
		{ value: 'percentage', label: 'Percentage', icon: '%', desc: 'Custom percentages' },
		{ value: 'shares', label: 'Shares', icon: '🎯', desc: 'Ratio-based' },
		{ value: 'exact', label: 'Exact', icon: '💰', desc: 'Fixed amounts' }
	];
</script>

<div class="grid grid-cols-2 gap-2">
	{#each modes as mode}
		<button
			type="button"
			class="p-3 rounded-lg border-2 text-left transition-all {value === mode.value
				? 'border-primary-500 bg-primary-500/10'
				: 'border-surface-600 hover:border-surface-500'}"
			onclick={() => onChange(mode.value)}
		>
			<div class="flex items-center gap-2">
				<span class="text-xl">{mode.icon}</span>
				<div>
					<p class="font-medium text-sm">{mode.label}</p>
					<p class="text-xs text-surface-400">{mode.desc}</p>
				</div>
			</div>
		</button>
	{/each}
</div>
