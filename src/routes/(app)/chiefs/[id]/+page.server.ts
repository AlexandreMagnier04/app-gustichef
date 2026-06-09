import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import {
	getChiefById,
	getMenusByChief,
	getChiefReviewStats,
	getNoticesForChief,
} from '$lib/server/services/chiefs';
import { getChiefPublicationImages } from '$lib/server/services/publications';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const chiefId = params.id;

	const [profile, menus, galleryImages, reviewStats, notices] = await Promise.all([
		getChiefById(chiefId),
		getMenusByChief(chiefId),
		getChiefPublicationImages(chiefId),
		getChiefReviewStats(chiefId),
		getNoticesForChief(chiefId),
	]);

	if (!profile) {
		error(404, 'Chef introuvable');
	}

	return { profile, menus, galleryImages, reviewStats, notices };
};
