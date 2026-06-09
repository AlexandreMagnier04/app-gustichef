import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/services/auth';
import { setupChiefProfile } from '$lib/server/services/chiefs';
import { setupChiefProfileDto } from '$lib/dtos/chief.dto';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireRole(locals, 'chief');

	const body = await request.json();
	const parsed = setupChiefProfileDto.safeParse(body);
	if (!parsed.success) {
		return json({ error: z.flattenError(parsed.error).fieldErrors }, { status: 400 });
	}

	await setupChiefProfile(user.id, {
		bio: parsed.data.bio,
		specialtyNames: parsed.data.specialties,
	});

	return json({ success: true });
};
