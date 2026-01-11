<script lang="ts">
	import type { Group } from '$lib/types';

	interface Props {
		group: Group;
		memberCount: number;
		balance?: number;
	}

	let { group, memberCount, balance = 0 }: Props = $props();

	const balanceColor = balance > 0 ? 'text-green-400' : balance < 0 ? 'text-red-400' : 'text-surface-400';
	const balanceText = balance > 0 ? `+${balance.toFixed(2)}` : balance.toFixed(2);
</script>

<a
	href="/group/{group.id}"
	class="card p-4 block hover:bg-surface-700/50 bg-surface-800 transition-colors"
>
	<div class="flex items-start justify-between gap-3">
		<div class="flex-1 min-w-0">
			<h3 class="font-semibold text-surface-50 truncate">{group.name}</h3>
			<p class="text-sm text-surface-400 mt-1">
				{memberCount} {memberCount === 1 ? 'member' : 'members'} · {group.defaultCurrency}
			</p>
		</div>
		{#if balance !== 0}
			<div class="text-right">
				<p class="text-sm {balanceColor} font-medium">{balanceText}</p>
				<p class="text-xs text-surface-500">{group.defaultCurrency}</p>
			</div>
		{/if}
	</div>
</a>
