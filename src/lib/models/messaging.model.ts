// Conversation affichée dans la liste des messages
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

// Un message dans une conversation
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

// Conversation complète avec ses messages
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
	request_time: string | null;
	request_localization: string | null;
	other_firstname: string;
	other_name: string;
	other_image: string | null;
	messages: MessageItem[];
}
