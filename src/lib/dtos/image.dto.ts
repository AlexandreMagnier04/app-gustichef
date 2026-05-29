import { z } from 'zod';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// Métadonnées d'upload — validées côté serveur, doublée d'un check binaire du buffer
export const uploadImageDto = z.object({
	target: z.enum(['chief', 'menu']),
	targetId: z.union([z.string().min(1), z.number().int().positive()]),
	position: z.coerce.number().int().min(0).default(0),
});

export type UploadImageDto = z.infer<typeof uploadImageDto>;

// Validation d'un File reçu (taille + type MIME)
export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
	if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
		return { ok: false, error: 'Format non supporté (JPEG, PNG ou WebP uniquement)' };
	}
	if (file.size > MAX_IMAGE_SIZE) {
		return { ok: false, error: 'Image trop lourde (5 MB maximum)' };
	}
	return { ok: true };
}
