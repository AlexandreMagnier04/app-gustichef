import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getConversationDetail } from '$lib/server/services/messaging';
import { getMenusByChief } from '$lib/server/services/chiefs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireUser(locals);
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const conv = await getConversationDetail(id, user.id);
	if (!conv) throw error(404, 'Conversation introuvable');

	const chiefMenus = user.role === 'chief' ? await getMenusByChief(user.id) : [];

	return { conv, user, chiefMenus };
};
