import { json, error } from '@sveltejs/kit';
import { requireUser, getUserInfo } from '$lib/server/services/auth';
import { createNotification } from '$lib/server/services/notifications';
import { createDirectBooking } from '$lib/server/services/reservations';

export const POST = async ({ request, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const body = await request.json();
	const {
		chiefId,
		menuId,
		menuTitle,
		pricePerPerson,
		guests,
		eventDate,
		eventTime,
		localization,
		extras,
		notes
	} = body as {
		chiefId: string;
		menuId: number;
		menuTitle: string;
		pricePerPerson: number;
		guests: number;
		eventDate: string;
		eventTime: string;
		localization: string;
		extras: { id_menu: number; title: string; qty: number; price_per_person: number }[];
		notes: string;
	};

	if (!chiefId || !eventDate || !localization) throw error(400, 'Données manquantes');

	const conversationId = await createDirectBooking({
		customerId: user.id,
		chiefId,
		menuId,
		menuTitle,
		pricePerPerson,
		guests,
		eventDate,
		eventTime,
		localization,
		extras,
		notes
	});

	const customer = await getUserInfo(user.id);
	const customerName = customer ? `${customer.firstname} ${customer.name}` : 'Un client';

	await createNotification(
		chiefId,
		'new_booking_request',
		'Nouvelle demande de prestation',
		`${customerName} souhaite réserver « ${menuTitle} »`,
		String(conversationId)
	);

	return json({ conversationId });
};
