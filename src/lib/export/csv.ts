import type { Group, Member, Expense } from '$lib/types';

/**
 * CSV export of expenses (spreadsheet-friendly, Splitwise-style).
 * One row per expense with the payer and each member's share.
 */

function escapeCsvField(value: string): string {
	if (/[",\n\r]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

function formatDate(timestamp: number): string {
	return new Date(timestamp).toISOString().slice(0, 10);
}

/**
 * Convert expenses to CSV. Member names become the per-share columns' content
 * ("Name=amount", semicolon-separated) so the file is readable without the app.
 */
export function expensesToCsv(
	groups: Group[],
	members: Member[],
	expenses: Expense[]
): string {
	const groupById = new Map(groups.map((g) => [g.id, g]));
	const memberById = new Map(members.map((m) => [m.id, m]));

	const header = ['Group', 'Date', 'Description', 'Category', 'Currency', 'Amount', 'Paid By', 'Splits'];

	const rows = expenses.map((expense) => {
		const splits = expense.splits
			.map((split) => {
				const name = memberById.get(split.memberId)?.name ?? split.memberId;
				return `${name}=${split.resolvedAmount.toFixed(2)}`;
			})
			.join('; ');

		return [
			groupById.get(expense.groupId)?.name ?? expense.groupId,
			formatDate(expense.date),
			expense.description,
			expense.category ?? '',
			expense.currency,
			expense.amount.toFixed(2),
			memberById.get(expense.paidBy)?.name ?? expense.paidBy,
			splits
		];
	});

	return [header, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\n');
}
