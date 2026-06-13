import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanDb, seedUser, testDb } from '../helpers/db';
import { chiefs } from '$lib/server/db/schema/chiefs';
import {
	createMenu,
	getMenusByChief,
	getMenuById,
	updateMenu,
	deleteMenu,
} from '$lib/server/services/chiefs';

let chiefUserId: string;

beforeAll(async () => {
	await cleanDb();
	const user = await seedUser({ role: 'chief' });
	chiefUserId = user.id;
	await testDb.insert(chiefs).values({ id_chief: chiefUserId });
});

afterAll(async () => {
	await cleanDb();
});

describe('createMenu', () => {
	it('crée un menu et le retourne avec id', async () => {
		const menu = await createMenu({
			title_menu: 'Menu test',
			description_menu: 'Description test',
			price_menu: 25.0,
			type_menu: 'plat',
			id_chief: chiefUserId,
		});
		expect(menu.id_menu).toBeDefined();
		expect(menu.title_menu).toBe('Menu test');
		expect(menu.id_chief).toBe(chiefUserId);
	});

	it('crée un menu de type extra', async () => {
		const menu = await createMenu({
			title_menu: 'Amuse-bouche',
			description_menu: 'Petites bouchées apéritives',
			price_menu: 8.5,
			type_menu: 'extra',
			id_chief: chiefUserId,
		});
		expect(menu.type_menu).toBe('extra');
	});
});

describe('getMenusByChief', () => {
	it('retourne les menus du chef', async () => {
		const menus = await getMenusByChief(chiefUserId);
		expect(Array.isArray(menus)).toBe(true);
		expect(menus.length).toBeGreaterThan(0);
		expect(menus.every((m) => m.id_chief === chiefUserId)).toBe(true);
	});

	it('retourne tableau vide pour chef inexistant', async () => {
		const menus = await getMenusByChief('id-inexistant-xyz');
		expect(menus).toEqual([]);
	});
});

describe('getMenuById', () => {
	it('retourne le menu par son id', async () => {
		const [first] = await getMenusByChief(chiefUserId);
		const menu = await getMenuById(first.id_menu);
		expect(menu).not.toBeNull();
		expect(menu?.id_menu).toBe(first.id_menu);
	});

	it('retourne null pour id inexistant', async () => {
		const menu = await getMenuById(999999);
		expect(menu).toBeNull();
	});
});

describe('updateMenu', () => {
	it('met à jour le titre du menu', async () => {
		const [first] = await getMenusByChief(chiefUserId);
		const updated = await updateMenu(first.id_menu, chiefUserId, { title_menu: 'Titre modifié' });
		expect(updated.title_menu).toBe('Titre modifié');
	});

	it('lève une erreur si le menu n\'appartient pas au chef', async () => {
		const [first] = await getMenusByChief(chiefUserId);
		await expect(updateMenu(first.id_menu, 'autre-chef-id', { title_menu: 'Hack' })).rejects.toThrow();
	});
});

describe('deleteMenu', () => {
	it('supprime le menu sans erreur', async () => {
		const menu = await createMenu({
			title_menu: 'À supprimer',
			description_menu: 'Sera supprimé',
			price_menu: 10,
			type_menu: 'extra',
			id_chief: chiefUserId,
		});
		await expect(deleteMenu(menu.id_menu, chiefUserId)).resolves.not.toThrow();
		expect(await getMenuById(menu.id_menu)).toBeNull();
	});

	it('lève une erreur si le menu n\'appartient pas au chef', async () => {
		const menu = await createMenu({
			title_menu: 'Protégé',
			description_menu: 'Ne peut pas être supprimé par un autre',
			price_menu: 15,
			type_menu: 'plat',
			id_chief: chiefUserId,
		});
		await expect(deleteMenu(menu.id_menu, 'autre-chef-id')).rejects.toThrow();
	});
});
