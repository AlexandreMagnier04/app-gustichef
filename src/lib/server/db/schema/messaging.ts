import { pgTable, serial, text, date, boolean } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const messages = pgTable('messages', {
	id_message: serial('id_message').primaryKey(),
	content_message: text('content_message').notNull(),
	expedition_date_message: date('expedition_date_message').notNull(),
	read_message: boolean('read_message').default(false).notNull(),
	id_sender: text('id_sender').notNull().references(() => users.id, { onDelete: 'cascade' }),
	id_recipient: text('id_recipient').notNull().references(() => users.id, { onDelete: 'cascade' }),
});
