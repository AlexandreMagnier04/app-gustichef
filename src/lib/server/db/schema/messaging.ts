import { pgTable, serial, text, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { requests } from './customers';

export const conversations = pgTable('conversations', {
	id_conversation: serial('id_conversation').primaryKey(),
	id_request: integer('id_request').references(() => requests.id_request),
	id_chief: text('id_chief').notNull().references(() => users.id, { onDelete: 'cascade' }),
	id_customer: text('id_customer').notNull().references(() => users.id, { onDelete: 'cascade' }),
	statut: varchar('statut', { length: 50 }).notNull().default('a_repondre'),
	last_message_at: timestamp('last_message_at').notNull().defaultNow(),
	created_at: timestamp('created_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
	id_message: serial('id_message').primaryKey(),
	id_conversation: integer('id_conversation').notNull().references(() => conversations.id_conversation, { onDelete: 'cascade' }),
	id_sender: text('id_sender').notNull().references(() => users.id),
	content_message: text('content_message').notNull(),
	type: varchar('type', { length: 50 }).notNull().default('text'), // text | menu_proposal | system
	id_menu: integer('id_menu'),
	price_per_person: integer('price_per_person'),
	created_at: timestamp('created_at').notNull().defaultNow(),
	read_message: boolean('read_message').notNull().default(false),
});
