import type { PageLoad } from './$types';
import { getClient } from '$lib/api';

export const load: PageLoad = async ({ params, url, fetch }) => {
	const roomId = params.id;
	const name = url.searchParams.get('name') || 'Player';
	const client = getClient(fetch);

	let initialState = null;
	try {
		const res = await client.api.rooms[':id'].$get({
			param: { id: roomId },
		});
		if (res.ok) {
			initialState = await res.json();
		}
	} catch (e) {
		console.error('Failed to fetch initial game state:', e);
	}

	return {
		roomId,
		name,
		initialState,
	};
};
