import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './env';
import { RoomDB } from './db';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

app.get('/api/health', (c) => c.json({ ok: true }));

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
