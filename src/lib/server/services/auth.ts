import { auth } from '$lib/server/auth';
import type { User } from '$lib/auth/user.model';

// Retourne l'utilisateur connecté ou null — équivalent NestJS : @CurrentUser() avec guard optionnel
export async function getSession(headers: Headers): Promise<User | null> {
	const session = await auth.api.getSession({ headers });
	if (!session?.user) return null;
	return session.user as unknown as User;
}

// Retourne l'utilisateur connecté ou lève une erreur — équivalent NestJS : @UseGuards(AuthGuard)
export async function requireSession(headers: Headers): Promise<User> {
	const user = await getSession(headers);
	if (!user) throw new Error('Non authentifié');
	return user;
}
