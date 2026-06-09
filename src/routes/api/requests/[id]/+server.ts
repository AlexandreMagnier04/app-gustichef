import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { requests } from '$lib/server/db/schema/customers';
import { requireUser } from '$lib/server/services/auth';
import { createRequestDto } from '$lib/dtos/customer.dto';

export const PATCH = async ({ params, request, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	const body = await request.json();
	const result = createRequestDto.partial().safeParse(body);
	if (!result.success) {
		return json({ error: z.flattenError(result.error).fieldErrors }, { status: 400 });
	}

	const [updated] = await db
		.update(requests)
		.set(result.data)
		.where(and(eq(requests.id_request, id), eq(requests.id_customer, user.id)))
		.returning();

	if (!updated) throw error(404, 'Demande introuvable');
	return json(updated);
};

export const DELETE = async ({ params, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID invalide');

	await db
		.delete(requests)
		.where(and(eq(requests.id_request, id), eq(requests.id_customer, user.id)));

	return new Response(null, { status: 204 });
};
