import { relations } from 'drizzle-orm';
import {
	pgTable,
	text,
	decimal,
	serial,
	varchar,
	integer,
	primaryKey,
	date,
	timestamp
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { customers } from './customers';

// Profil chef
export const chiefs = pgTable('chiefs', {
	id_chief: text('id_chief')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	bio_chief: text('bio_chief'),
	note_chief: decimal('note_chief', { precision: 2, scale: 1 })
});

export const specialties = pgTable('specialties', {
	id_speciality: serial('id_speciality').primaryKey(),
	name_speciality: varchar('name_speciality', { length: 50 }).notNull(),
	description_speciality: text('description_speciality')
});

// M:N chiefs ↔ specialties
export const chiefs_specialties = pgTable(
	'chiefs_specialties',
	{
		id_chief: text('id_chief')
			.notNull()
			.references(() => chiefs.id_chief, { onDelete: 'cascade' }),
		id_speciality: integer('id_speciality')
			.notNull()
			.references(() => specialties.id_speciality, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.id_chief, table.id_speciality] })]
);

// Galerie du profil chef
export const images_chef = pgTable('images_chef', {
	id_image: serial('id_image').primaryKey(),
	id_chief: text('id_chief')
		.notNull()
		.references(() => chiefs.id_chief, { onDelete: 'cascade' }),
	url: varchar('url', { length: 255 }).notNull(),
	position: integer('position').notNull().default(0),
	date_upload: timestamp('date_upload').defaultNow().notNull()
});

export const menus = pgTable('menus', {
	id_menu: serial('id_menu').primaryKey(),
	title_menu: varchar('title_menu', { length: 100 }).notNull(),
	description_menu: text('description_menu').notNull(),
	price_menu: decimal('price_menu', { precision: 5, scale: 2 }).notNull(),
	type_menu: varchar('type_menu', { length: 10 }).notNull().default('plat'),
	guests_min: integer('guests_min'),
	guests_max: integer('guests_max'),
	ingredients: text('ingredients').array(),
	id_chief: text('id_chief')
		.notNull()
		.references(() => chiefs.id_chief, { onDelete: 'cascade' })
});

// Photos d'un menu
export const images_menu = pgTable('images_menu', {
	id_image: serial('id_image').primaryKey(),
	id_menu: integer('id_menu')
		.notNull()
		.references(() => menus.id_menu, { onDelete: 'cascade' }),
	url: varchar('url', { length: 255 }).notNull(),
	position: integer('position').notNull().default(0),
	date_upload: timestamp('date_upload').defaultNow().notNull()
});

// Avis laissé par un client sur un chef
export const notices = pgTable('notices', {
	id_notice: serial('id_notice').primaryKey(),
	rating_notice: decimal('rating_notice', { precision: 2, scale: 1 }).notNull(),
	comment_notice: text('comment_notice'),
	date_notice: date('date_notice').notNull(),
	id_customer: text('id_customer')
		.notNull()
		.references(() => customers.id_customer, { onDelete: 'cascade' }),
	id_chief: text('id_chief')
		.notNull()
		.references(() => chiefs.id_chief, { onDelete: 'cascade' })
});

export const chiefRelations = relations(chiefs, ({ one }) => ({
	user: one(users, { fields: [chiefs.id_chief], references: [users.id] })
}));

export const chiefsSpecialtiesRelations = relations(chiefs_specialties, ({ one }) => ({
	chief: one(chiefs, { fields: [chiefs_specialties.id_chief], references: [chiefs.id_chief] }),
	speciality: one(specialties, {
		fields: [chiefs_specialties.id_speciality],
		references: [specialties.id_speciality]
	})
}));
