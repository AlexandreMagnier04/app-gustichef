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

export interface Category {
    id_category: number;
    name_category: string;
}

export interface Notice {
    id_notice: number;
    rating_notice: string;
    comment_notice: string | null;
    date_notice: string;
    id_customer: string;
    id_chief: string;
}

// chief enrichi : données user jointes pour l'affichage
export interface ChiefProfile extends Chief {
    user: {
        name: string;
        firstname: string;
        email: string;
        image: string | null;
        localization: string;
    };
    specialties: Specialty[];
    categories: Category[];
}

export interface Menu {
    id_menu: number;
    title_menu: string;
    description_menu: string;
    price_menu: string;
    id_chief: string;
}
export type CreateMenu = Omit<Menu, 'id_menu'>;


export type ChiefUpdate = Partial<Pick<Chief, 'bio_chief'>>;

export interface ChiefCard {
	id_chief: string;
	firstname: string;
	name: string;
	localization: string;
	image: string | null;
	min_price: string | null;
	avg_rating: string | null;
	review_count: number;
}