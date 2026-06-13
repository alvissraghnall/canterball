import { createAuthClient } from 'better-auth/svelte';
import { anonymousClient, magicLinkClient } from 'better-auth/client/plugins';

const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';

export const authClient = createAuthClient({
	baseURL: serverUrl,
	plugins: [anonymousClient(), magicLinkClient()],
	fetchOptions: {
		credentials: 'include',
	},
});
