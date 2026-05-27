import { getSpecialties } from '$lib/server/services/chiefs';
import type { Specialty } from '$lib/models/chief.model';

export async function load() {
	let specialties: Specialty[] = [];
	try {
		specialties = await getSpecialties();
	} catch {
		// DB indisponible ou table inexistante — l'utilisateur peut quand même s'inscrire
	}
	return { specialties };
}
