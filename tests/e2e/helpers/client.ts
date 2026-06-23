const BASE_URL = process.env.ORIGIN ?? 'http://localhost:4173';

// Effectue une requête HTTP vers l'app et retourne response + données JSON
export async function apiRequest(
	path: string,
	options: RequestInit & { cookie?: string } = {}
): Promise<{ res: Response; data: unknown }> {
	const { cookie, ...fetchOptions } = options;
	const isFormData = fetchOptions.body instanceof FormData;
	const headers: Record<string, string> = {
		...(isFormData ? {} : { 'Content-Type': 'application/json' }),
		...(cookie ? { Cookie: cookie } : {}),
		...((fetchOptions.headers as Record<string, string>) ?? {})
	};

	const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });
	const contentType = res.headers.get('content-type') ?? '';
	const data = contentType.includes('json') ? await res.json() : null;
	return { res, data };
}

// Crée un compte, se connecte, et retourne le cookie de session + userId
export async function signUpAndLogin(
	overrides: {
		email?: string;
		password?: string;
		role?: 'customer' | 'chief';
		name?: string;
		firstname?: string;
	} = {}
): Promise<{ cookie: string; userId: string; email: string }> {
	const email =
		overrides.email ?? `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
	const password = overrides.password ?? 'password123!';
	const role = overrides.role ?? 'customer';

	await apiRequest('/api/auth/sign-up/email', {
		method: 'POST',
		body: JSON.stringify({
			email,
			password,
			name: overrides.name ?? 'Dupont',
			firstname: overrides.firstname ?? 'Jean',
			role,
			localization: 'Paris'
		})
	});

	const { res: signInRes } = await apiRequest('/api/auth/sign-in/email', {
		method: 'POST',
		body: JSON.stringify({ email, password })
	});

	// Extraire le cookie de session depuis les headers set-cookie
	const cookies =
		(signInRes.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
	const cookie = cookies.map((c) => c.split(';')[0].trim()).join('; ');

	const { data: sessionData } = await apiRequest('/api/auth/get-session', { cookie });
	const userId = (sessionData as { user?: { id: string } })?.user?.id ?? '';

	if (role === 'chief') {
		await apiRequest('/api/chief/profile', {
			method: 'POST',
			cookie,
			body: JSON.stringify({ bio: 'Chef e2e', specialties: [] })
		});
	}

	return { cookie, userId, email };
}
