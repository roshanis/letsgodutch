import { db, dexieDb } from '$lib/db';
import type { Group, Member, Expense, Settlement } from '$lib/types';

/**
 * JSON export/import of the full local database.
 * Ids are preserved so an exported backup can be restored (or moved to
 * another device) without breaking member/expense references or P2P sync.
 */

export const EXPORT_VERSION = 1;

export interface ExportData {
	app: 'letsgodutch';
	version: number;
	exportedAt: number;
	groups: Group[];
	members: Member[];
	expenses: Expense[];
	settlements: Settlement[];
}

export interface ImportCounts {
	groups: number;
	members: number;
	expenses: number;
	settlements: number;
}

/**
 * Collect all local data into a serializable export object
 */
export async function exportAllData(): Promise<ExportData> {
	const [groups, members, expenses, settlements] = await Promise.all([
		dexieDb.groups.toArray(),
		dexieDb.members.toArray(),
		dexieDb.expenses.toArray(),
		dexieDb.settlements.toArray()
	]);

	return {
		app: 'letsgodutch',
		version: EXPORT_VERSION,
		exportedAt: Date.now(),
		groups,
		members,
		expenses,
		settlements
	};
}

/**
 * Serialize export data to a pretty-printed JSON string
 */
export function serializeExport(data: ExportData): string {
	return JSON.stringify(data, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function hasStringId(value: unknown): boolean {
	return isRecord(value) && typeof value.id === 'string' && value.id.length > 0;
}

/**
 * Validate a parsed export payload. Throws with a readable message on failure.
 */
export function validateExport(parsed: unknown): ExportData {
	if (!isRecord(parsed)) {
		throw new Error('Invalid file: not a JSON object');
	}
	if (parsed.app !== 'letsgodutch') {
		throw new Error('Invalid file: not a LetsGoDutch export');
	}
	if (typeof parsed.version !== 'number' || parsed.version > EXPORT_VERSION) {
		throw new Error('Unsupported export version. Update the app and try again.');
	}

	for (const key of ['groups', 'members', 'expenses', 'settlements'] as const) {
		const list = parsed[key];
		if (!Array.isArray(list)) {
			throw new Error(`Invalid file: missing "${key}" list`);
		}
		for (const item of list) {
			if (!hasStringId(item)) {
				throw new Error(`Invalid file: an entry in "${key}" has no id`);
			}
		}
	}

	return parsed as unknown as ExportData;
}

/**
 * Import data from a JSON string, merging into the local database.
 * Existing records with the same id are overwritten; everything else is kept.
 */
export async function importData(json: string): Promise<ImportCounts> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		throw new Error('Invalid file: could not parse JSON');
	}

	const data = validateExport(parsed);

	for (const group of data.groups) {
		await db.groups.put(group);
	}
	for (const member of data.members) {
		await db.members.put(member);
	}
	for (const expense of data.expenses) {
		await db.expenses.put(expense);
	}
	for (const settlement of data.settlements) {
		await db.settlements.put(settlement);
	}

	return {
		groups: data.groups.length,
		members: data.members.length,
		expenses: data.expenses.length,
		settlements: data.settlements.length
	};
}
