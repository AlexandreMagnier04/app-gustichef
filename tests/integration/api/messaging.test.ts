import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanDb, seedUser, testDb } from '../helpers/db';
import { chiefs } from '$lib/server/db/schema/chiefs';
import { customers, requests } from '$lib/server/db/schema/customers';
import {
	createConversation,
	getConversationDetail,
	addMessage,
	getConversationsForUser,
	updateConversationStatut,
} from '$lib/server/services/messaging';

let chiefId: string;
let customerId: string;
let requestId: number;

beforeAll(async () => {
	await cleanDb();
	const chiefUser = await seedUser({ role: 'chief' });
	const customerUser = await seedUser({ role: 'customer' });
	chiefId = chiefUser.id;
	customerId = customerUser.id;

	await testDb.insert(chiefs).values({ id_chief: chiefId });
	await testDb.insert(customers).values({ id_customer: customerId, preferences_customer: '' });

	const [req] = await testDb
		.insert(requests)
		.values({
			title_request: 'Demande test messaging',
			description_request: 'Description de la demande de test pour le messaging',
			expected_date_request: '2026-09-01',
			guests_request: 20,
			localization_request: 'Paris',
			statut_request: 'en_attente',
			id_customer: customerId,
		})
		.returning();
	requestId = req.id_request;
});

afterAll(async () => {
	await cleanDb();
});

describe('createConversation', () => {
	it('crée une conversation avec le message initial et retourne son id', async () => {
		const id = await createConversation(requestId, chiefId, customerId, 'Bonjour, je suis intéressé', null);
		expect(typeof id).toBe('number');
		expect(id).toBeGreaterThan(0);
	});
});

describe('getConversationDetail', () => {
	it('retourne le détail avec le message initial', async () => {
		const convId = await createConversation(requestId, chiefId, customerId, 'Premier message', null);
		const detail = await getConversationDetail(convId, customerId);
		expect(detail).not.toBeNull();
		expect(detail?.messages.length).toBeGreaterThanOrEqual(1);
		expect(detail?.messages[0].content_message).toBe('Premier message');
	});

	it('retourne null si userId n\'a pas accès à la conversation', async () => {
		const convId = await createConversation(requestId, chiefId, customerId, 'Message privé', null);
		const detail = await getConversationDetail(convId, 'intrus-id');
		expect(detail).toBeNull();
	});

	it('retourne les bonnes infos du chef et du client', async () => {
		const convId = await createConversation(requestId, chiefId, customerId, 'Test infos', null);
		const detail = await getConversationDetail(convId, chiefId);
		expect(detail?.id_chief).toBe(chiefId);
		expect(detail?.id_customer).toBe(customerId);
	});
});

describe('addMessage', () => {
	it('ajoute un message texte', async () => {
		const convId = await createConversation(requestId, chiefId, customerId, 'Init', null);
		await addMessage(convId, chiefId, 'Voici ma proposition');
		const detail = await getConversationDetail(convId, chiefId);
		const msgs = detail?.messages ?? [];
		expect(msgs.some((m) => m.content_message === 'Voici ma proposition')).toBe(true);
	});

	it('ajoute un message menu_proposal avec id_menu et price_per_person', async () => {
		const convId = await createConversation(requestId, chiefId, customerId, 'Init', null);
		await addMessage(convId, chiefId, 'Menu gastronomique', 'menu_proposal', 99, 45);
		const detail = await getConversationDetail(convId, chiefId);
		const proposal = detail?.messages.find((m) => m.type === 'menu_proposal');
		expect(proposal).toBeDefined();
		expect(proposal?.price_per_person).toBe(45);
		expect(proposal?.id_menu).toBe(99);
	});

	it('le statut passe à devis_envoye après menu_proposal', async () => {
		const convId = await createConversation(requestId, chiefId, customerId, 'Init', null);
		await addMessage(convId, chiefId, 'Devis', 'menu_proposal', 1, 55);
		const detail = await getConversationDetail(convId, chiefId);
		expect(detail?.statut).toBe('devis_envoye');
	});
});

describe('getConversationsForUser', () => {
	it('retourne les conversations du client', async () => {
		const convos = await getConversationsForUser(customerId, 'customer');
		expect(Array.isArray(convos)).toBe(true);
		expect(convos.length).toBeGreaterThan(0);
	});

	it('retourne les conversations du chef', async () => {
		const convos = await getConversationsForUser(chiefId, 'chief');
		expect(Array.isArray(convos)).toBe(true);
		expect(convos.length).toBeGreaterThan(0);
	});
});

describe('updateConversationStatut', () => {
	it('met à jour le statut de la conversation', async () => {
		const convId = await createConversation(requestId, chiefId, customerId, 'Test statut', null);
		await updateConversationStatut(convId, 'accepte');
		const detail = await getConversationDetail(convId, chiefId);
		expect(detail?.statut).toBe('accepte');
	});
});
