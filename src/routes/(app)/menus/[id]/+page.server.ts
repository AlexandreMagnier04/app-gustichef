import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getMenuById } from '$lib/server/services/chiefs';
import { getMenuImages } from '$lib/server/services/images';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireUser(locals);

	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const [menu, images] = await Promise.all([getMenuById(id), getMenuImages(id)]);

	if (!menu) throw error(404, 'Menu introuvable');

	return { menu, images };
};
