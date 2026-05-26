import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, cookies }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (session) {
		redirect(302, '/dashboard');
	}

	const onboardingSeen = cookies.get('onboarding_seen');
	if (onboardingSeen) {
		redirect(302, '/login');
	}

	redirect(302, '/onboarding');
};
