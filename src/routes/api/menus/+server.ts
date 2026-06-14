import { json, error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { createMenu } from '$lib/server/services/chiefs';
import { addMenuImage } from '$lib/server/services/images';
import { createMenuDto } from '$lib/dtos/chief.dto';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireUser(locals);
	if (user.role !== 'chief') throw error(403, 'Seul un chef peut créer un menu');

	const fd = await request.formData();

	const raw = {
		title_menu: fd.get('title_menu'),
		description_menu: fd.get('description_menu'),
		price_menu: fd.get('price_menu'),
		type_menu: fd.get('type_menu') ?? 'plat',
		guests_min: fd.get('guests_min') ?? undefined,
		guests_max: fd.get('guests_max') ?? undefined,
		ingredients: fd.getAll('ingredients[]').filter(Boolean)
	};

	const parsed = createMenuDto.safeParse(raw);
	if (!parsed.success) {
		return json({ message: 'Données invalides', errors: parsed.error.flatten() }, { status: 422 });
	}

	const menu = await createMenu({ ...parsed.data, id_chief: user.id });

	const photo = fd.get('photo');
	if (photo instanceof File && photo.size > 0) {
		const buffer = Buffer.from(await photo.arrayBuffer());
		await addMenuImage(menu.id_menu, user.id, {
			buffer,
			mimeType: photo.type,
			originalName: photo.name
		}).catch(() => {});
	}

	return json(menu, { status: 201 });
};
