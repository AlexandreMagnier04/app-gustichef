import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import {
	getConversationOwned,
	addMessage,
	updateConversationStatut
} from '$lib/server/services/messaging';

export const POST = async ({ params, locals }) => {
	const user = requireUser(locals);

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const role = user.role === 'chief' ? 'chief' : 'customer';
	const conv = await getConversationOwned(id, user.id, role);
	if (!conv) throw error(404, 'Conversation introuvable');

	await updateConversationStatut(id, 'refuse');
	const msg = user.role === 'chief' ? 'Demande refusée par le chef.' : 'Proposition refusée.';
	await addMessage(id, user.id, msg, 'system');

	return json({ ok: true });
};
