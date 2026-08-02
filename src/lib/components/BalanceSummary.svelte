<script lang="ts">
	import type { Debt, Member, Settlement } from '$lib/types';
	import MemberAvatar from './MemberAvatar.svelte';

	interface Props {
		debts: Debt[];
		members: Member[];
		currency: string;
		settlements?: Settlement[];
		onSettle?: (debt: Debt) => void;
		onDeleteSettlement?: (settlementId: string) => void;
	}

	let { debts, members, currency, settlements = [], onSettle, onDeleteSettlement }: Props = $props();

	// Debt awaiting settle confirmation, keyed by from+to
	let confirmingKey = $state<string | null>(null);

	function getMember(id: string): Member | undefined {
		return members.find((m) => m.id === id);
	}

	function debtKey(debt: Debt): string {
		return debt.from + debt.to;
	}

	function confirmSettle(debt: Debt) {
		confirmingKey = null;
		onSettle?.(debt);
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
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
				<div class="p-3 rounded-lg bg-surface-800">
					<div class="flex items-center gap-3">
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
						{#if onSettle}
							<button
								class="btn btn-sm variant-ghost-primary"
								onclick={() => (confirmingKey = debtKey(debt))}
							>
								Mark settled
							</button>
						{/if}
					</div>
					{#if confirmingKey === debtKey(debt)}
						<div class="mt-3 pt-3 border-t border-surface-700 flex items-center gap-2">
							<p class="flex-1 text-sm text-surface-300">
								Record that {fromMember.name} paid {toMember.name}
								{debt.amount.toFixed(2)} {currency}?
							</p>
							<button class="btn btn-sm variant-filled-primary" onclick={() => confirmSettle(debt)}>
								Confirm
							</button>
							<button class="btn btn-sm variant-ghost-surface" onclick={() => (confirmingKey = null)}>
								Cancel
							</button>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}

	{#if settlements.length > 0}
		<h3 class="text-sm font-medium text-surface-400 uppercase tracking-wide pt-4">
			Settlement History
		</h3>
		{#each settlements as settlement (settlement.id)}
			{@const fromMember = getMember(settlement.from)}
			{@const toMember = getMember(settlement.to)}
			{#if fromMember && toMember}
				<div class="flex items-center gap-3 p-3 rounded-lg bg-surface-800/60">
					<div class="text-lg">💸</div>
					<div class="flex-1">
						<p class="text-sm">
							<span class="font-medium text-surface-50">{fromMember.name}</span>
							<span class="text-surface-400"> paid </span>
							<span class="font-medium text-surface-50">{toMember.name}</span>
						</p>
						<p class="text-xs text-surface-500">{formatDate(settlement.date)}</p>
					</div>
					<div class="text-right">
						<p class="font-semibold text-green-400">{settlement.amount.toFixed(2)}</p>
						<p class="text-xs text-surface-500">{settlement.currency}</p>
					</div>
					{#if onDeleteSettlement}
						<button
							class="btn btn-sm variant-ghost-surface text-surface-400"
							onclick={() => onDeleteSettlement?.(settlement.id)}
							aria-label="Undo settlement"
						>
							Undo
						</button>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>
