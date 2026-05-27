import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { chiefs, specialties, chiefs_specialties } from '$lib/server/db/schema/chiefs';
import { setupChiefProfileDto } from '$lib/dtos/chief.dto';

export async function POST({ request }) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return json({ error: 'Non autorisé' }, { status: 401 });

	const body = await request.json();
	const parsed = setupChiefProfileDto.safeParse(body);
	if (!parsed.success) {
		return json({ error: z.flattenError(parsed.error).fieldErrors }, { status: 400 });
	}

	const { bio, specialties: specialtyNames } = parsed.data;

	await db
		.insert(chiefs)
		.values({ id_chief: session.user.id, bio_chief: bio ?? null })
		.onConflictDoNothing();

	for (const name of specialtyNames) {
		const existing = await db
			.select()
			.from(specialties)
			.where(eq(specialties.name_speciality, name))
			.limit(1);

		const id =
			existing.length > 0
				? existing[0].id_speciality
				: (await db.insert(specialties).values({ name_speciality: name }).returning())[0]
						.id_speciality;

		await db
			.insert(chiefs_specialties)
			.values({ id_chief: session.user.id, id_speciality: id })
			.onConflictDoNothing();
	}

	return json({ success: true });
}
