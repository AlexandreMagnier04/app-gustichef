import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { requireUser } from '$lib/server/services/auth';
import { createRequestDto } from '$lib/dtos/customer.dto';
import { createRequest, getRequestsByCustomer, getRequestsByChief } from '$lib/server/services/customers';

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
	return json(req, { status: 201 });
};
