<script lang="ts">
	import type { Member } from '$lib/types';
	import MemberAvatar from './MemberAvatar.svelte';

	interface Props {
		members: Member[];
		amount: number;
		currency: string;
		amounts: Map<string, number>;
		onChange: (amounts: Map<string, number>) => void;
	}

	let { members, amount, currency, amounts, onChange }: Props = $props();

	const total = $derived(Array.from(amounts.values()).reduce((sum, a) => sum + a, 0));
	const remaining = $derived(amount - total);
	const isValid = $derived(Math.abs(remaining) < 0.01);

	function updateAmount(memberId: string, value: string) {
		const newMap = new Map(amounts);
		newMap.set(memberId, parseFloat(value) || 0);
		onChange(newMap);
	}

	function distributeRemaining() {
		if (remaining <= 0) return;
		const perPerson = remaining / members.length;
		const newMap = new Map(amounts);
		members.forEach((m) => {
			const current = newMap.get(m.id) ?? 0;
			newMap.set(m.id, Math.round((current + perPerson) * 100) / 100);
		});
		onChange(newMap);
	}
</script>

<div class="space-y-3">
	<div class="flex justify-between items-center">
		<span class="text-sm text-surface-400">Exact amounts</span>
		{#if remaining > 0.01}
			<button type="button" class="text-xs text-primary-400 hover:underline" onclick={distributeRemaining}>
				Distribute {currency} {remaining.toFixed(2)}
			</button>
		{/if}
	</div>

	{#each members as member (member.id)}
		{@const memberAmount = amounts.get(member.id) ?? 0}
		<div class="flex items-center gap-3">
			<MemberAvatar name={member.name} size="sm" />
			<span class="flex-1 text-sm truncate">{member.name}</span>
			<div class="flex items-center gap-1">
				<span class="text-surface-400 text-sm">{currency}</span>
				<input
					type="number"
					min="0"
					step="0.01"
					class="input w-24 px-2 py-1 text-sm text-right bg-surface-700"
					value={memberAmount}
					onchange={(e) => updateAmount(member.id, e.currentTarget.value)}
				/>
			</div>
		</div>
	{/each}

	<div class="flex justify-between pt-2 border-t border-surface-700">
		<span class="text-sm">Total: {currency} {total.toFixed(2)}</span>
		<span class="text-sm {isValid ? 'text-green-400' : 'text-red-400'}">
			{#if isValid}
				✓ Matches
			{:else if remaining > 0}
				{currency} {remaining.toFixed(2)} remaining
			{:else}
				{currency} {Math.abs(remaining).toFixed(2)} over
			{/if}
		</span>
	</div>
</div>
