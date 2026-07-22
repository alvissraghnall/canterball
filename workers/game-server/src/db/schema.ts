import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
	isAnonymous: integer('isAnonymous', { mode: 'boolean' }),
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp' }),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});

export const rooms = sqliteTable('rooms', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	player_count: integer('player_count').notNull().default(0),
	status: text('status', { enum: ['waiting', 'playing', 'finished'] })
		.notNull()
		.default('waiting'),
	created_at: text('created_at').notNull(),
});

export const matchResults = sqliteTable('match_results', {
	id: text('id').primaryKey(),
	room_id: text('room_id').notNull(),
	home_player_id: text('home_player_id').notNull(),
	away_player_id: text('away_player_id').notNull(),
	home_player_name: text('home_player_name').notNull(),
	away_player_name: text('away_player_name').notNull(),
	winner: text('winner', { enum: ['HOME', 'AWAY', 'DRAW'] }).notNull(),
	home_score: integer('home_score').notNull(),
	away_score: integer('away_score').notNull(),
	created_at: text('created_at').notNull(),
});
