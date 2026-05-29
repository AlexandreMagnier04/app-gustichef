import { getCategories, getSpecialties } from '$lib/server/services/chiefs';
import type { Category, Specialty } from '$lib/models/chief.model';

export async function load() {
	let specialties: Specialty[] = [];
	let categories: Category[] = [];
	try {
		[specialties, categories] = await Promise.all([getSpecialties(), getCategories()]);
	} catch {
		// DB indisponible — l'utilisateur peut quand même commencer le signup
	}
	return { specialties, categories };
}
