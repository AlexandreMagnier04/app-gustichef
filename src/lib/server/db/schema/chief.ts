import { relations } from 'drizzle-orm';
import { pgTable, serial, text, varchar, decimal, integer, primaryKey, date } from 'drizzle-orm/pg-core';
import { chiefs, customers } from './profiles';


export const specialties = pgTable('specialties', {
	id_speciality: serial('id_speciality').primaryKey(),
	name_speciality: varchar('name_speciality', { length: 50 }).notNull(),
	description_speciality: text('description_speciality'),
});

export const categories = pgTable('categories', {
	id_category: serial('id_category').primaryKey(),
	name_category: varchar('name_category', { length: 50 }).notNull(),
});

export const cook = pgTable(
	'cook',
	{
		id_chief: text('id_chief').notNull().references(() => chiefs.id_chief, { onDelete: 'cascade' }),
		id_speciality: integer('id_speciality').notNull().references(() => specialties.id_speciality, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.id_chief, table.id_speciality] })],
);

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

export const notices = pgTable('notices', {
	id_notice: serial('id_notice').primaryKey(),
	rating_notice: decimal('rating_notice', { precision: 2, scale: 1 }).notNull(),
	comment_notice: text('comment_notice'),
	date_notice: date('date_notice').notNull(),
	id_customer: text('id_customer').notNull().references(() => customers.id_customer, { onDelete: 'cascade' }),
	id_chief: text('id_chief').notNull().references(() => chiefs.id_chief, { onDelete: 'cascade' }),
});

export const cookRelations = relations(cook, ({ one }) => ({
	chief: one(chiefs, { fields: [cook.id_chief], references: [chiefs.id_chief] }),
	speciality: one(specialties, { fields: [cook.id_speciality], references: [specialties.id_speciality] }),
}));

export const affiliateRelations = relations(affiliate, ({ one }) => ({
	chief: one(chiefs, { fields: [affiliate.id_chief], references: [chiefs.id_chief] }),
	category: one(categories, { fields: [affiliate.id_category], references: [categories.id_category] }),
}));
