import type { Env } from './env';

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

export async function sendEmail(env: Env, options: EmailOptions) {
	if (!env.BREVO_API_KEY) {
		console.warn('BREVO_API_KEY not set. Email would have been sent to:', options.to);
		console.log('HTML Content:', options.html);
		return;
	}

	const response = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'api-key': env.BREVO_API_KEY,
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			sender: {
				name: 'Cantar Ball Command',
				email: env.EMAIL_FROM || 'no-reply@canterball.app',
			},
			to: [{ email: options.to }],
			subject: options.subject,
			htmlContent: options.html,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		console.error(`[MAIL ERROR] Failed to send email to ${options.to}:`, error);
		throw new Error(`Brevo API error: ${response.status}`);
	}

	console.log(`[MAIL] Successfully sent "${options.subject}" to ${options.to}`);
}

export function generateMagicLinkHtml(url: string) {
	return `
    <div style="background-color: #0f172a; padding: 40px 20px; font-family: 'JetBrains Mono', monospace; color: #f1f5f9; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #1e293b; border: 1px solid #d9f99d; padding: 40px; border-radius: 4px;">

        <div style="margin-bottom: 30px;">
          <h1 style="color: #d9f99d; font-size: 24px; letter-spacing: -1px; margin: 0; text-transform: uppercase;">Identity Verification</h1>
          <p style="font-size: 10px; color: #94a3b8; margin-top: 5px; letter-spacing: 2px;">SECURE_PROTOCOL_V2.4</p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #f1f5f9; margin-bottom: 30px;">
          Commander, a request to access the tactical grid has been detected for this terminal. Confirm your identity to proceed to the lobby.
        </p>

        <a href="${url}" style="display: inline-block; background-color: #d9f99d; color: #1a2e05; padding: 16px 32px; font-weight: bold; text-decoration: none; text-transform: uppercase; font-size: 14px; border-radius: 2px;">
          Authorize Session
        </a>

        <div style="margin-top: 40px; border-top: 1px solid rgba(217, 249, 157, 0.1); padding-top: 20px;">
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
            If you did not request this authorization, ignore this transmission. This link expires in 1 hour.
          </p>
        </div>

      </div>
      <p style="margin-top: 20px; font-size: 10px; color: #475569; letter-spacing: 1px;">CANTAR BALL // TACTICAL SPORTS ENGINE</p>
    </div>
  `;
}
