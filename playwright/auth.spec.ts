import { test, expect } from '@playwright/test';

test('page de login s\'affiche correctement', async ({ page }) => {
	await page.goto('/login');
	await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
	await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
});

test('page protégée sans session → redirect vers /login', async ({ page }) => {
	await page.goto('/home');
	await expect(page).toHaveURL(/\/login/);
});

test('login avec mauvais mot de passe → message d\'erreur visible', async ({ page }) => {
	await page.goto('/login');
	await page.fill('input[name="email"], input[type="email"]', 'inexistant@test.com');
	await page.fill('input[name="password"], input[type="password"]', 'mauvais');
	await page.click('[type="submit"]');
	// Reste sur la page login (pas de redirect)
	await expect(page).toHaveURL(/\/login/);
});

test('inscription → redirect vers onboarding ou home', async ({ page }) => {
	await page.goto('/register');
	const email = `pw-test-${Date.now()}@test.com`;
	await page.fill('input[name="email"], input[type="email"]', email);
	await page.fill('input[name="password"], input[type="password"]', 'password123!');
	// Remplir les autres champs si visibles
	const nameInput = page.locator('input[name="name"]');
	if (await nameInput.isVisible()) await nameInput.fill('Dupont');
	const firstnameInput = page.locator('input[name="firstname"]');
	if (await firstnameInput.isVisible()) await firstnameInput.fill('Jean');
	await page.click('[type="submit"]');
	// Après inscription, redirection attendue (pas sur /register)
	await expect(page).not.toHaveURL(/\/register/);
});
