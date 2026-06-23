import { eq, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '$lib/server/db';
import { reservations } from '$lib/server/db/schema/reservations';
import { conversations, messages } from '$lib/server/db/schema/messaging';
import { requests, customers } from '$lib/server/db/schema/customers';
import { menus } from '$lib/server/db/schema/chiefs';
import { users } from '$lib/server/db/schema/auth';
import type { ReservationDetail } from '$lib/models/reservation.model';

const chiefUser = alias(users, 'chief_user');
const customerUser = alias(users, 'customer_user');

export async function createReservation(data: {
	id_conversation: number;
	id_chief: string;
	id_customer: string;
	id_menu?: number;
	title: string;
	price_per_person: number;
	guests: number;
	event_date: string;
	event_time?: string;
	localization: string;
	notes?: string;
	extras_json?: { id_menu: number; title: string; qty: number; price_per_person: number }[];
	stripe_payment_intent_id?: string;
}): Promise<number> {
	const [res] = await db.insert(reservations).values(data).returning();
	return res.id_reservation;
}

const reservationSelect = {
	id_reservation: reservations.id_reservation,
	id_conversation: reservations.id_conversation,
	id_chief: reservations.id_chief,
	id_customer: reservations.id_customer,
	id_menu: reservations.id_menu,
	title: reservations.title,
	price_per_person: reservations.price_per_person,
	guests: reservations.guests,
	event_date: reservations.event_date,
	event_time: reservations.event_time,
	localization: reservations.localization,
	notes: reservations.notes,
	extras_json: reservations.extras_json,
	statut: reservations.statut,
	created_at: reservations.created_at,
	chief_firstname: chiefUser.firstname,
	chief_name: chiefUser.name,
	chief_image: chiefUser.image,
	chief_localization: chiefUser.localization,
	customer_firstname: customerUser.firstname,
	customer_name: customerUser.name,
	customer_image: customerUser.image,
	menu_title: menus.title_menu,
	menu_description: menus.description_menu,
	menu_price: menus.price_menu,
	menu_ingredients: menus.ingredients
};

function mapReservation(row: {
	chief_firstname: string | null;
	chief_name: string | null;
	chief_image: string | null;
	chief_localization: string | null;
	customer_firstname: string | null;
	customer_name: string | null;
	customer_image: string | null;
	[key: string]: unknown;
}): ReservationDetail {
	const {
		chief_firstname,
		chief_name,
		chief_image,
		chief_localization,
		customer_firstname,
		customer_name,
		customer_image,
		...rest
	} = row;
	return {
		...(rest as Omit<ReservationDetail, 'chief' | 'customer'>),
		chief:
			chief_firstname != null
				? {
						firstname: chief_firstname,
						name: chief_name!,
						image: chief_image,
						localization: chief_localization ?? ''
					}
				: null,
		customer:
			customer_firstname != null
				? { firstname: customer_firstname, name: customer_name!, image: customer_image }
				: null
	};
}

export async function getReservationById(
	id: number,
	userId: string
): Promise<ReservationDetail | null> {
	const rows = await db
		.select(reservationSelect)
		.from(reservations)
		.leftJoin(chiefUser, eq(reservations.id_chief, chiefUser.id))
		.leftJoin(customerUser, eq(reservations.id_customer, customerUser.id))
		.leftJoin(menus, eq(reservations.id_menu, menus.id_menu))
		.where(eq(reservations.id_reservation, id));

	const row = rows[0];
	if (!row) return null;
	if (row.id_chief !== userId && row.id_customer !== userId) return null;
	return mapReservation(row);
}

export async function cancelReservation(id: number, userId: string): Promise<void> {
	await db
		.update(reservations)
		.set({ statut: 'annule' })
		.where(eq(reservations.id_reservation, id));
	void userId;
}

export async function getReservationsForUser(userId: string): Promise<ReservationDetail[]> {
	try {
		const rows = await db
			.select(reservationSelect)
			.from(reservations)
			.leftJoin(chiefUser, eq(reservations.id_chief, chiefUser.id))
			.leftJoin(customerUser, eq(reservations.id_customer, customerUser.id))
			.leftJoin(menus, eq(reservations.id_menu, menus.id_menu))
			.where(or(eq(reservations.id_chief, userId), eq(reservations.id_customer, userId)));
		return rows.map(mapReservation);
	} catch (e) {
		console.error('[getReservationsForUser] REAL ERROR:', e);
		throw e;
	}
}

export async function createDirectBooking(data: {
	customerId: string;
	chiefId: string;
	menuId: number;
	menuTitle: string;
	pricePerPerson: number;
	guests: number;
	eventDate: string;
	eventTime: string;
	localization: string;
	extras: { id_menu: number; title: string; qty: number; price_per_person: number }[];
	notes: string;
}): Promise<number> {
	await db
		.insert(customers)
		.values({ id_customer: data.customerId, preferences_customer: '' })
		.onConflictDoNothing();

	const [req] = await db
		.insert(requests)
		.values({
			title_request: data.menuTitle,
			description_request: data.notes || `Demande via profil chef — ${data.menuTitle}`,
			expected_date_request: data.eventDate,
			expected_time_request: data.eventTime || null,
			guests_request: data.guests,
			localization_request: data.localization,
			id_chief: data.chiefId,
			id_customer: data.customerId,
			statut_request: 'open'
		})
		.returning();

	const [conv] = await db
		.insert(conversations)
		.values({ id_request: req.id_request, id_chief: data.chiefId, id_customer: data.customerId })
		.returning();

	const bookingData = {
		date: data.eventDate,
		time: data.eventTime || '',
		guests: data.guests,
		location: data.localization,
		extras: data.extras.filter((e) => e.qty > 0).map((e) => ({ title: e.title, qty: e.qty })),
		notes: data.notes || '',
		menuTitle: data.menuTitle
	};

	await db.insert(messages).values({
		id_conversation: conv.id_conversation,
		id_sender: data.customerId,
		content_message: JSON.stringify(bookingData),
		type: 'booking_request',
		id_menu: data.menuId,
		price_per_person: data.pricePerPerson
	});

	return conv.id_conversation;
}
