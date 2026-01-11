import { describe, it, expect } from 'vitest';
import {
	calculateTotals,
	calculateBalances,
	simplifyDebts,
	calculateEqualSplit,
	calculatePercentageSplit,
	calculateSharesSplit
} from './balance';
import type { Expense, Member, Split, Debt } from '$lib/types';

describe('Balance Calculations', () => {
	const members: Member[] = [
		{ id: 'alice', groupId: 'g1', name: 'Alice', homeCurrency: 'USD', createdAt: 0 },
		{ id: 'bob', groupId: 'g1', name: 'Bob', homeCurrency: 'USD', createdAt: 0 },
		{ id: 'carol', groupId: 'g1', name: 'Carol', homeCurrency: 'USD', createdAt: 0 }
	];

	describe('calculateTotals', () => {
		it('should calculate total paid per member', () => {
			const expenses: Expense[] = [
				{
					id: 'e1',
					groupId: 'g1',
					paidBy: 'alice',
					amount: 90,
					currency: 'USD',
					exchangeRate: 1,
					description: 'Dinner',
					date: 0,
					splits: [],
					createdAt: 0,
					updatedAt: 0
				},
				{
					id: 'e2',
					groupId: 'g1',
					paidBy: 'bob',
					amount: 30,
					currency: 'USD',
					exchangeRate: 1,
					description: 'Coffee',
					date: 0,
					splits: [],
					createdAt: 0,
					updatedAt: 0
				}
			];

			const totals = calculateTotals(expenses, members);
			expect(totals.get('alice')).toBe(90);
			expect(totals.get('bob')).toBe(30);
			expect(totals.get('carol')).toBe(0);
		});
	});

	describe('calculateBalances', () => {
		it('should calculate who owes whom with equal splits', () => {
			// Alice paid $90 for dinner, split 3 ways = $30 each
			// Bob paid $30 for coffee, split 3 ways = $10 each
			// Total spent: $120, per person fair share: $40
			// Alice paid $90, owes $40, so is owed $50
			// Bob paid $30, owes $40, so owes $10
			// Carol paid $0, owes $40, so owes $40

			const expenses: Expense[] = [
				{
					id: 'e1',
					groupId: 'g1',
					paidBy: 'alice',
					amount: 90,
					currency: 'USD',
					exchangeRate: 1,
					description: 'Dinner',
					date: 0,
					splits: [
						{ memberId: 'alice', type: 'equal', value: 1, resolvedAmount: 30 },
						{ memberId: 'bob', type: 'equal', value: 1, resolvedAmount: 30 },
						{ memberId: 'carol', type: 'equal', value: 1, resolvedAmount: 30 }
					],
					createdAt: 0,
					updatedAt: 0
				},
				{
					id: 'e2',
					groupId: 'g1',
					paidBy: 'bob',
					amount: 30,
					currency: 'USD',
					exchangeRate: 1,
					description: 'Coffee',
					date: 0,
					splits: [
						{ memberId: 'alice', type: 'equal', value: 1, resolvedAmount: 10 },
						{ memberId: 'bob', type: 'equal', value: 1, resolvedAmount: 10 },
						{ memberId: 'carol', type: 'equal', value: 1, resolvedAmount: 10 }
					],
					createdAt: 0,
					updatedAt: 0
				}
			];

			const balances = calculateBalances(expenses, members);

			// Alice: paid 90, owes 40 -> balance = +50 (is owed)
			// Bob: paid 30, owes 40 -> balance = -10 (owes)
			// Carol: paid 0, owes 40 -> balance = -40 (owes)
			expect(balances.get('alice')).toBe(50);
			expect(balances.get('bob')).toBe(-10);
			expect(balances.get('carol')).toBe(-40);
		});

		it('should handle single payer scenario', () => {
			const expenses: Expense[] = [
				{
					id: 'e1',
					groupId: 'g1',
					paidBy: 'alice',
					amount: 60,
					currency: 'USD',
					exchangeRate: 1,
					description: 'Taxi',
					date: 0,
					splits: [
						{ memberId: 'alice', type: 'equal', value: 1, resolvedAmount: 20 },
						{ memberId: 'bob', type: 'equal', value: 1, resolvedAmount: 20 },
						{ memberId: 'carol', type: 'equal', value: 1, resolvedAmount: 20 }
					],
					createdAt: 0,
					updatedAt: 0
				}
			];

			const balances = calculateBalances(expenses, members);
			expect(balances.get('alice')).toBe(40); // Paid 60, owes 20
			expect(balances.get('bob')).toBe(-20); // Paid 0, owes 20
			expect(balances.get('carol')).toBe(-20); // Paid 0, owes 20
		});
	});

	describe('simplifyDebts', () => {
		it('should simplify debts to minimize transactions', () => {
			// Alice is owed $50
			// Bob owes $10
			// Carol owes $40
			const balances = new Map<string, number>([
				['alice', 50],
				['bob', -10],
				['carol', -40]
			]);

			const debts = simplifyDebts(balances);

			// Should result in:
			// Carol -> Alice: $40
			// Bob -> Alice: $10
			expect(debts).toHaveLength(2);

			const totalToAlice = debts
				.filter((d) => d.to === 'alice')
				.reduce((sum, d) => sum + d.amount, 0);
			expect(totalToAlice).toBe(50);
		});

		it('should handle zero balances', () => {
			const balances = new Map<string, number>([
				['alice', 0],
				['bob', 0],
				['carol', 0]
			]);

			const debts = simplifyDebts(balances);
			expect(debts).toHaveLength(0);
		});

		it('should handle all-positive impossible scenario gracefully', () => {
			// This shouldn't happen in practice, but handle edge case
			const balances = new Map<string, number>([
				['alice', 0],
				['bob', 0]
			]);

			const debts = simplifyDebts(balances);
			expect(debts).toHaveLength(0);
		});
	});

	describe('Split Calculations', () => {
		describe('calculateEqualSplit', () => {
			it('should split amount equally among members', () => {
				const splits = calculateEqualSplit(90, ['alice', 'bob', 'carol']);

				expect(splits).toHaveLength(3);
				expect(splits[0].resolvedAmount).toBe(30);
				expect(splits[1].resolvedAmount).toBe(30);
				expect(splits[2].resolvedAmount).toBe(30);
			});

			it('should handle non-divisible amounts', () => {
				const splits = calculateEqualSplit(100, ['alice', 'bob', 'carol']);

				// 100 / 3 = 33.33...
				// Total should still equal 100
				const total = splits.reduce((sum, s) => sum + s.resolvedAmount, 0);
				expect(total).toBeCloseTo(100, 2);
			});
		});

		describe('calculatePercentageSplit', () => {
			it('should split by percentage', () => {
				const percentages = new Map([
					['alice', 50],
					['bob', 30],
					['carol', 20]
				]);

				const splits = calculatePercentageSplit(100, percentages);

				const aliceSplit = splits.find((s) => s.memberId === 'alice');
				const bobSplit = splits.find((s) => s.memberId === 'bob');
				const carolSplit = splits.find((s) => s.memberId === 'carol');

				expect(aliceSplit?.resolvedAmount).toBe(50);
				expect(bobSplit?.resolvedAmount).toBe(30);
				expect(carolSplit?.resolvedAmount).toBe(20);
			});

			it('should handle percentages not totaling 100', () => {
				const percentages = new Map([
					['alice', 60],
					['bob', 60]
				]);

				// Should normalize or throw - implementation decides
				const splits = calculatePercentageSplit(100, percentages);
				const total = splits.reduce((sum, s) => sum + s.resolvedAmount, 0);

				// Either normalized to 100 or proportional
				expect(total).toBeCloseTo(100, 2);
			});
		});

		describe('calculateSharesSplit', () => {
			it('should split by shares', () => {
				const shares = new Map([
					['alice', 2],
					['bob', 1],
					['carol', 1]
				]);

				const splits = calculateSharesSplit(100, shares);

				const aliceSplit = splits.find((s) => s.memberId === 'alice');
				const bobSplit = splits.find((s) => s.memberId === 'bob');
				const carolSplit = splits.find((s) => s.memberId === 'carol');

				// Total shares = 4, Alice has 2/4 = 50%, others 25% each
				expect(aliceSplit?.resolvedAmount).toBe(50);
				expect(bobSplit?.resolvedAmount).toBe(25);
				expect(carolSplit?.resolvedAmount).toBe(25);
			});
		});
	});
});
