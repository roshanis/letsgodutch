import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, resetDatabase } from './index';

describe('Database', () => {
	beforeEach(async () => {
		await resetDatabase();
	});

	afterEach(async () => {
		await resetDatabase();
	});

	describe('Groups', () => {
		it('should create a group', async () => {
			const group = await db.groups.create({
				name: 'Trip to Berlin',
				defaultCurrency: 'EUR'
			});

			expect(group.id).toBeDefined();
			expect(group.name).toBe('Trip to Berlin');
			expect(group.defaultCurrency).toBe('EUR');
			expect(group.createdAt).toBeDefined();
			expect(group.updatedAt).toBeDefined();
		});

		it('should get a group by id', async () => {
			const created = await db.groups.create({
				name: 'Roommates',
				defaultCurrency: 'USD'
			});

			const found = await db.groups.get(created.id);
			expect(found).toBeDefined();
			expect(found?.name).toBe('Roommates');
		});

		it('should list all groups', async () => {
			await db.groups.create({ name: 'Group 1', defaultCurrency: 'USD' });
			await db.groups.create({ name: 'Group 2', defaultCurrency: 'EUR' });

			const groups = await db.groups.list();
			expect(groups).toHaveLength(2);
		});

		it('should update a group', async () => {
			const group = await db.groups.create({
				name: 'Old Name',
				defaultCurrency: 'USD'
			});

			const updated = await db.groups.update(group.id, { name: 'New Name' });
			expect(updated?.name).toBe('New Name');
			expect(updated?.updatedAt).toBeGreaterThanOrEqual(group.updatedAt);
		});

		it('should delete a group', async () => {
			const group = await db.groups.create({
				name: 'To Delete',
				defaultCurrency: 'USD'
			});

			await db.groups.delete(group.id);
			const found = await db.groups.get(group.id);
			expect(found).toBeUndefined();
		});
	});

	describe('Members', () => {
		let groupId: string;

		beforeEach(async () => {
			const group = await db.groups.create({
				name: 'Test Group',
				defaultCurrency: 'USD'
			});
			groupId = group.id;
		});

		it('should add a member to a group', async () => {
			const member = await db.members.create({
				groupId,
				name: 'Alice',
				homeCurrency: 'USD'
			});

			expect(member.id).toBeDefined();
			expect(member.name).toBe('Alice');
			expect(member.groupId).toBe(groupId);
		});

		it('should list members of a group', async () => {
			await db.members.create({ groupId, name: 'Alice', homeCurrency: 'USD' });
			await db.members.create({ groupId, name: 'Bob', homeCurrency: 'EUR' });

			const members = await db.members.listByGroup(groupId);
			expect(members).toHaveLength(2);
		});

		it('should update a member', async () => {
			const member = await db.members.create({
				groupId,
				name: 'Old Name',
				homeCurrency: 'USD'
			});

			const updated = await db.members.update(member.id, { name: 'New Name' });
			expect(updated?.name).toBe('New Name');
		});

		it('should delete a member', async () => {
			const member = await db.members.create({
				groupId,
				name: 'To Delete',
				homeCurrency: 'USD'
			});

			await db.members.delete(member.id);
			const members = await db.members.listByGroup(groupId);
			expect(members).toHaveLength(0);
		});
	});

	describe('Expenses', () => {
		let groupId: string;
		let memberId: string;

		beforeEach(async () => {
			const group = await db.groups.create({
				name: 'Test Group',
				defaultCurrency: 'USD'
			});
			groupId = group.id;

			const member = await db.members.create({
				groupId,
				name: 'Alice',
				homeCurrency: 'USD'
			});
			memberId = member.id;
		});

		it('should create an expense', async () => {
			const expense = await db.expenses.create({
				groupId,
				paidBy: memberId,
				amount: 100,
				currency: 'USD',
				exchangeRate: 1,
				description: 'Dinner',
				date: Date.now(),
				splits: [
					{ memberId, type: 'equal', value: 1, resolvedAmount: 100 }
				]
			});

			expect(expense.id).toBeDefined();
			expect(expense.amount).toBe(100);
			expect(expense.description).toBe('Dinner');
		});

		it('should list expenses by group', async () => {
			await db.expenses.create({
				groupId,
				paidBy: memberId,
				amount: 50,
				currency: 'USD',
				exchangeRate: 1,
				description: 'Lunch',
				date: Date.now(),
				splits: []
			});

			await db.expenses.create({
				groupId,
				paidBy: memberId,
				amount: 75,
				currency: 'USD',
				exchangeRate: 1,
				description: 'Coffee',
				date: Date.now(),
				splits: []
			});

			const expenses = await db.expenses.listByGroup(groupId);
			expect(expenses).toHaveLength(2);
		});

		it('should update an expense', async () => {
			const expense = await db.expenses.create({
				groupId,
				paidBy: memberId,
				amount: 100,
				currency: 'USD',
				exchangeRate: 1,
				description: 'Original',
				date: Date.now(),
				splits: []
			});

			const updated = await db.expenses.update(expense.id, {
				description: 'Updated',
				amount: 150
			});

			expect(updated?.description).toBe('Updated');
			expect(updated?.amount).toBe(150);
		});

		it('should delete an expense', async () => {
			const expense = await db.expenses.create({
				groupId,
				paidBy: memberId,
				amount: 100,
				currency: 'USD',
				exchangeRate: 1,
				description: 'To Delete',
				date: Date.now(),
				splits: []
			});

			await db.expenses.delete(expense.id);
			const expenses = await db.expenses.listByGroup(groupId);
			expect(expenses).toHaveLength(0);
		});
	});

	describe('Settlements', () => {
		let groupId: string;
		let aliceId: string;
		let bobId: string;

		beforeEach(async () => {
			const group = await db.groups.create({
				name: 'Test Group',
				defaultCurrency: 'USD'
			});
			groupId = group.id;

			const alice = await db.members.create({ groupId, name: 'Alice', homeCurrency: 'USD' });
			const bob = await db.members.create({ groupId, name: 'Bob', homeCurrency: 'USD' });
			aliceId = alice.id;
			bobId = bob.id;
		});

		it('should create a settlement', async () => {
			const settlement = await db.settlements.create({
				groupId,
				from: bobId,
				to: aliceId,
				amount: 25.5,
				currency: 'USD'
			});

			expect(settlement.id).toBeDefined();
			expect(settlement.from).toBe(bobId);
			expect(settlement.to).toBe(aliceId);
			expect(settlement.amount).toBe(25.5);
			expect(settlement.date).toBeDefined();
		});

		it('should list settlements by group', async () => {
			await db.settlements.create({ groupId, from: bobId, to: aliceId, amount: 10, currency: 'USD' });
			await db.settlements.create({ groupId, from: aliceId, to: bobId, amount: 5, currency: 'USD' });

			const settlements = await db.settlements.listByGroup(groupId);
			expect(settlements).toHaveLength(2);
		});

		it('should delete a settlement', async () => {
			const settlement = await db.settlements.create({
				groupId,
				from: bobId,
				to: aliceId,
				amount: 10,
				currency: 'USD'
			});

			await db.settlements.delete(settlement.id);
			const settlements = await db.settlements.listByGroup(groupId);
			expect(settlements).toHaveLength(0);
		});

		it('should delete settlements when the group is deleted', async () => {
			await db.settlements.create({ groupId, from: bobId, to: aliceId, amount: 10, currency: 'USD' });

			await db.groups.delete(groupId);
			const settlements = await db.settlements.listByGroup(groupId);
			expect(settlements).toHaveLength(0);
		});
	});

	describe('Id-preserving upserts (put)', () => {
		it('should keep the caller-provided ids', async () => {
			const now = Date.now();
			await db.groups.put({
				id: 'group-1',
				name: 'Synced Group',
				defaultCurrency: 'EUR',
				createdAt: now,
				updatedAt: now
			});
			await db.members.put({
				id: 'member-1',
				groupId: 'group-1',
				name: 'Alice',
				homeCurrency: 'EUR',
				createdAt: now
			});
			await db.expenses.put({
				id: 'expense-1',
				groupId: 'group-1',
				paidBy: 'member-1',
				amount: 42,
				currency: 'EUR',
				exchangeRate: 1,
				description: 'Synced expense',
				date: now,
				splits: [{ memberId: 'member-1', type: 'equal', value: 1, resolvedAmount: 42 }],
				createdAt: now,
				updatedAt: now
			});

			const group = await db.groups.get('group-1');
			const member = await db.members.get('member-1');
			const expense = await db.expenses.get('expense-1');

			expect(group?.name).toBe('Synced Group');
			expect(member?.groupId).toBe('group-1');
			expect(expense?.paidBy).toBe('member-1');
		});

		it('should overwrite an existing record with the same id', async () => {
			const now = Date.now();
			const base = {
				id: 'group-1',
				name: 'Original',
				defaultCurrency: 'USD',
				createdAt: now,
				updatedAt: now
			};
			await db.groups.put(base);
			await db.groups.put({ ...base, name: 'Updated' });

			const groups = await db.groups.list();
			expect(groups).toHaveLength(1);
			expect(groups[0].name).toBe('Updated');
		});
	});
});
