import type { Env } from './env';

export interface RoomRecord {
	id: string;
	name: string;
	player_count: number;
	status: 'waiting' | 'playing' | 'finished';
	created_at: string;
}

// In-memory fallback for environments without Turso
const memoryRooms: Map<string, RoomRecord> = new Map();

function makeClient(env: Env) {
	const { TURSO_URL, TURSO_AUTH_TOKEN } = env;
	if (!TURSO_URL) return null;

	const url = new URL(TURSO_URL);
	const params = new URLSearchParams();
	if (TURSO_AUTH_TOKEN) params.set('authToken', TURSO_AUTH_TOKEN);
	url.search = params.toString();

	return {
		execute: async (sql: string, args?: unknown[]) => {
			const resp = await fetch(url.toString(), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sql, args }),
			});
			if (!resp.ok) throw new Error(`Turso error: ${resp.status}`);
			return resp.json();
		},
	};
}

export class RoomDB {
	private env: Env;

	constructor(env: Env) {
		this.env = env;
	}

	async createRoom(id: string, name: string): Promise<void> {
		const client = makeClient(this.env);
		if (!client) {
			memoryRooms.set(id, {
				id,
				name,
				player_count: 0,
				status: 'waiting',
				created_at: new Date().toISOString(),
			});
			return;
		}

		await client.execute(
			`INSERT INTO rooms (id, name, player_count, status) VALUES (?, ?, 0, 'waiting')`,
			[id, name],
		);
	}

	async listRooms(): Promise<RoomRecord[]> {
		const client = makeClient(this.env);
		if (!client) {
			return Array.from(memoryRooms.values())
				.filter((r) => r.status === 'waiting')
				.sort((a, b) => b.created_at.localeCompare(a.created_at))
				.slice(0, 20);
		}

		const result = (await client.execute(
			`SELECT id, name, player_count, status, created_at FROM rooms WHERE status = 'waiting' ORDER BY created_at DESC LIMIT 20`,
		)) as { rows: RoomRecord[] };

		return result.rows ?? [];
	}

	async updatePlayerCount(id: string, count: number): Promise<void> {
		const client = makeClient(this.env);
		if (!client) {
			const room = memoryRooms.get(id);
			if (room) {
				room.player_count = count;
			}
			return;
		}

		await client.execute(`UPDATE rooms SET player_count = ? WHERE id = ?`, [count, id]);
	}

	async updateStatus(id: string, status: 'waiting' | 'playing' | 'finished'): Promise<void> {
		const client = makeClient(this.env);
		if (!client) {
			const room = memoryRooms.get(id);
			if (room) {
				room.status = status;
			}
			return;
		}

		await client.execute(`UPDATE rooms SET status = ? WHERE id = ?`, [status, id]);
	}
}
