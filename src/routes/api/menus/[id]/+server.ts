import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { getMenuById, updateMenu, deleteMenu } from '$lib/server/services/chiefs';
import { addMenuImage, getMenuImages } from '$lib/server/services/images';
import { updateMenuDto } from '$lib/dtos/chief.dto';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	requireUser(locals);
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');
	const [menu, images] = await Promise.all([getMenuById(id), getMenuImages(id)]);
	if (!menu) throw error(404, 'Menu introuvable');
	return json({ menu, images });
};

export const PATCH: RequestHandler = async ({ request, params, locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Accès refusé');

	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const fd = await request.formData();

	const raw = {
		title_menu: fd.get('title_menu') ?? undefined,
		description_menu: fd.get('description_menu') ?? undefined,
		price_menu: fd.get('price_menu') ?? undefined,
		type_menu: fd.get('type_menu') ?? undefined,
		guests_min: fd.get('guests_min') ?? undefined,
		guests_max: fd.get('guests_max') ?? undefined,
		ingredients: fd.getAll('ingredients[]').filter(Boolean)
	};

	const parsed = updateMenuDto.safeParse(raw);
	if (!parsed.success) {
		return json({ message: 'Données invalides', errors: parsed.error.flatten() }, { status: 422 });
	}

	const menu = await updateMenu(id, user.id, parsed.data);

	const photo = fd.get('photo');
	if (photo instanceof File && photo.size > 0) {
		const buffer = Buffer.from(await photo.arrayBuffer());
		await addMenuImage(menu.id_menu, user.id, {
			buffer,
			mimeType: photo.type,
			originalName: photo.name
		}).catch(() => {});
	}

	return json(menu);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Accès refusé');

	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	await deleteMenu(id, user.id);
	return json({ ok: true });
};
