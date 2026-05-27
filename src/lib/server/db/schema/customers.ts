import { relations } from 'drizzle-orm';
import { pgTable, text, integer, serial, date, varchar } from 'drizzle-orm/pg-core';
import { users } from './auth';

// Profil client (héritage 1-1 avec users)
export const customers = pgTable('customers', {
	id_customer: text('id_customer').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
	preferences_customer: text('preferences_customer').notNull(),
});

// Demande de prestation émise par un client
// id_service est nullable : la demande devient une prestation une fois acceptée
export const requests = pgTable('requests', {
	id_request: serial('id_request').primaryKey(),
	description_request: text('description_request').notNull(),
	expected_date_request: date('expected_date_request').notNull(),
	guests_request: integer('guests_request').notNull(),
	type_event_request: varchar('type_event_request', { length: 50 }),
	localization_request: varchar('localization_request', { length: 100 }).notNull(),
	statut_request: varchar('statut_request', { length: 50 }).notNull(),
	id_service: integer('id_service'),
	id_customer: text('id_customer').notNull().references(() => customers.id_customer, { onDelete: 'cascade' }),
	id_chief: text('id_chief').notNull(),
});

export const customerRelations = relations(customers, ({ one }) => ({
	user: one(users, { fields: [customers.id_customer], references: [users.id] }),
}));
