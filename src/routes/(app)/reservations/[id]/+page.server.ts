import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getReservationById } from '$lib/server/services/reservations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireUser(locals);
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const reservation = await getReservationById(id, user.id);
	if (!reservation) throw error(404, 'Réservation introuvable');

	return { reservation, user };
};
