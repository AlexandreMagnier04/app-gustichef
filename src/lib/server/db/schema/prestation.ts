import { pgTable, serial, text, varchar, decimal, integer, date } from 'drizzle-orm/pg-core';
import { chiefs, customers } from './profiles';

export const services = pgTable('services', {
	id_service: serial('id_service').primaryKey(),
	date_service: date('date_service').notNull(),
	price_service: decimal('price_service', { precision: 5, scale: 2 }).notNull(),
	statut_service: varchar('statut_service', { length: 50 }).notNull(),
	id_customer: text('id_customer').notNull().references(() => customers.id_customer, { onDelete: 'cascade' }),
	id_chief: text('id_chief').notNull().references(() => chiefs.id_chief, { onDelete: 'cascade' }),
});

export const requests = pgTable('requests', {
	id_request: serial('id_request').primaryKey(),
	description_request: text('description_request').notNull(),
	expected_date_request: date('expected_date_request').notNull(),
	guests_request: integer('guests_request').notNull(),
	type_event_request: varchar('type_event_request', { length: 50 }),
	localization_request: varchar('localization_request', { length: 100 }).notNull(),
	statut_request: varchar('statut_request', { length: 50 }).notNull(),
	id_service: integer('id_service').references(() => services.id_service, { onDelete: 'set null' }),
	id_customer: text('id_customer').notNull().references(() => customers.id_customer, { onDelete: 'cascade' }),
});

export const menus = pgTable('menus', {
	id_menu: serial('id_menu').primaryKey(),
	title_menu: varchar('title_menu', { length: 100 }).notNull(),
	description_menu: text('description_menu').notNull(),
	price_menu: decimal('price_menu', { precision: 5, scale: 2 }).notNull(),
	id_chief: text('id_chief').notNull().references(() => chiefs.id_chief, { onDelete: 'cascade' }),
});

export const images_menu = pgTable('images_menu', {
	id_image_menu: serial('id_image_menu').primaryKey(),
	url_image_menu: varchar('url_image_menu', { length: 255 }),
	upload_image_menu: date('upload_image_menu'),
	id_menu: integer('id_menu').notNull().references(() => menus.id_menu, { onDelete: 'cascade' }),
});
