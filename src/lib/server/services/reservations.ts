import { eq, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { reservations } from '$lib/server/db/schema/reservations';
import { menus, chiefs } from '$lib/server/db/schema/chiefs';
import { users } from '$lib/server/db/schema/auth';

export interface ReservationDetail {
	id_reservation: number;
	id_conversation: number;
	id_chief: string;
	id_customer: string;
	id_menu: number | null;
	title: string;
	price_per_person: number;
	guests: number;
	event_date: string;
	localization: string;
	statut: string;
	created_at: Date;
	chief_firstname: string | null;
	chief_name: string | null;
	chief_image: string | null;
	menu_title: string | null;
	menu_description: string | null;
	menu_price: string | null;
}

export async function createReservation(data: {
	id_conversation: number;
	id_chief: string;
	id_customer: string;
	id_menu?: number;
	title: string;
	price_per_person: number;
	guests: number;
	event_date: string;
	localization: string;
}): Promise<number> {
	const [res] = await db.insert(reservations).values(data).returning();
	return res.id_reservation;
}

export async function getReservationById(
	id: number,
	userId: string
): Promise<ReservationDetail | null> {
	const rows = await db
		.select({
			id_reservation: reservations.id_reservation,
			id_conversation: reservations.id_conversation,
			id_chief: reservations.id_chief,
			id_customer: reservations.id_customer,
			id_menu: reservations.id_menu,
			title: reservations.title,
			price_per_person: reservations.price_per_person,
			guests: reservations.guests,
			event_date: reservations.event_date,
			localization: reservations.localization,
			statut: reservations.statut,
			created_at: reservations.created_at,
			chief_firstname: users.firstname,
			chief_name: users.name,
			chief_image: users.image,
			menu_title: menus.title_menu,
			menu_description: menus.description_menu,
			menu_price: menus.price_menu
		})
		.from(reservations)
		.leftJoin(users, eq(reservations.id_chief, users.id))
		.leftJoin(menus, eq(reservations.id_menu, menus.id_menu))
		.where(eq(reservations.id_reservation, id));

	const row = rows[0];
	if (!row) return null;
	if (row.id_chief !== userId && row.id_customer !== userId) return null;
	return row;
}

export async function cancelReservation(id: number, userId: string): Promise<void> {
	await db
		.update(reservations)
		.set({ statut: 'annule' })
		.where(eq(reservations.id_reservation, id));
	void userId;
}

export async function getReservationsForUser(userId: string): Promise<ReservationDetail[]> {
	const rows = await db
		.select({
			id_reservation: reservations.id_reservation,
			id_conversation: reservations.id_conversation,
			id_chief: reservations.id_chief,
			id_customer: reservations.id_customer,
			id_menu: reservations.id_menu,
			title: reservations.title,
			price_per_person: reservations.price_per_person,
			guests: reservations.guests,
			event_date: reservations.event_date,
			localization: reservations.localization,
			statut: reservations.statut,
			created_at: reservations.created_at,
			chief_firstname: users.firstname,
			chief_name: users.name,
			chief_image: users.image,
			menu_title: menus.title_menu,
			menu_description: menus.description_menu,
			menu_price: menus.price_menu
		})
		.from(reservations)
		.leftJoin(users, eq(reservations.id_chief, users.id))
		.leftJoin(menus, eq(reservations.id_menu, menus.id_menu))
		.where(or(eq(reservations.id_chief, userId), eq(reservations.id_customer, userId)));
	return rows;
}
