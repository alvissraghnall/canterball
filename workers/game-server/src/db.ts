import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import type { Env } from './env';
import * as schema from './schema';
import { eq, desc } from 'drizzle-orm';

export function getDb(env: Env) {
	const client = createClient({
		url: env.TURSO_URL!,
		authToken: env.TURSO_AUTH_TOKEN,
	});
	return drizzle(client, { schema });
}

export class RoomDB {
	private env: Env;

	constructor(env: Env) {
		this.env = env;
	}

	async createRoom(id: string, name: string): Promise<void> {
		const db = getDb(this.env);
		await db.insert(schema.rooms).values({
			id,
			name,
			player_count: 0,
			status: 'waiting',
			created_at: new Date().toISOString(),
		});
	}

	async listRooms() {
		const db = getDb(this.env);
		return await db.query.rooms.findMany({
			where: eq(schema.rooms.status, 'waiting'),
			orderBy: [desc(schema.rooms.created_at)],
			limit: 20,
		});
	}

	async updatePlayerCount(id: string, count: number): Promise<void> {
		const db = getDb(this.env);
		await db.update(schema.rooms).set({ player_count: count }).where(eq(schema.rooms.id, id));
	}

	async updateStatus(id: string, status: 'waiting' | 'playing' | 'finished'): Promise<void> {
		const db = getDb(this.env);
		await db.update(schema.rooms).set({ status }).where(eq(schema.rooms.id, id));
	}
}
