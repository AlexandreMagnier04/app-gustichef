import { signUp, signIn } from '$lib/auth-client';
import { z } from 'zod';
import { signUpDto, chefSignUpStep1Dto } from '$lib/dtos/auth.dto';
import { setupChiefProfileDto } from '$lib/dtos/chief.dto';
import type { SetupChiefProfileDto } from '$lib/dtos/chief.dto';
import type { User, UserRole } from '$lib/models/user.model';

export type FieldErrors = Record<string, string>;

// --- Customer register ---

export type RegisterData = Pick<User, 'firstname' | 'name' | 'email' | 'localization' | 'role'> & {
	password: string;
	confirmPassword: string;
};

export async function registerUser(
	data: RegisterData
): Promise<{ errors?: FieldErrors; serverError?: string }> {
	if (data.password !== data.confirmPassword) {
		return { errors: { confirmPassword: 'Les mots de passe ne correspondent pas' } };
	}

	const parsed = signUpDto.safeParse(data);
	if (!parsed.success) {
		const fe = z.flattenError(parsed.error).fieldErrors;
		return { errors: Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? ''])) };
	}

	const result = await signUp.email({
		name: parsed.data.name,
		email: parsed.data.email,
		password: parsed.data.password,
		// @ts-expect-error — Better Auth additional fields configured server-side
		firstname: parsed.data.firstname,
		role: parsed.data.role,
		localization: parsed.data.localization,
		callbackURL: '/dashboard'
	});

	if (result.error) {
		return { serverError: result.error.message ?? 'Erreur lors de la création du compte' };
	}

	return {};
}

// --- chief register ---

export type Step1Data = Pick<User, 'firstname' | 'name' | 'email'> & {
	password: string;
	confirmPassword: string;
};

export type ChefSubmitData = Pick<User, 'firstname' | 'name' | 'email'> &
	SetupChiefProfileDto & {
		password: string;
		cities: string[];
	};

export function validateChefStep1(data: Step1Data): FieldErrors {
	if (data.password !== data.confirmPassword) {
		return { confirmPassword: 'Les mots de passe ne correspondent pas' };
	}
	const parsed = chefSignUpStep1Dto.safeParse(data);
	if (!parsed.success) {
		const fe = z.flattenError(parsed.error).fieldErrors;
		return Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? '']));
	}
	return {};
}

export async function registerChef(data: ChefSubmitData): Promise<{ error?: string }> {
	const ROLE: UserRole = 'chief';
	const primaryCity = data.cities[0] ?? 'Non renseigné';

	const parsedSignUp = signUpDto.safeParse({
		name: data.name,
		firstname: data.firstname,
		email: data.email,
		password: data.password,
		role: ROLE,
		localization: primaryCity
	});

	if (!parsedSignUp.success) {
		const fe = z.flattenError(parsedSignUp.error).fieldErrors;
		return { error: Object.values(fe).flat()[0] ?? 'Données invalides' };
	}

	const result = await signUp.email({
		name: parsedSignUp.data.name,
		email: parsedSignUp.data.email,
		password: parsedSignUp.data.password,
		// @ts-expect-error — Better Auth additional fields configured server-side
		firstname: parsedSignUp.data.firstname,
		role: parsedSignUp.data.role,
		localization: parsedSignUp.data.localization
	});

	if (result.error) {
		return { error: result.error.message ?? 'Erreur lors de la création du compte' };
	}

	const profileParsed = setupChiefProfileDto.safeParse({
		bio: data.bio,
		specialties: data.specialties,
		siret: data.siret
	});

	if (profileParsed.success) {
		await fetch('/api/chief/profile', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(profileParsed.data)
		});
	}

	return {};
}

// --- Commun ---

export async function loginWithGoogle() {
	await signIn.social({ provider: 'google', callbackURL: '/dashboard' });
}
