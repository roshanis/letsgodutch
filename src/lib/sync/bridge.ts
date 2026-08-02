import type * as Y from 'yjs';
import { db } from '$lib/db';
import { getSharedTypes, subscribeToChanges, type YjsSnapshot } from './yjs';

/**
 * Bidirectional bridge between the local Dexie database and a group's Yjs
 * document.
 *
 * Direction 1 (local -> Yjs): after any local mutation, push local records
 * into the shared document. Records already present in Yjs are only
 * overwritten when the local copy is newer (group/expenses carry updatedAt;
 * members and settlements are immutable once created, so they are only added
 * when missing). This prevents a device with stale data from clobbering
 * newer remote edits.
 *
 * Direction 2 (Yjs -> Dexie): whenever the shared document changes, mirror
 * the full snapshot into Dexie using id-preserving upserts, and remove local
 * rows that no longer exist in the document (remote deletions). The snapshot
 * is only applied once the document actually contains group data, so an
 * empty, not-yet-synced document can never wipe local data.
 */

/**
 * Push local Dexie data for a group into the Yjs document.
 */
export async function pushLocalDataToYjs(doc: Y.Doc, groupId: string): Promise<void> {
	const [group, members, expenses, settlements] = await Promise.all([
		db.groups.get(groupId),
		db.members.listByGroup(groupId),
		db.expenses.listByGroup(groupId),
		db.settlements.listByGroup(groupId)
	]);

	if (!group) return;

	const shared = getSharedTypes(doc);

	doc.transact(() => {
		const remoteGroup = shared.group.get('data');
		if (!remoteGroup || group.updatedAt > remoteGroup.updatedAt) {
			shared.group.set('data', group);
		}

		for (const member of members) {
			if (!shared.members.has(member.id)) {
				shared.members.set(member.id, member);
			}
		}

		for (const expense of expenses) {
			const remote = shared.expenses.get(expense.id);
			if (!remote || expense.updatedAt > remote.updatedAt) {
				shared.expenses.set(expense.id, expense);
			}
		}

		for (const settlement of settlements) {
			if (!shared.settlements.has(settlement.id)) {
				shared.settlements.set(settlement.id, settlement);
			}
		}
	});
}

/**
 * Mirror a Yjs snapshot into Dexie with id-preserving upserts.
 * Local rows for this group that are absent from the snapshot are deleted
 * (they were removed by a peer). Returns false if the snapshot has no group
 * data yet (nothing applied).
 */
export async function applySnapshotToDexie(
	groupId: string,
	snapshot: YjsSnapshot
): Promise<boolean> {
	if (!snapshot.group) return false;

	await db.groups.put({ ...snapshot.group, id: groupId });

	const [localMembers, localExpenses, localSettlements] = await Promise.all([
		db.members.listByGroup(groupId),
		db.expenses.listByGroup(groupId),
		db.settlements.listByGroup(groupId)
	]);

	const remoteMemberIds = new Set(snapshot.members.map((m) => m.id));
	for (const member of snapshot.members) {
		await db.members.put(member);
	}
	for (const member of localMembers) {
		if (!remoteMemberIds.has(member.id)) {
			await db.members.delete(member.id);
		}
	}

	const remoteExpenseIds = new Set(snapshot.expenses.map((e) => e.id));
	for (const expense of snapshot.expenses) {
		await db.expenses.put(expense);
	}
	for (const expense of localExpenses) {
		if (!remoteExpenseIds.has(expense.id)) {
			await db.expenses.delete(expense.id);
		}
	}

	const remoteSettlementIds = new Set(snapshot.settlements.map((s) => s.id));
	for (const settlement of snapshot.settlements) {
		await db.settlements.put(settlement);
	}
	for (const settlement of localSettlements) {
		if (!remoteSettlementIds.has(settlement.id)) {
			await db.settlements.delete(settlement.id);
		}
	}

	return true;
}

/**
 * Start mirroring Yjs changes into Dexie. Reconciles are serialized so a
 * burst of updates can't interleave writes. Returns an unsubscribe function.
 *
 * Call pushLocalDataToYjs() BEFORE starting the bridge so local rows that
 * haven't reached the document yet aren't treated as remote deletions.
 */
export function startYjsToDexieBridge(
	doc: Y.Doc,
	groupId: string,
	onChange: () => void
): () => void {
	let queue: Promise<void> = Promise.resolve();

	return subscribeToChanges(doc, (snapshot) => {
		queue = queue.then(async () => {
			try {
				const applied = await applySnapshotToDexie(groupId, snapshot);
				if (applied) onChange();
			} catch (err) {
				console.error('Failed to apply sync snapshot:', err);
			}
		});
	});
}
