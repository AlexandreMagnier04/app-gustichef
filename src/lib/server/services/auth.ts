import { error, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { User, UserRole } from '$lib/models/user.model';

// Lit la session depuis les headers (utile pour les endpoints API qui n'ont pas accès à locals).
// Préférer lire `event.locals.user` quand c'est possible (rempli par hooks.server.ts) — pas de requête DB.
export async function getSession(headers: Headers): Promise<User | null> {
	const session = await auth.api.getSession({ headers });
	if (!session?.user) return null;
	return session.user as unknown as User;
}

// Garde-fou : retourne l'utilisateur connecté, redirige sinon.
export function requireUser(locals: App.Locals): User {
	if (!locals.user) throw redirect(302, '/login');
	return locals.user as unknown as User;
}

// Garde-fou de rôle : 403 si l'utilisateur n'a pas le bon rôle.
export function requireRole(locals: App.Locals, role: UserRole): User {
	const user = requireUser(locals);
	if (user.role !== role) throw error(403, 'Accès refusé');
	return user;
}
