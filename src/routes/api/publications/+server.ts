import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/services/auth';
import { createPublication } from '$lib/server/services/publications';
import { createPublicationDto } from '$lib/dtos/publication.dto';
import { validateImageFile } from '$lib/dtos/image.dto';
import type { RequestHandler } from './$types';

// POST /api/publications — multipart/form-data
// Champs : file (image), title, description, price?, guestsMin?, guestsMax?, tags? (string[] répété)
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireRole(locals, 'chief');

	const form = await request.formData();
	const file = form.get('file');

	if (!(file instanceof File)) {
		return json({ error: 'Image obligatoire' }, { status: 400 });
	}

	const fileCheck = validateImageFile(file);
	if (!fileCheck.ok) {
		return json({ error: fileCheck.error }, { status: 400 });
	}

	const parsed = createPublicationDto.safeParse({
		title: form.get('title'),
		description: form.get('description'),
		price: form.get('price') || undefined,
		guestsMin: form.get('guestsMin') || undefined,
		guestsMax: form.get('guestsMax') || undefined,
		tags: form.getAll('tags').map(String).filter(Boolean)
	});

	if (!parsed.success) {
		return json({ error: z.flattenError(parsed.error).fieldErrors }, { status: 400 });
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const publication = await createPublication(user.id, parsed.data, {
		buffer,
		mimeType: file.type,
		originalName: file.name
	});

	return json({ publication });
};
