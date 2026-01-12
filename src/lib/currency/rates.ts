/**
 * Exchange rate fetching from Frankfurter API
 */

const API_BASE = 'https://api.frankfurter.app';

export interface ExchangeRates {
	base: string;
	date: string;
	rates: Record<string, number>;
}

/**
 * Fetch latest exchange rates
 */
export async function fetchLatestRates(base: string = 'USD'): Promise<ExchangeRates> {
	const response = await fetch(`${API_BASE}/latest?from=${base}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch rates: ${response.status}`);
	}
	return response.json();
}

/**
 * Fetch rates for a specific date
 */
export async function fetchRatesForDate(date: string, base: string = 'USD'): Promise<ExchangeRates> {
	const response = await fetch(`${API_BASE}/${date}?from=${base}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch rates: ${response.status}`);
	}
	return response.json();
}

/**
 * Get list of available currencies
 */
export async function fetchCurrencies(): Promise<Record<string, string>> {
	const response = await fetch(`${API_BASE}/currencies`);
	if (!response.ok) {
		throw new Error(`Failed to fetch currencies: ${response.status}`);
	}
	return response.json();
}

// Common currencies with symbols
export const CURRENCY_INFO: Record<string, { symbol: string; name: string }> = {
	USD: { symbol: '$', name: 'US Dollar' },
	EUR: { symbol: '€', name: 'Euro' },
	GBP: { symbol: '£', name: 'British Pound' },
	JPY: { symbol: '¥', name: 'Japanese Yen' },
	AUD: { symbol: 'A$', name: 'Australian Dollar' },
	CAD: { symbol: 'C$', name: 'Canadian Dollar' },
	CHF: { symbol: 'Fr', name: 'Swiss Franc' },
	CNY: { symbol: '¥', name: 'Chinese Yuan' },
	INR: { symbol: '₹', name: 'Indian Rupee' },
	SGD: { symbol: 'S$', name: 'Singapore Dollar' },
	NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
	HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
	SEK: { symbol: 'kr', name: 'Swedish Krona' },
	NOK: { symbol: 'kr', name: 'Norwegian Krone' },
	DKK: { symbol: 'kr', name: 'Danish Krone' },
	MXN: { symbol: '$', name: 'Mexican Peso' },
	BRL: { symbol: 'R$', name: 'Brazilian Real' },
	KRW: { symbol: '₩', name: 'South Korean Won' },
	THB: { symbol: '฿', name: 'Thai Baht' },
	MYR: { symbol: 'RM', name: 'Malaysian Ringgit' }
};
