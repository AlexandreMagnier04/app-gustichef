import { eq, min, avg, count, ilike, inArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chiefs, specialties, categories, chiefs_specialties, chiefs_categories, menus, notices } from '$lib/server/db/schema/chiefs';
import { users } from '$lib/server/db/schema/auth';
import type { Category, Chief, ChiefCard, ChiefProfile, Menu, Notice, Specialty } from '$lib/models/chief.model';
import type { UpdateChiefDto, CreateMenuDto, UpdateMenuDto } from '$lib/dtos/chief.dto';
import type { CreateNoticeDto } from '$lib/dtos/customer.dto';

export async function getChiefs(): Promise<Chief[]> {
	return db.select().from(chiefs);
}

const HOME_PAGE_SIZE = 20;

export type ChiefsHomeParams = {
	city?: string;
	page?: number;
};

export async function getChiefsForHome(params: ChiefsHomeParams = {}): Promise<ChiefCard[]> {
	const { city, page = 0 } = params;

	return db
		.select({
			id_chief: chiefs.id_chief,
			firstname: users.firstname,
			name: users.name,
			localization: users.localization,
			image: users.image,
			min_price: min(menus.price_menu),
			avg_rating: avg(notices.rating_notice),
			review_count: count(notices.id_notice),
		})
		.from(chiefs)
		.innerJoin(users, eq(users.id, chiefs.id_chief))
		.leftJoin(menus, eq(menus.id_chief, chiefs.id_chief))
		.leftJoin(notices, eq(notices.id_chief, chiefs.id_chief))
		.where(city ? ilike(users.localization, `%${city}%`) : undefined)
		.groupBy(
			chiefs.id_chief,
			users.firstname,
			users.name,
			users.localization,
			users.image,
		)
		.limit(HOME_PAGE_SIZE)
		.offset(page * HOME_PAGE_SIZE);
}

export async function getSpecialties(): Promise<Specialty[]> {
	return db.select().from(specialties);
}

export type SetupChiefProfileInput = {
	bio: string | undefined;
	categoryName: string;
	specialtyNames: string[];
};

export async function setupChiefProfile(
	userId: string,
	input: SetupChiefProfileInput,
): Promise<void> {
	// Vérifie que l'utilisateur existe et a bien le rôle 'chief' — refuse sinon.
	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) throw error(404, 'Utilisateur introuvable');
	if (user.role !== 'chief') throw error(403, 'Seul un chef peut créer un profil chef');

	await db.transaction(async (tx) => {
		// Insère le profil chef
		await tx
			.insert(chiefs)
			.values({ id_chief: userId, bio_chief: input.bio ?? null })
			.onConflictDoNothing();

		// --- Catégorie (1 seule par chef) ---
		// Upsert de la catégorie si elle n'existe pas, puis lien chef ↔ catégorie
		await tx
			.insert(categories)
			.values({ name_category: input.categoryName })
			.onConflictDoNothing();

		const [cat] = await tx
			.select({ id_category: categories.id_category })
			.from(categories)
			.where(eq(categories.name_category, input.categoryName))
			.limit(1);

		if (cat) {
			// Remplace l'éventuelle catégorie précédente : on s'assure qu'il n'y en a qu'une
			await tx.delete(chiefs_categories).where(eq(chiefs_categories.id_chief, userId));
			await tx
				.insert(chiefs_categories)
				.values({ id_chief: userId, id_category: cat.id_category });
		}

		// --- Spécialités (N par chef) ---
		if (input.specialtyNames.length === 0) return;

		await tx
			.insert(specialties)
			.values(input.specialtyNames.map((name) => ({ name_speciality: name })))
			.onConflictDoNothing();

		const rows = await tx
			.select({ id_speciality: specialties.id_speciality })
			.from(specialties)
			.where(inArray(specialties.name_speciality, input.specialtyNames));

		await tx
			.insert(chiefs_specialties)
			.values(rows.map((r) => ({ id_chief: userId, id_speciality: r.id_speciality })))
			.onConflictDoNothing();
	});
}

export async function getCategories(): Promise<Category[]> {
	return db.select().from(categories);
}

