import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanDb, seedUser, testDb } from '../helpers/db';
import { chiefs, notices } from '$lib/server/db/schema/chiefs';
import { customers } from '$lib/server/db/schema/customers';
import {
	getChiefs,
	getChiefsForHome,
	setupChiefProfile,
	getChiefById,
	updateChief,
	getChiefReviewStats,
	getNoticesForChief,
	createNotice
} from '$lib/server/services/chiefs';

let chiefId: string;
let customerId: string;

beforeAll(async () => {
	await cleanDb();
	const chiefUser = await seedUser({ role: 'chief' });
	const customerUser = await seedUser({ role: 'customer' });
	chiefId = chiefUser.id;
	customerId = customerUser.id;

	await testDb.insert(chiefs).values({ id_chief: chiefId, bio_chief: 'Chef passionné de cuisine française' });
	await testDb.insert(customers).values({ id_customer: customerId, preferences_customer: '' });
});

afterAll(async () => {
	await cleanDb();
});

describe('getChiefs', () => {
	it('retourne la liste des chefs', async () => {
		const list = await getChiefs();
		expect(Array.isArray(list)).toBe(true);
		expect(list.some((c) => c.id_chief === chiefId)).toBe(true);
	});
});

describe('getChiefsForHome', () => {
	it('retourne les chefs avec stats', async () => {
		const cards = await getChiefsForHome();
		expect(Array.isArray(cards)).toBe(true);
		expect(cards.length).toBeGreaterThan(0);
		const card = cards.find((c) => c.id_chief === chiefId);
		expect(card).toBeDefined();
		expect(card?.firstname).toBeDefined();
		expect(card?.name).toBeDefined();
	});

	it('filtre par ville', async () => {
		const cards = await getChiefsForHome({ city: 'ville-qui-nexiste-pas-xyz' });
		expect(cards).toEqual([]);
	});

	it('supporte la pagination', async () => {
		const page0 = await getChiefsForHome({ page: 0 });
		const page1 = await getChiefsForHome({ page: 1 });
		expect(Array.isArray(page0)).toBe(true);
		expect(Array.isArray(page1)).toBe(true);
	});
});

describe('setupChiefProfile', () => {
	it('crée le profil avec spécialités', async () => {
		const newChiefUser = await seedUser({ role: 'chief' });
		await setupChiefProfile(newChiefUser.id, {
			bio: 'Spécialiste de la cuisine méditerranéenne',
			specialtyNames: ['Italienne', 'Espagnole']
		});
		const profile = await getChiefById(newChiefUser.id);
		expect(profile).not.toBeNull();
		expect(profile?.specialties.length).toBeGreaterThanOrEqual(2);
		expect(profile?.specialties.map((s) => s.name_speciality)).toContain('Italienne');
	});

	it('refuse si utilisateur non chef', async () => {
		const customerUser = await seedUser({ role: 'customer' });
		await expect(
			setupChiefProfile(customerUser.id, { bio: undefined, specialtyNames: [] })
		).rejects.toThrow();
	});

	it('crée le profil sans spécialités', async () => {
		const newChiefUser = await seedUser({ role: 'chief' });
		await expect(
			setupChiefProfile(newChiefUser.id, { bio: 'Chef simple', specialtyNames: [] })
		).resolves.not.toThrow();
	});
});

describe('getChiefById', () => {
	it('retourne le profil complet avec user et spécialités', async () => {
		const profile = await getChiefById(chiefId);
		expect(profile).not.toBeNull();
		expect(profile?.id_chief).toBe(chiefId);
		expect(profile?.user.firstname).toBeDefined();
		expect(profile?.user.name).toBeDefined();
		expect(Array.isArray(profile?.specialties)).toBe(true);
	});

	it('retourne null pour id inexistant', async () => {
		const profile = await getChiefById('id-qui-nexiste-pas');
		expect(profile).toBeNull();
	});
});

describe('updateChief', () => {
	it('met à jour la bio', async () => {
		const updated = await updateChief(chiefId, { bio_chief: 'Nouvelle bio mise à jour' });
		expect(updated.bio_chief).toBe('Nouvelle bio mise à jour');
	});
});

describe('createNotice + getNoticesForChief', () => {
	it('crée un avis et le retrouve dans la liste', async () => {
		const notice = await createNotice({
			rating_notice: 4.5,
			comment_notice: 'Excellent repas, je recommande vivement',
			id_chief: chiefId,
			id_customer: customerId
		});
		expect(notice.id_notice).toBeDefined();
		expect(notice.id_chief).toBe(chiefId);

		const list = await getNoticesForChief(chiefId);
		expect(list.some((n) => n.id_notice === notice.id_notice)).toBe(true);
		const found = list.find((n) => n.id_notice === notice.id_notice);
		expect(found?.id_customer).toBe(customerId);
		expect(found?.id_chief).toBe(chiefId);
	});

	it('retourne tableau vide pour chef sans avis', async () => {
		const freshChief = await seedUser({ role: 'chief' });
		await testDb.insert(chiefs).values({ id_chief: freshChief.id });
		const list = await getNoticesForChief(freshChief.id);
		expect(list).toEqual([]);
	});
});

describe('getChiefReviewStats', () => {
	it("retourne moyenne et nombre d'avis", async () => {
		const stats = await getChiefReviewStats(chiefId);
		expect(typeof stats.count).toBe('number');
		expect(stats.count).toBeGreaterThan(0);
		expect(stats.avg).not.toBeNull();
	});

	it("retourne count 0 et avg null pour chef sans avis", async () => {
		const freshChief = await seedUser({ role: 'chief' });
		await testDb.insert(chiefs).values({ id_chief: freshChief.id });
		const stats = await getChiefReviewStats(freshChief.id);
		expect(stats.count).toBe(0);
		expect(stats.avg).toBeNull();
	});
});
