import { requireUser } from '$lib/server/services/auth';
import { getUnreadCount } from '$lib/server/services/notifications';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const unreadNotificationsCount = await getUnreadCount(user.id);
	return { user, unreadNotificationsCount };
};
