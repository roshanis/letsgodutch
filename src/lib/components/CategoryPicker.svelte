<script lang="ts">
	import { CATEGORIES, type Category } from '$lib/data/categories';

	interface Props {
		value: string;
		suggestedCategory?: string;
		onChange: (categoryId: string) => void;
	}

	let { value, suggestedCategory, onChange }: Props = $props();

	let showAll = $state(false);
	const displayCategories = $derived(showAll ? CATEGORIES : CATEGORIES.slice(0, 6));
</script>

<div class="space-y-2">
	{#if suggestedCategory && suggestedCategory !== value}
		{@const suggested = CATEGORIES.find((c) => c.id === suggestedCategory)}
		{#if suggested}
			<button
				type="button"
				class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/20 text-primary-400 text-sm hover:bg-primary-500/30 transition-colors"
				onclick={() => onChange(suggested.id)}
			>
				<span>💡</span>
				<span>Suggested: {suggested.icon} {suggested.name}</span>
			</button>
		{/if}
	{/if}

	<div class="flex flex-wrap gap-2">
		{#each displayCategories as category (category.id)}
			<button
				type="button"
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors {value === category.id
					? 'bg-primary-500 text-white'
					: 'bg-surface-700 text-surface-300 hover:bg-surface-600'}"
				onclick={() => onChange(category.id)}
			>
				<span>{category.icon}</span>
				<span>{category.name}</span>
			</button>
		{/each}

		{#if !showAll && CATEGORIES.length > 6}
			<button
				type="button"
				class="px-3 py-1.5 rounded-full text-sm bg-surface-700 text-surface-400 hover:bg-surface-600"
				onclick={() => (showAll = true)}
			>
				+{CATEGORIES.length - 6} more
			</button>
		{/if}
	</div>
</div>
