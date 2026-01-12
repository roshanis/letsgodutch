<script lang="ts">
	import type { Member } from '$lib/types';
	import MemberAvatar from './MemberAvatar.svelte';

	interface Props {
		members: Member[];
		amount: number;
		currency: string;
		percentages: Map<string, number>;
		onChange: (percentages: Map<string, number>) => void;
	}

	let { members, amount, currency, percentages, onChange }: Props = $props();

	const total = $derived(Array.from(percentages.values()).reduce((sum, p) => sum + p, 0));
	const isValid = $derived(Math.abs(total - 100) < 0.01);

	function updatePercentage(memberId: string, value: string) {
		const newMap = new Map(percentages);
		newMap.set(memberId, parseFloat(value) || 0);
		onChange(newMap);
	}

	function distributeEvenly() {
		const evenPct = 100 / members.length;
		const newMap = new Map<string, number>();
		members.forEach((m) => newMap.set(m.id, Math.round(evenPct * 100) / 100));
		onChange(newMap);
	}
</script>

<div class="space-y-3">
	<div class="flex justify-between items-center">
		<span class="text-sm text-surface-400">Percentage split</span>
		<button type="button" class="text-xs text-primary-400 hover:underline" onclick={distributeEvenly}>
			Split evenly
		</button>
	</div>

	{#each members as member (member.id)}
		{@const pct = percentages.get(member.id) ?? 0}
		{@const memberAmount = (amount * pct) / 100}
		<div class="flex items-center gap-3">
			<MemberAvatar name={member.name} size="sm" />
			<span class="flex-1 text-sm truncate">{member.name}</span>
			<div class="flex items-center gap-2">
				<input
					type="number"
					min="0"
					max="100"
					step="0.1"
					class="input w-20 px-2 py-1 text-sm text-right bg-surface-700"
					value={pct}
					onchange={(e) => updatePercentage(member.id, e.currentTarget.value)}
				/>
				<span class="text-surface-400 text-sm w-6">%</span>
				<span class="text-xs text-surface-500 w-20 text-right">
					{currency} {memberAmount.toFixed(2)}
				</span>
			</div>
		</div>
	{/each}

	<div class="flex justify-between pt-2 border-t border-surface-700">
		<span class="text-sm {isValid ? 'text-green-400' : 'text-red-400'}">
			Total: {total.toFixed(1)}%
		</span>
		{#if !isValid}
			<span class="text-xs text-red-400">Must equal 100%</span>
		{/if}
	</div>
</div>
