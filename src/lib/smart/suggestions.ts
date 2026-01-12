/**
 * Smart suggestions based on expense history
 */

import { db } from '$lib/db';
import { suggestCategory as matchCategory } from '$lib/data/categories';
import type { SplitType } from '$lib/types';

// In-memory pattern cache
const merchantCategoryCache = new Map<string, string>();
const groupSplitModeCache = new Map<string, SplitType>();

/**
 * Suggest category for an expense based on description
 */
export function suggestCategory(description: string): string {
	const normalized = description.toLowerCase().trim();

	// Check cached merchant patterns first
	for (const [merchant, category] of merchantCategoryCache) {
		if (normalized.includes(merchant)) {
			return category;
		}
	}

	// Fall back to keyword matching
	return matchCategory(description);
}

/**
 * Learn category from user selection
 */
export function learnCategory(description: string, category: string): void {
	const words = description.toLowerCase().split(/\s+/);
	// Learn the first meaningful word (skip short ones)
	const merchant = words.find((w) => w.length > 3);
	if (merchant) {
		merchantCategoryCache.set(merchant, category);
	}
}

/**
 * Get suggested split mode for a group based on history
 */
export async function suggestSplitMode(groupId: string): Promise<SplitType> {
	// Check cache
	if (groupSplitModeCache.has(groupId)) {
		return groupSplitModeCache.get(groupId)!;
	}

	// Analyze recent expenses
	try {
		const expenses = await db.expenses.listByGroup(groupId);
		if (expenses.length === 0) return 'equal';

		// Count split types
		const typeCounts = new Map<SplitType, number>();
		for (const expense of expenses.slice(0, 10)) {
			if (expense.splits.length > 0) {
				const type = expense.splits[0].type;
				typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
			}
		}

		// Find most common
		let maxCount = 0;
		let mostCommon: SplitType = 'equal';
		for (const [type, count] of typeCounts) {
			if (count > maxCount) {
				maxCount = count;
				mostCommon = type;
			}
		}

		groupSplitModeCache.set(groupId, mostCommon);
		return mostCommon;
	} catch {
		return 'equal';
	}
}

/**
 * Get frequently used members in a group (sorted by frequency)
 */
export async function getFrequentMembers(groupId: string): Promise<string[]> {
	try {
		const expenses = await db.expenses.listByGroup(groupId);
		const memberFrequency = new Map<string, number>();

		for (const expense of expenses) {
			for (const split of expense.splits) {
				memberFrequency.set(split.memberId, (memberFrequency.get(split.memberId) ?? 0) + 1);
			}
		}

		// Sort by frequency
		return Array.from(memberFrequency.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([id]) => id);
	} catch {
		return [];
	}
}

/**
 * Clear cached suggestions (for testing)
 */
export function clearSuggestionCache(): void {
	merchantCategoryCache.clear();
	groupSplitModeCache.clear();
}
