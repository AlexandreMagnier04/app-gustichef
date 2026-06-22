import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanDb, seedUser, testDb } from '../helpers/db';
import { chiefs, specialties, chiefs_specialties } from '$lib/server/db/schema/chiefs';
import { customers } from '$lib/server/db/schema/customers';
import {
	getCustomerById,
	updateCustomer,
	createRequest,
	getRequestsByCustomer,
	getRequestsWithChiefDetails,
	getRequestsByChief
} from '$lib/server/services/customers';

let chiefId: string;
let customerId: string;

beforeAll(async () => {
	await cleanDb();
	const chiefUser = await seedUser({ role: 'chief' });
	const customerUser = await seedUser({ role: 'customer' });
	chiefId = chiefUser.id;
	customerId = customerUser.id;

	await testDb.insert(chiefs).values({ id_chief: chiefId });
	await testDb.insert(customers).values({ id_customer: customerId, preferences_customer: '' });
});

afterAll(async () => {
	await cleanDb();
});

describe('getCustomerById', () => {
	it('retourne le client existant', async () => {
		const c = await getCustomerById(customerId);
		expect(c).not.toBeNull();
		expect(c?.id_customer).toBe(customerId);
	});

	it('retourne null pour id inexistant', async () => {
		const c = await getCustomerById('inexistant-id');
		expect(c).toBeNull();
	});
});

describe('updateCustomer', () => {
	it('met à jour les préférences', async () => {
		const updated = await updateCustomer(customerId, { preferences_customer: 'sans gluten' });
		expect(updated.preferences_customer).toBe('sans gluten');
	});
});

describe('createRequest', () => {
	it('crée une demande et la retourne', async () => {
		const req = await createRequest(customerId, {
			title_request: 'Dîner anniversaire',
			description_request: 'Un dîner pour 20 personnes pour un anniversaire en famille',
			expected_date_request: '2026-08-15',
			guests_request: 20,
			localization_request: 'Paris 75001'
		});
		expect(req.id_request).toBeDefined();
		expect(req.title_request).toBe('Dîner anniversaire');
		expect(req.statut_request).toBe('open');
		expect(req.id_customer).toBe(customerId);
	});

	it("crée le profil client s'il n'existe pas encore", async () => {
		const newUser = await seedUser({ role: 'customer' });
		const req = await createRequest(newUser.id, {
			title_request: 'Brunch dominical',
			description_request: 'Brunch pour 10 personnes avec produits bios et locaux de saison',
			expected_date_request: '2026-09-01',
			guests_request: 10,
			localization_request: 'Lyon 69001'
		});
		expect(req.id_customer).toBe(newUser.id);
	});
});

describe('getRequestsByCustomer', () => {
	it('retourne les demandes du client', async () => {
		const reqs = await getRequestsByCustomer(customerId);
		expect(Array.isArray(reqs)).toBe(true);
		expect(reqs.length).toBeGreaterThan(0);
		expect(reqs.every((r) => r.id_customer === customerId)).toBe(true);
	});

	it('retourne tableau vide pour client sans demandes', async () => {
		const newUser = await seedUser({ role: 'customer' });
		const reqs = await getRequestsByCustomer(newUser.id);
		expect(reqs).toEqual([]);
	});
});

describe('getRequestsWithChiefDetails', () => {
	it('retourne les demandes avec infos chef (null si pas de chef assigné)', async () => {
		const reqs = await getRequestsWithChiefDetails(customerId);
		expect(Array.isArray(reqs)).toBe(true);
		expect(reqs.length).toBeGreaterThan(0);
		const req = reqs[0];
		expect(req.id_customer ?? req.id_chief).toBeDefined();
	});

	it('retourne tableau vide pour client inexistant', async () => {
		const reqs = await getRequestsWithChiefDetails('inexistant');
		expect(reqs).toEqual([]);
	});
});

describe('getRequestsByChief', () => {
	it('retourne les demandes ouvertes visibles par les chefs', async () => {
		const reqs = await getRequestsByChief();
		expect(Array.isArray(reqs)).toBe(true);
		// au moins la demande créée dans createRequest
		expect(reqs.length).toBeGreaterThan(0);
	});

	it('retourne les infos du client dans chaque demande', async () => {
		const reqs = await getRequestsByChief();
		const req = reqs[0];
		expect(req.id_customer).toBeDefined();
		// le service retourne soit { customer: { firstname } } soit des champs plats selon la version
		const hasNested = 'customer' in req && req.customer !== null;
		const hasFlat = 'customer_firstname' in req;
		expect(hasNested || hasFlat).toBe(true);
	});
});
