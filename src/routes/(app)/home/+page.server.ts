import type { PageServerLoad } from './$types';
import { getChiefsForHome, getCategories } from '$lib/server/services/chiefs';

export const load: PageServerLoad = async ({ url }) => {
	const city = url.searchParams.get('city') ?? undefined;
	const page = Number(url.searchParams.get('page') ?? 0);

	const [chiefs, categories] = await Promise.all([
		getChiefsForHome({ city, page }),
		getCategories(),
	]);

	return { chiefs, categories, city, page };
};
