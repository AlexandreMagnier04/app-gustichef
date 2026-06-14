import { describe, it, expect } from 'vitest';
import { createRequestDto, createNoticeDto } from '$lib/dtos/customer.dto';

describe('createRequestDto', () => {
	const valid = {
		title_request: 'Dîner mariage',
		description_request: 'Un dîner pour 50 personnes pour un mariage en plein air',
		expected_date_request: '2026-09-15',
		guests_request: 50,
		localization_request: 'Paris 75001'
	};

	it('valide une demande minimale', () => {
		expect(createRequestDto.safeParse(valid).success).toBe(true);
	});
	it('rejette titre < 3 caractères', () => {
		expect(createRequestDto.safeParse({ ...valid, title_request: 'AB' }).success).toBe(false);
	});
	it('rejette description < 20 caractères', () => {
		expect(
			createRequestDto.safeParse({ ...valid, description_request: 'Trop court' }).success
		).toBe(false);
	});
	it('rejette date invalide', () => {
		expect(
			createRequestDto.safeParse({ ...valid, expected_date_request: 'pas-une-date' }).success
		).toBe(false);
	});
	it('rejette guests_request négatif', () => {
		expect(createRequestDto.safeParse({ ...valid, guests_request: -1 }).success).toBe(false);
	});
	it('rejette guests_request zéro', () => {
		expect(createRequestDto.safeParse({ ...valid, guests_request: 0 }).success).toBe(false);
	});
	it('rejette guests_request > 500', () => {
		expect(createRequestDto.safeParse({ ...valid, guests_request: 501 }).success).toBe(false);
	});
	it('accepte id_chief optionnel', () => {
		expect(createRequestDto.safeParse({ ...valid, id_chief: 'chef-abc' }).success).toBe(true);
	});
	it('coerce guests_request string vers number', () => {
		const result = createRequestDto.safeParse({ ...valid, guests_request: '30' });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.guests_request).toBe(30);
	});
});

describe('createNoticeDto', () => {
	it('valide un avis correct', () => {
		expect(
			createNoticeDto.safeParse({ rating_notice: 4.5, id_chief: 'chief-id-123' }).success
		).toBe(true);
	});
	it('valide note 0', () => {
		expect(createNoticeDto.safeParse({ rating_notice: 0, id_chief: 'id' }).success).toBe(true);
	});
	it('valide note 5', () => {
		expect(createNoticeDto.safeParse({ rating_notice: 5, id_chief: 'id' }).success).toBe(true);
	});
	it('rejette note > 5', () => {
		expect(createNoticeDto.safeParse({ rating_notice: 5.5, id_chief: 'id' }).success).toBe(false);
	});
	it('rejette note < 0', () => {
		expect(createNoticeDto.safeParse({ rating_notice: -0.5, id_chief: 'id' }).success).toBe(false);
	});
	it('rejette id_chief vide', () => {
		expect(createNoticeDto.safeParse({ rating_notice: 4, id_chief: '' }).success).toBe(false);
	});
	it('accepte commentaire optionnel', () => {
		expect(
			createNoticeDto.safeParse({ rating_notice: 3.5, id_chief: 'id', comment_notice: 'Très bien' })
				.success
		).toBe(true);
	});
});
