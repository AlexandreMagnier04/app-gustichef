import { describe, it, expect } from 'vitest';
import { createMenuDto, updateMenuDto, setupChiefProfileDto } from '$lib/dtos/chief.dto';

describe('createMenuDto', () => {
	const valid = {
		title_menu: 'Menu du jour',
		description_menu: 'Un repas savoureux',
		price_menu: 29.99,
		type_menu: 'plat' as const,
	};

	it('valide un menu minimal', () => {
		expect(createMenuDto.safeParse(valid).success).toBe(true);
	});
	it('rejette titre < 2 caractères', () => {
		expect(createMenuDto.safeParse({ ...valid, title_menu: 'A' }).success).toBe(false);
	});
	it('rejette prix négatif', () => {
		expect(createMenuDto.safeParse({ ...valid, price_menu: -10 }).success).toBe(false);
	});
	it('rejette prix zéro', () => {
		expect(createMenuDto.safeParse({ ...valid, price_menu: 0 }).success).toBe(false);
	});
	it('rejette type_menu invalide', () => {
		expect(createMenuDto.safeParse({ ...valid, type_menu: 'dessert' }).success).toBe(false);
	});
	it('accepte type extra', () => {
		expect(createMenuDto.safeParse({ ...valid, type_menu: 'extra' }).success).toBe(true);
	});
	it('coerce price_menu string vers number', () => {
		const result = createMenuDto.safeParse({ ...valid, price_menu: '29.99' });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.price_menu).toBe(29.99);
	});
	it('accepte ingredients optionnels', () => {
		expect(createMenuDto.safeParse({ ...valid, ingredients: ['Bœuf', 'Sel'] }).success).toBe(true);
	});
});

describe('updateMenuDto', () => {
	it('accepte un objet vide (tout optionnel)', () => {
		expect(updateMenuDto.safeParse({}).success).toBe(true);
	});
	it('valide une mise à jour partielle du titre', () => {
		expect(updateMenuDto.safeParse({ title_menu: 'Nouveau titre' }).success).toBe(true);
	});
	it('rejette titre < 2 caractères même en update', () => {
		expect(updateMenuDto.safeParse({ title_menu: 'A' }).success).toBe(false);
	});
});

describe('setupChiefProfileDto', () => {
	it('valide avec specialties', () => {
		expect(setupChiefProfileDto.safeParse({ specialties: ['Japonaise', 'Italienne'] }).success).toBe(true);
	});
	it('rejette plus de 3 specialties', () => {
		expect(setupChiefProfileDto.safeParse({ specialties: ['A', 'B', 'C', 'D'] }).success).toBe(false);
	});
	it('accepte tableau vide', () => {
		expect(setupChiefProfileDto.safeParse({ specialties: [] }).success).toBe(true);
	});
	it('accepte bio optionnelle', () => {
		expect(setupChiefProfileDto.safeParse({ specialties: [], bio: 'Je suis chef' }).success).toBe(true);
	});
	it('rejette bio > 200 caractères', () => {
		expect(setupChiefProfileDto.safeParse({ specialties: [], bio: 'a'.repeat(201) }).success).toBe(false);
	});
});
