import type { DurableObjectNamespace } from '@cloudflare/workers-types';

export interface Env {
  ROOMS: DurableObjectNamespace;
  TURSO_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  ENVIRONMENT?: string;
}
