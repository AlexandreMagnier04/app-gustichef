import type { Publication } from '$lib/models/publication.model';

export type CreatePublicationInput = {
	title: string;
	description: string;
	price?: number;
	guestsMin?: number;
	guestsMax?: number;
	tags: string[];
	file: File;
};

export type CreatePublicationResult =
	| { ok: true; publication: Publication }
	| { ok: false; error: string };

// Appelle POST /api/publications en multipart/form-data.
export async function createPublication(
	input: CreatePublicationInput
): Promise<CreatePublicationResult> {
	const form = new FormData();
	form.set('file', input.file);
	form.set('title', input.title);
	form.set('description', input.description);
	if (input.price !== undefined) form.set('price', String(input.price));
	if (input.guestsMin !== undefined) form.set('guestsMin', String(input.guestsMin));
	if (input.guestsMax !== undefined) form.set('guestsMax', String(input.guestsMax));
	for (const tag of input.tags) form.append('tags', tag);

	const res = await fetch('/api/publications', { method: 'POST', body: form });
	const body = await res.json();

	if (!res.ok) {
		const err =
			typeof body.error === 'string'
				? body.error
				: ((Object.values(body.error ?? {}).flat()[0] as string) ?? 'Erreur inconnue');
		return { ok: false, error: err };
	}
	return { ok: true, publication: body.publication };
}
