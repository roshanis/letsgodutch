/**
 * Currency conversion utilities
 */

import { fetchLatestRates, type ExchangeRates } from './rates';

// In-memory cache for rates
let cachedRates: ExchangeRates | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Get exchange rates (with caching)
 */
export async function getRates(base: string = 'USD'): Promise<ExchangeRates> {
	const now = Date.now();
	if (cachedRates && cachedRates.base === base && now - cacheTime < CACHE_DURATION) {
		return cachedRates;
	}

	try {
		cachedRates = await fetchLatestRates(base);
		cacheTime = now;
		return cachedRates;
	} catch (error) {
		// Return cached even if expired
		if (cachedRates) return cachedRates;
		throw error;
	}
}

/**
 * Convert amount between currencies
 */
export async function convert(
	amount: number,
	from: string,
	to: string
): Promise<{ amount: number; rate: number }> {
	if (from === to) {
		return { amount, rate: 1 };
	}

	const rates = await getRates(from);
	const rate = rates.rates[to];

	if (!rate) {
		throw new Error(`No rate available for ${from} to ${to}`);
	}

	return {
		amount: Math.round(amount * rate * 100) / 100,
		rate
	};
}

/**
 * Convert amount using a known rate
 */
export function convertWithRate(amount: number, rate: number): number {
	return Math.round(amount * rate * 100) / 100;
}

/**
 * Get rate between two currencies
 */
export async function getRate(from: string, to: string): Promise<number> {
	if (from === to) return 1;
	const rates = await getRates(from);
	return rates.rates[to] ?? 1;
}

/**
 * Format amount with currency symbol
 */
export function formatMoney(amount: number, currency: string): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}
