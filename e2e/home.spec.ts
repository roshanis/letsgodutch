import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
	test('should display the app title', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'LetsGoDutch' })).toBeVisible();
	});

	test('should show empty state when no groups exist', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('No groups yet')).toBeVisible();
		await expect(page.getByRole('button', { name: '+ Create Group' })).toBeVisible();
	});

	test('should display privacy footer', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Your data stays on your device')).toBeVisible();
	});
});
