import type { PageLoad } from './$types';
import { client } from '$lib/api';

export const load: PageLoad = async () => {
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
