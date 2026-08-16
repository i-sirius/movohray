(function (global) {
  "use strict";

  const SESSION_SCHEMA_VERSION = 1;
  const DEFAULT_PLAYER_LIMIT = 5;

  function clampPlayerCount(value) {
    const number = Number(value) || 1;
    return Math.max(1, Math.min(DEFAULT_PLAYER_LIMIT, Math.round(number)));
  }

  function makeId(prefix) {
    return `${prefix || "session"}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function createSession(options) {
    const settings = options || {};
    const playMode = settings.playMode === "timed" ? "timed" : "classic";
    const syncMode = settings.syncMode === "turn-based" || settings.syncMode === "realtime" ? settings.syncMode : "solo";
    const transport = settings.transport === "server" ? "server" : "local";
    const playerCount = clampPlayerCount(settings.playerCount);
    const timeLimitSeconds = playMode === "timed" ? Math.max(15, Number(settings.timeLimitSeconds) || 90) : 0;
    return {
      schemaVersion: SESSION_SCHEMA_VERSION,
      sessionId: String(settings.sessionId || makeId("wg")),
      game: String(settings.game || "wordguess"),
      playMode,
      syncMode,
      transport,
      playerCount,
      playerId: String(settings.playerId || "local-1"),
      turnIndex: 0,
      sequence: 0,
      timeLimitSeconds,
      startedAt: 0,
      serverEndpoint: String(settings.serverEndpoint || ""),
      status: "prepared",
    };
  }

  function start(session, now) {
    if (!session) return null;
    session.startedAt = Number(now) || Date.now();
    session.status = "running";
    return session;
  }

  function getRemainingMs(session, now) {
    if (!session || session.playMode !== "timed" || !session.timeLimitSeconds || !session.startedAt) return null;
    return Math.max(0, session.timeLimitSeconds * 1000 - ((Number(now) || Date.now()) - session.startedAt));
  }

  function createEvent(session, type, payload) {
    if (!session) return null;
    session.sequence = (Number(session.sequence) || 0) + 1;
    return {
      schemaVersion: SESSION_SCHEMA_VERSION,
      eventId: makeId("event"),
      sessionId: session.sessionId,
      sequence: session.sequence,
      playerId: session.playerId,
      turnIndex: Number(session.turnIndex) || 0,
      type: String(type || "event"),
      payload: payload || {},
      createdAt: new Date().toISOString(),
    };
  }

  function createTransport(options) {
    const settings = options || {};
    const kind = settings.kind === "server" ? "server" : "local";
    if (kind === "local") {
      return {
        kind: "local",
        connected: true,
        connect: function () { return Promise.resolve({ connected: true, kind: "local" }); },
        send: function () { return Promise.resolve({ accepted: true, local: true }); },
        close: function () {},
      };
    }
    return {
      kind: "server",
      connected: false,
      endpoint: String(settings.endpoint || ""),
      connect: function () { return Promise.resolve({ connected: false, reason: "server-not-configured" }); },
      send: function () { return Promise.resolve({ accepted: false, reason: "server-not-configured" }); },
      close: function () {},
    };
  }

  global.MovohraySession = Object.freeze({
    schemaVersion: SESSION_SCHEMA_VERSION,
    maxPlayers: DEFAULT_PLAYER_LIMIT,
    createSession,
    start,
    getRemainingMs,
    createEvent,
    createTransport,
  });
})(window);
