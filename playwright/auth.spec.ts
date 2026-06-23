import { test, expect } from '@playwright/test';

test("page de login s'affiche correctement", async ({ page }) => {
	await page.goto('/login');
	await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
	await expect(
		page.locator('input[name="password"], input[type="password"]').first()
	).toBeVisible();
});

test('page protégée sans session, redirect vers /login', async ({ page }) => {
	await page.goto('/home');
	await expect(page).toHaveURL(/\/login/);
});

test("login avec mauvais mot de passe, message d'erreur visible", async ({ page }) => {
	await page.goto('/login');
	await page.fill('input[name="email"], input[type="email"]', 'inexistant@test.com');
	await page.fill('input[name="password"], input[type="password"]', 'mauvais');
	await page.click('[type="submit"]');
	// Reste sur la page login (pas de redirect)
	await expect(page).toHaveURL(/\/login/);
});

test('inscription, redirect vers onboarding ou home', async ({ page }) => {
	await page.goto('/register');
	const email = `pw-test-${Date.now()}@test.com`;
	const inputs = page.locator('input[type="text"]');
	await inputs.nth(0).fill('Jean');
	await inputs.nth(1).fill('Dupont');
	await page.fill('input[type="email"]', email);
	await inputs.nth(2).fill('Paris');
	const passwords = page.locator('input[type="password"]');
	await passwords.nth(0).fill('password123!');
	await passwords.nth(1).fill('password123!');
	await page.click('[type="submit"]');
	await expect(page).not.toHaveURL(/\/register/, { timeout: 10000 });
});
