<script lang="ts">
	import type { Expense, Member } from '$lib/types';
	import MemberAvatar from './MemberAvatar.svelte';

	interface Props {
		expense: Expense;
		paidByMember?: Member;
		onClick?: () => void;
	}

	let { expense, paidByMember, onClick }: Props = $props();

	const dateStr = new Date(expense.date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric'
	});

	const categoryIcons: Record<string, string> = {
		food: '🍔',
		transport: '🚗',
		accommodation: '🏨',
		entertainment: '🎬',
		shopping: '🛍️',
		utilities: '💡',
		other: '📝'
	};

	const icon = categoryIcons[expense.category ?? 'other'] ?? '📝';
</script>

<button
	class="w-full text-left p-4 rounded-lg bg-surface-800 hover:bg-surface-700/50 transition-colors"
	onclick={onClick}
>
	<div class="flex items-start gap-3">
		<div class="text-2xl">{icon}</div>
		<div class="flex-1 min-w-0">
			<p class="font-medium text-surface-50 truncate">{expense.description}</p>
			<div class="flex items-center gap-2 mt-1">
				{#if paidByMember}
					<MemberAvatar name={paidByMember.name} size="sm" />
					<span class="text-sm text-surface-400">paid</span>
				{/if}
				<span class="text-xs text-surface-500">{dateStr}</span>
			</div>
		</div>
		<div class="text-right">
			<p class="font-semibold text-surface-50">
				{expense.amount.toFixed(2)}
			</p>
			<p class="text-xs text-surface-400">{expense.currency}</p>
		</div>
	</div>
</button>
