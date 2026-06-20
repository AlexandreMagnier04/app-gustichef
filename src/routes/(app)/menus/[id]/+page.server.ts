import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { requireUser } from '$lib/server/services/auth';
import { getMenuById } from '$lib/server/services/chiefs';
import { getMenuImages } from '$lib/server/services/images';
import { db } from '$lib/server/db';
import { menus } from '$lib/server/db/schema/chiefs';
import { users } from '$lib/server/db/schema/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireUser(locals);

	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const [menu, images] = await Promise.all([getMenuById(id), getMenuImages(id)]);
	if (!menu) throw error(404, 'Menu introuvable');

	const [chiefUser] = await db
		.select({ firstname: users.firstname, name: users.name })
		.from(users)
		.where(eq(users.id, menu.id_chief));

	const chiefExtras =
		user.role === 'customer'
			? await db
					.select()
					.from(menus)
					.where(and(eq(menus.id_chief, menu.id_chief), eq(menus.type_menu, 'extra')))
			: [];

	return { menu, images, user, chiefUser, chiefExtras };
};
