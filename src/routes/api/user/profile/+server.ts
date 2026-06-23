import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/services/auth';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema/auth';
import { chiefs } from '$lib/server/db/schema/chiefs';
import { uploadFile } from '$lib/server/services/storage';
import { validateImageFile } from '$lib/dtos/image.dto';
import { setupChiefProfile } from '$lib/server/services/chiefs';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireUser(locals);
	const form = await request.formData();

	const firstname = form.get('firstname') as string | null;
	const name = form.get('name') as string | null;
	const localization = form.get('localization') as string | null;
	const bio = form.get('bio') as string | null;
	const avatarFile = form.get('avatar');
	const bannerFile = form.get('banner');
	const specialties = form.get('specialties') as string | null;

	const userUpdate: Record<string, string> = {};
	if (firstname) userUpdate.firstname = firstname;
	if (name) userUpdate.name = name;
	if (localization !== null) userUpdate.localization = localization;

	if (avatarFile instanceof File && avatarFile.size > 0) {
		const check = validateImageFile(avatarFile);
		if (!check.ok) return json({ error: check.error }, { status: 400 });
		const buffer = Buffer.from(await avatarFile.arrayBuffer());
		const { url } = await uploadFile(`avatars/${user.id}`, { buffer, mimeType: avatarFile.type, originalName: avatarFile.name });
		userUpdate.image = url;
	}

	if (Object.keys(userUpdate).length > 0) {
		await db.update(users).set(userUpdate).where(eq(users.id, user.id));
	}

	if (user.role === 'chief') {
		const chiefUpdate: Record<string, string> = {};
		if (bio !== null) chiefUpdate.bio_chief = bio;

		if (bannerFile instanceof File && bannerFile.size > 0) {
			const check = validateImageFile(bannerFile);
			if (!check.ok) return json({ error: check.error }, { status: 400 });
			const buffer = Buffer.from(await bannerFile.arrayBuffer());
			const { url } = await uploadFile(`banners/${user.id}`, { buffer, mimeType: bannerFile.type, originalName: bannerFile.name });
			chiefUpdate.banner_chief = url;
		}

		if (Object.keys(chiefUpdate).length > 0) {
			await db.update(chiefs).set(chiefUpdate).where(eq(chiefs.id_chief, user.id));
		}

		if (specialties !== null) {
			const specialtyNames = specialties.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3);
			await setupChiefProfile(user.id, { bio: bio ?? undefined, specialtyNames });
		}
	}

	return json({ success: true });
};
