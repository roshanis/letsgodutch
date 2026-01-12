/**
 * Receipt parser - extracts structured data from OCR text
 */

export interface ReceiptItem {
	name: string;
	price: number;
	quantity?: number;
}

export interface ParsedReceipt {
	merchant?: string;
	date?: string;
	items: ReceiptItem[];
	subtotal?: number;
	tax?: number;
	tip?: number;
	total?: number;
	currency: string;
}

// Common currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
	'$': 'USD',
	'€': 'EUR',
	'£': 'GBP',
	'¥': 'JPY',
	'₹': 'INR',
	'A$': 'AUD',
	'C$': 'CAD',
	'S$': 'SGD'
};

/**
 * Parse receipt text into structured data
 */
export function parseReceipt(text: string): ParsedReceipt {
	const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

	const result: ParsedReceipt = {
		items: [],
		currency: 'USD'
	};

	// Detect currency
	for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
		if (text.includes(symbol)) {
			result.currency = code;
			break;
		}
	}

	// Extract merchant (usually first non-empty line)
	if (lines.length > 0) {
		const firstLine = lines[0];
		// Skip if it looks like a date or number
		if (!firstLine.match(/^\d/) && firstLine.length > 2) {
			result.merchant = cleanMerchantName(firstLine);
		}
	}

	// Extract date
	const dateMatch = text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
	if (dateMatch) {
		result.date = dateMatch[1];
	}

	// Extract line items with prices
	const itemPattern = /^(.+?)\s+(\d+[.,]\d{2})\s*$/;
	const itemPatternWithQty = /^(\d+)\s*[xX@]\s*(.+?)\s+(\d+[.,]\d{2})\s*$/;

	for (const line of lines) {
		// Skip known non-item lines
		if (isNonItemLine(line)) continue;

		// Try to match item with quantity
		const qtyMatch = line.match(itemPatternWithQty);
		if (qtyMatch) {
			result.items.push({
				quantity: parseInt(qtyMatch[1]),
				name: cleanItemName(qtyMatch[2]),
				price: parsePrice(qtyMatch[3])
			});
			continue;
		}

		// Try to match simple item
		const itemMatch = line.match(itemPattern);
		if (itemMatch) {
			const name = cleanItemName(itemMatch[1]);
			const price = parsePrice(itemMatch[2]);

			// Categorize special lines
			if (isSubtotal(name)) {
				result.subtotal = price;
			} else if (isTax(name)) {
				result.tax = price;
			} else if (isTip(name)) {
				result.tip = price;
			} else if (isTotal(name)) {
				result.total = price;
			} else if (name.length > 1 && price > 0) {
				result.items.push({ name, price });
			}
		}
	}

	// If no total found, calculate from items
	if (!result.total && result.items.length > 0) {
		result.total = result.items.reduce((sum, item) => sum + item.price, 0);
		if (result.tax) result.total += result.tax;
		if (result.tip) result.total += result.tip;
	}

	return result;
}

/**
 * Clean merchant name
 */
function cleanMerchantName(name: string): string {
	return name
		.replace(/[#*_=]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.split(' ')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(' ');
}

/**
 * Clean item name
 */
function cleanItemName(name: string): string {
	return name
		.replace(/[#*_]/g, '')
		.replace(/\s+/g, ' ')
		.replace(/^\d+\s*/, '') // Remove leading numbers
		.trim();
}

/**
 * Parse price string to number
 */
function parsePrice(priceStr: string): number {
	const cleaned = priceStr.replace(',', '.').replace(/[^\d.]/g, '');
	return parseFloat(cleaned) || 0;
}

/**
 * Check if line is a non-item line
 */
function isNonItemLine(line: string): boolean {
	const lower = line.toLowerCase();
	const skipPatterns = [
		/^tel[:\s]/i,
		/^phone/i,
		/^address/i,
		/^thank/i,
		/^receipt/i,
		/^order/i,
		/^table/i,
		/^server/i,
		/^cashier/i,
		/^card\s*(ending|number)/i,
		/visa|mastercard|amex/i,
		/^\*+$/,
		/^-+$/,
		/^=+$/
	];

	return skipPatterns.some((p) => p.test(lower));
}

/**
 * Check if name indicates subtotal
 */
function isSubtotal(name: string): boolean {
	const lower = name.toLowerCase();
	return /sub\s*total|subtotal/.test(lower);
}

/**
 * Check if name indicates tax
 */
function isTax(name: string): boolean {
	const lower = name.toLowerCase();
	return /\btax\b|vat|gst|hst/.test(lower);
}

/**
 * Check if name indicates tip
 */
function isTip(name: string): boolean {
	const lower = name.toLowerCase();
	return /\btip\b|gratuity|service\s*charge/.test(lower);
}

/**
 * Check if name indicates total
 */
function isTotal(name: string): boolean {
	const lower = name.toLowerCase();
	return /^total$|grand\s*total|amount\s*due|balance\s*due/.test(lower);
}

/**
 * Format parsed receipt for display
 */
export function formatReceiptSummary(receipt: ParsedReceipt): string {
	const lines: string[] = [];

	if (receipt.merchant) {
		lines.push(`Merchant: ${receipt.merchant}`);
	}
	if (receipt.date) {
		lines.push(`Date: ${receipt.date}`);
	}

	lines.push(`\nItems (${receipt.items.length}):`);
	for (const item of receipt.items) {
		const qty = item.quantity ? `${item.quantity}x ` : '';
		lines.push(`  ${qty}${item.name}: ${receipt.currency} ${item.price.toFixed(2)}`);
	}

	if (receipt.subtotal) {
		lines.push(`\nSubtotal: ${receipt.currency} ${receipt.subtotal.toFixed(2)}`);
	}
	if (receipt.tax) {
		lines.push(`Tax: ${receipt.currency} ${receipt.tax.toFixed(2)}`);
	}
	if (receipt.tip) {
		lines.push(`Tip: ${receipt.currency} ${receipt.tip.toFixed(2)}`);
	}
	if (receipt.total) {
		lines.push(`Total: ${receipt.currency} ${receipt.total.toFixed(2)}`);
	}

	return lines.join('\n');
}
