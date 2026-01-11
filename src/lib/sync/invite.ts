/**
 * Invite link utilities for P2P group sharing
 *
 * URL format: https://app.letsgodutch.com/join/{groupId}#key={encryptionKey}
 *
 * The encryption key is in the URL fragment (after #) so it's never sent to any server.
 * This ensures true end-to-end encryption where only people with the link can access the group.
 */

/**
 * Generate a random encryption key for group sharing
 */
export function generateRoomKey(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate an invite link for a group
 */
export function generateInviteLink(groupId: string, roomKey: string): string {
	const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://letsgodutch.app';
	return `${baseUrl}/join/${groupId}#key=${roomKey}`;
}

/**
 * Parse an invite link to extract group ID and room key
 */
export function parseInviteLink(url: string): { groupId: string; roomKey: string } | null {
	try {
		const parsed = new URL(url);
		const pathMatch = parsed.pathname.match(/\/join\/([a-zA-Z0-9-]+)/);
		if (!pathMatch) return null;

		const groupId = pathMatch[1];
		const hash = parsed.hash;
		const keyMatch = hash.match(/key=([a-fA-F0-9]+)/);
		if (!keyMatch) return null;

		const roomKey = keyMatch[1];
		return { groupId, roomKey };
	} catch {
		return null;
	}
}

/**
 * Extract room key from current URL hash (for join page)
 */
export function getRoomKeyFromHash(): string | null {
	if (typeof window === 'undefined') return null;
	const hash = window.location.hash;
	const match = hash.match(/key=([a-fA-F0-9]+)/);
	return match ? match[1] : null;
}

/**
 * Store room key for a group in localStorage
 * This allows reconnecting after page refresh
 */
export function storeRoomKey(groupId: string, roomKey: string): void {
	if (typeof localStorage === 'undefined') return;
	const keys = getRoomKeys();
	keys[groupId] = roomKey;
	localStorage.setItem('letsgodutch-room-keys', JSON.stringify(keys));
}

/**
 * Get stored room key for a group
 */
export function getStoredRoomKey(groupId: string): string | null {
	const keys = getRoomKeys();
	return keys[groupId] ?? null;
}

/**
 * Remove stored room key for a group
 */
export function removeStoredRoomKey(groupId: string): void {
	if (typeof localStorage === 'undefined') return;
	const keys = getRoomKeys();
	delete keys[groupId];
	localStorage.setItem('letsgodutch-room-keys', JSON.stringify(keys));
}

/**
 * Get all stored room keys
 */
function getRoomKeys(): Record<string, string> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const stored = localStorage.getItem('letsgodutch-room-keys');
		return stored ? JSON.parse(stored) : {};
	} catch {
		return {};
	}
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fallback for older browsers
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		try {
			document.execCommand('copy');
			return true;
		} catch {
			return false;
		} finally {
			document.body.removeChild(textarea);
		}
	}
}
