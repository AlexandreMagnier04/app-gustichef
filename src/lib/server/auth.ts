import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { sendPasswordResetMail, sendMail } from '$lib/server/mail';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendVerificationEmail: async ({
			user,
			url
		}: {
			user: { email: string; name: string; role?: string; firstname?: string };
			url: string;
		}) => {
			console.log(`[auth] sendVerificationEmail appelé pour ${user.email} role=${user.role}`);
			const isChief = user.role === 'chief';
			await sendMail({
				to: user.email,
				subject: isChief
					? 'Confirmez votre inscription Chef – Gustichef'
					: 'Confirmez votre adresse email – Gustichef',
				html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5EDDC;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EDDC;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#163040;padding:28px 32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:20px">Gustichef</h1>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 8px;color:#163040;font-size:17px">
            ${isChief ? `Bienvenue, ${user.firstname ?? user.name} !` : 'Confirmez votre adresse email'}
          </h2>
          <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6">
            ${
							isChief
								? `Votre inscription en tant que chef est bien enregistrée.<br>Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et accéder à l'application.`
								: `Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et finaliser votre inscription.`
						}
          </p>
          <a href="${url}"
             style="display:inline-block;background:#B85C38;color:#fff;text-decoration:none;padding:13px 28px;border-radius:50px;font-size:14px;font-weight:600">
            ${isChief ? "Accéder à l'application" : 'Confirmer mon email'}
          </a>
          <p style="margin:24px 0 0;color:#999;font-size:12px">
            Ce lien expire dans <strong>24 heures</strong>.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #f0e8da">
          <p style="margin:0;color:#bbb;font-size:11px;text-align:center">© ${new Date().getFullYear()} Gustichef</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
			});
		},
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetMail(user.email, url);
		}
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: env.GOOGLE_CLIENT_SECRET ?? ''
		}
	},
	user: {
		modelName: 'users',
		additionalFields: {
			firstname: { type: 'string', required: false, defaultValue: '' },
			role: { type: 'string', required: false, defaultValue: 'customer' },
			localization: { type: 'string', required: false, defaultValue: '' },
			upload_profile_picture: { type: 'string', required: false }
		}
	},
	session: { modelName: 'sessions' },
	account: { modelName: 'accounts' },
	verification: { modelName: 'verifications' },
	advanced: {
		useSecureCookies: env.ORIGIN?.startsWith('https') ?? false
	},
	accountLinking: {
		enabled: true,
		trustedProviders: ['google']
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
