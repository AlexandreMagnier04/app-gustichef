import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import { users, accounts } from './schema/auth';
import { chiefs, specialties, chiefs_specialties, menus } from './schema/chiefs';
import { customers } from './schema/customers';

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

const CHEFS = [
	{
		firstname: 'Antoine',
		name: 'Dupont',
		email: 'antoine.dupont@gustichef.com',
		localization: 'Lyon',
		bio: "Chef passionné par la gastronomie française traditionnelle. 15 ans d'expérience en restaurant étoilé.",
		note: '4.8',
		specialties: ['Cuisine française', 'Pâtisserie'],
		menus: [
			{
				title: 'Menu Lyonnais',
				description: 'Quenelles de brochet sauce Nantua, tablier de sapeur, tarte praline',
				price: '65.00',
				guests_min: 4,
				guests_max: 12,
				ingredients: ['brochet', 'veau', 'pralines', 'crème']
			},
			{
				title: 'Dégustation Terroir',
				description: 'Saucisson brioché, gratin dauphinois, St-Marcellin rôti, bugnes',
				price: '55.00',
				guests_min: 6,
				guests_max: 20,
				ingredients: ['saucisson', 'pommes de terre', 'fromage', 'farine']
			}
		]
	},
	{
		firstname: 'Sofia',
		name: 'Martinez',
		email: 'sofia.martinez@gustichef.com',
		localization: 'Paris',
		bio: 'Cheffe italo-espagnole, spécialiste des saveurs méditerranéennes et des cocktails maison.',
		note: '4.6',
		specialties: ['Cuisine italienne', 'Cocktails & Mixologie'],
		menus: [
			{
				title: 'Soir à Rome',
				description: 'Antipasti variés, risotto aux truffes, osso buco, tiramisu maison',
				price: '70.00',
				guests_min: 4,
				guests_max: 10,
				ingredients: ['riz arborio', 'truffe', 'jarret de veau', 'mascarpone']
			},
			{
				title: 'Aperitivo Club',
				description: 'Cocktails signatures, bruschette, charcuteries italiennes, fromages',
				price: '45.00',
				guests_min: 8,
				guests_max: 30,
				ingredients: ['prosecco', 'tomates', 'basilic', 'burrata']
			}
		]
	},
	{
		firstname: 'Kenji',
		name: 'Tanaka',
		email: 'kenji.tanaka@gustichef.com',
		localization: 'Paris',
		bio: 'Chef japonais formé à Tokyo et Paris. Expert en omakase, sushi et cuisine fusion asiatique.',
		note: '4.9',
		specialties: ['Cuisine japonaise', 'Cuisine asiatique'],
		menus: [
			{
				title: 'Omakase Parisien',
				description: 'Sashimi de thon rouge, nigiri saumon, wagyu grillé, mochi glacé',
				price: '95.00',
				guests_min: 2,
				guests_max: 8,
				ingredients: ['thon rouge', 'saumon', 'wagyu', 'riz à sushi']
			},
			{
				title: 'Bento Prestige',
				description: 'Gyoza maison, ramen au miso, katsu curry, daifuku mochi',
				price: '55.00',
				guests_min: 4,
				guests_max: 15,
				ingredients: ['porc', 'nouilles', 'miso', 'farine de riz']
			}
		]
	},
	{
		firstname: 'Marie',
		name: 'Leblanc',
		email: 'marie.leblanc@gustichef.com',
		localization: 'Bordeaux',
		bio: 'Nutritionniste et cheffe vegan, je crée des assiettes végétales colorées et équilibrées.',
		note: '4.7',
		specialties: ['Vegan', 'Nutrition'],
		menus: [
			{
				title: 'Green Power',
				description: 'Buddha bowl quinoa, tartare de betterave, brownie coco-cacao cru',
				price: '48.00',
				guests_min: 4,
				guests_max: 14,
				ingredients: ['quinoa', 'betterave', 'avocat', 'cacao cru']
			},
			{
				title: 'Bistronomie Végétale',
				description: 'Carpaccio de courgettes, risotto de chou-fleur, tarte citron vegan',
				price: '52.00',
				guests_min: 2,
				guests_max: 10,
				ingredients: ['courgettes', 'chou-fleur', 'citron', 'lait de coco']
			}
		]
	},
	{
		firstname: 'Lucas',
		name: 'Bernard',
		email: 'lucas.bernard@gustichef.com',
		localization: 'Marseille',
		bio: 'Spécialiste traiteur événementiel et maître du barbecue. Du cocktail à la réception.',
		note: '4.5',
		specialties: ['Traiteur', 'Barbecue'],
		menus: [
			{
				title: 'BBQ Premium',
				description: 'Côtes de bœuf, ribs marinés, poulet fumé, légumes grillés, sauces maison',
				price: '58.00',
				guests_min: 10,
				guests_max: 50,
				ingredients: ['côtes de bœuf', 'ribs', 'poulet', 'légumes de saison']
			},
			{
				title: 'Cocktail Dinatoire',
				description: '30 pièces cocktail maison : verrines, brochettes, mini-burgers, desserts',
				price: '42.00',
				guests_min: 20,
				guests_max: 100,
				ingredients: ['variés selon saison']
			}
		]
	}
];

