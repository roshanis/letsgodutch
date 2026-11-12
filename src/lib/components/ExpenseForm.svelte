<script lang="ts">
	import { db } from '$lib/db';
	import { calculateEqualSplit } from '$lib/calc/balance';
	import { getRate } from '$lib/currency/convert';
	import type { Member } from '$lib/types';
	import MemberAvatar from './MemberAvatar.svelte';
	import CurrencyPicker from './CurrencyPicker.svelte';

	interface Props {
		groupId: string;
		members: Member[];
		currency: string;
		onSaved: () => void;
		onCancel: () => void;
	}

	let { groupId, members, currency, onSaved, onCancel }: Props = $props();

	let description = $state('');
	let amount = $state('');
	let paidBy = $state(members[0]?.id ?? '');
	let selectedMembers = $state<Set<string>>(new Set(members.map((m) => m.id)));
	let category = $state('other');
	let loading = $state(false);
	let error = $state('');

	// Per-expense currency; empty means the group's currency
	let selectedCurrency = $state('');
	const expenseCurrency = $derived(selectedCurrency || currency);
	let rateInput = $state('1');
	let rateLoading = $state(false);
	let rateError = $state('');

	const isForeignCurrency = $derived(expenseCurrency !== currency);
	const parsedRate = $derived(isForeignCurrency ? parseFloat(rateInput) : 1);
	const convertedPreview = $derived.by(() => {
		const amountNum = parseFloat(amount);
		if (!isForeignCurrency || isNaN(amountNum) || isNaN(parsedRate)) return null;
		return (amountNum * parsedRate).toFixed(2);
	});

	async function handleCurrencyChange(code: string) {
		selectedCurrency = code;
		rateError = '';
		if (code === currency) {
			rateInput = '1';
			return;
		}
		rateLoading = true;
		try {
			const rate = await getRate(code, currency);
			rateInput = String(rate);
		} catch {
			rateError = `Couldn't fetch the ${code}→${currency} rate — enter it manually`;
		} finally {
			rateLoading = false;
		}
	}

	const categories = [
		{ value: 'food', label: '🍔 Food' },
		{ value: 'transport', label: '🚗 Transport' },
		{ value: 'accommodation', label: '🏨 Accommodation' },
		{ value: 'entertainment', label: '🎬 Entertainment' },
		{ value: 'shopping', label: '🛍️ Shopping' },
		{ value: 'utilities', label: '💡 Utilities' },
		{ value: 'other', label: '📝 Other' }
	];

	function toggleMember(memberId: string) {
		const newSet = new Set(selectedMembers);
		if (newSet.has(memberId)) {
			if (newSet.size > 1) {
				newSet.delete(memberId);
			}
		} else {
			newSet.add(memberId);
		}
		selectedMembers = newSet;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const amountNum = parseFloat(amount);
		if (!description.trim()) {
			error = 'Please enter a description';
			return;
		}
		if (isNaN(amountNum) || amountNum <= 0) {
			error = 'Please enter a valid amount';
			return;
		}
		if (!paidBy) {
			error = 'Please select who paid';
			return;
		}
		if (selectedMembers.size === 0) {
			error = 'Please select at least one member to split with';
			return;
		}
		if (isForeignCurrency && (isNaN(parsedRate) || parsedRate <= 0)) {
			error = `Please enter a valid exchange rate to ${currency}`;
			return;
		}

		loading = true;
		error = '';

		try {
			const splits = calculateEqualSplit(amountNum, Array.from(selectedMembers));

			await db.expenses.create({
				groupId,
				paidBy,
				amount: amountNum,
				currency: expenseCurrency,
				exchangeRate: parsedRate,
				description: description.trim(),
				category,
				date: Date.now(),
				splits
			});

			onSaved();
		} catch (err) {
			error = 'Failed to save expense';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<!-- Amount -->
	<div class="text-center">
		<label class="label">
			<span class="text-sm text-surface-400">Amount</span>
			<div class="flex items-center justify-center gap-2 mt-2">
				<span class="text-2xl text-surface-400">{expenseCurrency}</span>
				<input
					type="number"
					step="0.01"
					min="0"
					class="input text-4xl font-bold text-center bg-transparent border-none w-40 p-0"
					placeholder="0.00"
					bind:value={amount}
					disabled={loading}
				/>
			</div>
		</label>
	</div>

	<!-- Currency -->
	<div>
		<p class="text-sm text-surface-300 mb-2">Currency</p>
		<CurrencyPicker value={expenseCurrency} onChange={handleCurrencyChange} />
		{#if isForeignCurrency}
			<div class="mt-3 flex items-center gap-3">
				<label class="label flex-1">
					<span class="text-sm text-surface-300">Rate to {currency}</span>
					<input
						type="number"
						step="any"
						min="0"
						class="input px-4 py-2 bg-surface-700"
						placeholder="e.g. 1.08"
						bind:value={rateInput}
						disabled={loading || rateLoading}
					/>
				</label>
				<div class="flex-1 text-sm text-surface-400 pt-5">
					{#if rateLoading}
						Fetching rate...
					{:else if convertedPreview}
						≈ {convertedPreview} {currency}
					{/if}
				</div>
			</div>
			{#if rateError}
				<p class="text-warning-400 text-xs mt-1">{rateError}</p>
			{/if}
		{/if}
	</div>

	<!-- Description -->
	<label class="label">
		<span class="text-sm text-surface-300">Description</span>
		<input
			type="text"
			class="input px-4 py-2 bg-surface-700"
			placeholder="What's this for?"
			bind:value={description}
			disabled={loading}
		/>
	</label>

	<!-- Category -->
	<label class="label">
		<span class="text-sm text-surface-300">Category</span>
		<select class="select px-4 py-2 bg-surface-700" bind:value={category} disabled={loading}>
			{#each categories as cat}
				<option value={cat.value}>{cat.label}</option>
			{/each}
		</select>
	</label>

	<!-- Paid By -->
	<div>
		<p class="text-sm text-surface-300 mb-2">Paid by</p>
		<div class="flex flex-wrap gap-2">
			{#each members as member (member.id)}
				<button
					type="button"
					class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors {paidBy === member.id
						? 'bg-primary-500 text-white'
						: 'bg-surface-700 text-surface-300 hover:bg-surface-600'}"
					onclick={() => (paidBy = member.id)}
					disabled={loading}
				>
					<MemberAvatar name={member.name} size="sm" />
					<span class="text-sm">{member.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Split With -->
	<div>
		<p class="text-sm text-surface-300 mb-2">Split equally with</p>
		<div class="flex flex-wrap gap-2">
			{#each members as member (member.id)}
				<button
					type="button"
					class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors {selectedMembers.has(
						member.id
					)
						? 'bg-secondary-500 text-white'
						: 'bg-surface-700 text-surface-300 hover:bg-surface-600'}"
					onclick={() => toggleMember(member.id)}
					disabled={loading}
				>
					<MemberAvatar name={member.name} size="sm" />
					<span class="text-sm">{member.name}</span>
				</button>
			{/each}
		</div>
		<p class="text-xs text-surface-500 mt-2">
			{selectedMembers.size} people · {amount ? (parseFloat(amount) / selectedMembers.size).toFixed(2) : '0.00'} {expenseCurrency} each
		</p>
	</div>

	{#if error}
		<p class="text-red-400 text-sm">{error}</p>
	{/if}

	<!-- Actions -->
	<div class="flex gap-3 pt-2">
		<button
			type="button"
			class="btn variant-ghost-surface flex-1"
			onclick={onCancel}
			disabled={loading}
		>
			Cancel
		</button>
		<button type="submit" class="btn variant-filled-primary flex-1" disabled={loading}>
			{loading ? 'Saving...' : 'Save Expense'}
		</button>
	</div>
</form>
