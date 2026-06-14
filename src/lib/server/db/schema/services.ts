import { pgTable, serial, date, decimal, varchar, text } from 'drizzle-orm/pg-core';
import { chiefs } from './chiefs';
import { customers } from './customers';

// Prestation réalisée entre un client et un chef
export const services = pgTable('services', {
	id_service: serial('id_service').primaryKey(),
	date_service: date('date_service').notNull(),
	price_service: decimal('price_service', { precision: 5, scale: 2 }).notNull(),
	statut_service: varchar('statut_service', { length: 50 }).notNull(),
	id_customer: text('id_customer')
		.notNull()
		.references(() => customers.id_customer, { onDelete: 'cascade' }),
	id_chief: text('id_chief')
		.notNull()
		.references(() => chiefs.id_chief, { onDelete: 'cascade' })
});
