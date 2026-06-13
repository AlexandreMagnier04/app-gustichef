import { describe, it, expect } from 'vitest';
import { apiRequest, signUpAndLogin } from './helpers/client';

describe('Messaging flow — proposition de menu', () => {
	it('chef propose un menu → client voit la proposition de type menu_proposal', async () => {
		const { cookie: customerCookie } = await signUpAndLogin({ role: 'customer' });
		const { cookie: chiefCookie, userId: chiefId } = await signUpAndLogin({ role: 'chief' });

		// Créer un menu pour le chef (route attend FormData)
		const menuFd = new FormData();
		menuFd.append('title_menu', 'Menu Gastronomique E2E');
		menuFd.append('description_menu', 'Un menu 5 services avec produits locaux et de saison');
		menuFd.append('price_menu', '95');
		menuFd.append('type_menu', 'plat');
		const { res: menuRes, data: menuData } = await apiRequest('/api/menus', {
			method: 'POST',
			cookie: chiefCookie,
			body: menuFd,
		});
		expect(menuRes.status).toBe(201);
		const menuId = (menuData as { id_menu: number }).id_menu;

		// Client crée une demande
		const { data: reqData } = await apiRequest('/api/requests', {
			method: 'POST',
			cookie: customerCookie,
			body: JSON.stringify({
				title_request: 'Soirée entreprise',
				description_request: 'Soirée pour 40 personnes, cuisine gastronomique française souhaitée',
				expected_date_request: '2026-10-10',
				guests_request: 40,
				localization_request: 'Lyon 69001',
			}),
		});
		const requestId = (reqData as { id_request: number }).id_request;

		// Chef répond → crée la conversation
		await apiRequest(`/api/requests/${requestId}/respond`, {
			method: 'POST',
			cookie: chiefCookie,
			body: JSON.stringify({
				message: 'Bonjour, voici ma proposition pour votre soirée.',
				price_per_person: null,
			}),
		});

		// Récupérer l'id de la conversation
		const { data: convListData } = await apiRequest('/api/conversations', { cookie: customerCookie });
		const convs = convListData as { id_conversation: number; id_chief: string }[];
		const convId = convs.find((c) => c.id_chief === chiefId)!.id_conversation;

		// Chef propose le menu via propose-menu
		const { res: proposeRes } = await apiRequest(`/api/conversations/${convId}/propose-menu`, {
			method: 'POST',
			cookie: chiefCookie,
			body: JSON.stringify({ id_menu: menuId }),
		});
		expect(proposeRes.status).toBe(200);

		// Client consulte la conversation et voit le message menu_proposal
		const { res: detailRes, data: detailData } = await apiRequest(
			`/api/conversations/${convId}/messages`,
			{ cookie: customerCookie },
		);
		expect(detailRes.status).toBe(200);
		const msgs = (detailData as { messages: { type: string; id_menu: number | null }[] }).messages;
		const proposal = msgs.find((m) => m.type === 'menu_proposal');
		expect(proposal).toBeDefined();
		expect(proposal?.id_menu).toBe(menuId);
	});

	it('client refuse la proposition → statut conversation refuse', async () => {
		const { cookie: customerCookie } = await signUpAndLogin({ role: 'customer' });
		const { cookie: chiefCookie, userId: chiefId } = await signUpAndLogin({ role: 'chief' });

		const { data: reqData } = await apiRequest('/api/requests', {
			method: 'POST',
			cookie: customerCookie,
			body: JSON.stringify({
				title_request: 'Brunch dominical',
				description_request: 'Brunch pour 15 personnes avec produits bio et locaux de saison',
				expected_date_request: '2026-11-01',
				guests_request: 15,
				localization_request: 'Bordeaux 33000',
			}),
		});
		const requestId = (reqData as { id_request: number }).id_request;

		await apiRequest(`/api/requests/${requestId}/respond`, {
			method: 'POST',
			cookie: chiefCookie,
			body: JSON.stringify({ message: 'Je peux réaliser ce brunch pour vous.', price_per_person: null }),
		});

		const { data: convListData } = await apiRequest('/api/conversations', { cookie: customerCookie });
		const convs = convListData as { id_conversation: number; id_chief: string }[];
		const convId = convs.find((c) => c.id_chief === chiefId)!.id_conversation;

		// Client refuse
		const { res: refuseRes } = await apiRequest(`/api/conversations/${convId}/refuse`, {
			method: 'POST',
			cookie: customerCookie,
			body: JSON.stringify({}),
		});
		expect(refuseRes.status).toBe(200);

		// Vérifier le statut de la conversation
		const { data: detailData } = await apiRequest(`/api/conversations/${convId}/messages`, {
			cookie: customerCookie,
		});
		expect((detailData as { statut: string }).statut).toBe('refuse');
	});
});