const CUSTOMERS = [
	{
		firstname: 'Emma',
		name: 'Martin',
		email: 'emma.martin@example.com',
		localization: 'Paris',
		preferences: 'Cuisine gastronomique, allergique aux fruits à coque'
	},
	{
		firstname: 'Thomas',
		name: 'Durand',
		email: 'thomas.durand@example.com',
		localization: 'Lyon',
		preferences: 'Amateur de cuisine asiatique et barbecue'
	},
	{
		firstname: 'Chloé',
		name: 'Petit',
		email: 'chloe.petit@example.com',
		localization: 'Bordeaux',
		preferences: 'Végétarienne, curieuse de nouvelles saveurs'
	}
];

async function seed() {
	// Idempotent : si des chefs existent déjà, on ne re-seed pas (préserve la prod)
	const existingChefs = await db.select({ id: chiefs.id_chief }).from(chiefs).limit(1);
	if (existingChefs.length > 0) {
		console.log('Seed: données déjà présentes, rien à faire.');
		await client.end();
		return;
	}

	const password = await hashPassword('Password123!');

	// Spécialités — n'insère que celles qui manquent (évite les doublons)
	console.log('Seeding specialties...');
	const existingSpecs = await db.select().from(specialties);
	const existingNames = new Set(existingSpecs.map((s) => s.name_speciality));
	const toInsert = SPECIALTIES.filter((name) => !existingNames.has(name));
	if (toInsert.length > 0) {
		await db.insert(specialties).values(toInsert.map((name) => ({ name_speciality: name })));
	}

	// Construit la map depuis l'ensemble complet des spécialités présentes en base
	const allSpecs = await db.select().from(specialties);
	const specialtyMap = new Map(allSpecs.map((s) => [s.name_speciality, s.id_speciality]));

	// Chefs
	console.log('Seeding chefs...');
	for (const chef of CHEFS) {
		const userId = randomUUID();

		await db.insert(users).values({
			id: userId,
			name: chef.name,
			firstname: chef.firstname,
			email: chef.email,
			emailVerified: true,
			role: 'chief',
			localization: chef.localization
		});

		await db.insert(accounts).values({
			id: randomUUID(),
			accountId: userId,
			providerId: 'credential',
			userId,
			password
		});

		await db.insert(chiefs).values({
			id_chief: userId,
			bio_chief: chef.bio,
			note_chief: chef.note
		});

		for (const specName of chef.specialties) {
			const specId = specialtyMap.get(specName);
			if (specId) {
				await db.insert(chiefs_specialties).values({ id_chief: userId, id_speciality: specId });
			}
		}

		for (const menu of chef.menus) {
			await db.insert(menus).values({
				id_chief: userId,
				title_menu: menu.title,
				description_menu: menu.description,
				price_menu: menu.price,
				guests_min: menu.guests_min,
				guests_max: menu.guests_max,
				ingredients: menu.ingredients
			});
		}
	}

	// Clients
	console.log('Seeding customers...');
	for (const customer of CUSTOMERS) {
		const userId = randomUUID();

		await db.insert(users).values({
			id: userId,
			name: customer.name,
			firstname: customer.firstname,
			email: customer.email,
			emailVerified: true,
			role: 'customer',
			localization: customer.localization
		});

		await db.insert(accounts).values({
			id: randomUUID(),
			accountId: userId,
			providerId: 'credential',
			userId,
			password
		});

		await db.insert(customers).values({
			id_customer: userId,
			preferences_customer: customer.preferences
		});
	}

	console.log('Seed done.');
	await client.end();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
