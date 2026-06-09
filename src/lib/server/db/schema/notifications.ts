import { pgTable, serial, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const notifications = pgTable('notifications', {
	id_notification: serial('id_notification').primaryKey(),
	id_user: text('id_user').notNull().references(() => users.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 50 }).notNull(),
	title: varchar('title', { length: 200 }).notNull(),
	body: text('body').notNull(),
	read: boolean('read').notNull().default(false),
	id_request: text('id_request'),
	created_at: timestamp('created_at').notNull().defaultNow(),
});
