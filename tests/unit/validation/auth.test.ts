import { describe, it, expect } from 'vitest';
import { signInDto, signUpDto, chefSignUpStep1Dto } from '$lib/dtos/auth.dto';

describe('signInDto', () => {
	it('valide email + password corrects', () => {
		expect(signInDto.safeParse({ email: 'test@test.com', password: 'password123' }).success).toBe(true);
	});
	it('rejette email invalide', () => {
		expect(signInDto.safeParse({ email: 'pas-un-email', password: 'password123' }).success).toBe(false);
	});
	it('rejette password vide', () => {
		expect(signInDto.safeParse({ email: 'test@test.com', password: '' }).success).toBe(false);
	});
});

describe('signUpDto', () => {
	const valid = {
		name: 'Dupont',
		firstname: 'Jean',
		email: 'jean@test.com',
		password: 'password123',
		role: 'customer' as const,
		localization: 'Paris',
	};
	it('valide les champs corrects', () => {
		expect(signUpDto.safeParse(valid).success).toBe(true);
	});
	it('rejette password < 8 caractères', () => {
		expect(signUpDto.safeParse({ ...valid, password: '1234567' }).success).toBe(false);
	});
	it('rejette role invalide', () => {
		expect(signUpDto.safeParse({ ...valid, role: 'admin' }).success).toBe(false);
	});
	it('rejette nom < 2 caractères', () => {
		expect(signUpDto.safeParse({ ...valid, name: 'A' }).success).toBe(false);
	});
	it('rejette email invalide', () => {
		expect(signUpDto.safeParse({ ...valid, email: 'invalide' }).success).toBe(false);
	});
});

describe('chefSignUpStep1Dto', () => {
	it('ne requiert pas localization ni role', () => {
		expect(
			chefSignUpStep1Dto.safeParse({
				name: 'Dupont',
				firstname: 'Jean',
				email: 'jean@test.com',
				password: 'password123',
			}).success,
		).toBe(true);
	});
	it('rejette password < 8 caractères', () => {
		expect(
			chefSignUpStep1Dto.safeParse({
				name: 'Dupont',
				firstname: 'Jean',
				email: 'jean@test.com',
				password: 'court',
			}).success,
		).toBe(false);
	});
});
