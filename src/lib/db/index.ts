import Dexie, { type EntityTable } from 'dexie';
import type { Group, Member, Expense, Split } from '$lib/types';

// Database schema
interface GroupRecord extends Group {}
interface MemberRecord extends Member {}
interface ExpenseRecord extends Expense {}

// Dexie database class
class LetsGoDutchDB extends Dexie {
	groups!: EntityTable<GroupRecord, 'id'>;
	members!: EntityTable<MemberRecord, 'id'>;
	expenses!: EntityTable<ExpenseRecord, 'id'>;

	constructor() {
		super('LetsGoDutchDB');

		this.version(1).stores({
			groups: 'id, name, createdAt',
			members: 'id, groupId, name',
			expenses: 'id, groupId, paidBy, date, createdAt'
		});
	}
}

// Database instance
const dexieDb = new LetsGoDutchDB();

// Generate UUID
function generateId(): string {
	return crypto.randomUUID();
}

// Group operations
const groups = {
	async create(data: { name: string; defaultCurrency: string }): Promise<Group> {
		const now = Date.now();
		const group: Group = {
			id: generateId(),
			name: data.name,
			defaultCurrency: data.defaultCurrency,
			createdAt: now,
			updatedAt: now
		};

		await dexieDb.groups.add(group);
		return group;
	},

	async get(id: string): Promise<Group | undefined> {
		return dexieDb.groups.get(id);
	},

	async list(): Promise<Group[]> {
		return dexieDb.groups.orderBy('createdAt').reverse().toArray();
	},

	async update(id: string, data: Partial<Pick<Group, 'name' | 'defaultCurrency'>>): Promise<Group | undefined> {
		const existing = await dexieDb.groups.get(id);
		if (!existing) return undefined;

		const updated: Group = {
			...existing,
			...data,
			updatedAt: Date.now()
		};

		await dexieDb.groups.put(updated);
		return updated;
	},

	async delete(id: string): Promise<void> {
		// Delete group and all related data
		await dexieDb.transaction('rw', [dexieDb.groups, dexieDb.members, dexieDb.expenses], async () => {
			await dexieDb.expenses.where('groupId').equals(id).delete();
			await dexieDb.members.where('groupId').equals(id).delete();
			await dexieDb.groups.delete(id);
		});
	}
};

// Member operations
const members = {
	async create(data: { groupId: string; name: string; homeCurrency: string }): Promise<Member> {
		const member: Member = {
			id: generateId(),
			groupId: data.groupId,
			name: data.name,
			homeCurrency: data.homeCurrency,
			createdAt: Date.now()
		};

		await dexieDb.members.add(member);
		return member;
	},

	async get(id: string): Promise<Member | undefined> {
		return dexieDb.members.get(id);
	},

	async listByGroup(groupId: string): Promise<Member[]> {
		return dexieDb.members.where('groupId').equals(groupId).toArray();
	},

	async update(id: string, data: Partial<Pick<Member, 'name' | 'homeCurrency'>>): Promise<Member | undefined> {
		const existing = await dexieDb.members.get(id);
		if (!existing) return undefined;

		const updated: Member = {
			...existing,
			...data
		};

		await dexieDb.members.put(updated);
		return updated;
	},

	async delete(id: string): Promise<void> {
		await dexieDb.members.delete(id);
	}
};

// Expense operations
const expenses = {
	async create(data: {
		groupId: string;
		paidBy: string;
		amount: number;
		currency: string;
		exchangeRate: number;
		description: string;
		category?: string;
		date: number;
		splits: Split[];
	}): Promise<Expense> {
		const now = Date.now();
		const expense: Expense = {
			id: generateId(),
			groupId: data.groupId,
			paidBy: data.paidBy,
			amount: data.amount,
			currency: data.currency,
			exchangeRate: data.exchangeRate,
			description: data.description,
			category: data.category,
			date: data.date,
			splits: data.splits,
			createdAt: now,
			updatedAt: now
		};

		await dexieDb.expenses.add(expense);
		return expense;
	},

	async get(id: string): Promise<Expense | undefined> {
		return dexieDb.expenses.get(id);
	},

	async listByGroup(groupId: string): Promise<Expense[]> {
		return dexieDb.expenses.where('groupId').equals(groupId).orderBy('date').reverse().toArray();
	},

	async update(
		id: string,
		data: Partial<Pick<Expense, 'amount' | 'description' | 'category' | 'date' | 'splits' | 'paidBy'>>
	): Promise<Expense | undefined> {
		const existing = await dexieDb.expenses.get(id);
		if (!existing) return undefined;

		const updated: Expense = {
			...existing,
			...data,
			updatedAt: Date.now()
		};

		await dexieDb.expenses.put(updated);
		return updated;
	},

	async delete(id: string): Promise<void> {
		await dexieDb.expenses.delete(id);
	}
};

// Reset database (for testing)
async function resetDatabase(): Promise<void> {
	await dexieDb.groups.clear();
	await dexieDb.members.clear();
	await dexieDb.expenses.clear();
}

// Export database API
export const db = {
	groups,
	members,
	expenses
};

export { resetDatabase, dexieDb };
