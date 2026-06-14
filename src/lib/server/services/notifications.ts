import { and, eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { notifications } from '$lib/server/db/schema/notifications';
import { publish, userChannel } from '$lib/server/db/pubsub';

export interface Notification {
	id_notification: number;
	id_user: string;
	type: string;
	title: string;
	body: string;
	read: boolean;
	id_request: string | null;
	created_at: Date;
}

export async function createNotification(
	userId: string,
	type: string,
	title: string,
	body: string,
	idRequest?: string
): Promise<void> {
	await db.insert(notifications).values({
		id_user: userId,
		type,
		title,
		body,
		id_request: idRequest ?? null
	});
	await publish(userChannel(userId), JSON.stringify({ type: 'notification' }));
}

export async function getNotifications(userId: string): Promise<Notification[]> {
	return db
		.select()
		.from(notifications)
		.where(eq(notifications.id_user, userId))
		.orderBy(desc(notifications.created_at))
		.limit(50);
}

export async function getUnreadCount(userId: string): Promise<number> {
	const rows = await db
		.select({ id: notifications.id_notification })
		.from(notifications)
		.where(and(eq(notifications.id_user, userId), eq(notifications.read, false)));
	return rows.length;
}

export async function markAllRead(userId: string): Promise<void> {
	await db.update(notifications).set({ read: true }).where(eq(notifications.id_user, userId));
}
