import { eq, min, avg, count, ilike, inArray, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	chiefs,
	specialties,
	chiefs_specialties,
	menus,
	images_menu,
	notices
} from '$lib/server/db/schema/chiefs';
import { users } from '$lib/server/db/schema/auth';
import type {
	Chief,
	ChiefCard,
	ChiefProfile,
	Menu,
	Notice,
	Specialty
} from '$lib/models/chief.model';
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
			review_count: count(notices.id_notice)
		})
		.from(chiefs)
		.innerJoin(users, eq(users.id, chiefs.id_chief))
		.leftJoin(menus, eq(menus.id_chief, chiefs.id_chief))
		.leftJoin(notices, eq(notices.id_chief, chiefs.id_chief))
		.where(city ? ilike(users.localization, `%${city}%`) : undefined)
		.groupBy(chiefs.id_chief, users.firstname, users.name, users.localization, users.image)
		.limit(HOME_PAGE_SIZE)
		.offset(page * HOME_PAGE_SIZE);
}

export async function getSpecialties(): Promise<Specialty[]> {
	return db.select().from(specialties);
}

export type ChiefMenuImage = {
	id_menu: number;
	url: string | null;
	title: string;
	price: string;
};

export type ChiefDetails = {
	specialties: string[];
	menuImages: ChiefMenuImage[];
};

export async function getChiefsDetails(ids: string[]): Promise<Map<string, ChiefDetails>> {
	if (ids.length === 0) return new Map();

	const [specialtyRows, imageRows] = await Promise.all([
		db
			.select({
				id_chief: chiefs_specialties.id_chief,
				name_speciality: specialties.name_speciality
			})
			.from(chiefs_specialties)
			.innerJoin(specialties, eq(chiefs_specialties.id_speciality, specialties.id_speciality))
			.where(inArray(chiefs_specialties.id_chief, ids)),

		db
			.select({
				id_chief: menus.id_chief,
				id_menu: menus.id_menu,
				url: images_menu.url,
				title: menus.title_menu,
				price: menus.price_menu
			})
			.from(menus)
			.leftJoin(images_menu, eq(images_menu.id_menu, menus.id_menu))
			.where(inArray(menus.id_chief, ids))
			.orderBy(images_menu.position)
	]);

	const map = new Map<string, ChiefDetails>();
	for (const id of ids) {
		map.set(id, { specialties: [], menuImages: [] });
	}

	for (const row of specialtyRows) {
		const entry = map.get(row.id_chief);
		if (entry && !entry.specialties.includes(row.name_speciality)) {
			entry.specialties.push(row.name_speciality);
		}
	}

	const seenMenus = new Set<number>();
	for (const row of imageRows) {
		const entry = map.get(row.id_chief);
		if (entry && !seenMenus.has(row.id_menu) && entry.menuImages.length < 6) {
			seenMenus.add(row.id_menu);
			entry.menuImages.push({
				id_menu: row.id_menu,
				url: row.url,
				title: row.title,
				price: row.price
			});
		}
	}

	return map;
}

export type SetupChiefProfileInput = {
	bio: string | undefined;
	specialtyNames: string[];
};

