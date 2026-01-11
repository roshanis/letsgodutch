// Core types for LetsGoDutch

export interface Group {
	id: string;
	name: string;
	defaultCurrency: string;
	createdAt: number;
	updatedAt: number;
}

export interface Member {
	id: string;
	groupId: string;
	name: string;
	homeCurrency: string;
	createdAt: number;
}

export type SplitType = 'equal' | 'percentage' | 'shares' | 'exact';

export interface Split {
	memberId: string;
	type: SplitType;
	value: number; // Interpreted based on type
	resolvedAmount: number; // Calculated absolute amount
}

export interface Expense {
	id: string;
	groupId: string;
	paidBy: string; // Member ID
	amount: number;
	currency: string;
	exchangeRate: number;
	description: string;
	category?: string;
	date: number;
	splits: Split[];
	createdAt: number;
	updatedAt: number;
}

export interface ReceiptItem {
	name: string;
	price: number;
	assignedTo: string[]; // Member IDs
}

export interface ReceiptData {
	merchant?: string;
	items: ReceiptItem[];
	subtotal?: number;
	tax?: number;
	tip?: number;
	extractedAt: number;
}

// Utility types
export interface Balance {
	memberId: string;
	amount: number; // Positive = owed, Negative = owes
}

export interface Debt {
	from: string; // Member ID who owes
	to: string; // Member ID who is owed
	amount: number;
}
