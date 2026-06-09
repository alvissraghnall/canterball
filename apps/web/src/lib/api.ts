import { hc } from 'hono/client';
import type { AppType } from '@canterball/server';

const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';

export const client = hc<AppType>(serverUrl);
