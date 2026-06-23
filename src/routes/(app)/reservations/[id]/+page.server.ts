import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getReservationById } from '$lib/server/services/reservations';
import { getChiefReviewStats } from '$lib/server/services/chiefs';
import { db } from '$lib/server/db';
import { images_menu } from '$lib/server/db/schema/chiefs';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireUser(locals);
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const reservation = await getReservationById(id, user.id);
	if (!reservation) throw error(404, 'Réservation introuvable');

	const [reviewStats, menuImages] = await Promise.all([
		getChiefReviewStats(reservation.id_chief),
		reservation.id_menu
			? db
					.select({ url: images_menu.url })
					.from(images_menu)
					.where(eq(images_menu.id_menu, reservation.id_menu))
					.limit(1)
			: Promise.resolve([])
	]);

	return {
		reservation,
		user,
		reviewStats,
		menuImage: menuImages[0]?.url ?? null
	};
};
