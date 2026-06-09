import { getSpecialties } from '$lib/server/services/chiefs';
import type { Specialty } from '$lib/models/chief.model';

export async function load() {
	let specialties: Specialty[] = [];
	try {
		specialties = await getSpecialties();
	} catch {
		// DB indisponible — l'utilisateur peut quand même commencer le signup
	}
	return { specialties };
}
