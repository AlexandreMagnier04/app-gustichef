import { json, error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { requireUser } from '$lib/server/services/auth';
import { updateConversationStatut } from '$lib/server/services/messaging';
import { createNotification } from '$lib/server/services/notifications';
import { db } from '$lib/server/db';
import { conversations, messages } from '$lib/server/db/schema/messaging';
import { users } from '$lib/server/db/schema/auth';

export const POST = async ({ params, request, locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Réservé aux chefs');

	const convId = Number(params.id);
	if (isNaN(convId)) throw error(400, 'ID invalide');

	const { pricePerPerson, menuId } = await request.json() as {
		pricePerPerson: number;
		menuId: number | null;
	};

	if (!pricePerPerson || pricePerPerson <= 0) throw error(400, 'Prix invalide');

	const [conv] = await db.select().from(conversations)
		.where(and(eq(conversations.id_conversation, convId), eq(conversations.id_chief, user.id)));
	if (!conv) throw error(404, 'Conversation introuvable');
	if (conv.statut !== 'a_repondre') throw error(400, 'Cette conversation ne peut pas être validée');

	// Message invitation au paiement
	await db.insert(messages).values({
		id_conversation: convId,
		id_sender: user.id,
		content_message: 'Votre prestation est prête ! Sécurisez votre réservation ci-dessous.',
		type: 'payment_invitation',
		id_menu: menuId ?? null,
		price_per_person: pricePerPerson
	});

	await updateConversationStatut(convId, 'paiement_requis');

	// Notifier le client
	const [chef] = await db.select({ firstname: users.firstname, name: users.name })
		.from(users).where(eq(users.id, user.id));
	const chefName = chef ? `${chef.firstname} ${chef.name}` : 'Le chef';

	await createNotification(
		conv.id_customer,
		'payment_invitation',
		'Votre réservation est prête !',
		`${chefName} a validé votre demande. Sécurisez votre réservation.`,
		String(convId)
	);

	return json({ ok: true });
};
