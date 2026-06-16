import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

// Transporter SMTP partagé (Brevo, Gmail, ou autre)
function createTransporter() {
	return nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: Number(env.SMTP_PORT ?? 587),
		secure: env.SMTP_SECURE === 'true',
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASS
		}
	});
}

export async function sendMail(options: {
	to: string;
	subject: string;
	html: string;
	text?: string;
}) {
	const transporter = createTransporter();
	await transporter.sendMail({
		from: env.SMTP_FROM ?? `"Gustichef" <${env.SMTP_USER}>`,
		to: options.to,
		subject: options.subject,
		html: options.html,
		text: options.text
	});
}

export async function sendPasswordResetMail(email: string, resetUrl: string) {
	await sendMail({
		to: email,
		subject: 'Réinitialisation de votre mot de passe – Gustichef',
		text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}\n\nCe lien expire dans 1 heure.`,
		html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5EDDC;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EDDC;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#1B2A4A;padding:32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.5px">Gustichef</h1>
        </td></tr>
        <tr><td style="padding:36px 32px">
          <h2 style="margin:0 0 12px;color:#1B2A4A;font-size:18px">Réinitialisation de mot de passe</h2>
          <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6">
            Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#B85C38;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:600">
            Réinitialiser mon mot de passe
          </a>
          <p style="margin:24px 0 0;color:#999;font-size:12px;line-height:1.5">
            Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet e-mail.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;border-top:1px solid #f0e8da">
          <p style="margin:0;color:#bbb;font-size:11px;text-align:center">© ${new Date().getFullYear()} Gustichef</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
	});
}
