import { redirect, fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';
import { roleDto } from '$lib/dtos/onboarding.dto';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const parsed = roleDto.safeParse({ role: formData.get('role') });
		if (!parsed.success) {
			const message = z.flattenError(parsed.error).fieldErrors.role?.[0] ?? 'Rôle invalide';
			return fail(400, { error: message });
		}

		cookies.set('onboarding_seen', 'true', {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: true,
			sameSite: 'lax'
		});

		if (parsed.data.role === 'chef') {
			redirect(302, '/chief/register');
		} else {
			redirect(302, '/register');
		}
	}
};
