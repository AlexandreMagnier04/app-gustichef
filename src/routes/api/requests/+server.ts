import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { requireUser } from '$lib/server/services/auth';
import { createRequestDto } from '$lib/dtos/customer.dto';
import {
	createRequest,
	getRequestsByCustomer,
	getRequestsByChief
} from '$lib/server/services/customers';
import { getChiefs } from '$lib/server/services/chiefs';
import { createNotification } from '$lib/server/services/notifications';

export const GET = async ({ locals }) => {
	const user = requireUser(locals);

	if (user.role === 'chief') {
		const requests = await getRequestsByChief();
		return json(requests);
	}

	const requests = await getRequestsByCustomer(user.id);
	return json(requests);
};

export const POST = async ({ request, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const body = await request.json();
	const result = createRequestDto.safeParse(body);
	if (!result.success) {
		return json({ error: z.flattenError(result.error).fieldErrors }, { status: 400 });
	}

	const req = await createRequest(user.id, result.data);

	// Notifie tous les chefs qu'une nouvelle demande est disponible
	const allChiefs = await getChiefs();
	await Promise.all(
		allChiefs.map((c) =>
			createNotification(
				c.id_chief,
				'new_request',
				'Nouvelle demande client',
				`${user.firstname} ${user.name} recherche un chef pour "${result.data.title_request}".`,
				String(req.id_request)
			)
		)
	);

	return json(req, { status: 201 });
};
