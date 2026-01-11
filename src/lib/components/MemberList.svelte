<script lang="ts">
	import type { Member } from '$lib/types';
	import MemberAvatar from './MemberAvatar.svelte';

	interface Props {
		members: Member[];
		balances?: Map<string, number>;
		currency?: string;
	}

	let { members, balances, currency = 'USD' }: Props = $props();

	function getBalanceDisplay(memberId: string): { text: string; color: string } {
		if (!balances) return { text: '', color: '' };
		const balance = balances.get(memberId) ?? 0;
		if (balance > 0.01) {
			return { text: `+${balance.toFixed(2)}`, color: 'text-green-400' };
		} else if (balance < -0.01) {
			return { text: balance.toFixed(2), color: 'text-red-400' };
		}
		return { text: 'settled', color: 'text-surface-500' };
	}
</script>

<div class="space-y-2">
	{#each members as member (member.id)}
		{@const balanceInfo = getBalanceDisplay(member.id)}
		<div class="flex items-center gap-3 p-3 rounded-lg bg-surface-800">
			<MemberAvatar name={member.name} />
			<div class="flex-1 min-w-0">
				<p class="font-medium text-surface-50 truncate">{member.name}</p>
				<p class="text-xs text-surface-400">{member.homeCurrency}</p>
			</div>
			{#if balances}
				<div class="text-right">
					<p class="text-sm font-medium {balanceInfo.color}">{balanceInfo.text}</p>
					{#if balanceInfo.text !== 'settled'}
						<p class="text-xs text-surface-500">{currency}</p>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
