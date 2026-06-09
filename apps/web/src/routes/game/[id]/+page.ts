import type { PageLoad } from './$types';
import { client } from '$lib/api';

export const load: PageLoad = async ({ params, url }) => {
	const roomId = params.id;
	const name = url.searchParams.get('name') || 'Player';

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
