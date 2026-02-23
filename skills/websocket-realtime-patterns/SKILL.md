---
name: websocket-realtime-patterns
description: WebSocket and real-time communication patterns — native WebSocket, Socket.io, Phoenix Channels, managed services (Pusher/Ably), backpressure, security, and testing for low-latency bidirectional systems.
---
# WebSocket & Real-Time Communication Patterns
Low-latency bidirectional communication for live dashboards, chat, collaboration, and streaming updates.
> **Scope boundary**: This skill covers persistent connections and real-time push.
> For durable async message queues (RabbitMQ, Kafka, SQS), see `message-queue-patterns`.
## When to Activate
- Building chat, notifications, or collaborative editing features
- Choosing between WebSocket, SSE, and long-polling
- Implementing reconnection with exponential backoff
- Setting up Socket.io with auth, rooms, and horizontal scaling
- Adding real-time features to a Phoenix application (see also `elixir-phoenix-patterns`)
- Integrating managed real-time services (Pusher, Ably)
- Handling backpressure, rate limiting, and heartbeat on persistent connections
- Securing WebSocket upgrade handshakes
## Core Principles
1. **Connection is expensive, keep it alive** — reconnect with backoff; never let a transient failure kill the session
2. **Rooms over broadcast** — scope messages to the smallest audience; fan-out belongs in the server
3. **Authenticate on upgrade, authorize on every message** — the HTTP handshake is your gate; room checks happen per event
4. **Backpressure before you need it** — a single slow client must not stall the server; buffer, drop, or disconnect
5. **Idempotent handlers** — duplicate delivery is inevitable after reconnect; guard with message IDs
---
## 1. Protocol Fundamentals
| | WebSocket | SSE (EventSource) | Long-Polling |
|---|---|---|---|
| Direction | Full-duplex | Server-to-client | Simulated bidirectional |
| Transport | TCP + upgrade | HTTP/2 stream | Repeated HTTP requests |
| Binary data | Yes | No (text only) | Yes (base64) |
| Auto-reconnect | Manual | Built-in | Manual |
| Proxy compat | Needs upgrade support | Works everywhere | Works everywhere |
| Best for | Chat, games, collab | Live feeds, dashboards | Legacy/firewall envs |

