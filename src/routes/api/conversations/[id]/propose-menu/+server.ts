import { json, error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { requireUser } from '$lib/server/services/auth';
import { addMessage } from '$lib/server/services/messaging';
import { db } from '$lib/server/db';
import { conversations } from '$lib/server/db/schema/messaging';
import { menus } from '$lib/server/db/schema/chiefs';

export const POST = async ({ params, request, locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Réservé aux chefs');

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const { id_menu } = await request.json();
	if (!id_menu) throw error(400, 'Menu requis');

	// Verify the menu belongs to this chef
	const [menu] = await db
		.select()
		.from(menus)
		.where(and(eq(menus.id_menu, id_menu), eq(menus.id_chief, user.id)));
	if (!menu) throw error(404, 'Menu introuvable');

	// Verify the chef owns this conversation
	const [conv] = await db
		.select()
		.from(conversations)
		.where(and(eq(conversations.id_conversation, id), eq(conversations.id_chief, user.id)));
	if (!conv) throw error(404, 'Conversation introuvable');

	await addMessage(id, user.id, `${menu.title_menu}`, 'menu_proposal', id_menu);
	return json({ ok: true });
};
