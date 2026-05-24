import { pgTable, serial, text, varchar, integer, date, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { requests } from './prestation';

export const images_publication = pgTable('images_publication', {
	id_image_publication: serial('id_image_publication').primaryKey(),
	url_image_publication: varchar('url_image_publication', { length: 255 }),
	upload_image_publication: date('upload_image_publication'),
});

export const publications = pgTable('publications', {
	id_publication: serial('id_publication').primaryKey(),
	content_publication: text('content_publication').notNull(),
	date_publication: date('date_publication').notNull(),
	likes_publication: integer('likes_publication').default(0),
	id_image_publication: integer('id_image_publication').references(
		() => images_publication.id_image_publication,
		{ onDelete: 'set null' }
	),
	id_users: text('id_users').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const tags = pgTable('tags', {
	id_tag: serial('id_tag').primaryKey(),
	name_tag: varchar('name_tag', { length: 50 }).notNull(),
});

export const contain = pgTable(
	'contain',
	{
		id_publication: integer('id_publication').notNull().references(() => publications.id_publication, { onDelete: 'cascade' }),
		id_tag: integer('id_tag').notNull().references(() => tags.id_tag, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.id_publication, table.id_tag] })],
);

export const associate = pgTable(
	'associate',
	{
		id_tag: integer('id_tag').notNull().references(() => tags.id_tag, { onDelete: 'cascade' }),
		id_request: integer('id_request').notNull().references(() => requests.id_request, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.id_tag, table.id_request] })],
);
