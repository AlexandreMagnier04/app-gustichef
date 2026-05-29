const GEO_API = 'https://geo.api.gouv.fr/communes';

export type Commune = {
	nom: string;
	code: string;
};

export async function searchCommunes(query: string, limit = 8): Promise<Commune[]> {
	if (query.length < 2) return [];
	const url = `${GEO_API}?nom=${encodeURIComponent(query)}&fields=nom,code&boost=population&limit=${limit}&type=commune-actuelle`;
	const res = await fetch(url);
	if (!res.ok) return [];
	return res.json();
}
