import { test, expect } from '@playwright/test';

const LOGIN_BUTTON = 'button:has-text("se connecter")';
const BASE_URL = 'http://localhost:5173';
const PASSWORD = 'password123!';
let testEmail: string;

// Créer un compte fresh avant les tests (évite la dépendance à un seed)
test.beforeAll(async () => {
	testEmail = `pw-res-${Date.now()}@test.com`;
	const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
		body: JSON.stringify({
			email: testEmail,
			password: PASSWORD,
			name: 'Customer',
			firstname: 'Playwright',
			role: 'customer',
			localization: 'Paris'
		})
	});
	if (!res.ok) throw new Error(`Échec création compte test : ${res.status}`);
});

// Connecte l'utilisateur et attend la redirection hors de /login
async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
	await page.goto('/login');
	await page.fill('input[name="email"], input[type="email"]', email);
	await page.fill('input[name="password"], input[type="password"]', password);
	await page.click(LOGIN_BUTTON);
	await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 10000 });
}

test('page réservations accessible après login', async ({ page }) => {
	await loginAs(page, testEmail, PASSWORD);
	await page.goto('/reservations');
	await expect(page.locator('h1, h2').first()).toBeVisible();
});

test('page messages accessible après login', async ({ page }) => {
	await loginAs(page, testEmail, PASSWORD);
	await page.goto('/messages');
	await expect(page.locator('main, [role="main"]').first()).toBeVisible();
});
