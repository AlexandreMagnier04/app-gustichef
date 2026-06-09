import { z } from 'zod';

// DTOs pour mettre à jour le profil du chief
export const updateChiefDto = z.object({
	bio_chief: z.string().max(1000, { message: 'Maximum 1000 caractères' }).optional()
});

// DTO pour créer un menu
export const createMenuDto = z.object({
	title_menu: z.string().min(2, { message: 'Au moins 2 caractères' }).max(100, { message: 'Maximum 100 caractères' }),
	description_menu: z.string().min(2, { message: 'Au moins 2 caractères' }),
	price_menu: z.coerce.number().positive({ message: 'Prix invalide' }).multipleOf(0.01),
	type_menu: z.enum(['plat', 'extra']).default('plat'),
	guests_min: z.coerce.number().int().positive().optional(),
	guests_max: z.coerce.number().int().positive().optional(),
	ingredients: z.array(z.string().min(1)).optional(),
});

export const updateMenuDto = createMenuDto.partial().extend({
	title_menu: z.string().min(2).max(100).optional(),
});

// DTO pour la création du profil chef après signUp (appelé par /api/chief/profile)
export const setupChiefProfileDto = z.object({
	bio: z.string().max(200, { message: 'Maximum 200 caractères' }).optional(),
	specialties: z.array(z.string().min(1)).max(3, { message: '3 spécialités maximum' }),
	siret: z.string().optional()
});

export type CreateMenuDto = z.infer<typeof createMenuDto>;
export type UpdateMenuDto = z.infer<typeof updateMenuDto>;
export type UpdateChiefDto = z.infer<typeof updateChiefDto>;
export type SetupChiefProfileDto = z.infer<typeof setupChiefProfileDto>;
