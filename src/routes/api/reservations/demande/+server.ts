import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { createNotification } from '$lib/server/services/notifications';
import { db } from '$lib/server/db';
import { conversations, messages } from '$lib/server/db/schema/messaging';
import { requests, customers } from '$lib/server/db/schema/customers';
import { users } from '$lib/server/db/schema/auth';
import { eq } from 'drizzle-orm';

export const POST = async ({ request, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const body = await request.json();
	const { chiefId, menuId, menuTitle, pricePerPerson, guests, eventDate, eventTime, localization, extras, notes } = body as {
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
	};

	if (!chiefId || !eventDate || !localization) throw error(400, 'Données manquantes');

	// S'assurer que le profil client existe
	await db.insert(customers).values({ id_customer: user.id, preferences_customer: '' }).onConflictDoNothing();

	// Créer la demande
	const [req] = await db.insert(requests).values({
		title_request: menuTitle,
		description_request: notes || `Demande via profil chef — ${menuTitle}`,
		expected_date_request: eventDate,
		guests_request: guests,
		localization_request: localization,
		id_chief: chiefId,
		id_customer: user.id,
		statut_request: 'open'
	}).returning();

	// Créer la conversation
	const [conv] = await db.insert(conversations)
		.values({ id_request: req.id_request, id_chief: chiefId, id_customer: user.id })
		.returning();

	// Stocker les données structurées en JSON
	const bookingData = {
		date: eventDate,
		time: eventTime || '',
		guests,
		location: localization,
		extras: extras.filter(e => e.qty > 0).map(e => ({ title: e.title, qty: e.qty })),
		notes: notes || '',
		menuTitle
	};

	await db.insert(messages).values({
		id_conversation: conv.id_conversation,
		id_sender: user.id,
		content_message: JSON.stringify(bookingData),
		type: 'booking_request',
		id_menu: menuId,
		price_per_person: pricePerPerson
	});

	// Notifier le chef
	const [customer] = await db.select({ firstname: users.firstname, name: users.name })
		.from(users).where(eq(users.id, user.id));
	const customerName = customer ? `${customer.firstname} ${customer.name}` : 'Un client';

	await createNotification(
		chiefId,
		'new_booking_request',
		'Nouvelle demande de prestation',
		`${customerName} souhaite réserver « ${menuTitle} »`,
		String(conv.id_conversation)
	);

	return json({ conversationId: conv.id_conversation });
};

