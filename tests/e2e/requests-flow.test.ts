import { describe, it, expect } from 'vitest';
import { apiRequest, signUpAndLogin } from './helpers/client';

describe('Requests flow', () => {
	it('client crée une demande → chef la voit dans la liste', async () => {
		const { cookie: customerCookie } = await signUpAndLogin({ role: 'customer' });
		const { cookie: chiefCookie } = await signUpAndLogin({ role: 'chief' });

		const { res: reqRes, data: reqData } = await apiRequest('/api/requests', {
			method: 'POST',
			cookie: customerCookie,
			body: JSON.stringify({
				title_request: 'Soirée anniversaire E2E',
				description_request: 'Repas pour 15 personnes dans une salle de réception parisienne haussmannienne',
				expected_date_request: '2026-11-20',
				guests_request: 15,
				localization_request: 'Paris 75008'
			})
		});
		expect(reqRes.status).toBe(201);
		const requestId = (reqData as { id_request: number }).id_request;
		expect(requestId).toBeDefined();

		// Chef consulte les demandes ouvertes
		const { res: listRes, data: listData } = await apiRequest('/api/requests', {
			cookie: chiefCookie
		});
		expect(listRes.status).toBe(200);
		const found = (listData as { id_request: number }[]).find((r) => r.id_request === requestId);
		expect(found).toBeDefined();
	});

	it('un chef ne peut pas créer de demande → 403', async () => {
		const { cookie: chiefCookie } = await signUpAndLogin({ role: 'chief' });

		const { res } = await apiRequest('/api/requests', {
			method: 'POST',
			cookie: chiefCookie,
			body: JSON.stringify({
				title_request: 'Tentative chef',
				description_request: 'Un chef essaie de créer une demande ce qui est interdit par la logique métier',
				expected_date_request: '2026-12-01',
				guests_request: 10,
				localization_request: 'Lyon 69001'
			})
		});
		expect(res.status).toBe(403);
	});

	it('accès sans session → redirect 302 vers /login', async () => {
		const { res } = await apiRequest('/api/requests', {
			method: 'POST',
			body: JSON.stringify({}),
			redirect: 'manual'
		});
		expect(res.status).toBe(302);
	});

	it('validation : titre trop court → 400', async () => {
		const { cookie } = await signUpAndLogin({ role: 'customer' });

		const { res } = await apiRequest('/api/requests', {
			method: 'POST',
			cookie,
			body: JSON.stringify({
				title_request: 'AB',
				description_request: 'Description suffisamment longue pour passer la validation zod du DTO',
				expected_date_request: '2026-12-01',
				guests_request: 10,
				localization_request: 'Paris'
			})
		});
		expect(res.status).toBe(400);
	});

	it('client voit uniquement ses propres demandes', async () => {
		const { cookie: c1 } = await signUpAndLogin({ role: 'customer' });
		const { cookie: c2 } = await signUpAndLogin({ role: 'customer' });

		const { data: d1 } = await apiRequest('/api/requests', {
			method: 'POST',
			cookie: c1,
			body: JSON.stringify({
				title_request: 'Demande client 1',
				description_request: 'Description suffisamment longue pour la validation du champ dans le DTO',
				expected_date_request: '2026-09-10',
				guests_request: 5,
				localization_request: 'Bordeaux'
			})
		});
		const requestId = (d1 as { id_request: number }).id_request;

		// c2 GET ses demandes → ne doit pas voir celle de c1
		const { data: list2 } = await apiRequest('/api/requests', { cookie: c2 });
		const found = (list2 as { id_request: number }[]).find((r) => r.id_request === requestId);
		expect(found).toBeUndefined();
	});
});

describe('Chief profile', () => {
	it('chef accède à son profil après setup', async () => {
		const { cookie, userId } = await signUpAndLogin({ role: 'chief' });

		const { res } = await apiRequest(`/chiefs/${userId}`, { cookie });
		expect(res.status).toBe(200);
	});

	it('accès profil chef inexistant → 404', async () => {
		const { cookie } = await signUpAndLogin({ role: 'chief' });

		const { res } = await apiRequest('/chiefs/id-qui-nexiste-absolument-pas', { cookie });
		expect(res.status).toBe(404);
	});
});
