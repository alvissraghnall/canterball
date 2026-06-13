import { hc } from 'hono/client';
import type { AppType } from '@canterball/server';

const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';

export const getClient = (customFetch?: typeof fetch) =>
	hc<AppType>(serverUrl, {
		headers: {
			'Content-Type': 'application/json',
		},
		fetch: (url: string | URL | Request, options?: RequestInit) =>
			(customFetch || fetch)(url, { ...options, credentials: 'include' }),
	});

export const client = getClient();
