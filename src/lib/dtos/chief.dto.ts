import { z } from 'zod';

// DTOs pour mettre à jour le profil du chef
export const updateChiefDto = z.object({
	bio_chief: z.string().max(1000, { message: 'Maximum 1000 caractères' }).optional()
});

// DTO pour créer un menu
export const createMenuDto = z.object({
	title_menu: z.string().min(2, { message: 'Au moins 2 caractères' }).max(100, { message: 'Maximum 100 caractères' }),
	description_menu: z.string().min(10, { message: 'Au moins 10 caractères' }),
	price_menu: z.coerce.number().positive({ message: 'Prix invalide' }).multipleOf(0.01)
});

// DTO pour la création du profil chef après signUp (appelé par /api/chef/profile)
export const setupChiefProfileDto = z.object({
	bio: z.string().max(200, { message: 'Maximum 200 caractères' }).optional(),
	specialties: z.array(z.string().min(1)).max(3, { message: '3 spécialités maximum' }),
	siret: z.string().optional()
});

export type CreateMenuDto = z.infer<typeof createMenuDto>;
export type UpdateChiefDto = z.infer<typeof updateChiefDto>;
export type SetupChiefProfileDto = z.infer<typeof setupChiefProfileDto>;

