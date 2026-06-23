import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chiefs, images_chef, images_menu, menus } from '$lib/server/db/schema/chiefs';
import { uploadFile, deleteFile } from '$lib/server/services/storage';
import type { ImageChef, ImageMenu } from '$lib/models/image.model';

type FileInput = { buffer: Buffer; mimeType: string; originalName?: string };

// --- Galerie d'un chef ---

export async function addChiefImage(
	chiefId: string,
	file: FileInput,
	position = 0
): Promise<ImageChef> {
	// Vérifie que le chef existe
	const [chief] = await db
		.select({ id_chief: chiefs.id_chief })
		.from(chiefs)
		.where(eq(chiefs.id_chief, chiefId))
		.limit(1);
	if (!chief) throw error(404, 'Chef introuvable');

	const uploaded = await uploadFile(`chiefs/${chiefId}`, file);

	try {
		const [row] = await db
			.insert(images_chef)
			.values({ id_chief: chiefId, url: uploaded.url, position })
			.returning();
		return row;
	} catch (err) {
		// Rollback : si l'insertion DB échoue, on supprime le fichier déjà uploadé
		await deleteFile(uploaded.objectKey).catch(() => {});
		throw err;
	}
}

export async function getChiefImages(chiefId: string): Promise<ImageChef[]> {
	return db
		.select()
		.from(images_chef)
		.where(eq(images_chef.id_chief, chiefId))
		.orderBy(images_chef.position);
}

// --- Photos d'un menu ---

export async function addMenuImage(
	menuId: number,
	requestingChiefId: string,
	file: FileInput,
	position = 0
): Promise<ImageMenu> {
	// Vérifie que le menu existe ET appartient bien au chef qui upload
	const [menu] = await db
		.select({ id_chief: menus.id_chief })
		.from(menus)
		.where(eq(menus.id_menu, menuId))
		.limit(1);
	if (!menu) throw error(404, 'Menu introuvable');
	if (menu.id_chief !== requestingChiefId) throw error(403, 'Ce menu ne vous appartient pas');

	const uploaded = await uploadFile(`menus/${menuId}`, file);

	try {
		const [row] = await db
			.insert(images_menu)
			.values({ id_menu: menuId, url: uploaded.url, position })
			.returning();
		return row;
	} catch (err) {
		await deleteFile(uploaded.objectKey).catch(() => {});
		throw err;
	}
}

export async function getMenuImages(menuId: number): Promise<ImageMenu[]> {
	return db
		.select()
		.from(images_menu)
		.where(eq(images_menu.id_menu, menuId))
		.orderBy(images_menu.position);
}

export async function getMenuImageUrl(menuId: number): Promise<string | null> {
	const [row] = await db
		.select({ url: images_menu.url })
		.from(images_menu)
		.where(eq(images_menu.id_menu, menuId))
		.limit(1);
	return row?.url ?? null;
}
