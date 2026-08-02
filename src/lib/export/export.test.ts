import { describe, it, expect, beforeEach } from 'vitest';
import { db, resetDatabase } from '$lib/db';
import { exportAllData, serializeExport, importData, validateExport } from './json';
import { expensesToCsv } from './csv';

describe('Export / Import', () => {
	beforeEach(async () => {
		await resetDatabase();
	});

	async function seedData() {
		const group = await db.groups.create({ name: 'Trip', defaultCurrency: 'USD' });
		const alice = await db.members.create({
			groupId: group.id,
			name: 'Alice',
			homeCurrency: 'USD'
		});
		const bob = await db.members.create({ groupId: group.id, name: 'Bob', homeCurrency: 'USD' });
		const expense = await db.expenses.create({
			groupId: group.id,
			paidBy: alice.id,
			amount: 50,
			currency: 'USD',
			exchangeRate: 1,
			description: 'Dinner, with "quotes"',
			category: 'food',
			date: Date.UTC(2026, 0, 15),
			splits: [
				{ memberId: alice.id, type: 'equal', value: 1, resolvedAmount: 25 },
				{ memberId: bob.id, type: 'equal', value: 1, resolvedAmount: 25 }
			]
		});
		const settlement = await db.settlements.create({
			groupId: group.id,
			from: bob.id,
			to: alice.id,
			amount: 25,
			currency: 'USD'
		});
		return { group, alice, bob, expense, settlement };
	}

	describe('JSON export', () => {
		it('should export all tables', async () => {
			await seedData();
			const data = await exportAllData();

			expect(data.app).toBe('letsgodutch');
			expect(data.groups).toHaveLength(1);
			expect(data.members).toHaveLength(2);
			expect(data.expenses).toHaveLength(1);
			expect(data.settlements).toHaveLength(1);
		});

		it('should round-trip through export and import with ids preserved', async () => {
			const seeded = await seedData();
			const json = serializeExport(await exportAllData());

			await resetDatabase();
			const counts = await importData(json);

			expect(counts).toEqual({ groups: 1, members: 2, expenses: 1, settlements: 1 });

			const group = await db.groups.get(seeded.group.id);
			expect(group?.name).toBe('Trip');

			const expense = await db.expenses.get(seeded.expense.id);
			expect(expense?.paidBy).toBe(seeded.alice.id);
			expect(expense?.splits).toHaveLength(2);

			const settlement = await db.settlements.get(seeded.settlement.id);
			expect(settlement?.from).toBe(seeded.bob.id);
		});

		it('should merge into existing data without duplicating same ids', async () => {
			await seedData();
			const json = serializeExport(await exportAllData());

			// Import on top of the same data
			await importData(json);

			const data = await exportAllData();
			expect(data.groups).toHaveLength(1);
			expect(data.expenses).toHaveLength(1);
		});

		it('should reject non-JSON input', async () => {
			await expect(importData('not json at all')).rejects.toThrow(/could not parse/i);
		});

		it('should reject JSON from another app', async () => {
			await expect(importData(JSON.stringify({ app: 'other', version: 1 }))).rejects.toThrow(
				/not a LetsGoDutch export/i
			);
		});

		it('should reject a newer export version', () => {
			expect(() =>
				validateExport({
					app: 'letsgodutch',
					version: 999,
					groups: [],
					members: [],
					expenses: [],
					settlements: []
				})
			).toThrow(/unsupported/i);
		});

		it('should reject entries without ids', () => {
			expect(() =>
				validateExport({
					app: 'letsgodutch',
					version: 1,
					groups: [{ name: 'no id' }],
					members: [],
					expenses: [],
					settlements: []
				})
			).toThrow(/no id/i);
		});
	});

	describe('CSV export', () => {
		it('should produce a header and one row per expense', async () => {
			await seedData();
			const data = await exportAllData();
			const csv = expensesToCsv(data.groups, data.members, data.expenses);
			const lines = csv.split('\n');

			expect(lines[0]).toBe('Group,Date,Description,Category,Currency,Amount,Paid By,Splits');
			expect(lines).toHaveLength(2);
			expect(lines[1]).toContain('Trip');
			expect(lines[1]).toContain('2026-01-15');
			expect(lines[1]).toContain('50.00');
			expect(lines[1]).toContain('Alice');
		});

		it('should escape quotes and commas in fields', async () => {
			await seedData();
			const data = await exportAllData();
			const csv = expensesToCsv(data.groups, data.members, data.expenses);

			// Description with comma and quotes must be quoted with doubled quotes
			expect(csv).toContain('"Dinner, with ""quotes"""');
		});

		it('should include each member share in the splits column', async () => {
			await seedData();
			const data = await exportAllData();
			const csv = expensesToCsv(data.groups, data.members, data.expenses);

			expect(csv).toContain('Alice=25.00');
			expect(csv).toContain('Bob=25.00');
		});
	});
});
