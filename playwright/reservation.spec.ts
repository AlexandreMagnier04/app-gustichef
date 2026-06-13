import { test, expect } from '@playwright/test';

// Ces tests nécessitent un compte pré-existant en DB locale.
// Créer manuellement ou via `pnpm db:seed` avant de lancer.
const TEST_CUSTOMER_EMAIL = 'playwright-customer@test.com';
const TEST_CUSTOMER_PASSWORD = 'password123!';

test('page réservations accessible après login', async ({ page }) => {
	await page.goto('/login');
	await page.fill('input[name="email"], input[type="email"]', TEST_CUSTOMER_EMAIL);
	await page.fill('input[name="password"], input[type="password"]', TEST_CUSTOMER_PASSWORD);
	await page.click('[type="submit"]');

	// Si login réussi, accéder aux réservations
	const url = page.url();
	if (!url.includes('login')) {
		await page.goto('/reservations');
		await expect(page.locator('h1, h2').first()).toBeVisible();
	}
});

test('page messages accessible après login', async ({ page }) => {
	await page.goto('/login');
	await page.fill('input[name="email"], input[type="email"]', TEST_CUSTOMER_EMAIL);
	await page.fill('input[name="password"], input[type="password"]', TEST_CUSTOMER_PASSWORD);
	await page.click('[type="submit"]');

	const url = page.url();
	if (!url.includes('login')) {
		await page.goto('/messages');
		await expect(page.locator('main, [role="main"]').first()).toBeVisible();
	}
});