**Rule of thumb**: SSE when you only push from server. WebSocket when the client sends frequently. Long-polling only as fallback.
---
## 2. Native WebSocket
### Browser Client with Reconnect (TypeScript)
```typescript
class ReconnectingSocket {
  private ws: WebSocket | null = null;
  private attempt = 0;
  private maxAttempt = 10;
  private handlers = new Map<string, Set<(data: unknown) => void>>();
  private pending: string[] = [];
  constructor(private url: string) { this.connect(); }
  private connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.attempt = 0;
      this.pending.forEach((m) => this.ws!.send(m));
      this.pending = [];
    };
    this.ws.onmessage = (ev) => {
      const { type, payload } = JSON.parse(ev.data);
      this.handlers.get(type)?.forEach((fn) => fn(payload));
    };
    this.ws.onclose = (ev) => { if (ev.code !== 1000) this.scheduleReconnect(); };
    this.ws.onerror = () => this.ws?.close();
  }
  private scheduleReconnect() {
    if (this.attempt >= this.maxAttempt) return;
    // Exponential backoff with jitter: 1s, 2s, 4s ... capped at 30s
    const base = Math.min(30_000, 1000 * 2 ** this.attempt);
    setTimeout(() => this.connect(), base + base * 0.3 * Math.random());
    this.attempt++;
  }
  send(type: string, payload: unknown) {
    const msg = JSON.stringify({ type, payload });
    this.ws?.readyState === WebSocket.OPEN ? this.ws.send(msg) : this.pending.push(msg);
  }
  on(type: string, fn: (data: unknown) => void) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(fn);
    return () => this.handlers.get(type)?.delete(fn);
  }
  close() { this.maxAttempt = 0; this.ws?.close(1000); }
}
```
### Node.js ws Server with Binary Messages
```typescript
import { WebSocketServer, WebSocket, RawData } from "ws";

const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", (ws: WebSocket) => {
  ws.binaryType = "arraybuffer";
  ws.on("message", (raw: RawData, isBinary: boolean) => {
    if (isBinary) {
      const buf = raw as Buffer;
      const msgType = new DataView(buf.buffer, buf.byteOffset).getUint8(0);
      handleBinaryMessage(ws, msgType, buf.subarray(1));
    } else {
      const { type, payload } = JSON.parse(raw.toString());
      handleTextMessage(ws, type, payload);
    }
  });
  const aliveSock = ws as WebSocket & { isAlive: boolean };
  aliveSock.isAlive = true;
  ws.on("pong", () => { aliveSock.isAlive = true; });
});
// Heartbeat — detect dead connections
const hb = setInterval(() => {
  for (const ws of wss.clients) {
    const a = ws as WebSocket & { isAlive: boolean };
    if (!a.isAlive) { ws.terminate(); continue; }
    a.isAlive = false; ws.ping();
  });
}, 30_000);
wss.on("close", () => clearInterval(hb));
```
---
## 3. Socket.io
### CORS + JWT Auth Middleware
```typescript
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import jwt from "jsonwebtoken";

const io = new Server(httpServer, {
  cors: { origin: ["https://app.example.com"], credentials: true },
  pingInterval: 25_000, pingTimeout: 20_000,
  maxHttpBufferSize: 1e6, // 1 MB
});
// JWT auth middleware — runs once on connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("missing token"));
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string };
    socket.data.userId = user.sub;
    socket.data.role = user.role;
    next();
  } catch { next(new Error("invalid token")); }
});
```
### Namespaces, Rooms, and Acknowledgements
```typescript
const chat = io.of("/chat");
chat.on("connection", (socket) => {
  const { userId } = socket.data;
  socket.join(`user:${userId}`);
  socket.on("join-room", async (roomId: string, ack) => {
    const allowed = await db.roomMembers.exists({ roomId, userId });
    if (!allowed) return ack({ error: "forbidden" });
    socket.join(`room:${roomId}`);
    ack({ ok: true });
    socket.to(`room:${roomId}`).emit("user-joined", { userId });
  });
  socket.on("message", (data: { roomId: string; text: string }, ack) => {
    if (!socket.rooms.has(`room:${data.roomId}`)) return ack({ error: "not in room" });
    const msg = { id: crypto.randomUUID(), userId, text: data.text, ts: Date.now() };
    chat.to(`room:${data.roomId}`).emit("message", msg);
    ack({ ok: true, id: msg.id });
  });
});
```
### Presence Tracking
```typescript
const presence = new Map<string, Set<string>>(); // roomId -> userIds
function trackPresence(roomId: string, userId: string) {
  if (!presence.has(roomId)) presence.set(roomId, new Set());
  presence.get(roomId)!.add(userId);
  chat.to(`room:${roomId}`).emit("presence", [...presence.get(roomId)!]);
}
function removePresence(roomId: string, userId: string) {
  presence.get(roomId)?.delete(userId);
  if (!presence.get(roomId)?.size) presence.delete(roomId);
  else chat.to(`room:${roomId}`).emit("presence", [...presence.get(roomId)!]);
}
```
### Redis Adapter for Horizontal Scaling
```typescript
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
// All emit/broadcast calls now fan out across nodes
```
---
## 4. Phoenix Channels
> For full Elixir/OTP context (GenServer, Supervision, Ecto), see `elixir-phoenix-patterns`.
### Channel Join with Auth, Push/Broadcast, and Presence
```elixir
defmodule MyAppWeb.GameChannel do
  use MyAppWeb, :channel
  alias MyAppWeb.Presence
  @impl true
  def join("game:" <> game_id, %{"token" => token}, socket) do
    case MyApp.Accounts.verify_token(token) do
      {:ok, user_id} ->
        if MyApp.Games.player?(game_id, user_id) do
          send(self(), :after_join)
          {:ok, assign(socket, game_id: game_id, user_id: user_id)}
        else
          {:error, %{reason: "not_a_player"}}
        end
      {:error, _} -> {:error, %{reason: "unauthorized"}}
    end
  end
  @impl true
  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user_id, %{online_at: System.system_time(:second), status: "active"})
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end
  @impl true
  def handle_in("move", %{"x" => x, "y" => y}, socket) do
    broadcast!(socket, "player_moved", %{user_id: socket.assigns.user_id, x: x, y: y})
    {:reply, :ok, socket}
  end
  @impl true
  def handle_in("ping", _payload, socket),
    do: {:reply, {:ok, %{ts: System.system_time(:millisecond)}}, socket}
end

defmodule MyAppWeb.Presence do
  use Phoenix.Presence, otp_app: :my_app, pubsub_server: MyApp.PubSub
end
```
---
## 5. Managed Services (Pusher / Ably)
### Server Auth Endpoint (TypeScript)
```typescript
import Pusher from "pusher";
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!, key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!, cluster: process.env.PUSHER_CLUSTER!, useTLS: true,
});
// POST /api/pusher/auth — called by client lib on subscribe
app.post("/api/pusher/auth", requireAuth, (req, res) => {
  const { socket_id, channel_name } = req.body;
  const userId = req.user.id;
  if (channel_name.startsWith("presence-")) {
    const pd = { user_id: userId, user_info: { name: req.user.name } };
    return res.json(pusher.authorizeChannel(socket_id, channel_name, pd));
  }
  if (channel_name.startsWith("private-")) {
    if (!checkChannelAccess(userId, channel_name)) return res.status(403).json({ error: "forbidden" });
    return res.json(pusher.authorizeChannel(socket_id, channel_name));
  }
  res.status(400).json({ error: "invalid channel" });
});
// Server-side trigger
await pusher.trigger("private-room-42", "new-message", { userId: "abc", text: "Hello" });
```
### Managed vs Self-Hosted
| | Managed (Pusher/Ably) | Self-Hosted (Socket.io/ws) |
|---|---|---|
| Setup time | Minutes | Hours to days |
| Scaling | Automatic | Manual (Redis adapter, LB) |
| Cost at scale | Per-message pricing | Server infrastructure |
| Protocol control | Limited | Full |
| Presence | Built-in | Custom implementation |
| Binary messages | Limited | Full support |
| Vendor lock-in | Yes | No |
| Best for | MVPs, <100k conn | High-volume, custom protocols |
---
## 6. Backpressure & Rate Limiting
### Token Bucket Per Connection (TypeScript)
```typescript
class ConnectionRateLimiter {
  private tokens: number;
  private lastRefill: number;
  constructor(private max = 20, private rate = 5) { this.tokens = max; this.lastRefill = Date.now(); }
  consume(): boolean {
    const now = Date.now();
    this.tokens = Math.min(this.max, this.tokens + ((now - this.lastRefill) / 1000) * this.rate);
    this.lastRefill = now;
    if (this.tokens <= 0) return false;
    this.tokens--;
    return true;
  }
}
const limiters = new WeakMap<WebSocket, ConnectionRateLimiter>();
wss.on("connection", (ws) => {
  limiters.set(ws, new ConnectionRateLimiter());
  ws.on("message", (data) => {
    if (!limiters.get(ws)!.consume()) {
      ws.send(JSON.stringify({ type: "error", payload: "rate_limited" })); return;
    }
    // Process message
  });
});
```
### Per-Client Buffer with Slow Consumer Disconnect
```typescript
class ClientBuffer {
  private queue: string[] = [];
  private readonly maxQueue = 500;
  enqueue(msg: string, ws: WebSocket): boolean {
    if (ws.bufferedAmount > 64 * 1024) {
      if (this.queue.length >= this.maxQueue) { ws.close(4008, "slow consumer"); return false; }
      this.queue.push(msg); return true;
    }
    while (this.queue.length > 0 && ws.bufferedAmount < 32 * 1024) ws.send(this.queue.shift()!);
    ws.send(msg); return true;
  }
}
```
### Heartbeat Timeout Detection (Elixir)
```elixir
defmodule MyApp.ConnectionMonitor do
  use GenServer
  @heartbeat_interval 30_000
  @timeout_threshold 90_000
  def start_link(opts), do: GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  def heartbeat(conn_id), do: GenServer.cast(__MODULE__, {:heartbeat, conn_id, System.monotonic_time(:millisecond)})
  @impl true
  def init(_) do
    Process.send_after(self(), :check_stale, @heartbeat_interval)
    {:ok, %{connections: %{}}}
  end
  @impl true
  def handle_cast({:heartbeat, id, ts}, state), do: {:noreply, put_in(state, [:connections, id], ts)}
  @impl true
  def handle_info(:check_stale, state) do
    now = System.monotonic_time(:millisecond)
    stale = for {id, ts} <- state.connections, now - ts > @timeout_threshold, do: id
    Enum.each(stale, &MyApp.Connections.force_disconnect/1)
    Process.send_after(self(), :check_stale, @heartbeat_interval)
    {:noreply, %{state | connections: Map.drop(state.connections, stale)}}
  end
end
```
---
## 7. Security
### JWT Validation on WebSocket Upgrade
```typescript
import { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
const wss = new WebSocketServer({ noServer: true });
httpServer.on("upgrade", (req: IncomingMessage, socket, head) => {
  // Origin validation
  if (!["https://app.example.com"].includes(req.headers.origin ?? "")) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n"); socket.destroy(); return;
  }
  // Token from query string
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");
  if (!token) { socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); socket.destroy(); return; }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    wss.handleUpgrade(req, socket, head, (ws) => {
      (ws as any).userId = user.sub;
      wss.emit("connection", ws, req);
    });
  } catch {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); socket.destroy();
  }
});
```
### Message Size and Room Membership Guards
```typescript
const MAX_PAYLOAD = 64 * 1024; // Also set wss maxPayload option
wss.on("connection", (ws) => {
  const joinedRooms = new Set<string>();
  ws.on("message", (raw) => {
    if (Buffer.byteLength(raw as Buffer) > MAX_PAYLOAD) { ws.close(1009, "too large"); return; }
    const { type, roomId, payload } = JSON.parse(raw.toString());
    if (type === "room:message" && !joinedRooms.has(roomId)) {
      ws.send(JSON.stringify({ type: "error", payload: "not_in_room" })); return;
    }
    // Process valid message
  });
});
```
---
## 8. Testing
### ws Integration Test (TypeScript / Vitest)
```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { WebSocketServer, WebSocket } from "ws";

describe("WebSocket server", () => {
  let wss: WebSocketServer;
  const PORT = 9123;
  beforeAll(() => {
    wss = new WebSocketServer({ port: PORT });
    wss.on("connection", (ws) => {
      ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "echo") ws.send(JSON.stringify({ type: "echo", payload: msg.payload }));
      });
    });
  });
  afterAll(() => wss.close());
  const connect = () => new Promise<WebSocket>((res, rej) => {
    const ws = new WebSocket(`ws://localhost:${PORT}`);
    ws.on("open", () => res(ws)); ws.on("error", rej);
  });
  const nextMsg = (ws: WebSocket) => new Promise<unknown>((res) =>
    ws.once("message", (raw) => res(JSON.parse(raw.toString())))
  );
  it("echoes messages back", async () => {
    const ws = await connect();
    const resp = nextMsg(ws);
    ws.send(JSON.stringify({ type: "echo", payload: "hello" }));
    expect(await resp).toEqual({ type: "echo", payload: "hello" });
    ws.close();
  });
  it("handles concurrent clients", async () => {
    const clients = await Promise.all([connect(), connect()]);
    const responses = clients.map(nextMsg);
    clients.forEach((c, i) => c.send(JSON.stringify({ type: "echo", payload: `msg-${i}` })));
    expect(await Promise.all(responses)).toEqual([
      { type: "echo", payload: "msg-0" }, { type: "echo", payload: "msg-1" },
    ]);
    clients.forEach((c) => c.close());
  });
});
```
### Socket.io Room Delivery Test (TypeScript / Vitest)
```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "http";
import { Server } from "socket.io";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";

