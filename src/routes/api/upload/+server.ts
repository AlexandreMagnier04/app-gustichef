import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/services/auth';
import { addChiefImage, addMenuImage } from '$lib/server/services/images';
import { uploadImageDto, validateImageFile } from '$lib/dtos/image.dto';
import type { RequestHandler } from './$types';

// POST /api/upload — multipart/form-data
// Champs: file (binaire), target ('chief'|'menu'), targetId, position (optionnel)
// Seul un utilisateur 'chief' peut uploader. Le service vérifie la propriété du menu cible.
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireRole(locals, 'chief');

	const form = await request.formData();
	const file = form.get('file');

	if (!(file instanceof File)) {
		return json({ error: 'Fichier manquant' }, { status: 400 });
	}

	const fileCheck = validateImageFile(file);
	if (!fileCheck.ok) {
		return json({ error: fileCheck.error }, { status: 400 });
	}

	const parsed = uploadImageDto.safeParse({
		target: form.get('target'),
		targetId: form.get('targetId'),
		position: form.get('position') ?? 0,
	});

	if (!parsed.success) {
		return json({ error: z.flattenError(parsed.error).fieldErrors }, { status: 400 });
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const input = { buffer, mimeType: file.type, originalName: file.name };

	if (parsed.data.target === 'chief') {
		// Un chef ne peut uploader que dans sa propre galerie
		if (String(parsed.data.targetId) !== user.id) {
			return json({ error: 'Galerie non autorisée' }, { status: 403 });
		}
		const image = await addChiefImage(user.id, input, parsed.data.position);
		return json({ image });
	}

	// target === 'menu' : le service vérifie que le menu appartient au chef
	const menuId = Number(parsed.data.targetId);
	if (Number.isNaN(menuId)) {
		return json({ error: 'targetId invalide pour un menu' }, { status: 400 });
	}
	const image = await addMenuImage(menuId, user.id, input, parsed.data.position);
	return json({ image });
};
