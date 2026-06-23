import { z } from 'zod';

// DTO pour créer un avis  sur un chef
export const createNoticeDto = z.object({
	rating_notice: z.coerce.number().min(0).max(5).multipleOf(0.5),
	comment_notice: z.string().max(500, { message: 'Maximum 500 caractères' }).optional(),
	id_chief: z.string().min(1)
});

// DTO pour créer une demande de prestation
export const createRequestDto = z.object({
	title_request: z.string().min(3, { message: 'Titre requis (min 3 caractères)' }).max(100),
	description_request: z
		.string()
		.min(20, { message: 'Description requise (min 20 caractères)' })
		.max(2000),
	expected_date_request: z.iso.date({ error: 'Date invalide' }),
	guests_request: z.coerce
		.number()
		.int()
		.positive({ message: 'Nombre de convives invalide' })
		.max(500, { message: 'Maximum 500 convives' }),
	type_event_request: z.string().max(50).optional(),
	localization_request: z.string().min(2, { message: 'Localisation requise' }).max(100),
	id_chief: z.string().optional()
});

export type CreateRequestDto = z.infer<typeof createRequestDto>;

export type CreateNoticeDto = z.infer<typeof createNoticeDto>;
