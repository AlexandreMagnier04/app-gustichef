import { z } from 'zod';

// DTO pour le rôle d'un utilisateur
export const roleDto = z.object({
	role: z.enum(['chef', 'customer'], { error: 'Rôle invalide : Choisissez chef ou customer' })
});

export type RoleDto = z.infer<typeof roleDto>;
