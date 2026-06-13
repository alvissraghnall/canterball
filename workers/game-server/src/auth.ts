import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous, magicLink } from 'better-auth/plugins';
import type { Env } from './env';
import { getDb } from './db';
import * as schema from './db/schema';
import { sendEmail, generateMagicLinkHtml } from './mail';

export function getAuth(env: Env) {
	return betterAuth({
		database: drizzleAdapter(getDb(env), {
			provider: 'sqlite',
			schema: {
				user: schema.user,
				session: schema.session,
				account: schema.account,
				verification: schema.verification,
			},
		}),
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID || '',
				clientSecret: env.GOOGLE_CLIENT_SECRET || '',
			},
			github: {
				clientId: env.GITHUB_CLIENT_ID || '',
				clientSecret: env.GITHUB_CLIENT_SECRET || '',
			},
		},
		emailAndPassword: {
			enabled: true,
		},
		plugins: [
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					await sendEmail(env, {
						to: email,
						subject: 'Sign in to Cantar Ball Command',
						html: generateMagicLinkHtml(url),
					});
				},
			}),
			anonymous(),
		],
	});
}
