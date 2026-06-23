import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { addMessage } from '$lib/server/services/messaging';
import { getConversationOwned } from '$lib/server/services/messaging';
import { getMenuById } from '$lib/server/services/chiefs';

export const POST = async ({ params, request, locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Réservé aux chefs');

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const { id_menu } = await request.json();
	if (!id_menu) throw error(400, 'Menu requis');

	const [menu, conv] = await Promise.all([
		getMenuById(id_menu),
		getConversationOwned(id, user.id, 'chief')
	]);

	if (!menu || menu.id_chief !== user.id) throw error(404, 'Menu introuvable');
	if (!conv) throw error(404, 'Conversation introuvable');

	await addMessage(id, user.id, `${menu.title_menu}`, 'menu_proposal', id_menu);
	return json({ ok: true });
};
