import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { chiefs, specialties, categories, chiefs_specialties, chiefs_categories, menus, notices } from '$lib/server/db/schema/chiefs';
import type { Chief, ChiefProfile, ChiefUpdate, Menu, Notice, Specialty } from '$lib/models/chief.model';
import type { UpdateChiefDto, CreateMenuDto } from '$lib/dtos/chief.dto';
import type { CreateNoticeDto } from '$lib/dtos/customer.dto';

export async function getChiefs(): Promise<Chief[]> {
	return db.select().from(chiefs);
}

export async function getSpecialties(): Promise<Specialty[]> {
	return db.select().from(specialties);
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
		.select({ id_category: categories.id_category, name_category: categories.name_category })
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

export async function createMenu(data: CreateMenuDto & { id_chief: string }): Promise<Menu> {
	const [menu] = await db
		.insert(menus)
		.values({
			title_menu: data.title_menu,
			description_menu: data.description_menu,
			price_menu: String(data.price_menu),
			id_chief: data.id_chief
		})
		.returning();
	return menu;
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
