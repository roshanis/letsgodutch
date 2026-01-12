import { describe, it, expect } from 'vitest';
import { parseReceipt } from './parser';

describe('Receipt Parser', () => {
	it('should parse a simple receipt', () => {
		const text = `
THAI PALACE
123 Main St

Pad Thai         14.99
Green Curry      16.50
Spring Rolls      8.00

Subtotal         39.49
Tax               3.16
Total            42.65
`;
		const result = parseReceipt(text);

		expect(result.merchant).toBe('Thai Palace');
		expect(result.items).toHaveLength(3);
		expect(result.items[0].name).toBe('Pad Thai');
		expect(result.items[0].price).toBe(14.99);
		expect(result.subtotal).toBe(39.49);
		expect(result.tax).toBe(3.16);
		expect(result.total).toBe(42.65);
	});

	it('should detect currency from symbols', () => {
		const usdReceipt = 'Coffee $4.50';
		const eurReceipt = 'Coffee €4.50';
		const gbpReceipt = 'Coffee £4.50';

		expect(parseReceipt(usdReceipt).currency).toBe('USD');
		expect(parseReceipt(eurReceipt).currency).toBe('EUR');
		expect(parseReceipt(gbpReceipt).currency).toBe('GBP');
	});

	it('should extract date from receipt', () => {
		const text = `
Store Name
01/15/2024
Item 10.00
`;
		const result = parseReceipt(text);
		expect(result.date).toBe('01/15/2024');
	});

	it('should handle items with quantities', () => {
		const text = `
2 x Coffee      8.00
3 x Muffin     12.00
`;
		const result = parseReceipt(text);

		expect(result.items).toHaveLength(2);
		expect(result.items[0].quantity).toBe(2);
		expect(result.items[0].name).toBe('Coffee');
		expect(result.items[0].price).toBe(8.0);
	});

	it('should skip non-item lines', () => {
		const text = `
Restaurant Name
Tel: 555-1234
Thank you for visiting!

Burger          12.00
Fries            4.00

Card ending 1234
VISA APPROVED
`;
		const result = parseReceipt(text);

		expect(result.items).toHaveLength(2);
		expect(result.items.find((i) => i.name.includes('Tel'))).toBeUndefined();
		expect(result.items.find((i) => i.name.includes('Thank'))).toBeUndefined();
	});

	it('should extract tip', () => {
		const text = `
Pizza          20.00
Tip             4.00
Total          24.00
`;
		const result = parseReceipt(text);

		expect(result.items).toHaveLength(1);
		expect(result.tip).toBe(4.0);
		expect(result.total).toBe(24.0);
	});

	it('should handle European number format', () => {
		const text = `
Item One       10,50
Item Two       20,00
Total          30,50
`;
		const result = parseReceipt(text);

		expect(result.items).toHaveLength(2);
		expect(result.items[0].price).toBe(10.5);
		expect(result.total).toBe(30.5);
	});

	it('should calculate total from items if not found', () => {
		const text = `
Coffee          4.50
Sandwich        8.00
Cookie          2.50
`;
		const result = parseReceipt(text);

		expect(result.items).toHaveLength(3);
		expect(result.total).toBe(15.0);
	});

	it('should handle empty or garbage text', () => {
		const result = parseReceipt('');
		expect(result.items).toHaveLength(0);

		const garbage = parseReceipt('asdf jkl; qwerty');
		expect(garbage.items).toHaveLength(0);
	});

	it('should identify tax with different labels', () => {
		const texts = ['VAT 5.00', 'GST 5.00', 'HST 5.00', 'Tax 5.00'];

		for (const text of texts) {
			const result = parseReceipt(text);
			expect(result.tax).toBe(5.0);
		}
	});
});
