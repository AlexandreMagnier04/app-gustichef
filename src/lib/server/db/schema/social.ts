import { pgTable, serial, text, varchar, integer, primaryKey, decimal, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { requests } from './customers';

export const publications = pgTable('publications', {
	id_publication: serial('id_publication').primaryKey(),
	title_publication: varchar('title_publication', { length: 100 }).notNull(),
	content_publication: text('content_publication').notNull(),
	price_publication: decimal('price_publication', { precision: 5, scale: 2 }),
	guests_min: integer('guests_min'),
	guests_max: integer('guests_max'),
	likes_publication: integer('likes_publication').notNull().default(0),
	date_publication: timestamp('date_publication').defaultNow().notNull(),
	id_users: text('id_users').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

// Photos d'une publication (carrousel) — voir MPD
// FK nommée explicitement (court) : le nom auto-généré dépasse 63 car. et
// Postgres le tronque, ce qui crée une boucle de diff dans `drizzle-kit push`.
export const images_publication = pgTable(
	'images_publication',
	{
		id_image: serial('id_image').primaryKey(),
		id_publication: integer('id_publication').notNull(),
		url: varchar('url', { length: 255 }).notNull(),
		position: integer('position').notNull().default(0),
		date_upload: timestamp('date_upload').defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: 'fk_images_pub_publication',
			columns: [table.id_publication],
			foreignColumns: [publications.id_publication],
		}).onDelete('cascade'),
	],
);

export const tags = pgTable('tags', {
	id_tag: serial('id_tag').primaryKey(),
	name_tag: varchar('name_tag', { length: 50 }).notNull().unique(),
});

// M:N publications ↔ tags
export const publications_tags = pgTable(
	'publications_tags',
	{
		id_publication: integer('id_publication').notNull().references(() => publications.id_publication, { onDelete: 'cascade' }),
		id_tag: integer('id_tag').notNull().references(() => tags.id_tag, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.id_publication, table.id_tag] })],
);

// M:N tags ↔ requests
export const tags_requests = pgTable(
	'tags_requests',
	{
		id_tag: integer('id_tag').notNull().references(() => tags.id_tag, { onDelete: 'cascade' }),
		id_request: integer('id_request').notNull().references(() => requests.id_request, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.id_tag, table.id_request] })],
);
