import { test, expect } from '@playwright/test';

const TEST_CUSTOMER_EMAIL = 'playwright-customer@test.com';
const TEST_CUSTOMER_PASSWORD = 'password123!';

async function loginAs(page: import('@playwright/test').Page) {
	await page.goto('/login');
	await page.fill('input[name="email"], input[type="email"]', TEST_CUSTOMER_EMAIL);
	await page.fill('input[name="password"], input[type="password"]', TEST_CUSTOMER_PASSWORD);
	await page.click('button:has-text("se connecter")');
	await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
}

test('page demandes accessible après login', async ({ page }) => {
	await loginAs(page);
	await page.goto('/home?tab=demandes');
	await expect(page.locator('h1, h2, main').first()).toBeVisible();
});

test('page messages accessible après login', async ({ page }) => {
	await loginAs(page);
	await page.goto('/messages');
	await expect(page.locator('main, [role="main"]').first()).toBeVisible();
});
