import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getChiefById, getMenusByChief } from '$lib/server/services/chiefs';
import { getChiefPublicationImages } from '$lib/server/services/publications';
import { getReservationsForUser } from '$lib/server/services/reservations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	if (user.role !== 'chief') {
		redirect(302, '/customer-profile');
	}

	const [profile, menus, galleryImages, reservations] = await Promise.all([
		getChiefById(user.id),
		getMenusByChief(user.id),
		getChiefPublicationImages(user.id),
		getReservationsForUser(user.id)
	]);

	// Réservations à venir (statut confirme, date future)
	const today = new Date().toISOString().split('T')[0];
	const upcomingReservations = reservations.filter(
		(r) => r.statut === 'confirme' && r.event_date >= today
	);

	return { profile, menus, galleryImages, reservations, upcomingReservations };
};
