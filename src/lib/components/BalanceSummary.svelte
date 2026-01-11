<script lang="ts">
	import type { Debt, Member } from '$lib/types';
	import MemberAvatar from './MemberAvatar.svelte';

	interface Props {
		debts: Debt[];
		members: Member[];
		currency: string;
	}

	let { debts, members, currency }: Props = $props();

	function getMember(id: string): Member | undefined {
		return members.find((m) => m.id === id);
	}
</script>

<div class="space-y-3">
	{#if debts.length === 0}
		<div class="text-center py-6">
			<div class="text-4xl mb-2">✅</div>
			<p class="text-surface-300">All settled up!</p>
		</div>
	{:else}
		<h3 class="text-sm font-medium text-surface-400 uppercase tracking-wide">Settle Up</h3>
		{#each debts as debt (debt.from + debt.to)}
			{@const fromMember = getMember(debt.from)}
			{@const toMember = getMember(debt.to)}
			{#if fromMember && toMember}
				<div class="flex items-center gap-3 p-3 rounded-lg bg-surface-800">
					<MemberAvatar name={fromMember.name} size="sm" />
					<div class="flex-1">
						<p class="text-sm">
							<span class="font-medium text-surface-50">{fromMember.name}</span>
							<span class="text-surface-400"> owes </span>
							<span class="font-medium text-surface-50">{toMember.name}</span>
						</p>
					</div>
					<div class="text-right">
						<p class="font-semibold text-red-400">{debt.amount.toFixed(2)}</p>
						<p class="text-xs text-surface-500">{currency}</p>
					</div>
				</div>
			{/if}
		{/each}
	{/if}
</div>
