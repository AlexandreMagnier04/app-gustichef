import { json, error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { requireUser } from '$lib/server/services/auth';
import { addMessage, updateConversationStatut } from '$lib/server/services/messaging';
import { db } from '$lib/server/db';
import { conversations } from '$lib/server/db/schema/messaging';

export const POST = async ({ params, locals }) => {
	const user = requireUser(locals);

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	// Chef ou client peuvent refuser selon leur rôle
	const condition =
		user.role === 'chief'
			? and(eq(conversations.id_conversation, id), eq(conversations.id_chief, user.id))
			: and(eq(conversations.id_conversation, id), eq(conversations.id_customer, user.id));

	const [conv] = await db.select().from(conversations).where(condition);
	if (!conv) throw error(404, 'Conversation introuvable');

	await updateConversationStatut(id, 'refuse');
	const msg = user.role === 'chief' ? 'Demande refusée par le chef.' : 'Proposition refusée.';
	await addMessage(id, user.id, msg, 'system');

	return json({ ok: true });
};
