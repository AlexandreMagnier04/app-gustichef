import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { roleDto } from '$lib/features/onboarding/onboarding.dto';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const parsed = roleDto.safeParse({ role: formData.get('role') });
		if (!parsed.success) {
			const message = parsed.error.flatten().fieldErrors.role?.[0] ?? 'Rôle invalide';
			return fail(400, { error: message });
		}

		cookies.set('onboarding_seen', 'true', {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: true,
			sameSite: 'lax'
		});

		redirect(302, `/register?role=${parsed.data.role}`);
	}
};
