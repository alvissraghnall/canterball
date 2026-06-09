import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { RoomDB } from './db';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

app.get('/api/health', (c) => c.json({ ok: true }));

app.get('/api/rooms', async (c) => {
  const db = new RoomDB(c.env);
  const rooms = await db.listRooms();
  return c.json(rooms);
});

app.post('/api/rooms', async (c) => {
  const body = await c.req.json<{ name?: string }>();
  const roomId = crypto.randomUUID().slice(0, 8);
  const roomName = body.name ?? `Room ${roomId}`;

  const db = new RoomDB(c.env);
  await db.createRoom(roomId, roomName);

  return c.json({ id: roomId, name: roomName, status: 'waiting' }, 201);
});

app.get('/api/rooms/:id', async (c) => {
  const roomId = c.req.param('id');
  const doId = c.env.ROOMS.idFromName(roomId);
  const stub = c.env.ROOMS.get(doId);
  return stub.fetch('http://do/state');
});

app.get('/ws', async (c) => {
  const roomId = c.req.query('room');
  const name = c.req.query('name');

  if (!roomId || !name) {
    return c.json({ error: 'room and name required' }, 400);
  }

  const doId = c.env.ROOMS.idFromName(roomId);
  const stub = c.env.ROOMS.get(doId);

  const url = new URL(c.req.url);
  url.search = `?name=${encodeURIComponent(name)}`;
  const doRequest = new Request(url.toString(), {
    headers: c.req.raw.headers,
  });

  return stub.fetch(doRequest);
});

export { RoomDO } from './room-do';

export default app;
