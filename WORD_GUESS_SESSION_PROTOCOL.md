# Word Guess session protocol draft (0.6.4)

This file documents dormant groundwork only. The current game still runs as the existing local/classic single-player mode and the UI is unchanged.

## Goals

- Classic and timed Word Guess sessions.
- 1 local player today; 2–5 players when server play is enabled.
- `realtime` mode: players participate in the same live session.
- `turn-based` mode: the server advances the active player after an accepted turn/event.
- One event envelope for local, realtime and turn-based play.

## Client session model

`wordguess-session.js` exposes `window.MovohraySession` with:

- `createSession(options)`
- `start(session, now)`
- `getRemainingMs(session, now)`
- `createEvent(session, type, payload)`
- `createTransport(options)`

Supported prepared options:

- `playMode`: `classic` | `timed`
- `syncMode`: `solo` | `realtime` | `turn-based`
- `transport`: `local` | `server`
- `playerCount`: 1–5
- `timeLimitSeconds`: active only for `timed`

The existing app starts a `classic / solo / local` session, so this abstraction does not change current gameplay.

## Event envelope

Future client → server events use a stable envelope:

```json
{
  "schemaVersion": 1,
  "eventId": "event-...",
  "sessionId": "wg-...",
  "sequence": 3,
  "playerId": "player-2",
  "turnIndex": 1,
  "type": "guess",
  "payload": {},
  "createdAt": "2026-08-16T00:00:00.000Z"
}
```

Suggested event types:

- `player.join`
- `player.ready`
- `game.start`
- `guess.submit`
- `guess.result`
- `hint.use`
- `turn.advance`
- `timer.sync`
- `game.finish`
- `player.leave`

## Server authority

When multiplayer is implemented, the server should be authoritative for:

- lobby/session membership;
- player order and active turn;
- target selection;
- validation of submitted guesses;
- timer start/deadline for timed games;
- final result and score.

The target word should not be sent to non-host clients before the round is finished. Timed mode should use a server deadline rather than trusting the client's local clock.

## Suggested HTTP / realtime boundary

Possible first version:

- `POST /api/wordguess/sessions` — create a lobby/session.
- `POST /api/wordguess/sessions/{id}/join` — join by code.
- `GET /api/wordguess/sessions/{id}` — current snapshot/reconnect.
- WebSocket `/ws/wordguess/{id}` — events for realtime play.

A turn-based implementation can initially use the same event schema over ordinary HTTP/polling and later switch transports without changing game events.

## Compatibility rule

Keep gameplay state separate from rendering. New multiplayer/timed options should first select a session configuration; existing local/classic setup remains the default until the new UI is deliberately enabled.
