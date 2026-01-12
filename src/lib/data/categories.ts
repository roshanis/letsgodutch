/**
 * Predefined expense categories
 */

export interface Category {
	id: string;
	name: string;
	icon: string;
	keywords: string[];
}

export const CATEGORIES: Category[] = [
	{
		id: 'food',
		name: 'Food & Dining',
		icon: '🍔',
		keywords: ['restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'sushi', 'thai', 'indian', 'chinese', 'mexican', 'bar', 'pub', 'food']
	},
	{
		id: 'groceries',
		name: 'Groceries',
		icon: '🛒',
		keywords: ['grocery', 'supermarket', 'walmart', 'target', 'costco', 'whole foods', 'trader joe', 'market', 'store']
	},
	{
		id: 'transport',
		name: 'Transport',
		icon: '🚗',
		keywords: ['uber', 'lyft', 'taxi', 'gas', 'petrol', 'parking', 'toll', 'train', 'bus', 'metro', 'subway', 'flight', 'airline']
	},
	{
		id: 'accommodation',
		name: 'Accommodation',
		icon: '🏨',
		keywords: ['hotel', 'airbnb', 'hostel', 'motel', 'lodging', 'accommodation', 'rent', 'stay']
	},
	{
		id: 'entertainment',
		name: 'Entertainment',
		icon: '🎬',
		keywords: ['movie', 'cinema', 'theater', 'concert', 'show', 'museum', 'game', 'sports', 'netflix', 'spotify']
	},
	{
		id: 'shopping',
		name: 'Shopping',
		icon: '🛍️',
		keywords: ['amazon', 'shop', 'store', 'mall', 'clothes', 'electronics', 'gift']
	},
	{
		id: 'utilities',
		name: 'Utilities',
		icon: '💡',
		keywords: ['electric', 'water', 'gas', 'internet', 'phone', 'utility', 'bill']
	},
	{
		id: 'health',
		name: 'Health',
		icon: '🏥',
		keywords: ['pharmacy', 'doctor', 'hospital', 'medicine', 'health', 'gym', 'fitness']
	},
	{
		id: 'travel',
		name: 'Travel',
		icon: '✈️',
		keywords: ['travel', 'vacation', 'trip', 'tour', 'booking']
	},
	{
		id: 'other',
		name: 'Other',
		icon: '📝',
		keywords: []
	}
];

/**
 * Get category by ID
 */
export function getCategoryById(id: string): Category | undefined {
	return CATEGORIES.find((c) => c.id === id);
}

/**
 * Suggest category based on text
 */
export function suggestCategory(text: string): string {
	const lower = text.toLowerCase();
	for (const category of CATEGORIES) {
		for (const keyword of category.keywords) {
			if (lower.includes(keyword)) {
				return category.id;
			}
		}
	}
	return 'other';
}
