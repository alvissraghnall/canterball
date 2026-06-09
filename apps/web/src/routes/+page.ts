import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const server = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';
	try {
		const res = await fetch(`${server}/api/rooms`);
		if (res.ok) {
			const rooms = await res.json();
			return { rooms };
		}
	} catch (e) {
		console.error('Failed to fetch rooms:', e);
	}

	return { rooms: [] };
};
