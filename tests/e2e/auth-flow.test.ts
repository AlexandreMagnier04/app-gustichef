import { describe, it, expect } from 'vitest';
import { apiRequest, signUpAndLogin } from './helpers/client';

describe('Auth flow', () => {
	it('inscription client → session valide avec userId', async () => {
		const { cookie, userId } = await signUpAndLogin({ role: 'customer' });
		expect(cookie).toBeTruthy();
		expect(userId).toBeTruthy();
	});

	it('inscription chef → session valide avec userId', async () => {
		const { cookie, userId } = await signUpAndLogin({ role: 'chief' });
		expect(cookie).toBeTruthy();
		expect(userId).toBeTruthy();
	});

	it('accès route protégée sans session → redirect 302 vers /login', async () => {
		const { res } = await apiRequest('/home', { redirect: 'manual' });
		expect(res.status).toBe(302);
		const location = res.headers.get('location') ?? '';
		expect(location).toContain('login');
	});

	it('accès route protégée avec session valide → 200', async () => {
		const { cookie } = await signUpAndLogin();
		const { res } = await apiRequest('/home', { cookie });
		expect(res.status).toBe(200);
	});

	it('login avec mauvais mot de passe → réponse non-200', async () => {
		const { email } = await signUpAndLogin({ password: 'correct123!' });
		const { res } = await apiRequest('/api/auth/sign-in/email', {
			method: 'POST',
			body: JSON.stringify({ email, password: 'mauvais' })
		});
		expect(res.status).not.toBe(200);
	});

	it('GET /api/auth/get-session sans cookie → session null', async () => {
		const { data } = await apiRequest('/api/auth/get-session');
		expect((data as { session?: unknown } | null)?.session ?? null).toBeNull();
	});
});
