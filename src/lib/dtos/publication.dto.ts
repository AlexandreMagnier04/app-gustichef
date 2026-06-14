import { z } from 'zod';

export const createPublicationDto = z
	.object({
		title: z
			.string({ error: 'Nom du plat requis' })
			.min(2, { error: 'Au moins 2 caractères' })
			.max(100, { error: 'Maximum 100 caractères' }),
		description: z
			.string({ error: 'Description requise' })
			.min(10, { error: 'Au moins 10 caractères' })
			.max(2000, { error: 'Maximum 2000 caractères' }),
		price: z.coerce.number().positive({ error: 'Prix invalide' }).multipleOf(0.01).optional(),
		guestsMin: z.coerce.number().int().min(1, { error: 'Au moins 1 convive' }).optional(),
		guestsMax: z.coerce.number().int().min(1).optional(),
		tags: z.array(z.string().min(1)).max(10, { error: '10 tags maximum' }).default([])
	})
	.refine(
		(data) => {
			if (data.guestsMin && data.guestsMax) return data.guestsMin <= data.guestsMax;
			return true;
		},
		{ error: 'Le min doit être inférieur ou égal au max', path: ['guestsMax'] }
	);

export type CreatePublicationDto = z.infer<typeof createPublicationDto>;
