import type { PageServerLoad } from './$types';
import { getSpecialties } from '$lib/server/services/chiefs';
import { getPublicationsFeed } from '$lib/server/services/publications';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page') ?? 0);

	const [publications, specialties] = await Promise.all([
		getPublicationsFeed(page),
		getSpecialties(),
	]);

	return { publications, specialties, page };
};
