# Canter Ball

A browser-based tactical football game where two players control 11 puck-like pieces each, taking turns to maneuver and kick a ball across a pitch. Kinda like chess having a kid with football.

Built with SvelteKit, Hono, and Cloudflare Durable Objects.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit 2 + Svelte 5 (runes), Tailwind CSS 4, Canvas 2D |
| API | Hono (RPC client) |
| Backend | Cloudflare Workers + Durable Objects |
| Database | Turso (libSQL) via Drizzle ORM |
| Auth | better-auth (Google, GitHub, magic link, anonymous) |
| Shared | Pure TypeScript (types, constants, game logic) |
| Build | Vite 6, pnpm workspaces |

## Project Structure

```
canterball/
├── apps/web/               # SvelteKit frontend
│   └── src/
│       ├── lib/
│       │   ├── components/ # GameBoard.svelte (Canvas 2D renderer)
│       │   ├── game/       # WebSocket client, constants
│       │   └── stores/     # Svelte 5 reactive game state
│       └── routes/         # /, /lobby, /game/[id], /stats, /chat, /settings
├── packages/shared/        # Shared types, constants, protocol, board setup
├── workers/game-server/    # Hono API + Durable Object game room
│   └── src/
│       ├── game-state.ts   # Turn-based game state machine
│       ├── physics.ts      # Ball collision, shot paths, goal detection
│       ├── room-do.ts      # Durable Object WebSocket handler
│       └── db/             # Drizzle schema + migrations
```

## Game Rules

- **2 players**, each controlling 11 pieces (10 outfield + 1 goalie)
- **Turn-based**: players alternate moving one piece at a time
- **Movement**: click and drag a piece within its move radius (8 for players, 6 for goalies)
- **Kicking**: if your piece moves through the ball, it gets kicked in the direction of movement
- **Scoring**: push the ball into the opponent's goal to score
- **Kickoff**: after a goal, pieces reset; the ball must be kicked toward your own half
- **Game over**: first to score wins, or draw after 100 turns

### Planned Mechanics (not yet implemented)

- **Shots**: declare a shot with power for a directed ball trajectory with parabolic arc
- **Goalie window**: defending player gets a timed reaction window to reposition their goalie
- **Shot resolution**: goalie save, goal, or out-of-bounds

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/)
- A [Cloudflare](https://dash.cloudflare.com/) account (for deployment)

### Install

```sh
pnpm install
```

### Environment Variables

**Workers** (`workers/game-server/.dev.vars`):

```sh
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
BREVO_API_KEY=...
```

**Web** (`apps/web/.env`):

```sh
VITE_SERVER_URL=http://localhost:8787
PUBLIC_BETTER_AUTH_URL=http://localhost:5173
```

### Development

Start the backend (port 8787):

```sh
pnpm --filter @canterball/server dev
```

Start the frontend (port 5173):

```sh
pnpm --filter @canterball/web dev
```

### Typecheck

```sh
pnpm typecheck
```

### Build & Deploy

```sh
# Frontend (Cloudflare Pages)
pnpm --filter @canterball/web build

# Backend (Cloudflare Workers)
pnpm --filter @canterball/server deploy
```

## Architecture

### Server-Authoritative

All game logic runs in a Cloudflare Durable Object (`RoomDO`). The client sends move commands; the server validates, applies physics, and broadcasts the new state. No client can cheat.

### WebSocket Protocol

Communication between client and server uses JSON-serialized WebSocket messages:

**Client → Server**: `JOIN_ROOM`, `MOVE_PIECE`, `DECLARE_SHOT`, `REPOSITION_GOALIE`

**Server → Client**: `ROOM_JOINED`, `STATE_UPDATE`, `PLAYER_JOINED`, `GOALIE_WINDOW`, `SHOT_RESOLVED`, `GAME_OVER`, `ERROR`, `OPPONENT_DISCONNECTED`

### Canvas 2D Rendering

The game board renders on an 800x480 HTML5 Canvas. The field uses a 100x60 coordinate system with `fieldToCanvas()` / `canvasToField()` conversion functions. Pieces are gradient circles with hover/select states; the ball has a radial gradient with shadow.

### Shared Package

`@canterball/shared` contains types, constants (field dimensions, piece radii, formations), protocol definitions, and board initialization -- used by both client and server to stay in sync.
