import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getMenusByChief } from '$lib/server/services/chiefs';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Accès refusé');
	const menus = await getMenusByChief(user.id);
	return json(menus);
};