describe("Socket.io chat namespace", () => {
  let ioServer: Server, httpServer: ReturnType<typeof createServer>;
  const PORT = 9124;
  beforeAll(async () => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    setupChatHandlers(ioServer);
    await new Promise<void>((resolve) => httpServer.listen(PORT, resolve));
  });
  afterAll(() => { ioServer.close(); httpServer.close(); });
  const client = (auth = {}) => new Promise<ClientSocket>((res) => {
    const c = ioClient(`http://localhost:${PORT}/chat`, { auth, transports: ["websocket"] });
    c.on("connect", () => res(c));
  });
  it("delivers to room members only", async () => {
    const [alice, bob, carol] = await Promise.all([
      client({ token: "alice-token" }), client({ token: "bob-token" }), client({ token: "carol-token" }),
    ]);
    await new Promise<void>((r) => alice.emit("join-room", "room-1", () => r()));
    await new Promise<void>((r) => bob.emit("join-room", "room-1", () => r()));
    const bobMsg = new Promise((res) => bob.on("message", res));
    const carolTimeout = new Promise((res) => {
      carol.on("message", () => res("unexpected"));
      setTimeout(() => res("timeout"), 200);
    });
    alice.emit("message", { roomId: "room-1", text: "hi" }, () => {});
    expect(await bobMsg).toMatchObject({ text: "hi" });
    expect(await carolTimeout).toBe("timeout");
    [alice, bob, carol].forEach((c) => c.disconnect());
  });
});
```
---
## 9. Checklist
- [ ] Protocol chosen based on direction (full-duplex vs server-push) and proxy constraints
- [ ] Client reconnects automatically with exponential backoff and jitter
- [ ] Messages queued during disconnect and replayed on reconnect
- [ ] Auth token validated during WebSocket upgrade handshake, not after
- [ ] Origin header checked on upgrade to prevent cross-site WebSocket hijacking
- [ ] Message size limited on both client and server (`maxPayload`, `maxHttpBufferSize`)
- [ ] Room/channel membership validated server-side on every inbound message
- [ ] Backpressure strategy in place: token bucket, buffer limit, or slow-consumer disconnect
- [ ] Heartbeat/ping-pong enabled with timeout to detect dead connections
- [ ] Horizontal scaling addressed (Redis adapter, Phoenix PubSub, managed service)
- [ ] Message handlers are idempotent -- safe to process duplicates after reconnect
- [ ] Integration tests cover connect, auth reject, message delivery, and concurrent clients
