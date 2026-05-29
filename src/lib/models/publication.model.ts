export interface Publication {
	id_publication: number;
	title_publication: string;
	content_publication: string;
	price_publication: string | null; // decimal → string (Drizzle/Postgres)
	guests_min: number | null;
	guests_max: number | null;
	likes_publication: number;
	date_publication: Date;
	id_users: string;
}

export interface ImagePublication {
	id_image: number;
	id_publication: number;
	url: string;
	position: number;
	date_upload: Date;
}

export interface Tag {
	id_tag: number;
	name_tag: string;
}

// Publication enrichie pour l'affichage dans le feed.
// chiefCategory = catégorie unique du chef (1er tag affiché, accent rust).
// chiefSpecialties = spécialités du chef (tags suivants, vert clair).
// tags = tags spécifiques à la publication (cuisines sélectionnées au moment de la création).
export interface PublicationCard extends Publication {
	images: ImagePublication[];
	tags: Tag[];
	chiefCategory: string | null;
	chiefSpecialties: string[];
	author: {
		id: string;
		firstname: string;
		name: string;
		image: string | null;
		localization: string;
	};
}
