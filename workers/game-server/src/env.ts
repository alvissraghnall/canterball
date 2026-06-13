import type { DurableObjectNamespace } from '@cloudflare/workers-types';

export interface Env {
	ROOMS: DurableObjectNamespace;
	TURSO_URL?: string;
	TURSO_AUTH_TOKEN?: string;
	ENVIRONMENT?: string;

	// Better Auth
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;

	// OAuth
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GITHUB_CLIENT_ID?: string;
	GITHUB_CLIENT_SECRET?: string;

	// Brevo
	BREVO_API_KEY?: string;
	EMAIL_FROM?: string;
}
