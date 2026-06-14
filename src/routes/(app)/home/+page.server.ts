import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { getSpecialties } from '$lib/server/services/chiefs';
import { getPublicationsFeed } from '$lib/server/services/publications';
import { getRequestsByCustomer, getRequestsByChief } from '$lib/server/services/customers';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireUser(locals);
	const page = Number(url.searchParams.get('page') ?? 0);

	const [publications, specialties] = await Promise.all([
		getPublicationsFeed(page),
		getSpecialties()
	]);

	const requests =
		user.role === 'chief' ? await getRequestsByChief() : await getRequestsByCustomer(user.id);

	return { publications, specialties, page, requests };
};
