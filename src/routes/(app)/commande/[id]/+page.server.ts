import { error, redirect } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { requireUser } from '$lib/server/services/auth';
import { getConversationDetail } from '$lib/server/services/messaging';
import { getExtrasByChief } from '$lib/server/services/chiefs';
import { getMenuImageUrl } from '$lib/server/services/images';
import type { MessageItem } from '$lib/models/messaging.model';
import type { PageServerLoad } from './$types';

const getStripe = () => new Stripe(env.STRIPE_SECRET_KEY ?? '');

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

	const [chiefExtras, menuImage, setupIntent] = await Promise.all([
		getExtrasByChief(conv.id_chief),
		proposal?.id_menu ? getMenuImageUrl(proposal.id_menu) : Promise.resolve(null),
		getStripe().setupIntents.create({ usage: 'off_session', payment_method_types: ['card'] })
	]);

	return { conv, user, chiefExtras, menuImage, stripeClientSecret: setupIntent.client_secret };
};
