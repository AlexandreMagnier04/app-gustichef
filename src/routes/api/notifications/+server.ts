import { json } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getNotifications, markAllRead } from '$lib/server/services/notifications';

export const GET = async ({ locals }) => {
	const user = requireUser(locals);
	const notifs = await getNotifications(user.id);
	return json(notifs);
};

export const PATCH = async ({ locals }) => {
	const user = requireUser(locals);
	await markAllRead(user.id);
	return json({ ok: true });
};
