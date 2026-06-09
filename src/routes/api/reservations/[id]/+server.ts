import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { cancelReservation } from '$lib/server/services/reservations';

export const DELETE = async ({ params, locals }) => {
	const user = requireUser(locals);
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');
	await cancelReservation(id, user.id);
	return json({ ok: true });
};
