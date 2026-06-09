import { json, error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { requests } from '$lib/server/db/schema/customers';
import { requireUser } from '$lib/server/services/auth';
import { createConversation } from '$lib/server/services/messaging';
import { createNotification } from '$lib/server/services/notifications';
import { users } from '$lib/server/db/schema/auth';

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

	const [req] = await db
		.select()
		.from(requests)
		.where(and(eq(requests.id_request, id), eq(requests.statut_request, 'open')));
	if (!req) throw error(404, 'Demande introuvable ou déjà traitée');

	// Mark request as responded
	await db
		.update(requests)
		.set({ id_chief: user.id, statut_request: 'responded', chief_message: message.trim(), ...(price !== null ? { chief_price_per_person: price } : {}) })
		.where(eq(requests.id_request, id));

	// Create the conversation
	await createConversation(id, user.id, req.id_customer, message.trim(), price);

	// Notify the customer
	const [chef] = await db.select({ firstname: users.firstname, name: users.name, image: users.image }).from(users).where(eq(users.id, user.id));
	const chefName = chef ? `${chef.firstname} ${chef.name}` : 'Un chef';
	await createNotification(
		req.id_customer,
		'request_responded',
		'Nouvelle proposition',
		`${chefName} vous a envoyé une proposition pour « ${req.title_request} »`,
		String(id),
	);

	return json({ ok: true });
};
