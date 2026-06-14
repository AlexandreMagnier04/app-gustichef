import { Client as MinioClient } from 'minio';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';

// Singleton client MinIO — réutilisé sur toute la durée du serveur
const client = new MinioClient({
	endPoint: env.MINIO_ENDPOINT ?? 'localhost',
	port: Number(env.MINIO_PORT ?? 9000),
	useSSL: env.MINIO_USE_SSL === 'true',
	accessKey: env.MINIO_ROOT_USER ?? '',
	secretKey: env.MINIO_ROOT_PASSWORD ?? ''
});

const BUCKET = env.MINIO_BUCKET ?? 'gustichef';
const PUBLIC_URL = env.MINIO_PUBLIC_URL ?? 'http://localhost:9000';

let bucketInitialized = false;

// S'assure que le bucket existe et qu'il est lisible publiquement (lecture seule).
// La policy est (ré)appliquée même si le bucket préexiste (pour récupérer un bucket créé sans policy).
async function ensureBucket(): Promise<void> {
	if (bucketInitialized) return;

	const exists = await client.bucketExists(BUCKET);
	if (!exists) {
		await client.makeBucket(BUCKET);
	}

	// Lecture publique : permet d'afficher les images via <img src> sans signed URL
	await client.setBucketPolicy(
		BUCKET,
		JSON.stringify({
			Version: '2012-10-17',
			Statement: [
				{
					Effect: 'Allow',
					Principal: { AWS: ['*'] },
					Action: ['s3:GetObject'],
					Resource: [`arn:aws:s3:::${BUCKET}/*`]
				}
			]
		})
	);

	bucketInitialized = true;
}

export type UploadedFile = {
	url: string;
	objectKey: string;
};

// Upload un fichier sous un prefix (ex: 'chiefs/123', 'menus/45').
// Retourne l'URL publique + la clé de l'objet (pour suppression ultérieure).
export async function uploadFile(
	prefix: string,
	file: { buffer: Buffer; mimeType: string; originalName?: string }
): Promise<UploadedFile> {
	await ensureBucket();

	const ext = (file.originalName?.split('.').pop() ?? 'bin').toLowerCase();
	const objectKey = `${prefix}/${randomUUID()}.${ext}`;

	await client.putObject(BUCKET, objectKey, file.buffer, file.buffer.length, {
		'Content-Type': file.mimeType
	});

	return {
		url: `${PUBLIC_URL}/${BUCKET}/${objectKey}`,
		objectKey
	};
}

// Supprime un objet du bucket (utilisé lors de la suppression d'une image en DB).
export async function deleteFile(objectKey: string): Promise<void> {
	await ensureBucket();
	await client.removeObject(BUCKET, objectKey);
}

// Génère une URL temporaire signée (utile si on passe le bucket en privé plus tard).
export async function getSignedUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
	await ensureBucket();
	return client.presignedGetObject(BUCKET, objectKey, expirySeconds);
}
