import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);

async function migrate() {
	const migrationsDir = join(process.cwd(), 'drizzle');
	const files = readdirSync(migrationsDir)
		.filter((f) => f.endsWith('.sql'))
		.sort();

	console.log(`Found ${files.length} migration file(s)...`);

	for (const file of files) {
		const content = readFileSync(join(migrationsDir, file), 'utf-8');
		const statements = content
			.split('--> statement-breakpoint')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		console.log(`Applying ${file} (${statements.length} statements)...`);
		for (const statement of statements) {
			await client.unsafe(statement);
		}
		console.log(`✓ ${file}`);
	}

	console.log('Migration done.');
	await client.end();
}

migrate().catch((err) => {
	console.error('Migration failed:', err.message);
	process.exit(1);
});
