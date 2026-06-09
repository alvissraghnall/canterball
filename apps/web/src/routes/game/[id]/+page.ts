import type { PageLoad } from './$types';
import type { GameState } from '@canterball/shared';

export const load: PageLoad = async ({ params, url, fetch }) => {
	const roomId = params.id;
	const name = url.searchParams.get('name') || 'Player';
	const server = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';

	let initialState: GameState | null = null;
	try {
		const res = await fetch(`${server}/api/rooms/${roomId}`);
		if (res.ok) {
			initialState = await res.json();
		}
	} catch (e) {
		console.error('Failed to fetch initial game state:', e);
	}

	return {
		roomId,
		name,
		initialState
	};
};