export async function getChiefById(id: string): Promise<ChiefProfile | null> {
	const result = await db.query.chiefs.findFirst({
		where: eq(chiefs.id_chief, id),
		with: {
			user: {
				columns: {
					name: true,
					firstname: true,
					email: true,
					image: true,
					localization: true
				}
			}
		}
	});

	if (!result) return null;

	const chiefSpecialties = await db
		.select({ id_speciality: specialties.id_speciality, name_speciality: specialties.name_speciality, description_speciality: specialties.description_speciality })
		.from(specialties)
		.innerJoin(chiefs_specialties, eq(chiefs_specialties.id_speciality, specialties.id_speciality))
		.where(eq(chiefs_specialties.id_chief, id));

	const chiefCategories = await db
		.select({
			id_category: categories.id_category,
			name_category: categories.name_category,
			image_url: categories.image_url,
		})
		.from(categories)
		.innerJoin(chiefs_categories, eq(chiefs_categories.id_category, categories.id_category))
		.where(eq(chiefs_categories.id_chief, id));

	return {
		...result,
		specialties: chiefSpecialties,
		categories: chiefCategories
	};
}

export async function updateChief(id: string, data: UpdateChiefDto): Promise<Chief> {
	const [updated] = await db.update(chiefs).set(data).where(eq(chiefs.id_chief, id)).returning();
	return updated;
}

export async function getMenusByChief(chiefId: string): Promise<Menu[]> {
	return db.select().from(menus).where(eq(menus.id_chief, chiefId));
}

export async function getMenuById(id: number): Promise<Menu | null> {
	const [menu] = await db.select().from(menus).where(eq(menus.id_menu, id)).limit(1);
	return menu ?? null;
}

export async function createMenu(data: CreateMenuDto & { id_chief: string }): Promise<Menu> {
	const [menu] = await db
		.insert(menus)
		.values({
			title_menu: data.title_menu,
			description_menu: data.description_menu,
			price_menu: String(data.price_menu),
			type_menu: data.type_menu ?? 'plat',
			guests_min: data.guests_min ?? null,
			guests_max: data.guests_max ?? null,
			ingredients: data.ingredients ?? null,
			id_chief: data.id_chief
		})
		.returning();
	return menu;
}

export async function updateMenu(id: number, chiefId: string, data: UpdateMenuDto): Promise<Menu> {
	const [existing] = await db.select({ id_chief: menus.id_chief }).from(menus).where(eq(menus.id_menu, id)).limit(1);
	if (!existing) throw error(404, 'Menu introuvable');
	if (existing.id_chief !== chiefId) throw error(403, 'Ce menu ne vous appartient pas');

	const [updated] = await db
		.update(menus)
		.set({
			...(data.title_menu !== undefined && { title_menu: data.title_menu }),
			...(data.description_menu !== undefined && { description_menu: data.description_menu }),
			...(data.price_menu !== undefined && { price_menu: String(data.price_menu) }),
			...(data.type_menu !== undefined && { type_menu: data.type_menu }),
			...(data.guests_min !== undefined && { guests_min: data.guests_min }),
			...(data.guests_max !== undefined && { guests_max: data.guests_max }),
			...(data.ingredients !== undefined && { ingredients: data.ingredients }),
		})
		.where(eq(menus.id_menu, id))
		.returning();
	return updated;
}

export async function deleteMenu(id: number, chiefId: string): Promise<void> {
	const [existing] = await db.select({ id_chief: menus.id_chief }).from(menus).where(eq(menus.id_menu, id)).limit(1);
	if (!existing) throw error(404, 'Menu introuvable');
	if (existing.id_chief !== chiefId) throw error(403, 'Ce menu ne vous appartient pas');
	await db.delete(menus).where(eq(menus.id_menu, id));
}

export async function createNotice(data: CreateNoticeDto & { id_customer: string }): Promise<Notice> {
	const [notice] = await db
		.insert(notices)
		.values({
			rating_notice: String(data.rating_notice),
			comment_notice: data.comment_notice ?? null,
			date_notice: new Date().toISOString().split('T')[0],
			id_customer: data.id_customer,
			id_chief: data.id_chief
		})
		.returning();
	return notice;
}
