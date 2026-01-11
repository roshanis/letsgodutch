import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	generateRoomKey,
	generateInviteLink,
	parseInviteLink,
	storeRoomKey,
	getStoredRoomKey,
	removeStoredRoomKey
} from './invite';

describe('Invite Link Utilities', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
	});

	describe('generateRoomKey', () => {
		it('should generate a 64-character hex string', () => {
			const key = generateRoomKey();
			expect(key).toMatch(/^[a-f0-9]{64}$/);
		});

		it('should generate unique keys', () => {
			const key1 = generateRoomKey();
			const key2 = generateRoomKey();
			expect(key1).not.toBe(key2);
		});
	});

	describe('generateInviteLink', () => {
		it('should generate a valid invite link', () => {
			const groupId = 'test-group-123';
			const roomKey = 'abc123def456';

			// Mock window.location.origin
			Object.defineProperty(window, 'location', {
				value: { origin: 'https://letsgodutch.app' },
				writable: true
			});

			const link = generateInviteLink(groupId, roomKey);

			expect(link).toBe('https://letsgodutch.app/join/test-group-123#key=abc123def456');
		});
	});

	describe('parseInviteLink', () => {
		it('should parse a valid invite link', () => {
			const link = 'https://letsgodutch.app/join/my-group-id#key=abc123def456';
			const result = parseInviteLink(link);

			expect(result).toEqual({
				groupId: 'my-group-id',
				roomKey: 'abc123def456'
			});
		});

		it('should return null for invalid link without group id', () => {
			const link = 'https://letsgodutch.app/other#key=abc123';
			const result = parseInviteLink(link);
			expect(result).toBeNull();
		});

		it('should return null for link without key', () => {
			const link = 'https://letsgodutch.app/join/group-id';
			const result = parseInviteLink(link);
			expect(result).toBeNull();
		});

		it('should return null for invalid URL', () => {
			const link = 'not a valid url';
			const result = parseInviteLink(link);
			expect(result).toBeNull();
		});

		it('should handle UUIDs in group id', () => {
			const link = 'https://app.com/join/550e8400-e29b-41d4-a716-446655440000#key=abc123';
			const result = parseInviteLink(link);

			expect(result?.groupId).toBe('550e8400-e29b-41d4-a716-446655440000');
		});
	});

	describe('Room Key Storage', () => {
		it('should store and retrieve room key', () => {
			const groupId = 'test-group';
			const roomKey = 'secret-key-123';

			storeRoomKey(groupId, roomKey);
			const retrieved = getStoredRoomKey(groupId);

			expect(retrieved).toBe(roomKey);
		});

		it('should return null for non-existent key', () => {
			const retrieved = getStoredRoomKey('non-existent');
			expect(retrieved).toBeNull();
		});

		it('should remove stored key', () => {
			const groupId = 'test-group';
			storeRoomKey(groupId, 'key');

			removeStoredRoomKey(groupId);
			const retrieved = getStoredRoomKey(groupId);

			expect(retrieved).toBeNull();
		});

		it('should handle multiple groups', () => {
			storeRoomKey('group1', 'key1');
			storeRoomKey('group2', 'key2');

			expect(getStoredRoomKey('group1')).toBe('key1');
			expect(getStoredRoomKey('group2')).toBe('key2');
		});
	});
});
