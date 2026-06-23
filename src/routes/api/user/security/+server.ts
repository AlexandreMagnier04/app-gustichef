import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/services/auth';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireUser(locals);
	const { email, currentPassword, newPassword } = await request.json();

	if (email && email !== user.email) {
		await db.update(users).set({ email }).where(eq(users.id, user.id));
	}

	if (currentPassword && newPassword) {
		const result = await auth.api.changePassword({
			headers: request.headers,
			body: { currentPassword, newPassword, revokeOtherSessions: false }
		});
		if (!result) return json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
	}

	return json({ success: true });
};
