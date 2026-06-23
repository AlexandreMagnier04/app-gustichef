import 'dotenv/config';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);

async function drop() {
	console.log('Dropping schema public...');
	await client`DROP SCHEMA public CASCADE`;
	await client`CREATE SCHEMA public`;
	await client`GRANT ALL ON SCHEMA public TO public`;
	console.log('Schema reset done.');
	await client.end();
}

drop().catch((err) => {
	console.error(err);
	process.exit(1);
});
