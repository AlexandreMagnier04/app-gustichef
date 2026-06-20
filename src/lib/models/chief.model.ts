export interface Chief {
	id_chief: string;
	bio_chief: string | null;
	note_chief: string | null; // decimal → string (comportement Drizzle/Postgres)
}

export interface Specialty {
	id_speciality: number;
	name_speciality: string;
	description_speciality: string | null;
}

export interface Notice {
	id_notice: number;
	rating_notice: string;
	comment_notice: string | null;
	date_notice: string;
	id_customer: string;
	id_chief: string;
}

export interface ChiefProfile extends Chief {
	user: {
		firstname: string;
		name: string;
		image: string | null;
		email: string;
		localization: string;
	};
	specialties: Specialty[];
}

export interface Menu {
	id_menu: number;
	title_menu: string;
	description_menu: string;
	price_menu: string;
	type_menu: string;
	guests_min: number | null;
	guests_max: number | null;
	ingredients: string[] | null;
	id_chief: string;
}
export type CreateMenu = Omit<Menu, 'id_menu'>;

export type ChiefUpdate = Partial<Pick<Chief, 'bio_chief'>>;

export interface ChiefCard {
	id_chief: string;
	firstname: string;
	name: string;
	image: string | null;
	localization: string;
	min_price: string | null;
	avg_rating: string | null;
	review_count: number;
}
