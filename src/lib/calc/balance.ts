import type { Expense, Member, Split, Debt } from '$lib/types';

/**
 * Calculate total amount paid by each member
 */
export function calculateTotals(expenses: Expense[], members: Member[]): Map<string, number> {
	const totals = new Map<string, number>();

	// Initialize all members with 0
	for (const member of members) {
		totals.set(member.id, 0);
	}

	// Sum up payments
	for (const expense of expenses) {
		const current = totals.get(expense.paidBy) ?? 0;
		totals.set(expense.paidBy, current + expense.amount);
	}

	return totals;
}

/**
 * Calculate balance for each member
 * Positive = is owed money
 * Negative = owes money
 */
export function calculateBalances(expenses: Expense[], members: Member[]): Map<string, number> {
	const balances = new Map<string, number>();

	// Initialize all members with 0
	for (const member of members) {
		balances.set(member.id, 0);
	}

	for (const expense of expenses) {
		// The payer gets credit for the full amount
		const payerBalance = balances.get(expense.paidBy) ?? 0;
		balances.set(expense.paidBy, payerBalance + expense.amount);

		// Each person in the split owes their portion
		for (const split of expense.splits) {
			const memberBalance = balances.get(split.memberId) ?? 0;
			balances.set(split.memberId, memberBalance - split.resolvedAmount);
		}
	}

	return balances;
}

/**
 * Simplify debts to minimize number of transactions
 * Uses a greedy algorithm to settle debts
 */
export function simplifyDebts(balances: Map<string, number>): Debt[] {
	const debts: Debt[] = [];

	// Separate into creditors (positive balance) and debtors (negative balance)
	const creditors: { id: string; amount: number }[] = [];
	const debtors: { id: string; amount: number }[] = [];

	for (const [memberId, balance] of balances) {
		if (balance > 0.01) {
			creditors.push({ id: memberId, amount: balance });
		} else if (balance < -0.01) {
			debtors.push({ id: memberId, amount: -balance }); // Store as positive
		}
	}

	// Sort by amount descending for optimal matching
	creditors.sort((a, b) => b.amount - a.amount);
	debtors.sort((a, b) => b.amount - a.amount);

	// Greedy matching
	let i = 0;
	let j = 0;

	while (i < creditors.length && j < debtors.length) {
		const creditor = creditors[i];
		const debtor = debtors[j];

		const amount = Math.min(creditor.amount, debtor.amount);

		if (amount > 0.01) {
			debts.push({
				from: debtor.id,
				to: creditor.id,
				amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
			});
		}

		creditor.amount -= amount;
		debtor.amount -= amount;

		if (creditor.amount < 0.01) i++;
		if (debtor.amount < 0.01) j++;
	}

	return debts;
}

/**
 * Calculate equal split among members
 */
export function calculateEqualSplit(amount: number, memberIds: string[]): Split[] {
	const perPerson = amount / memberIds.length;

	return memberIds.map((memberId) => ({
		memberId,
		type: 'equal' as const,
		value: 1,
		resolvedAmount: Math.round(perPerson * 100) / 100
	}));
}

/**
 * Calculate percentage-based split
 * Normalizes if percentages don't sum to 100
 */
export function calculatePercentageSplit(
	amount: number,
	percentages: Map<string, number>
): Split[] {
	// Calculate total percentage
	let totalPercentage = 0;
	for (const pct of percentages.values()) {
		totalPercentage += pct;
	}

	// Normalize if needed
	const normalizer = totalPercentage > 0 ? 100 / totalPercentage : 1;

	const splits: Split[] = [];

	for (const [memberId, percentage] of percentages) {
		const normalizedPct = percentage * normalizer;
		const resolvedAmount = (amount * normalizedPct) / 100;

		splits.push({
			memberId,
			type: 'percentage',
			value: normalizedPct,
			resolvedAmount: Math.round(resolvedAmount * 100) / 100
		});
	}

	return splits;
}

/**
 * Calculate shares-based split
 * e.g., 2:1:1 shares = 50%, 25%, 25%
 */
export function calculateSharesSplit(amount: number, shares: Map<string, number>): Split[] {
	// Calculate total shares
	let totalShares = 0;
	for (const share of shares.values()) {
		totalShares += share;
	}

	const splits: Split[] = [];

	for (const [memberId, share] of shares) {
		const resolvedAmount = totalShares > 0 ? (amount * share) / totalShares : 0;

		splits.push({
			memberId,
			type: 'shares',
			value: share,
			resolvedAmount: Math.round(resolvedAmount * 100) / 100
		});
	}

	return splits;
}

/**
 * Calculate exact amount split (user specifies exact amounts)
 */
export function calculateExactSplit(exactAmounts: Map<string, number>): Split[] {
	const splits: Split[] = [];

	for (const [memberId, amount] of exactAmounts) {
		splits.push({
			memberId,
			type: 'exact',
			value: amount,
			resolvedAmount: amount
		});
	}

	return splits;
}
