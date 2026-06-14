import { describe, it, expect } from 'vitest';
import { apiRequest, signUpAndLogin } from './helpers/client';

describe('Reservation flow', () => {
	it('client crée demande → chef répond → client accepte → réservation créée', async () => {
		const { cookie: customerCookie, userId: _customerId } = await signUpAndLogin({
			role: 'customer'
		});
		const { cookie: chiefCookie, userId: chiefId } = await signUpAndLogin({ role: 'chief' });

		// Client crée une demande ouverte (visible par tous les chefs)
		const { res: reqRes, data: reqData } = await apiRequest('/api/requests', {
			method: 'POST',
			cookie: customerCookie,
			body: JSON.stringify({
				title_request: 'Dîner mariage E2E',
				description_request: 'Un dîner pour 30 personnes dans une salle de réception parisienne',
				expected_date_request: '2026-09-20',
				guests_request: 30,
				localization_request: 'Paris 75008'
			})
		});
		expect(reqRes.status).toBe(201);
		const requestId = (reqData as { id_request: number }).id_request;
		expect(requestId).toBeDefined();

		// Chef voit la demande dans la liste
		const { res: listRes, data: listData } = await apiRequest('/api/requests', {
			cookie: chiefCookie
		});
		expect(listRes.status).toBe(200);
		const found = (listData as { id_request: number }[]).find((r) => r.id_request === requestId);
		expect(found).toBeDefined();

		// Chef répond à la demande → crée la conversation
		const { res: respondRes } = await apiRequest(`/api/requests/${requestId}/respond`, {
			method: 'POST',
			cookie: chiefCookie,
			body: JSON.stringify({
				message: 'Bonjour, je suis disponible pour votre événement de mariage.',
				price_per_person: 75
			})
		});
		expect(respondRes.status).toBe(200);

		// Client consulte ses conversations pour trouver l'id de la conversation créée
		const { res: convListRes, data: convListData } = await apiRequest('/api/conversations', {
			cookie: customerCookie
		});
		expect(convListRes.status).toBe(200);
		const convs = convListData as { id_conversation: number; id_chief: string }[];
		const conv = convs.find((c) => c.id_chief === chiefId);
		expect(conv).toBeDefined();
		const convId = conv!.id_conversation;

		// Client accepte la proposition → crée la réservation
		const { res: acceptRes, data: acceptData } = await apiRequest(
			`/api/conversations/${convId}/accept`,
			{
				method: 'POST',
				cookie: customerCookie,
				body: JSON.stringify({})
			}
		);
		expect(acceptRes.status).toBe(200);
		const reservationId = (acceptData as { id_reservation: number }).id_reservation;
		expect(reservationId).toBeDefined();
	});

	it('annuler une réservation → statut annule', async () => {
		const { cookie: customerCookie } = await signUpAndLogin({ role: 'customer' });
		const { cookie: chiefCookie, userId: chiefId } = await signUpAndLogin({ role: 'chief' });

		// Créer une demande + conversation + réservation en une fois
		const { data: reqData } = await apiRequest('/api/requests', {
			method: 'POST',
			cookie: customerCookie,
			body: JSON.stringify({
				title_request: 'Soirée anniversaire',
				description_request: 'Soirée pour 20 personnes dans un appartement parisien haussmannien',
				expected_date_request: '2026-10-15',
				guests_request: 20,
				localization_request: 'Paris 75016'
			})
		});
		const requestId = (reqData as { id_request: number }).id_request;

		await apiRequest(`/api/requests/${requestId}/respond`, {
			method: 'POST',
			cookie: chiefCookie,
			body: JSON.stringify({
				message: 'Je suis disponible pour cette soirée.',
				price_per_person: 60
			})
		});

		const { data: convListData } = await apiRequest('/api/conversations', {
			cookie: customerCookie
		});
		const convs = convListData as { id_conversation: number; id_chief: string }[];
		const convId = convs.find((c) => c.id_chief === chiefId)!.id_conversation;

		const { data: acceptData } = await apiRequest(`/api/conversations/${convId}/accept`, {
			method: 'POST',
			cookie: customerCookie,
			body: JSON.stringify({})
		});
		const reservationId = (acceptData as { id_reservation: number }).id_reservation;

		// Annuler la réservation
		const { res: cancelRes } = await apiRequest(`/api/reservations/${reservationId}`, {
			method: 'DELETE',
			cookie: customerCookie
		});
		expect(cancelRes.status).toBe(200);
	});
});
