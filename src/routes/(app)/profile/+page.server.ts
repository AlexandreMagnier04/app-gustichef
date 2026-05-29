import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getChiefById, getMenusByChief } from '$lib/server/services/chiefs';
import { getChiefPublicationImages } from '$lib/server/services/publications';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	if (user.role !== 'chief') {
		redirect(302, '/home');
	}

	const [profile, menus, galleryImages] = await Promise.all([
		getChiefById(user.id),
		getMenusByChief(user.id),
		getChiefPublicationImages(user.id),
	]);

	return { profile, menus, galleryImages };
};
