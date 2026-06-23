import { requireUser } from '$lib/server/services/auth';
import { getChiefById, getSpecialties } from '$lib/server/services/chiefs';
import { getCustomerById } from '$lib/server/services/customers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	if (user.role === 'chief') {
		const [profile, specialties] = await Promise.all([
			getChiefById(user.id),
			getSpecialties()
		]);
		return { user, profile, specialties, customer: null };
	}

	const customer = await getCustomerById(user.id);
	return { user, profile: null, specialties: [], customer };
};
