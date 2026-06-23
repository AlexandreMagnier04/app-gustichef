import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	publications,
	images_publication,
	tags,
	publications_tags
} from '$lib/server/db/schema/social';
import { users } from '$lib/server/db/schema/auth';
import { chiefs_specialties, specialties } from '$lib/server/db/schema/chiefs';
import { uploadFile, deleteFile } from '$lib/server/services/storage';
import type { CreatePublicationDto } from '$lib/dtos/publication.dto';
import type { Publication, PublicationCard } from '$lib/models/publication.model';

type FileInput = { buffer: Buffer; mimeType: string; originalName?: string };

const FEED_PAGE_SIZE = 20;

// Crée une publication avec image obligatoire + tags (créés à la volée si nécessaire).
// Rollback du fichier MinIO si l'écriture DB échoue.
export async function createPublication(
	userId: string,
	data: CreatePublicationDto,
	image: FileInput
): Promise<Publication> {
	const uploaded = await uploadFile(`publications/${userId}`, image);

	try {
		return await db.transaction(async (tx) => {
			const [publication] = await tx
				.insert(publications)
				.values({
					title_publication: data.title,
					content_publication: data.description ?? '',
					price_publication: data.price !== undefined ? String(data.price) : null,
					guests_min: data.guestsMin ?? null,
					guests_max: data.guestsMax ?? null,
					id_users: userId
				})
				.returning();

			await tx.insert(images_publication).values({
				id_publication: publication.id_publication,
				url: uploaded.url,
				position: 0
			});

			if (data.tags.length > 0) {
				await tx
					.insert(tags)
					.values(data.tags.map((name) => ({ name_tag: name })))
					.onConflictDoNothing();

				const tagRows = await tx
					.select({ id_tag: tags.id_tag })
					.from(tags)
					.where(inArray(tags.name_tag, data.tags));

				await tx
					.insert(publications_tags)
					.values(
						tagRows.map((t) => ({ id_publication: publication.id_publication, id_tag: t.id_tag }))
					)
					.onConflictDoNothing();
			}

			return publication;
		});
	} catch (err) {
		await deleteFile(uploaded.objectKey).catch(() => {});
		throw err;
	}
}

// Images des publications d'un chef — utilisé par la galerie du profil
export async function getChiefPublicationImages(
	chiefId: string
): Promise<{ id_image: number; id_publication: number; url: string; position: number }[]> {
	const pubs = await db
		.select({ id_publication: publications.id_publication })
		.from(publications)
		.where(eq(publications.id_users, chiefId));

	if (pubs.length === 0) return [];

	const pubIds = pubs.map((p) => p.id_publication);
	return db
		.select({
			id_image: images_publication.id_image,
			id_publication: images_publication.id_publication,
			url: images_publication.url,
			position: images_publication.position
		})
		.from(images_publication)
		.where(inArray(images_publication.id_publication, pubIds))
		.orderBy(desc(images_publication.date_upload));
}

// Feed paginé enrichi (auteur + images + tags + spécialités du chef) — utilisé par la home
export async function getPublicationsFeed(page = 0): Promise<PublicationCard[]> {
	const rows = await db
		.select({
			publication: publications,
			author_id: users.id,
			author_firstname: users.firstname,
			author_name: users.name,
			author_image: users.image,
			author_localization: users.localization
		})
		.from(publications)
		.innerJoin(users, eq(users.id, publications.id_users))
		.orderBy(desc(publications.date_publication))
		.limit(FEED_PAGE_SIZE)
		.offset(page * FEED_PAGE_SIZE);

	if (rows.length === 0) return [];

	const publicationIds = rows.map((r) => r.publication.id_publication);
	const authorIds = [...new Set(rows.map((r) => r.author_id))];

	const [allImages, allTags, allSpecialties] = await Promise.all([
		db
			.select()
			.from(images_publication)
			.where(inArray(images_publication.id_publication, publicationIds)),
		db
			.select({
				id_publication: publications_tags.id_publication,
				id_tag: tags.id_tag,
				name_tag: tags.name_tag
			})
			.from(publications_tags)
			.innerJoin(tags, eq(tags.id_tag, publications_tags.id_tag))
			.where(inArray(publications_tags.id_publication, publicationIds)),
		db
			.select({
				id_chief: chiefs_specialties.id_chief,
				name_speciality: specialties.name_speciality
			})
			.from(chiefs_specialties)
			.innerJoin(specialties, eq(specialties.id_speciality, chiefs_specialties.id_speciality))
			.where(inArray(chiefs_specialties.id_chief, authorIds))
	]);

	return rows.map((r) => ({
		...r.publication,
		images: allImages
			.filter((img) => img.id_publication === r.publication.id_publication)
			.sort((a, b) => a.position - b.position),
		tags: allTags
			.filter((t) => t.id_publication === r.publication.id_publication)
			.map((t) => ({ id_tag: t.id_tag, name_tag: t.name_tag })),
		chiefSpecialties: allSpecialties
			.filter((s) => s.id_chief === r.author_id)
			.map((s) => s.name_speciality),
		author: {
			id: r.author_id,
			firstname: r.author_firstname,
			name: r.author_name,
			image: r.author_image,
			localization: r.author_localization
		}
	}));
}
