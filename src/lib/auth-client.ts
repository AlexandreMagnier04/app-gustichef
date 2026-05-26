import { createAuthClient } from 'better-auth/svelte';

// Instance partagée — importée dans tous les composants qui ont besoin de signIn/signUp/signOut
// Équivalent NestJS : le module AuthModule importé une seule fois dans AppModule
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
