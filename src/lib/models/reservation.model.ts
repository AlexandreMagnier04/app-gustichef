// Réservation enrichie pour l'affichage : données chef, client et menu jointes.
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
	event_time: string | null;
	localization: string;
	statut: string;
	created_at: Date;
	chief: { firstname: string; name: string; image: string | null } | null;
	customer: { firstname: string; name: string; image: string | null } | null;
	menu_title: string | null;
	menu_description: string | null;
	menu_price: string | null;
}
