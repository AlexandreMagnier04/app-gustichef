import type { PageServerLoad } from './$types';
import { getCategories } from '$lib/server/services/chiefs';
import { getPublicationsFeed } from '$lib/server/services/publications';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page') ?? 0);

	const [publications, categories] = await Promise.all([
		getPublicationsFeed(page),
		getCategories(),
	]);

	return { publications, categories, page };
};
