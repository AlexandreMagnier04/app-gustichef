import { error, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { requireUser } from '$lib/server/services/auth';
import { getConversationDetail } from '$lib/server/services/messaging';
import { db } from '$lib/server/db';
import { menus, images_menu } from '$lib/server/db/schema/chiefs';
import type { MessageItem } from '$lib/models/messaging.model';
import type { PageServerLoad } from './$types';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw redirect(302, '/messages');

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const conv = await getConversationDetail(id, user.id);
	if (!conv) throw error(404, 'Conversation introuvable');

	if (conv.statut === 'confirme') throw redirect(302, `/messages/${id}`);
	if (conv.statut !== 'devis_envoye' && conv.statut !== 'paiement_requis')
		throw redirect(302, `/messages/${id}`);

	const proposal = [...(conv.messages ?? [])]
		.reverse()
		.find((m: MessageItem) => m.type === 'menu_proposal' || m.type === 'payment_invitation');

	const [chiefExtras, menuImages, setupIntent] = await Promise.all([
		db
			.select()
			.from(menus)
			.where(and(eq(menus.id_chief, conv.id_chief), eq(menus.type_menu, 'extra'))),
		proposal?.id_menu
			? db.select().from(images_menu).where(eq(images_menu.id_menu, proposal.id_menu)).limit(1)
			: Promise.resolve([]),
		stripe.setupIntents.create({ usage: 'off_session', payment_method_types: ['card'] })
	]);

	const menuImage = menuImages[0]?.url ?? null;

	return { conv, user, chiefExtras, menuImage, stripeClientSecret: setupIntent.client_secret };
};
