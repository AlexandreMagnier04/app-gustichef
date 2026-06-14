import postgres from 'postgres';
import { env } from '$env/dynamic/private';

// Dedicated connection for LISTEN/NOTIFY (postgres.js manages it internally)
let _sql: ReturnType<typeof postgres> | null = null;

function getSql() {
	if (!_sql) _sql = postgres(env.DATABASE_URL, { max: 1 });
	return _sql;
}

// Safe channel name: replace hyphens/special chars
export function userChannel(userId: string): string {
	return `user_${userId.replace(/[^a-z0-9]/gi, '_')}`;
}

export async function subscribe(
	channel: string,
	handler: (payload: string) => void
): Promise<() => Promise<void>> {
	const sql = getSql();
	const meta = await sql.listen(channel, handler);
	return () => meta.unlisten();
}

export async function publish(channel: string, payload: string): Promise<void> {
	const sql = getSql();
	await sql`SELECT pg_notify(${channel}, ${payload})`;
}
