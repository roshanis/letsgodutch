<script lang="ts">
	import type { Member } from '$lib/types';
	import MemberAvatar from './MemberAvatar.svelte';

	interface Props {
		members: Member[];
		amount: number;
		currency: string;
		shares: Map<string, number>;
		onChange: (shares: Map<string, number>) => void;
	}

	let { members, amount, currency, shares, onChange }: Props = $props();

	const totalShares = $derived(Array.from(shares.values()).reduce((sum, s) => sum + s, 0));

	function updateShares(memberId: string, value: string) {
		const newMap = new Map(shares);
		newMap.set(memberId, parseInt(value) || 0);
		onChange(newMap);
	}

	function getMemberAmount(memberId: string): number {
		const memberShares = shares.get(memberId) ?? 0;
		return totalShares > 0 ? (amount * memberShares) / totalShares : 0;
	}
</script>

<div class="space-y-3">
	<p class="text-sm text-surface-400">Shares split (e.g., 2:1:1)</p>

	{#each members as member (member.id)}
		{@const memberShares = shares.get(member.id) ?? 1}
		{@const memberAmount = getMemberAmount(member.id)}
		<div class="flex items-center gap-3">
			<MemberAvatar name={member.name} size="sm" />
			<span class="flex-1 text-sm truncate">{member.name}</span>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="btn-icon btn-sm variant-ghost-surface"
					onclick={() => updateShares(member.id, String(Math.max(0, memberShares - 1)))}
				>
					-
				</button>
				<span class="w-8 text-center font-medium">{memberShares}</span>
				<button
					type="button"
					class="btn-icon btn-sm variant-ghost-surface"
					onclick={() => updateShares(member.id, String(memberShares + 1))}
				>
					+
				</button>
				<span class="text-xs text-surface-500 w-20 text-right">
					{currency} {memberAmount.toFixed(2)}
				</span>
			</div>
		</div>
	{/each}

	<p class="text-xs text-surface-500 pt-2 border-t border-surface-700">
		Total: {totalShares} shares
	</p>
</div>
