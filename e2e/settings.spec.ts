import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
	test('should be reachable from the home header', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Settings' }).click();
		await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
	});

	test('should offer export and import actions', async ({ page }) => {
		await page.goto('/settings');
		await expect(page.getByRole('button', { name: 'Export backup (JSON)' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Export expenses (CSV)' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Choose backup file…' })).toBeVisible();
	});

	test('should require typed confirmation before deleting all data', async ({ page }) => {
		await page.goto('/settings');
		await page.getByRole('button', { name: 'Delete all data' }).click();

		const deleteButton = page.getByRole('button', { name: 'Permanently delete' });
		await expect(deleteButton).toBeDisabled();

		await page.getByPlaceholder('DELETE').fill('DELETE');
		await expect(deleteButton).toBeEnabled();
	});

	test('should download a JSON backup', async ({ page }) => {
		await page.goto('/settings');
		const downloadPromise = page.waitForEvent('download');
		await page.getByRole('button', { name: 'Export backup (JSON)' }).click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/^letsgodutch-backup-\d{4}-\d{2}-\d{2}\.json$/);
	});
});
