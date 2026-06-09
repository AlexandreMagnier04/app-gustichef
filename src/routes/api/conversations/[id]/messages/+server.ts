import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { addMessage, getConversationDetail } from '$lib/server/services/messaging';

export const GET = async ({ params, locals }) => {
	const user = requireUser(locals);
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const conv = await getConversationDetail(id, user.id);
	if (!conv) throw error(404, 'Conversation introuvable');
	return json(conv);
};

export const POST = async ({ params, request, locals }) => {
	const user = requireUser(locals);
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const { content } = await request.json();
	if (!content?.trim()) throw error(400, 'Message vide');

	await addMessage(id, user.id, content.trim());
	return json({ ok: true });
};
