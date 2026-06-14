import { z } from 'zod';

// DTOs pour l'authentification
export const signInDto = z.object({
	email: z.email({ error: 'Email invalide' }),
	password: z.string().min(1, { message: 'Mot de passe requis' })
});

// DTOs pour l'inscription
export const signUpDto = z.object({
	name: z
		.string()
		.min(2, { message: 'Au moins 2 caractères' })
		.max(50, { message: 'Maximum 50 caractères' }),
	firstname: z
		.string()
		.min(2, { message: 'Au moins 2 caractères' })
		.max(50, { message: 'Maximum 50 caractères' }),
	email: z.email({ error: 'Email invalide' }),
	password: z.string().min(8, { message: 'Au moins 8 caractères' }),
	role: z.enum(['chief', 'customer']),
	localization: z
		.string()
		.min(2, { message: 'Localisation requise' })
		.max(128, { message: 'Maximum 128 caractères' })
});

// DTO pour la réinitialisation du mot de passe
export const forgotPasswordDto = z.object({
	email: z.email({ error: 'Email invalide' })
});

// Validation étape 1 du register chief (localization vient de l'étape 4)
export const chefSignUpStep1Dto = signUpDto.pick({
	name: true,
	firstname: true,
	email: true,
	password: true
});

export type SignInDto = z.infer<typeof signInDto>;
export type SignUpDto = z.infer<typeof signUpDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ChefSignUpStep1Dto = z.infer<typeof chefSignUpStep1Dto>;
