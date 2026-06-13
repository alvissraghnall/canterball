import type { PageLoad } from './$types';
import { getClient } from '$lib/api';

export const load: PageLoad = async ({ fetch }) => {
	const client = getClient(fetch);
	try {
		const res = await client.api.rooms.$get();
		if (res.ok) {
			const rooms = await res.json();
			return { rooms };
		}
	} catch (e) {
		console.error('Failed to fetch rooms:', e);
	}

	return { rooms: [] };
};
