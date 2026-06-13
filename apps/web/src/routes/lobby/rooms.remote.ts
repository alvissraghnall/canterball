import { query } from '$app/server';
import { client } from '$lib/api';

export const getLiveRooms = query.live(async function* () {
	while (true) {
		try {
			const res = await client.api.rooms.$get();
			if (res.ok) {
				const rooms = await res.json();
				yield rooms;
			}
		} catch (e) {
			console.error('Error fetching live rooms:', e);
		}
		// Poll every 3 seconds for updates
		await new Promise((resolve) => setTimeout(resolve, 3000));
	}
});
