import { pgTable, serial, text, integer, varchar, date, timestamp, json } from 'drizzle-orm/pg-core';
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
	event_time: varchar('event_time', { length: 5 }),
	localization: varchar('localization', { length: 100 }).notNull(),
	notes: text('notes'),
	extras_json: json('extras_json').$type<{ id_menu: number; title: string; qty: number; price_per_person: number }[]>(),
	stripe_payment_intent_id: varchar('stripe_payment_intent_id', { length: 255 }),
	statut: varchar('statut', { length: 50 }).notNull().default('confirme'),
	created_at: timestamp('created_at').notNull().defaultNow()
});
