import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import type { Env } from './env';
import * as schema from './db/schema';
import { eq, desc, sql, count, or } from 'drizzle-orm';

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

	async recordMatchResult(result: {
		id: string;
		roomId: string;
		homePlayerId: string;
		awayPlayerId: string;
		homePlayerName: string;
		awayPlayerName: string;
		winner: 'HOME' | 'AWAY' | 'DRAW';
		homeScore: number;
		awayScore: number;
	}): Promise<void> {
		const db = getDb(this.env);
		await db.insert(schema.matchResults).values({
			id: result.id,
			room_id: result.roomId,
			home_player_id: result.homePlayerId,
			away_player_id: result.awayPlayerId,
			home_player_name: result.homePlayerName,
			away_player_name: result.awayPlayerName,
			winner: result.winner,
			home_score: result.homeScore,
			away_score: result.awayScore,
			created_at: new Date().toISOString(),
		});
	}

	async getPlayerStats(playerId: string) {
		const db = getDb(this.env);
		const results = await db
			.select({
				totalGames: count(),
				wins: sql<number>`CAST(SUM(CASE WHEN (${schema.matchResults.winner} = 'HOME' AND ${schema.matchResults.home_player_id} = ${playerId}) OR (${schema.matchResults.winner} = 'AWAY' AND ${schema.matchResults.away_player_id} = ${playerId}) THEN 1 ELSE 0 END) AS INTEGER)`,
				goalsScored: sql<number>`CAST(SUM(CASE WHEN ${schema.matchResults.home_player_id} = ${playerId} THEN ${schema.matchResults.home_score} WHEN ${schema.matchResults.away_player_id} = ${playerId} THEN ${schema.matchResults.away_score} ELSE 0 END) AS INTEGER)`,
				goalsConceded: sql<number>`CAST(SUM(CASE WHEN ${schema.matchResults.home_player_id} = ${playerId} THEN ${schema.matchResults.away_score} WHEN ${schema.matchResults.away_player_id} = ${playerId} THEN ${schema.matchResults.home_score} ELSE 0 END) AS INTEGER)`,
			})
			.from(schema.matchResults)
			.where(
				or(
					eq(schema.matchResults.home_player_id, playerId),
					eq(schema.matchResults.away_player_id, playerId),
				),
			);

		const stats = results[0];
		return {
			totalGames: stats.totalGames,
			wins: stats.wins,
			losses: stats.totalGames - stats.wins,
			goalsScored: stats.goalsScored,
			goalsConceded: stats.goalsConceded,
		};
	}

	async getLeaderboard(limit = 10) {
		const db = getDb(this.env);

		const homeWins = db
			.select({
				playerId: schema.matchResults.home_player_id,
				playerName: schema.matchResults.home_player_name,
				wins: count(),
			})
			.from(schema.matchResults)
			.where(eq(schema.matchResults.winner, 'HOME'))
			.groupBy(schema.matchResults.home_player_id)
			.as('home_wins');

		const awayWins = db
			.select({
				playerId: schema.matchResults.away_player_id,
				playerName: schema.matchResults.away_player_name,
				wins: count(),
			})
			.from(schema.matchResults)
			.where(eq(schema.matchResults.winner, 'AWAY'))
			.groupBy(schema.matchResults.away_player_id)
			.as('away_wins');

		const result = await db
			.select({
				playerId: sql<string>`COALESCE(${homeWins.playerId}, ${awayWins.playerId})`,
				playerName: sql<string>`COALESCE(${homeWins.playerName}, ${awayWins.playerName})`,
				wins: sql<number>`${homeWins.wins} + ${awayWins.wins}`,
			})
			.from(homeWins)
			.fullJoin(awayWins, eq(homeWins.playerId, awayWins.playerId))
			.orderBy(desc(sql<number>`${homeWins.wins} + ${awayWins.wins}`))
			.limit(limit);

		return result;
	}

	async getMatchHistory(playerId: string, limit = 20) {
		const db = getDb(this.env);
		return await db
			.select()
			.from(schema.matchResults)
			.where(
				or(
					eq(schema.matchResults.home_player_id, playerId),
					eq(schema.matchResults.away_player_id, playerId),
				),
			)
			.orderBy(desc(schema.matchResults.created_at))
			.limit(limit);
	}

	async getOnlineCount(): Promise<number> {
		const db = getDb(this.env);
		const result = await db
			.select({ total: sql<number>`COALESCE(SUM(${schema.rooms.player_count}), 0)` })
			.from(schema.rooms)
			.where(sql`${schema.rooms.status} != 'finished'`);
		return result[0]?.total ?? 0;
	}
}
