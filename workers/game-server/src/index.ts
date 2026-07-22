import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './env';
import { RoomDB } from './db';
import { getAuth } from './auth';

type Variables = {
	user: ReturnType<typeof getAuth> extends { $Infer: { Session: { user: infer U } } }
		? U | null
		: any;
	session: ReturnType<typeof getAuth> extends { $Infer: { Session: { session: infer S } } }
		? S | null
		: any;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use(
	'/*',
	cors({
		origin: (origin) => origin,
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
		exposeHeaders: ['Content-Length', 'Set-Cookie'],
		credentials: true,
	}),
);

app.on(['POST', 'GET', 'OPTIONS'], '/api/auth/*', (c) => {
	const auth = getAuth(c.env);
	return auth.handler(c.req.raw);
});

app.use('*', async (c, next) => {
	const auth = getAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (session) {
		c.set('user', session.user);
		c.set('session', session.session);
	} else {
		c.set('user', null);
		c.set('session', null);
	}
	await next();
});

app.get('/api/health', (c) => c.json({ ok: true, user: c.get('user') }));

const routes = app
	.get('/api/rooms', async (c) => {
		const db = new RoomDB(c.env);
		const rooms = await db.listRooms();
		return c.json(rooms);
	})
	.post(
		'/api/rooms',
		zValidator('json', z.object({ name: z.string().optional() })),
		async (c) => {
			const { name } = c.req.valid('json');
			const roomId = crypto.randomUUID().slice(0, 8);
			const roomName = name ?? `Room ${roomId}`;

			const db = new RoomDB(c.env);
			await db.createRoom(roomId, roomName);

			return c.json({ id: roomId, name: roomName, status: 'waiting' }, 201);
		},
	)
	.get('/api/rooms/:id', async (c) => {
		const roomId = c.req.param('id');
		const doId = c.env.ROOMS.idFromName(roomId);
		const stub = c.env.ROOMS.get(doId);
		const res = await stub.fetch('http://do/state');
		return c.json(await res.json());
	})
	.get('/api/leaderboard', async (c) => {
		const db = new RoomDB(c.env);
		const leaderboard = await db.getLeaderboard();
		return c.json(leaderboard);
	})
	.get('/api/stats/:playerId', async (c) => {
		const playerId = c.req.param('playerId');
		const db = new RoomDB(c.env);
		const stats = await db.getPlayerStats(playerId);
		return c.json(stats);
	})
	.get('/api/history/:playerId', async (c) => {
		const playerId = c.req.param('playerId');
		const db = new RoomDB(c.env);
		const history = await db.getMatchHistory(playerId);
		return c.json(history);
	})
	.get('/api/online-count', async (c) => {
		const db = new RoomDB(c.env);
		const count = await db.getOnlineCount();
		return c.json({ count });
	});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = app.get('/ws', (c) => {
	const roomId = c.req.query('room');
	const name = c.req.query('name');

	if (!roomId || !name) {
		return c.body('room and name required', 400);
	}

	const doId = c.env.ROOMS.idFromName(roomId);
	const stub = c.env.ROOMS.get(doId);

	const url = new URL(c.req.url);
	url.search = `?name=${encodeURIComponent(name)}`;
	// #tw-ignore
	return stub.fetch(new Request(url, { headers: c.req.raw.headers }) as any) as any;
});

export { RoomDO } from './room-do';
export type AppType = typeof routes;

export default app;
