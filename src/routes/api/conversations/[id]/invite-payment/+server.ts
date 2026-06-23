import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getUserInfo } from '$lib/server/services/auth';
import {
	getConversationOwned,
	addPaymentInvitation,
	updateConversationStatut
} from '$lib/server/services/messaging';
import { createNotification } from '$lib/server/services/notifications';

export const POST = async ({ params, request, locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Réservé aux chefs');

	const convId = Number(params.id);
	if (isNaN(convId)) throw error(400, 'ID invalide');

	const { pricePerPerson, menuId } = (await request.json()) as {
		pricePerPerson: number;
		menuId: number | null;
	};

	if (!pricePerPerson || pricePerPerson <= 0) throw error(400, 'Prix invalide');

	const conv = await getConversationOwned(convId, user.id, 'chief');
	if (!conv) throw error(404, 'Conversation introuvable');
	if (conv.statut !== 'a_repondre') throw error(400, 'Cette conversation ne peut pas être validée');

	await addPaymentInvitation(convId, user.id, pricePerPerson, menuId ?? null);
	await updateConversationStatut(convId, 'paiement_requis');

	const chef = await getUserInfo(user.id);
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
