import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			console.log(`Reset password link for ${user.email}: ${url}`);
		}
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		}
	},
	user: {
		modelName: 'users',
		additionalFields: {
			firstname: { type: 'string', required: false, defaultValue: '' },
			role: { type: 'string', required: false, defaultValue: 'customer' },
			localization: { type: 'string', required: false, defaultValue: '' },
			upload_profile_picture: { type: 'string', required: false },
		}
	},
	session: { modelName: 'sessions' },
	account: { modelName: 'accounts' },
	verification: { modelName: 'verifications' },
	plugins: [
		sveltekitCookies(getRequestEvent)
	]
});
