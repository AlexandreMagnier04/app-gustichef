import { pgTable, serial, text, integer, varchar, date, timestamp } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { conversations } from './messaging';

export const reservations = pgTable('reservations', {
	id_reservation: serial('id_reservation').primaryKey(),
	id_conversation: integer('id_conversation')
		.notNull()
		.references(() => conversations.id_conversation),
	id_chief: text('id_chief')
		.notNull()
		.references(() => users.id),
	id_customer: text('id_customer')
		.notNull()
		.references(() => users.id),
	id_menu: integer('id_menu'),
	title: varchar('title', { length: 200 }).notNull(),
	price_per_person: integer('price_per_person').notNull(),
	guests: integer('guests').notNull(),
	event_date: date('event_date').notNull(),
	localization: varchar('localization', { length: 100 }).notNull(),
	statut: varchar('statut', { length: 50 }).notNull().default('confirme'),
	created_at: timestamp('created_at').notNull().defaultNow()
});
