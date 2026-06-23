import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { users } from '../src/lib/server/db/schema/auth';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const BASE_URL = 'http://localhost:5173';
export const TEST_CUSTOMER_EMAIL = 'playwright-customer@test.com';
export const TEST_CUSTOMER_PASSWORD = 'password123!';

export default async function globalSetup() {
	const db = drizzle(postgres(process.env.DATABASE_URL!));

	// Tente la création — ignore si l'user existe déjà
	try {
		const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
			body: JSON.stringify({
				email: TEST_CUSTOMER_EMAIL,
				password: TEST_CUSTOMER_PASSWORD,
				name: 'Playwright',
				firstname: 'Test',
				role: 'customer',
				localization: 'Paris'
			})
		});
		if (!res.ok) {
			const text = await res.text();
			console.log(`[global-setup] sign-up status ${res.status}: ${text.slice(0, 200)}`);
		}
	} catch (e) {
		console.log('[global-setup] sign-up fetch error:', e);
	}

	// Force emailVerified = true pour que le login fonctionne sans vérification mail
	const updated = await db
		.update(users)
		.set({ emailVerified: true })
		.where(eq(users.email, TEST_CUSTOMER_EMAIL))
		.returning({ email: users.email });

	if (updated.length === 0) {
		throw new Error(
			`[global-setup] User ${TEST_CUSTOMER_EMAIL} not found in DB after sign-up — login tests will fail`
		);
	}

	console.log(`[global-setup] User ${TEST_CUSTOMER_EMAIL} ready (emailVerified=true)`);
}
