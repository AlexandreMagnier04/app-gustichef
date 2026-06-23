import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { getChiefsForHome, getChiefsDetails, getSpecialties } from '$lib/server/services/chiefs';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);

	const chiefsBase = await getChiefsForHome();
	const [detailsMap, specialties] = await Promise.all([
		getChiefsDetails(chiefsBase.map((c) => c.id_chief)),
		getSpecialties()
	]);

	const chiefs = chiefsBase.map((c) => ({
		...c,
		specialties: detailsMap.get(c.id_chief)?.specialties ?? [],
		menuImages: detailsMap.get(c.id_chief)?.menuImages ?? []
	}));

	return { chiefs, specialties };
};
