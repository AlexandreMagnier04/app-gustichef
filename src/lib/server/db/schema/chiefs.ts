import { relations } from 'drizzle-orm';
import { pgTable, text, decimal, serial, varchar, integer, primaryKey, date } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { customers } from './customers';

// Profil chef (héritage 1-1 avec users)
export const chiefs = pgTable('chiefs', {
	id_chief: text('id_chief').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
	bio_chief: text('bio_chief'),
	note_chief: decimal('note_chief', { precision: 2, scale: 1 }),
});

export const specialties = pgTable('specialties', {
	id_speciality: serial('id_speciality').primaryKey(),
	name_speciality: varchar('name_speciality', { length: 50 }).notNull(),
	description_speciality: text('description_speciality'),
});

export const categories = pgTable('categories', {
	id_category: serial('id_category').primaryKey(),
	name_category: varchar('name_category', { length: 50 }).notNull(),
});

// M:N chiefs ↔ specialties
export const cook = pgTable(
	'cook',
	{
		id_chief: text('id_chief').notNull().references(() => chiefs.id_chief, { onDelete: 'cascade' }),
		id_speciality: integer('id_speciality').notNull().references(() => specialties.id_speciality, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.id_chief, table.id_speciality] })],
);

// M:N chiefs ↔ categories
export const affiliate = pgTable(
	'affiliate',
	{
		id_chief: text('id_chief').notNull().references(() => chiefs.id_chief, { onDelete: 'cascade' }),
		id_category: integer('id_category').notNull().references(() => categories.id_category, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.id_chief, table.id_category] })],
);

export const images_chef = pgTable('images_chef', {
	id_image_chef: serial('id_image_chef').primaryKey(),
	url_image_chef: varchar('url_image_chef', { length: 255 }),
	upload_image_chef: date('upload_image_chef'),
	id_chief: text('id_chief').notNull().references(() => chiefs.id_chief, { onDelete: 'cascade' }),
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

// Avis laissé par un client sur un chef (référence les deux entités)
export const notices = pgTable('notices', {
	id_notice: serial('id_notice').primaryKey(),
	rating_notice: decimal('rating_notice', { precision: 2, scale: 1 }).notNull(),
	comment_notice: text('comment_notice'),
	date_notice: date('date_notice').notNull(),
	id_customer: text('id_customer').notNull().references(() => customers.id_customer, { onDelete: 'cascade' }),
	id_chief: text('id_chief').notNull().references(() => chiefs.id_chief, { onDelete: 'cascade' }),
});

export const chiefRelations = relations(chiefs, ({ one }) => ({
	user: one(users, { fields: [chiefs.id_chief], references: [users.id] }),
}));

export const cookRelations = relations(cook, ({ one }) => ({
	chief: one(chiefs, { fields: [cook.id_chief], references: [chiefs.id_chief] }),
	speciality: one(specialties, { fields: [cook.id_speciality], references: [specialties.id_speciality] }),
}));

export const affiliateRelations = relations(affiliate, ({ one }) => ({
	chief: one(chiefs, { fields: [affiliate.id_chief], references: [chiefs.id_chief] }),
	category: one(categories, { fields: [affiliate.id_category], references: [categories.id_category] }),
}));