export async function setupChiefProfile(
	userId: string,
	input: SetupChiefProfileInput
): Promise<void> {
	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) throw error(404, 'Utilisateur introuvable');
	if (user.role !== 'chief') throw error(403, 'Seul un chef peut créer un profil chef');

	await db.transaction(async (tx) => {
		await tx
			.insert(chiefs)
			.values({ id_chief: userId, bio_chief: input.bio ?? null })
			.onConflictDoNothing();

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
		.select({
			id_speciality: specialties.id_speciality,
			name_speciality: specialties.name_speciality,
			description_speciality: specialties.description_speciality
		})
		.from(specialties)
		.innerJoin(chiefs_specialties, eq(chiefs_specialties.id_speciality, specialties.id_speciality))
		.where(eq(chiefs_specialties.id_chief, id));

	return {
		...result,
		specialties: chiefSpecialties
	};
}

export async function updateChief(id: string, data: UpdateChiefDto): Promise<Chief> {
	const [updated] = await db.update(chiefs).set(data).where(eq(chiefs.id_chief, id)).returning();
	return updated;
}

export async function getMenusByChief(
	chiefId: string
): Promise<(Menu & { image_url: string | null })[]> {
	const rows = await db
		.select({
			id_menu: menus.id_menu,
			title_menu: menus.title_menu,
			description_menu: menus.description_menu,
			price_menu: menus.price_menu,
			type_menu: menus.type_menu,
			guests_min: menus.guests_min,
			guests_max: menus.guests_max,
			ingredients: menus.ingredients,
			id_chief: menus.id_chief,
			image_url: images_menu.url
		})
		.from(menus)
		.leftJoin(images_menu, eq(images_menu.id_menu, menus.id_menu))
		.where(eq(menus.id_chief, chiefId));

	// Dédoublonnage : garder uniquement la première image par menu
	const seen = new Set<number>();
	return rows
		.filter((r) => {
			if (seen.has(r.id_menu)) return false;
			seen.add(r.id_menu);
			return true;
		})
		.map((r) => ({ ...r, image_url: r.image_url ?? null }));
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
	const [existing] = await db
		.select({ id_chief: menus.id_chief })
		.from(menus)
		.where(eq(menus.id_menu, id))
		.limit(1);
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
			...(data.ingredients !== undefined && { ingredients: data.ingredients })
		})
		.where(eq(menus.id_menu, id))
		.returning();
	return updated;
}

export async function getExtrasByChief(chiefId: string): Promise<Menu[]> {
	return db
		.select()
		.from(menus)
		.where(and(eq(menus.id_chief, chiefId), eq(menus.type_menu, 'extra')));
}

export async function getChiefUserInfo(
	chiefId: string
): Promise<{ firstname: string; name: string } | null> {
	const [row] = await db
		.select({ firstname: users.firstname, name: users.name })
		.from(users)
		.where(eq(users.id, chiefId));
	return row ?? null;
}

export async function deleteMenu(id: number, chiefId: string): Promise<void> {
	const [existing] = await db
		.select({ id_chief: menus.id_chief })
		.from(menus)
		.where(eq(menus.id_menu, id))
		.limit(1);
	if (!existing) throw error(404, 'Menu introuvable');
	if (existing.id_chief !== chiefId) throw error(403, 'Ce menu ne vous appartient pas');
	await db.delete(menus).where(eq(menus.id_menu, id));
}

export async function getChiefReviewStats(
	chiefId: string
): Promise<{ avg: number | null; count: number }> {
	const [row] = await db
		.select({
			avg: avg(notices.rating_notice),
			count: count(notices.id_notice)
		})
		.from(notices)
		.where(eq(notices.id_chief, chiefId));
	return {
		avg: row?.avg != null ? parseFloat(row.avg) : null,
		count: Number(row?.count ?? 0)
	};
}

export interface NoticeWithCustomer extends Notice {
	customer: { firstname: string; name: string; image: string | null };
}

export async function getNoticesForChief(chiefId: string): Promise<NoticeWithCustomer[]> {
	const rows = await db
		.select({
			id_notice: notices.id_notice,
			rating_notice: notices.rating_notice,
			comment_notice: notices.comment_notice,
			date_notice: notices.date_notice,
			id_customer: notices.id_customer,
			id_chief: notices.id_chief,
			firstname: users.firstname,
			name: users.name,
			image: users.image
		})
		.from(notices)
		.innerJoin(users, eq(notices.id_customer, users.id))
		.where(eq(notices.id_chief, chiefId))
		.orderBy(notices.date_notice);

	return rows.map(({ firstname, name, image, ...rest }) => ({
		...rest,
		customer: { firstname, name, image }
	}));
}

export async function createNotice(
	data: CreateNoticeDto & { id_customer: string }
): Promise<Notice> {
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
