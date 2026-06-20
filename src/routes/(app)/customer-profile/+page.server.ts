import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getCustomerById } from '$lib/server/services/customers';
import { getReservationsForUser } from '$lib/server/services/reservations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	if (user.role !== 'customer') {
		redirect(302, '/profile');
	}

	const [customer, allReservations] = await Promise.all([
		getCustomerById(user.id),
		getReservationsForUser(user.id)
	]);

	// Uniquement les réservations confirmées (paiement validé)
	const reservations = allReservations.filter((r) => r.statut === 'confirme');

	return { customer, reservations };
};
