import { eq, and, or, desc, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { conversations, messages } from '$lib/server/db/schema/messaging';
import { requests } from '$lib/server/db/schema/customers';
import { menus } from '$lib/server/db/schema/chiefs';
import { users } from '$lib/server/db/schema/auth';
import { publish, userChannel } from '$lib/server/db/pubsub';

export interface ConversationListItem {
	id_conversation: number;
	id_chief: string;
	id_customer: string;
	statut: string;
	last_message_at: Date;
	other_firstname: string;
	other_name: string;
	other_image: string | null;
	request_title: string | null;
	request_guests: number | null;
	request_type: string | null;
	last_message: string | null;
	unread_count: number;
}

export interface MessageItem {
	id_message: number;
	id_conversation: number;
	id_sender: string;
	content_message: string;
	type: string;
	id_menu: number | null;
	price_per_person: number | null;
	created_at: Date;
	read_message: boolean;
	menu_title: string | null;
	menu_description: string | null;
	menu_price: string | null;
}

export interface ConversationDetail {
	id_conversation: number;
	id_chief: string;
	id_customer: string;
	statut: string;
	id_request: number | null;
	request_title: string | null;
	request_guests: number | null;
	request_type: string | null;
	request_date: string | null;
	request_localization: string | null;
	other_firstname: string;
	other_name: string;
	other_image: string | null;
	messages: MessageItem[];
}

// Retourne toutes les conversations de l'utilisateur avec le dernier message et le nombre de non-lus
export async function getConversationsForUser(
	userId: string,
	role: string
): Promise<ConversationListItem[]> {
	const isChief = role === 'chief';
	const filter = isChief
		? eq(conversations.id_chief, userId)
		: eq(conversations.id_customer, userId);

	const otherUsers = db.$with('other_users').as(db.select().from(users));
	void otherUsers;

	const rows = await db
		.select({
			id_conversation: conversations.id_conversation,
			id_chief: conversations.id_chief,
			id_customer: conversations.id_customer,
			statut: conversations.statut,
			last_message_at: conversations.last_message_at,
			request_title: requests.title_request,
			request_guests: requests.guests_request,
			request_type: requests.type_event_request
		})
		.from(conversations)
		.leftJoin(requests, eq(conversations.id_request, requests.id_request))
		.where(filter)
		.orderBy(desc(conversations.last_message_at));

	const result: ConversationListItem[] = [];
	for (const row of rows) {
		const otherId = isChief ? row.id_customer : row.id_chief;

		const [other] = await db
			.select({ firstname: users.firstname, name: users.name, image: users.image })
			.from(users)
			.where(eq(users.id, otherId));

		const [lastMsg] = await db
			.select({ content_message: messages.content_message })
			.from(messages)
			.where(eq(messages.id_conversation, row.id_conversation))
			.orderBy(desc(messages.created_at))
			.limit(1);

		const unreadRows = await db
			.select({ id: messages.id_message })
			.from(messages)
			.where(
				and(
					eq(messages.id_conversation, row.id_conversation),
					eq(messages.read_message, false),
					ne(messages.id_sender, userId)
				)
			);

		result.push({
			...row,
			other_firstname: other?.firstname ?? '',
			other_name: other?.name ?? '',
			other_image: other?.image ?? null,
			last_message: lastMsg?.content_message ?? null,
			unread_count: unreadRows.length
		});
	}
	return result;
}

// Retourne le détail d'une conversation (messages + infos demande) et marque les messages reçus comme lus
export async function getConversationDetail(
	convId: number,
	userId: string
): Promise<ConversationDetail | null> {
	const [conv] = await db
		.select()
		.from(conversations)
		.where(
			and(
				eq(conversations.id_conversation, convId),
				or(eq(conversations.id_chief, userId), eq(conversations.id_customer, userId))
			)
		);
	if (!conv) return null;

	const otherId = conv.id_chief === userId ? conv.id_customer : conv.id_chief;
	const [other] = await db
		.select({ firstname: users.firstname, name: users.name, image: users.image })
		.from(users)
		.where(eq(users.id, otherId));

	let requestInfo = {
		title: null as string | null,
		guests: null as number | null,
		type: null as string | null,
		date: null as string | null,
		localization: null as string | null
	};
	if (conv.id_request) {
		const [req] = await db
			.select({
				title_request: requests.title_request,
				guests_request: requests.guests_request,
				type_event_request: requests.type_event_request,
				expected_date_request: requests.expected_date_request,
				localization_request: requests.localization_request
			})
			.from(requests)
			.where(eq(requests.id_request, conv.id_request));
		if (req) {
			requestInfo = {
				title: req.title_request,
				guests: req.guests_request,
				type: req.type_event_request,
				date: req.expected_date_request,
				localization: req.localization_request
			};
		}
	}

	const msgs = await db
		.select({
			id_message: messages.id_message,
			id_conversation: messages.id_conversation,
			id_sender: messages.id_sender,
			content_message: messages.content_message,
			type: messages.type,
			id_menu: messages.id_menu,
			price_per_person: messages.price_per_person,
			created_at: messages.created_at,
			read_message: messages.read_message,
			menu_title: menus.title_menu,
			menu_description: menus.description_menu,
			menu_price: menus.price_menu
		})
		.from(messages)
		.leftJoin(menus, eq(messages.id_menu, menus.id_menu))
		.where(eq(messages.id_conversation, convId))
		.orderBy(messages.created_at);

	// Mark messages from other as read
	await db
		.update(messages)
		.set({ read_message: true })
		.where(
			and(
				eq(messages.id_conversation, convId),
				eq(messages.read_message, false),
				ne(messages.id_sender, userId)
			)
		);

	return {
		id_conversation: conv.id_conversation,
		id_chief: conv.id_chief,
		id_customer: conv.id_customer,
		statut: conv.statut,
		id_request: conv.id_request,
		request_title: requestInfo.title,
		request_guests: requestInfo.guests,
		request_type: requestInfo.type,
		request_date: requestInfo.date,
		request_localization: requestInfo.localization,
		other_firstname: other?.firstname ?? '',
		other_name: other?.name ?? '',
		other_image: other?.image ?? null,
		messages: msgs
	};
}

// Crée une nouvelle conversation suite à la réponse d'un chef à une demande, avec le premier message
export async function createConversation(
	requestId: number,
	chiefId: string,
	customerId: string,
	initialMessage: string,
	pricePerPerson: number | null
): Promise<number> {
	const [conv] = await db
		.insert(conversations)
		.values({ id_request: requestId, id_chief: chiefId, id_customer: customerId })
		.returning();

	await db.insert(messages).values({
		id_conversation: conv.id_conversation,
		id_sender: chiefId,
		content_message: initialMessage,
		type: 'text',
		price_per_person: pricePerPerson
	});

	return conv.id_conversation;
}

// Ajoute un message dans une conversation et notifie les deux parties en temps réel via pg_notify
export async function addMessage(
	convId: number,
	senderId: string,
	content: string,
	type = 'text',
	menuId?: number,
	pricePerPerson?: number
): Promise<void> {
	await db.insert(messages).values({
		id_conversation: convId,
		id_sender: senderId,
		content_message: content,
		type,
		id_menu: menuId ?? null,
		price_per_person: pricePerPerson ?? null
	});
	const [conv] = await db
		.update(conversations)
		.set({
			last_message_at: new Date(),
			...(type === 'menu_proposal' ? { statut: 'devis_envoye' } : {})
		})
		.where(eq(conversations.id_conversation, convId))
		.returning();

	// Notify both parties via pg_notify
	if (conv) {
		const payload = JSON.stringify({ type: 'message', convId });
		await Promise.all([
			publish(userChannel(conv.id_chief), payload),
			publish(userChannel(conv.id_customer), payload)
		]);
	}
}

// Met à jour le statut d'une conversation (ex: devis_envoye → confirme / refuse)
export async function updateConversationStatut(convId: number, statut: string): Promise<void> {
	await db.update(conversations).set({ statut }).where(eq(conversations.id_conversation, convId));
}
