import { type Page } from '@playwright/test';

// Connecte l'utilisateur via le formulaire de login
export async function loginAs(page: Page, email: string, password: string) {
	await page.goto('/login');
	await page.fill('[name="email"]', email);
	await page.fill('[name="password"]', password);
	await page.click('[type="submit"]');
	await page.waitForURL(/\/(home|profile|customer-profile)/);
}
