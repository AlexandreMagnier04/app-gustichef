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
// chiefSpecialties = spécialités du chef (tags affichés sur la card).
export interface PublicationCard extends Publication {
	images: ImagePublication[];
	tags: Tag[];
	chiefSpecialties: string[];
	author: {
		id: string;
		firstname: string;
		name: string;
		image: string | null;
		localization: string;
	};
}
