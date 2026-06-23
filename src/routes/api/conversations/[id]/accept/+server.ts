import { json, error } from '@sveltejs/kit';
import { requireUser, getUserInfo } from '$lib/server/services/auth';
import {
	getConversationOwned,
	getLatestProposalInConversation,
	addMessage,
	updateConversationStatut
} from '$lib/server/services/messaging';
import { createReservation } from '$lib/server/services/reservations';
import { createNotification } from '$lib/server/services/notifications';
import { getOpenRequestById } from '$lib/server/services/customers';

export const POST = async ({ params, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const conv = await getConversationOwned(id, user.id, 'customer');
	if (!conv) throw error(404, 'Conversation introuvable');

	const proposal = await getLatestProposalInConversation(id, ['menu_proposal']);

	let reqData = {
		title: 'Prestation',
		guests: 1,
		date: new Date().toISOString().split('T')[0],
		localization: ''
	};
	if (conv.id_request) {
		const req = await getOpenRequestById(conv.id_request);
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

	const customer = await getUserInfo(user.id);
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
