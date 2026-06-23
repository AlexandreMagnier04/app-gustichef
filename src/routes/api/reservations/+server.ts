import { json, error } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
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

const getStripe = () => new Stripe(env.STRIPE_SECRET_KEY ?? '');

export const POST = async ({ request, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const body = await request.json();
	const { conversationId, guests, eventTime, extras, notes, stripeSetupIntentId } = body as {
		conversationId: number;
		guests: number;
		eventTime?: string;
		extras: { id_menu: number; title: string; qty: number; price_per_person: number }[];
		notes: string;
		stripeSetupIntentId: string;
	};

	if (!conversationId || !stripeSetupIntentId) throw error(400, 'Données manquantes');

	if (!stripeSetupIntentId.startsWith('simulated_')) {
		const setupIntent = await getStripe().setupIntents.retrieve(stripeSetupIntentId);
		if (setupIntent.status !== 'succeeded') throw error(402, 'Empreinte bancaire non confirmée');
	}

	const conv = await getConversationOwned(conversationId, user.id, 'customer');
	if (!conv) throw error(404, 'Conversation introuvable');

	const proposal = await getLatestProposalInConversation(conversationId, [
		'menu_proposal',
		'booking_request'
	]);

	let reqData = {
		title: 'Prestation',
		guests: guests ?? 1,
		date: new Date().toISOString().split('T')[0],
		localization: ''
	};
	if (conv.id_request) {
		const req = await getOpenRequestById(conv.id_request);
		if (req)
			reqData = {
				title: req.title_request,
				guests: guests ?? req.guests_request,
				date: req.expected_date_request,
				localization: req.localization_request
			};
	}

	const reservationId = await createReservation({
		id_conversation: conversationId,
		id_chief: conv.id_chief,
		id_customer: user.id,
		id_menu: proposal?.id_menu ?? undefined,
		title: reqData.title,
		price_per_person: proposal?.price_per_person ?? 0,
		guests: reqData.guests,
		event_date: reqData.date,
		event_time: eventTime || undefined,
		localization: reqData.localization,
		notes: notes || undefined,
		extras_json: extras?.length ? extras : undefined,
		stripe_payment_intent_id: stripeSetupIntentId
	});

	await updateConversationStatut(conversationId, 'confirme');
	await addMessage(conversationId, user.id, 'Réservation confirmée ✓', 'system');

	const customer = await getUserInfo(user.id);
	const customerName = customer ? `${customer.firstname} ${customer.name}` : 'Le client';
	await createNotification(
		conv.id_chief,
		'reservation_confirmed',
		'Nouvelle réservation confirmée !',
		`${customerName} a confirmé votre prestation « ${reqData.title} »`,
		String(conversationId)
	);

	return json({ id_reservation: reservationId });
};
