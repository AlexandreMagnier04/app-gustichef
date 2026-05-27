import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { specialties, categories } from './schema/chiefs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);
const db = drizzle(client);

const SPECIALTIES = [
	'Pâtisserie',
	'Chef à domicile',
	'Vegan',
	'Nutrition',
	'Traiteur',
	'Plats préparés',
	'Cuisine asiatique',
	'Cuisine française',
	'Cuisine italienne',
	'Cuisine japonaise',
	'Barbecue',
	'Cocktails & Mixologie'
];

const CATEGORIES = [
	'Dîner privé',
	'Anniversaire',
	'Mariage',
	'Événement d\'entreprise',
	'Brunch',
	'Cours de cuisine',
	'Repas en famille'
];

async function seed() {
	console.log('Seeding specialties...');
	for (const name of SPECIALTIES) {
		await db
			.insert(specialties)
			.values({ name_speciality: name })
			.onConflictDoNothing();
	}

	console.log('Seeding categories...');
	for (const name of CATEGORIES) {
		await db
			.insert(categories)
			.values({ name_category: name })
			.onConflictDoNothing();
	}

	console.log('Seed done.');
	await client.end();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
