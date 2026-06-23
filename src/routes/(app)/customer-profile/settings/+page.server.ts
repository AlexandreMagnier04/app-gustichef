import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	throw redirect(302, '/profile/settings');
};
