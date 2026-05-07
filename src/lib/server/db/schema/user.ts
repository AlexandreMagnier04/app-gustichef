import { pgTable, serial, varchar, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id_user: serial('id_user').primaryKey(),
	firstname_user: varchar('firstname_user', { length: 50 }).notNull(),
	url_profile_picture_user: varchar('url_profile_picture_user', { length: 255 }),
	role_user: varchar('role_user', { length: 50 }).notNull(),
	upload_profile_picture_user: date('upload_profile_picture_user'),
	name_user: varchar('name_user', { length: 50 }).notNull(),
	email_user: varchar('email_user', { length: 128 }).notNull().unique(),
	password_user: varchar('password_user', { length: 255 }).notNull(),
	localization_user: varchar('localization_user', { length: 128 }).notNull(),
	date_subscription_user: date('date_subscription_user').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
