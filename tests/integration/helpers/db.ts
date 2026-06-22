import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, sessions, accounts, verifications } from '$lib/server/db/schema/auth';
import {
	chiefs,
	menus,
	chiefs_specialties,
	specialties,
	notices,
	images_chef,
	images_menu
} from '$lib/server/db/schema/chiefs';
import { customers, requests } from '$lib/server/db/schema/customers';
import { conversations, messages } from '$lib/server/db/schema/messaging';
import { reservations } from '$lib/server/db/schema/reservations';

const client = postgres(process.env.DATABASE_URL!);
export const testDb = drizzle(client);

// Insère un utilisateur minimal directement en DB (bypass better-auth)
export async function seedUser(overrides: Partial<typeof users.$inferInsert> = {}) {
	const id = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
	const [user] = await testDb
		.insert(users)
		.values({
			id,
			name: 'Dupont',
			firstname: 'Jean',
			email: `${id}@test.com`,
			emailVerified: true,
			role: 'customer',
			localization: 'Paris',
			createdAt: new Date(),
			updatedAt: new Date(),
			...overrides
		})
		.returning();
	return user;
}

// Nettoie toutes les tables dans l'ordre FK
export async function cleanDb() {
	await testDb.delete(reservations);
	await testDb.delete(messages);
	await testDb.delete(conversations);
	await testDb.delete(requests);
	await testDb.delete(notices);
	await testDb.delete(images_menu);
	await testDb.delete(menus);
	await testDb.delete(images_chef);
	await testDb.delete(chiefs_specialties);
	await testDb.delete(specialties);
	await testDb.delete(chiefs);
	await testDb.delete(customers);
	await testDb.delete(sessions);
	await testDb.delete(accounts);
	await testDb.delete(verifications);
	await testDb.delete(users);
}
