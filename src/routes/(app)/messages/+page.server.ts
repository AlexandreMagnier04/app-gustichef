import { requireUser } from '$lib/server/services/auth';
import { getConversationsForUser } from '$lib/server/services/messaging';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const conversations = await getConversationsForUser(user.id, user.role ?? 'customer');
	return { conversations, user };
};
