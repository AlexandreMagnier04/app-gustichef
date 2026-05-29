// Modèle unique partagé par toutes les tables images_* (chef, menu, publication).
// Le champ FK varie selon la cible : id_chief | id_menu | id_publication.

export interface BaseImage {
	id_image: number;
	url: string;
	position: number;
	date_upload: Date;
}

export interface ImageChef extends BaseImage {
	id_chief: string;
}

export interface ImageMenu extends BaseImage {
	id_menu: number;
}

export type ImageTarget = 'chief' | 'menu';
