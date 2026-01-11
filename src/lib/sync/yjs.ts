import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import type { Group, Member, Expense } from '$lib/types';

// Yjs document for a group
export interface GroupSync {
	doc: Y.Doc;
	persistence: IndexeddbPersistence;
	provider: WebrtcProvider | null;
	destroy: () => void;
}

// Store active syncs
const activeSyncs = new Map<string, GroupSync>();

// Signaling servers for WebRTC
const SIGNALING_SERVERS = [
	'wss://signaling.yjs.dev',
	'wss://y-webrtc-signaling-eu.herokuapp.com',
	'wss://y-webrtc-signaling-us.herokuapp.com'
];

/**
 * Initialize Yjs sync for a group
 */
export function initGroupSync(groupId: string, roomKey?: string): GroupSync {
	// Return existing sync if already initialized
	if (activeSyncs.has(groupId)) {
		return activeSyncs.get(groupId)!;
	}

	// Create Yjs document
	const doc = new Y.Doc();

	// Set up IndexedDB persistence
	const persistence = new IndexeddbPersistence(`letsgodutch-${groupId}`, doc);

	// Set up WebRTC provider for P2P sync (only if room key provided)
	let provider: WebrtcProvider | null = null;
	if (roomKey) {
		provider = new WebrtcProvider(`letsgodutch-${groupId}`, doc, {
			signaling: SIGNALING_SERVERS,
			password: roomKey,
			maxConns: 20,
			filterBcConns: true,
			peerOpts: {}
		});
	}

	const sync: GroupSync = {
		doc,
		persistence,
		provider,
		destroy: () => {
			provider?.destroy();
			persistence.destroy();
			doc.destroy();
			activeSyncs.delete(groupId);
		}
	};

	activeSyncs.set(groupId, sync);
	return sync;
}

/**
 * Get shared types from Yjs document
 */
export function getSharedTypes(doc: Y.Doc) {
	return {
		group: doc.getMap<Group>('group'),
		members: doc.getMap<Member>('members'),
		expenses: doc.getMap<Expense>('expenses')
	};
}

/**
 * Sync group data to Yjs document
 */
export function syncGroupToYjs(doc: Y.Doc, group: Group) {
	const shared = getSharedTypes(doc);
	doc.transact(() => {
		shared.group.set('data', group);
	});
}

/**
 * Sync member to Yjs document
 */
export function syncMemberToYjs(doc: Y.Doc, member: Member) {
	const shared = getSharedTypes(doc);
	doc.transact(() => {
		shared.members.set(member.id, member);
	});
}

/**
 * Remove member from Yjs document
 */
export function removeMemberFromYjs(doc: Y.Doc, memberId: string) {
	const shared = getSharedTypes(doc);
	doc.transact(() => {
		shared.members.delete(memberId);
	});
}

/**
 * Sync expense to Yjs document
 */
export function syncExpenseToYjs(doc: Y.Doc, expense: Expense) {
	const shared = getSharedTypes(doc);
	doc.transact(() => {
		shared.expenses.set(expense.id, expense);
	});
}

/**
 * Remove expense from Yjs document
 */
export function removeExpenseFromYjs(doc: Y.Doc, expenseId: string) {
	const shared = getSharedTypes(doc);
	doc.transact(() => {
		shared.expenses.delete(expenseId);
	});
}

/**
 * Get all data from Yjs document
 */
export function getDataFromYjs(doc: Y.Doc) {
	const shared = getSharedTypes(doc);
	return {
		group: shared.group.get('data'),
		members: Array.from(shared.members.values()),
		expenses: Array.from(shared.expenses.values())
	};
}

/**
 * Subscribe to changes in Yjs document
 */
export function subscribeToChanges(
	doc: Y.Doc,
	callback: (data: { group?: Group; members: Member[]; expenses: Expense[] }) => void
) {
	const shared = getSharedTypes(doc);

	const handler = () => {
		callback(getDataFromYjs(doc));
	};

	shared.group.observe(handler);
	shared.members.observe(handler);
	shared.expenses.observe(handler);

	// Return unsubscribe function
	return () => {
		shared.group.unobserve(handler);
		shared.members.unobserve(handler);
		shared.expenses.unobserve(handler);
	};
}

/**
 * Get connection status
 */
export function getConnectionStatus(sync: GroupSync): 'disconnected' | 'connecting' | 'connected' {
	if (!sync.provider) return 'disconnected';
	if (sync.provider.connected) return 'connected';
	return 'connecting';
}

/**
 * Get connected peer count
 */
export function getPeerCount(sync: GroupSync): number {
	if (!sync.provider) return 0;
	return sync.provider.awareness.getStates().size - 1; // Exclude self
}

/**
 * Destroy sync for a group
 */
export function destroyGroupSync(groupId: string) {
	const sync = activeSyncs.get(groupId);
	if (sync) {
		sync.destroy();
	}
}

/**
 * Destroy all active syncs
 */
export function destroyAllSyncs() {
	for (const sync of activeSyncs.values()) {
		sync.destroy();
	}
	activeSyncs.clear();
}
