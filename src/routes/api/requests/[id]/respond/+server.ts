import { json, error } from '@sveltejs/kit';
import { requireUser, getUserInfo } from '$lib/server/services/auth';
import { createConversation } from '$lib/server/services/messaging';
import { createNotification } from '$lib/server/services/notifications';
import { getOpenRequestById, respondToRequest } from '$lib/server/services/customers';

export const POST = async ({ params, request, locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Réservé aux chefs');

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const { message, price_per_person } = await request.json();

	if (!message || message.trim().length < 10) {
		return json({ error: 'Le message doit faire au moins 10 caractères.' }, { status: 400 });
	}

	const price = price_per_person ? Number(price_per_person) : null;

	const req = await getOpenRequestById(id);
	if (!req) throw error(404, 'Demande introuvable ou déjà traitée');

	await respondToRequest(id, user.id);

	const convId = await createConversation(id, user.id, req.id_customer, message.trim(), price);

	const chef = await getUserInfo(user.id);
	const chefName = chef ? `${chef.firstname} ${chef.name}` : 'Un chef';
	await createNotification(
		req.id_customer,
		'request_responded',
		'Nouvelle proposition',
		`${chefName} vous a envoyé une proposition pour « ${req.title_request} »`,
		String(convId)
	);

	return json({ ok: true });
};
