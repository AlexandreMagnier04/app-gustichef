import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanDb, seedUser, testDb } from '../helpers/db';
import { chiefs } from '$lib/server/db/schema/chiefs';
import { customers } from '$lib/server/db/schema/customers';
import { conversations } from '$lib/server/db/schema/messaging';
import {
	createReservation,
	getReservationById,
	cancelReservation,
	getReservationsForUser,
} from '$lib/server/services/reservations';

let chiefId: string;
let customerId: string;
let convId: number;

beforeAll(async () => {
	await cleanDb();
	const chiefUser = await seedUser({ role: 'chief' });
	const customerUser = await seedUser({ role: 'customer' });
	chiefId = chiefUser.id;
	customerId = customerUser.id;

	await testDb.insert(chiefs).values({ id_chief: chiefId });
	await testDb.insert(customers).values({ id_customer: customerId, preferences_customer: '' });

	const [conv] = await testDb
		.insert(conversations)
		.values({ id_chief: chiefId, id_customer: customerId, statut: 'a_repondre', last_message_at: new Date() })
		.returning();
	convId = conv.id_conversation;
});

afterAll(async () => {
	await cleanDb();
});

describe('createReservation', () => {
	it('crée une réservation et retourne son id numérique', async () => {
		const id = await createReservation({
			id_conversation: convId,
			id_chief: chiefId,
			id_customer: customerId,
			title: 'Dîner de mariage',
			price_per_person: 80,
			guests: 30,
			event_date: '2026-09-15',
			localization: 'Paris 75001',
		});
		expect(typeof id).toBe('number');
		expect(id).toBeGreaterThan(0);
	});
});

describe('getReservationById', () => {
	it('retourne la réservation pour le client propriétaire', async () => {
		const id = await createReservation({
			id_conversation: convId,
			id_chief: chiefId,
			id_customer: customerId,
			title: 'Test get',
			price_per_person: 50,
			guests: 10,
			event_date: '2026-10-01',
			localization: 'Lyon',
		});
		const resa = await getReservationById(id, customerId);
		expect(resa).not.toBeNull();
		expect(resa?.id_customer).toBe(customerId);
		expect(resa?.title).toBe('Test get');
	});

	it('retourne la réservation pour le chef propriétaire', async () => {
		const id = await createReservation({
			id_conversation: convId,
			id_chief: chiefId,
			id_customer: customerId,
			title: 'Test chef',
			price_per_person: 60,
			guests: 15,
			event_date: '2026-10-05',
			localization: 'Marseille',
		});
		const resa = await getReservationById(id, chiefId);
		expect(resa).not.toBeNull();
		expect(resa?.id_chief).toBe(chiefId);
	});

	it('retourne null si userId ne correspond ni au chef ni au client', async () => {
		const id = await createReservation({
			id_conversation: convId,
			id_chief: chiefId,
			id_customer: customerId,
			title: 'Test unauthorized',
			price_per_person: 50,
			guests: 10,
			event_date: '2026-11-01',
			localization: 'Nice',
		});
		const resa = await getReservationById(id, 'utilisateur-inconnu');
		expect(resa).toBeNull();
	});
});

describe('cancelReservation', () => {
	it('passe le statut à annule', async () => {
		const id = await createReservation({
			id_conversation: convId,
			id_chief: chiefId,
			id_customer: customerId,
			title: 'À annuler',
			price_per_person: 45,
			guests: 5,
			event_date: '2026-12-01',
			localization: 'Bordeaux',
		});
		await cancelReservation(id, customerId);
		const resa = await getReservationById(id, customerId);
		expect(resa?.statut).toBe('annule');
	});
});

describe('getReservationsForUser', () => {
	it('retourne toutes les réservations du client', async () => {
		const resas = await getReservationsForUser(customerId);
		expect(Array.isArray(resas)).toBe(true);
		expect(resas.length).toBeGreaterThan(0);
	});

	it('retourne toutes les réservations du chef', async () => {
		const resas = await getReservationsForUser(chiefId);
		expect(Array.isArray(resas)).toBe(true);
		expect(resas.length).toBeGreaterThan(0);
	});
});
