import { json, error } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import { requireUser } from '$lib/server/services/auth';
import { addMessage, updateConversationStatut } from '$lib/server/services/messaging';
import { createReservation } from '$lib/server/services/reservations';
import { createNotification } from '$lib/server/services/notifications';
import { db } from '$lib/server/db';
import { conversations, messages } from '$lib/server/db/schema/messaging';
import { requests } from '$lib/server/db/schema/customers';
import { users } from '$lib/server/db/schema/auth';

export const POST = async ({ params, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const [conv] = await db
		.select()
		.from(conversations)
		.where(and(eq(conversations.id_conversation, id), eq(conversations.id_customer, user.id)));
	if (!conv) throw error(404, 'Conversation introuvable');

	// Find the latest menu_proposal message
	const [proposal] = await db
		.select()
		.from(messages)
		.where(and(eq(messages.id_conversation, id), eq(messages.type, 'menu_proposal')))
		.orderBy(desc(messages.created_at))
		.limit(1);

	// Get request details for reservation
	let reqData = {
		title: 'Prestation',
		guests: 1,
		date: new Date().toISOString().split('T')[0],
		localization: ''
	};
	if (conv.id_request) {
		const [req] = await db.select().from(requests).where(eq(requests.id_request, conv.id_request));
		if (req)
			reqData = {
				title: req.title_request,
				guests: req.guests_request,
				date: req.expected_date_request,
				localization: req.localization_request
			};
	}

	const reservationId = await createReservation({
		id_conversation: id,
		id_chief: conv.id_chief,
		id_customer: user.id,
		id_menu: proposal?.id_menu ?? undefined,
		title: reqData.title,
		price_per_person: proposal?.price_per_person ?? 0,
		guests: reqData.guests,
		event_date: reqData.date,
		localization: reqData.localization
	});

	await updateConversationStatut(id, 'confirme');
	await addMessage(id, user.id, 'Réservation confirmée ✓', 'system');

	// Notify chef
	const [customer] = await db
		.select({ firstname: users.firstname, name: users.name })
		.from(users)
		.where(eq(users.id, user.id));
	const customerName = customer ? `${customer.firstname} ${customer.name}` : 'Le client';
	await createNotification(
		conv.id_chief,
		'reservation_confirmed',
		'Réservation confirmée !',
		`${customerName} a confirmé votre prestation « ${reqData.title} »`,
		String(id)
	);

	return json({ id_reservation: reservationId });
};
