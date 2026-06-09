import { json, error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { requireUser } from '$lib/server/services/auth';
import { addMessage, updateConversationStatut } from '$lib/server/services/messaging';
import { db } from '$lib/server/db';
import { conversations } from '$lib/server/db/schema/messaging';

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

	await updateConversationStatut(id, 'refuse');
	await addMessage(id, user.id, 'Proposition refusée.', 'system');

	return json({ ok: true });
};
