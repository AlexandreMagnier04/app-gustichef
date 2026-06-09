import { json } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getConversationsForUser } from '$lib/server/services/messaging';

export const GET = async ({ locals }) => {
	const user = requireUser(locals);
	const convs = await getConversationsForUser(user.id, user.role ?? 'customer');
	return json(convs);
};
