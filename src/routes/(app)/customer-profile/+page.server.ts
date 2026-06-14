import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getCustomerById, getRequestsWithChiefDetails } from '$lib/server/services/customers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	if (user.role !== 'customer') {
		redirect(302, '/profile');
	}

	const [customer, reservations] = await Promise.all([
		getCustomerById(user.id),
		getRequestsWithChiefDetails(user.id)
	]);

	return { customer, reservations };
};
