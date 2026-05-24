import { relations } from 'drizzle-orm';
import { pgTable, text, decimal } from 'drizzle-orm/pg-core';
import { users } from './auth';

// chiefs : id_chief = PK + FK vers users.id (héritage 1-1)
export const chiefs = pgTable('chiefs', {
	id_chief: text('id_chief').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
	bio_chief: text('bio_chief'),
	note_chief: decimal('note_chief', { precision: 2, scale: 1 }),
});

// customers : id_customer = PK + FK vers users.id (héritage 1-1)
export const customers = pgTable('customers', {
	id_customer: text('id_customer').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
	preferences_customer: text('preferences_customer').notNull(),
});

export const chiefRelations = relations(chiefs, ({ one }) => ({
	user: one(users, { fields: [chiefs.id_chief], references: [users.id] }),
}));

export const customerRelations = relations(customers, ({ one }) => ({
	user: one(users, { fields: [customers.id_customer], references: [users.id] }),
}));
