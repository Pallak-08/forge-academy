/* Forge Academy lessons: FastAPI async, Node.js and Express, database design, PostgreSQL features,
   ORM performance, search engines, choosing databases, test strategy, message brokers, real-time */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 69, id: "fastapi-lessons", fills: "fastapi", title: "Python web APIs with FastAPI", level: 2,
  blurb: "Async endpoints, background work and WebSockets.",
  lessons: [
    {
      t: "Async, background tasks and WebSockets",
      sub: ["async endpoints", "BackgroundTasks", "WebSockets", "Lifespan events"],
      body: `<p>FastAPI runs on an <b>async</b> event loop (via Uvicorn). An <code>async def</code> endpoint can <code>await</code> slow I/O (database queries with async drivers, HTTP calls with httpx) and, while it waits, the same worker serves other requests. The rule: inside <code>async def</code>, only use non-blocking libraries. A blocking call (<code>requests.get</code>, <code>time.sleep</code>, a sync database driver, heavy CPU work) freezes every request on that worker. If a library is blocking, define the endpoint with plain <code>def</code>: FastAPI then runs it in a thread pool automatically. Use <code>asyncio.gather</code> to run independent awaits concurrently.</p>
<p><b>BackgroundTasks</b> run small jobs <i>after</i> the response is sent, such as sending a welcome email or writing an audit log, so users don't wait. They run in the same process, so they're lost if the server restarts and aren't suitable for heavy or critical work; use a real task queue (Celery, RQ, Arq, Dramatiq) for that.</p>
<p><b>WebSockets</b> keep a two-way connection open for real-time features: chat, live notifications, collaborative editing, progress updates. FastAPI's <code>@app.websocket</code> endpoints accept the connection, then loop receiving and sending messages. Authenticate during the handshake (a token in a query parameter or cookie), handle disconnects, and remember that with several server instances you need a shared channel (Redis pub/sub) to broadcast across them.</p>
<p><b>Lifespan events</b> run code once at startup and shutdown: create a database connection pool or HTTP client, load an ML model, then close them cleanly. Store shared resources on <code>app.state</code> or inject them with dependencies.</p>`,
      lang: "python",
      code: `import asyncio, json
from contextlib import asynccontextmanager
import httpx
from fastapi import BackgroundTasks, FastAPI, WebSocket, WebSocketDisconnect

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(timeout=10)        # one shared client: connection reuse
    yield                                                 # app runs here
    await app.state.http.aclose()                         # clean shutdown

app = FastAPI(lifespan=lifespan)

# Concurrent awaits: three API calls take as long as the slowest, not the sum
@app.get("/dashboard")
async def dashboard():
    http = app.state.http
    weather, news, rates = await asyncio.gather(
        http.get("https://api.example.com/weather"),
        http.get("https://api.example.com/news"),
        http.get("https://api.example.com/rates"),
    )
    return {"weather": weather.json(), "news": news.json(), "rates": rates.json()}

# Blocking library? Use plain def: FastAPI runs it in a thread pool
@app.get("/legacy-report")
def legacy_report():
    import time; time.sleep(2)                            # would freeze the loop inside async def
    return {"ok": True}

# Background task after the response
def send_welcome_email(email: str):
    print("sending welcome email to", email)              # in real life: call an email API

@app.post("/signup")
async def signup(email: str, background: BackgroundTasks):
    background.add_task(send_welcome_email, email)
    return {"status": "created"}                          # returned immediately

# WebSocket chat room (single instance; use Redis pub/sub to scale out)
rooms: dict[str, set[WebSocket]] = {}

@app.websocket("/ws/{room}")
async def chat(ws: WebSocket, room: str, token: str):
    if not verify_token(token):                           # authenticate at handshake
        await ws.close(code=1008); return
    await ws.accept()
    rooms.setdefault(room, set()).add(ws)
    try:
        while True:
            msg = await ws.receive_text()
            for peer in list(rooms[room]):
                await peer.send_text(json.dumps({"room": room, "text": msg}))
    except WebSocketDisconnect:
        rooms[room].discard(ws)`,
      ex: "Build a FastAPI app with: a lifespan-managed httpx client; an endpoint that calls three slow mock APIs concurrently with asyncio.gather (measure the time versus sequential awaits); a sign-up endpoint that queues a background email; and a WebSocket chat room with token authentication and a tiny HTML client. Then put time.sleep inside an async endpoint and show with a load test how it blocks other requests.",
      q: ["What happens if you call time.sleep(5) inside an async def FastAPI endpoint?", ["Only that request waits", "The event loop is blocked, so every other request on that worker also stalls for 5 seconds", "FastAPI converts it to async automatically", "It raises an error"], 1, "Blocking calls hold the event loop. Use await asyncio.sleep, an async library, or a plain def endpoint that runs in the thread pool."]
    }
  ]
});

COURSE.push({
  n: 70, id: "node-lessons", fills: "node", title: "Node.js and Express", level: 2,
  blurb: "JavaScript on the server, from the runtime to production.",
  lessons: [
    {
      t: "The Node.js runtime",
      sub: ["The event loop on the server", "Modules and npm", "File system and streams", "Environment and process"],
      body: `<p><b>Node.js</b> runs JavaScript outside the browser using the V8 engine plus <b>libuv</b>, which handles I/O asynchronously. Like the browser, Node runs your JavaScript on one thread with an <b>event loop</b>: network, file and timer operations are handed off, and their callbacks or promises resume when ready. This makes Node excellent for I/O-heavy servers handling many concurrent connections, but CPU-heavy work (image processing, big JSON parsing, hashing loops) blocks every request. Move it to <b>worker threads</b>, a job queue or another service.</p>
<p><b>Modules</b>: modern Node uses ES modules (<code>import</code>/<code>export</code>, with <code>"type": "module"</code> in package.json); older code uses CommonJS (<code>require</code>, <code>module.exports</code>). <b>npm</b> installs packages listed in package.json; the lock file pins exact versions (commit it; use <code>npm ci</code> in CI). <code>dependencies</code> are needed at runtime, <code>devDependencies</code> only for development. npm scripts (<code>npm run dev</code>) are the standard place for project commands. Node also has built-in modules: <code>node:fs</code>, <code>node:path</code>, <code>node:crypto</code>, <code>node:http</code>, and recent versions include a test runner, <code>fetch</code> and watch mode.</p>
<p><b>Streams</b> process data in chunks instead of loading everything into memory: reading a 5 GB log file, piping an upload to S3, compressing a response. <code>pipeline()</code> connects streams with proper error handling and backpressure.</p>
<p><b>process</b> gives access to the environment: <code>process.env</code> (configuration and secrets), <code>process.argv</code> (command-line arguments), <code>process.exit(code)</code>, and signals like <code>SIGTERM</code> for graceful shutdown. Node 20.6+ can load <code>.env</code> files with <code>--env-file</code>.</p>`,
      lang: "javascript",
      code: `// package.json: { "type": "module", "scripts": { "dev": "node --watch --env-file=.env src/index.js" } }
import { readFile, writeFile } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createInterface } from "node:readline";
import path from "node:path";

// Small files: read all at once (async: doesn't block the event loop)
const config = JSON.parse(await readFile(path.join(import.meta.dirname, "config.json"), "utf8"));

// Large files: stream line by line, constant memory even for 5 GB
async function countErrors(file) {
  const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  let errors = 0;
  for await (const line of rl) if (line.includes(" 500 ")) errors++;
  return errors;
}

// Compress a file with streams; pipeline handles errors and backpressure
await pipeline(createReadStream("access.log"), createGzip(), createWriteStream("access.log.gz"));

// Environment and arguments
const port = Number(process.env.PORT ?? 3000);
const [, , command = "help"] = process.argv;               // node src/index.js report
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

// Never block the loop with CPU work in a request handler: offload it
import { Worker } from "node:worker_threads";
function hashInWorker(data) {
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL("./hash-worker.js", import.meta.url), { workerData: data });
    w.once("message", resolve); w.once("error", reject);
  });
}`,
      ex: "Write a Node CLI (ES modules) that takes a log file path as an argument, streams it line by line to count status codes, writes a JSON summary with fs/promises, and gzips the original with pipeline. Generate a 1 GB test file and confirm memory stays low. Then compare a CPU-heavy loop run on the main thread versus a worker thread while a small HTTP server tries to respond.",
      q: ["Why is Node.js well suited to I/O-heavy servers but not CPU-heavy work in request handlers?", ["Node can't do math", "One event loop thread runs JavaScript; waiting on I/O is non-blocking, but long CPU work blocks all other requests", "Node has no threads at all", "CPU work requires TypeScript"], 1, "Async I/O lets one thread juggle thousands of connections. CPU-bound code monopolises that thread unless moved to workers or other services."]
    },
    {
      t: "Express fundamentals",
      sub: ["Routing and middleware", "Request validation with zod", "Error handling middleware", "Static files"],
      body: `<p><b>Express</b> is the most widely used Node web framework: minimal, with a huge ecosystem. (Fastify and Hono are faster modern alternatives with similar ideas.)</p>
<p><b>Routing</b> maps a method and path to a handler: <code>app.get("/users/:id", handler)</code>, with <code>req.params</code>, <code>req.query</code> and <code>req.body</code>. Group related routes with <code>express.Router()</code> and mount them (<code>app.use("/api/orders", ordersRouter)</code>).</p>
<p><b>Middleware</b> functions run in order for each request, each receiving <code>(req, res, next)</code>: they can modify the request, end the response, or call <code>next()</code> to continue. Everything is middleware: JSON body parsing (<code>express.json()</code>), CORS, logging, authentication, rate limiting. Order matters; register body parsing and auth before the routes that need them.</p>
<p><b>Validation</b>: never trust <code>req.body</code>. Validate with a <b>zod</b> schema in a reusable middleware, return 422 with field errors when invalid, and pass the parsed, typed data on.</p>
<p><b>Error handling</b>: Express recognises error-handling middleware by its four arguments <code>(err, req, res, next)</code>, registered last. Throw or <code>next(err)</code> from handlers (Express 5 also catches rejected promises from async handlers automatically), map known error types to status codes, log unexpected errors with details, and return a generic message so internal details don't leak to clients.</p>
<p><b>Static files</b>: <code>express.static("public")</code> serves files from a folder, useful for small apps and SPAs, though in production a CDN or reverse proxy usually serves static assets.</p>`,
      lang: "javascript",
      code: `import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json({ limit: "1mb" }));                 // body parsing, with a size limit

// Logging middleware
app.use((req, res, next) => {
  const start = performance.now();
  res.on("finish", () => console.log(req.method, req.originalUrl, res.statusCode, Math.round(performance.now() - start) + "ms"));
  next();
});

// Reusable validation middleware
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(422).json({ errors: result.error.flatten().fieldErrors });
  req.body = result.data;                                 // parsed and typed
  next();
};

class NotFoundError extends Error { status = 404; }

// Router for one resource
const notes = express.Router();
const NoteIn = z.object({ title: z.string().min(1).max(120), body: z.string().max(10_000).default("") });
const db = new Map();

notes.get("/", (req, res) => res.json([...db.values()]));
notes.get("/:id", (req, res) => {
  const note = db.get(req.params.id);
  if (!note) throw new NotFoundError("Note not found");
  res.json(note);
});
notes.post("/", validate(NoteIn), (req, res) => {
  const note = { id: crypto.randomUUID(), ...req.body, createdAt: new Date().toISOString() };
  db.set(note.id, note);
  res.status(201).json(note);
});

app.use("/api/notes", notes);
app.use(express.static("public"));                        // index.html, css, js

// 404 for unknown API routes, then the error handler (4 args, registered last)
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);                                     // full details in logs
  res.status(500).json({ error: "Something went wrong" }); // generic to clients
});

app.listen(process.env.PORT ?? 3000);`,
      ex: "Build an Express API for a bookmarks app with a router per resource, zod validation middleware, request logging, auth middleware that checks a bearer token, a 404 handler and a central error handler that maps custom errors to status codes. Write tests with supertest (or Node's test runner plus fetch) for valid input, invalid input, missing auth and an unexpected error.",
      q: ["How does Express identify error-handling middleware?", ["By its name", "It takes four arguments (err, req, res, next) and is registered after the routes", "It must be async", "It's set with app.error()"], 1, "Express treats a middleware function with four parameters as an error handler and routes errors to it."]
    },
    {
      t: "Databases from Node",
      sub: ["Prisma ORM", "Migrations", "Transactions", "Connection pooling"],
      body: `<p><b>Prisma</b> is a popular TypeScript ORM: you define models in <code>schema.prisma</code>, and Prisma generates a fully typed client, so queries are autocompleted and type-checked (<code>prisma.order.findMany({ where, include, orderBy })</code>). Alternatives: <b>Drizzle</b> (SQL-like and lightweight), Kysely (a type-safe query builder), TypeORM, or the plain <code>pg</code> driver with parameterised SQL.</p>
<p><b>Migrations</b> version your schema: <code>prisma migrate dev</code> compares the schema file with the database, generates a SQL migration file (commit it) and applies it locally; <code>prisma migrate deploy</code> applies pending migrations in CI or at deploy time. Review generated SQL for destructive changes, and use the expand-and-contract approach for renames on live systems.</p>
<p><b>Transactions</b> group writes that must succeed or fail together: placing an order must create the order, decrement stock and record the payment atomically. Prisma offers <code>$transaction</code> with an array of operations or an interactive callback. Keep transactions short and never call slow external APIs inside them.</p>
<p><b>Connection pooling</b>: opening a database connection is slow, and databases allow a limited number (Postgres often around 100). Create <b>one</b> client per process and reuse it; it maintains a pool. In serverless environments, where many short-lived function instances each open connections, use a pooler (PgBouncer, Supabase/Neon poolers, Prisma Accelerate) or the provider's serverless driver to avoid exhausting connections.</p>`,
      lang: "javascript",
      code: `// prisma/schema.prisma
// model User    { id String @id @default(cuid()) email String @unique orders Order[] }
// model Product { id String @id @default(cuid()) name String stock Int priceP Int }
// model Order   { id String @id @default(cuid()) userId String user User @relation(fields: [userId], references: [id])
//                 items OrderItem[] totalP Int status String @default("pending") createdAt DateTime @default(now()) }
// model OrderItem { id String @id @default(cuid()) orderId String order Order @relation(fields: [orderId], references: [id])
//                 productId String qty Int priceP Int }
//
// npx prisma migrate dev --name init      (creates prisma/migrations/<timestamp>_init/migration.sql)
// npx prisma migrate deploy               (in CI / at deploy)

// db.js : ONE client per process (it pools connections)
import { PrismaClient } from "@prisma/client";
export const prisma = globalThis.prisma ?? new PrismaClient({ log: ["warn", "error"] });
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;   // avoid new pools on hot reload

// Typed queries, with relations loaded in one go (no N+1)
const recent = await prisma.order.findMany({
  where: { userId, status: "paid" },
  include: { items: true },
  orderBy: { createdAt: "desc" },
  take: 20,
});

// Interactive transaction: all or nothing
export async function placeOrder(userId, lines) {        // lines: [{ productId, qty }]
  return prisma.$transaction(async (tx) => {
    let total = 0;
    for (const { productId, qty } of lines) {
      // conditional update: only succeeds if enough stock (prevents overselling under concurrency)
      const updated = await tx.product.updateMany({ where: { id: productId, stock: { gte: qty } },
                                                    data: { stock: { decrement: qty } } });
      if (updated.count === 0) throw new Error(\`Out of stock: \${productId}\`);   // rolls everything back
      const p = await tx.product.findUniqueOrThrow({ where: { id: productId } });
      total += p.priceP * qty;
    }
    return tx.order.create({
      data: { userId, totalP: total, items: { create: await Promise.all(lines.map(async (l) =>
        ({ productId: l.productId, qty: l.qty, priceP: (await tx.product.findUniqueOrThrow({ where: { id: l.productId } })).priceP }))) } },
      include: { items: true },
    });
  });
}

// Graceful shutdown closes the pool
process.on("SIGTERM", async () => { await prisma.$disconnect(); process.exit(0); });`,
      ex: "Add Prisma with PostgreSQL (Docker) to an Express API: models for users, products and orders, an initial migration and a second migration that adds a column. Implement order placement in a transaction that can't oversell stock, and test it by firing 20 concurrent orders for a product with 5 in stock. Log queries to verify list endpoints don't cause N+1 queries.",
      q: ["Why create a single Prisma (or pg Pool) client per process instead of one per request?", ["It's required by JavaScript", "The client maintains a connection pool; creating clients per request opens too many slow connections and can exhaust the database's limit", "Single clients are more secure", "Prisma can't create more than one client"], 1, "Connections are expensive and limited. Reusing a pooled client keeps latency low and protects the database."]
    },
    {
      t: "Production Node",
      sub: ["Logging with pino", "Graceful shutdown", "Clustering and PM2", "Security headers with helmet"],
      body: `<p><b>Logging</b>: <code>console.log</code> is slow and unstructured. <b>pino</b> writes fast JSON logs with levels, and <code>pino-http</code> adds a log line per request with timing and a request ID. Use child loggers to attach context, redact secrets (<code>authorization</code> headers, passwords), and pretty-print only in development.</p>
<p><b>Graceful shutdown</b>: when a deploy or autoscaler stops a container, it sends <code>SIGTERM</code> and waits a grace period before killing it. Handle it: stop accepting new connections (<code>server.close()</code>), let in-flight requests finish, close database pools and queue consumers, then exit. Without this, every deploy drops some requests. Fail health checks during shutdown so the load balancer stops sending traffic first.</p>
<p><b>Using all CPU cores</b>: one Node process uses one core for JavaScript. Options: run several processes, either with the <code>cluster</code> module, with <b>PM2</b> (a process manager that also restarts crashed processes, reloads with zero downtime and manages logs) on a VM, or, in containers and Kubernetes, simply run more replicas and let the orchestrator handle restarts and load balancing.</p>
<p><b>Security</b>: <b>helmet</b> sets security headers (Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, frame protection). Also: rate limiting (<code>express-rate-limit</code>), body size limits, CORS with an allow-list, <code>app.disable("x-powered-by")</code>, input validation everywhere, <code>npm audit</code> in CI, running as a non-root user, and keeping Node on a supported LTS version.</p>
<p>Handle <code>unhandledRejection</code> and <code>uncaughtException</code> by logging and exiting: the process may be in a broken state, and the orchestrator will start a fresh one.</p>`,
      lang: "javascript",
      code: `import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import { prisma } from "./db.js";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password"],
  transport: process.env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
});

const app = express();
app.disable("x-powered-by");
app.use(helmet());                                         // security headers
app.use(pinoHttp({ logger, genReqId: (req) => req.headers["x-request-id"] ?? crypto.randomUUID() }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7" }));

let shuttingDown = false;
app.get("/health/ready", (req, res) => res.status(shuttingDown ? 503 : 200).send(shuttingDown ? "draining" : "ok"));
app.get("/api/orders", async (req, res) => {
  req.log.info({ userId: req.user?.id }, "listing orders");   // child logger with request id
  res.json(await prisma.order.findMany({ take: 20 }));
});

const server = app.listen(process.env.PORT ?? 3000, () => logger.info("listening"));

// Graceful shutdown
async function shutdown(signal) {
  logger.info({ signal }, "shutting down");
  shuttingDown = true;                                     // readiness fails -> LB stops sending traffic
  server.close(async () => {                               // finish in-flight requests
    await prisma.$disconnect();
    logger.info("closed cleanly");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 25_000).unref();       // hard stop before the orchestrator kills us
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("unhandledRejection", (err) => { logger.fatal({ err }, "unhandled rejection"); process.exit(1); });

// On a VM with PM2 (one process per core, zero-downtime reloads):
//   pm2 start src/index.js -i max --name api && pm2 reload api && pm2 logs api`,
      ex: "Harden an Express API for production: pino logging with request IDs and redaction, helmet, rate limiting, readiness and liveness endpoints, and graceful shutdown. Prove shutdown works by running a load test (k6 or autocannon) while sending SIGTERM: no requests should fail. Then run it under PM2 in cluster mode and do a zero-downtime reload during the load test.",
      q: ["Why handle SIGTERM in a Node server?", ["To make the server start faster", "To stop accepting new requests, finish in-flight ones and close connections before exiting, so deploys don't drop requests", "SIGTERM is required for logging", "To disable helmet"], 1, "Orchestrators send SIGTERM before stopping containers. Graceful handling turns restarts and deploys into zero-error events."]
    }
  ]
});

COURSE.push({
  n: 71, id: "sql-lessons", fills: "sql", title: "SQL and relational databases", level: 2,
  blurb: "Designing schemas well and using PostgreSQL's power features.",
  lessons: [
    {
      t: "Database design and normalisation",
      sub: ["Entities and relationships", "Normal forms in practice", "When to denormalise", "ER diagrams"],
      body: `<p>Good schema design starts from the domain: identify the <b>entities</b> (users, courses, enrolments, payments), their <b>attributes</b>, and the <b>relationships</b> between them:</p>
<ul><li><b>One-to-many</b>: a user has many orders, so <code>orders.user_id</code> references <code>users.id</code>.</li>
<li><b>Many-to-many</b>: students and courses, so a <b>junction table</b> <code>enrolments(student_id, course_id, enrolled_at)</code>, which often carries its own attributes.</li>
<li><b>One-to-one</b>: a user and their profile settings; often just columns on the same table.</li></ul>
<p><b>Normalisation</b> removes duplicated data so each fact is stored once, preventing update anomalies (changing a customer's email in one row but not in the 50 others). In practice: <b>1NF</b>, atomic values and no repeating groups (no <code>phone1, phone2, phone3</code> columns or comma-separated lists); <b>2NF</b>, no column depending on only part of a composite key; <b>3NF</b>, no column depending on another non-key column (store <code>city_id</code>, not city name plus city's state in every row). "Every non-key column depends on the key, the whole key and nothing but the key."</p>
<p><b>Denormalise deliberately</b> when reads dominate and joins become a measured bottleneck: store an order's total on the order row, keep a <code>comment_count</code> on posts, or snapshot a product's price into <code>order_items</code> (this one is actually correct modelling, since the historical price must not change when the product's price does). Keep denormalised data consistent with transactions, triggers or background jobs.</p>
<p>Use <b>constraints</b> to enforce rules in the database itself: primary keys, foreign keys, <code>NOT NULL</code>, <code>UNIQUE</code> and <code>CHECK</code>. Sketch an <b>ER diagram</b> (dbdiagram.io, Mermaid, draw.io) before building: it's the fastest way to spot missing relationships.</p>`,
      lang: "sql",
      code: `-- Learning platform schema (PostgreSQL), normalised with deliberate snapshots

CREATE TABLE users (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE courses (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  price_paise integer NOT NULL CHECK (price_paise >= 0)
);

-- many-to-many with its own attributes
CREATE TABLE enrolments (
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   bigint NOT NULL REFERENCES courses(id),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  progress    smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  PRIMARY KEY (user_id, course_id)               -- a student enrols in a course once
);

CREATE TABLE orders (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id),
  total_paise integer NOT NULL,                   -- denormalised for fast listing; set in the same transaction
  status      text NOT NULL CHECK (status IN ('pending','paid','refunded')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  order_id    bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  course_id   bigint NOT NULL REFERENCES courses(id),
  price_paise integer NOT NULL,                   -- snapshot: the price at purchase time, by design
  PRIMARY KEY (order_id, course_id)
);
CREATE INDEX ON orders (user_id, created_at DESC);  -- "my orders, newest first"

-- Anti-patterns this avoids:
--   users(phone1, phone2, phone3)            -> separate user_phones table (1NF)
--   enrolments(..., course_title)            -> title depends on course, not enrolment (3NF)
--   courses(tags = 'python,sql,api')         -> course_tags(course_id, tag) junction table`,
      ex: "Design the schema for a food delivery app (customers, restaurants, menu items, orders, order items, delivery partners, ratings). Draw the ER diagram, write the CREATE TABLE statements with keys and constraints, and justify each denormalisation you choose. Then write five realistic queries against it (with sample data) to check the design supports them.",
      q: ["Why store price_paise in order_items even though courses already has a price?", ["It's a normalisation mistake", "The price at purchase time is a separate fact; if the course price changes later, past orders must still show what was paid", "To make queries slower", "Foreign keys require it"], 1, "Historical values belong to the transaction. Snapshotting them is correct modelling, not harmful duplication."]
    },
    {
      t: "PostgreSQL features",
      sub: ["JSONB", "Full-text search", "Views and materialised views", "Constraints and triggers", "EXPLAIN ANALYZE"],
      body: `<p>PostgreSQL is far more than tables and joins, and knowing its features often saves adding another system.</p>
<p><b>JSONB</b> stores JSON in a binary, indexable form. Use it for genuinely flexible data (user settings, event payloads, product attributes that differ per category) alongside regular columns, not as a replacement for a schema. Query with <code>-&gt;</code> and <code>-&gt;&gt;</code>, test containment with <code>@&gt;</code>, and index with GIN indexes.</p>
<p><b>Full-text search</b>: <code>tsvector</code> (a processed document) and <code>tsquery</code> (a search query) handle stemming ("running" matches "run"), stop words and ranking. A generated <code>tsvector</code> column with a GIN index gives fast, decent search for many apps before you need Elasticsearch. The <code>pg_trgm</code> extension adds fuzzy matching for typos.</p>
<p><b>Views</b> save a query under a name (simplify reporting, hide columns). <b>Materialised views</b> store the result physically, ideal for expensive dashboard aggregates, refreshed on a schedule with <code>REFRESH MATERIALIZED VIEW CONCURRENTLY</code>.</p>
<p><b>Constraints</b> keep data valid regardless of which app writes it: <code>CHECK</code>, <code>UNIQUE</code> (including partial unique indexes, such as one active subscription per user), foreign keys and exclusion constraints (no overlapping bookings). <b>Triggers</b> run functions on insert, update or delete, such as maintaining <code>updated_at</code> or audit tables. Use them sparingly, as hidden logic can surprise developers.</p>
<p><b>EXPLAIN ANALYZE</b> runs a query and shows the actual plan: sequential scans versus index scans, join methods, row estimates versus actual rows, and time per step. It's the first tool for any slow query.</p>`,
      lang: "sql",
      code: `-- JSONB for flexible attributes
CREATE TABLE products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  attrs jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX products_attrs_gin ON products USING gin (attrs);
SELECT name, attrs->>'ram' AS ram FROM products WHERE attrs @> '{"brand": "Lenovo", "ram": "16GB"}';

-- Full-text search with a generated column
ALTER TABLE lessons ADD COLUMN search tsvector
  GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(body, '')), 'B')) STORED;
CREATE INDEX lessons_search_gin ON lessons USING gin (search);
SELECT title, ts_rank(search, q) AS rank
FROM lessons, websearch_to_tsquery('english', 'docker volumes -swarm') AS q
WHERE search @@ q ORDER BY rank DESC LIMIT 10;

-- Materialised view for a dashboard
CREATE MATERIALIZED VIEW daily_revenue AS
  SELECT date_trunc('day', created_at)::date AS day, sum(total_paise) AS revenue, count(*) AS orders
  FROM orders WHERE status = 'paid' GROUP BY 1;
CREATE UNIQUE INDEX ON daily_revenue (day);
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;   -- e.g. every 15 minutes

-- Partial unique index: only one active subscription per user
CREATE UNIQUE INDEX one_active_sub ON subscriptions (user_id) WHERE status = 'active';

-- Trigger: keep updated_at current
CREATE FUNCTION touch() RETURNS trigger AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;
CREATE TRIGGER products_touch BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION touch();

-- Read the actual plan
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
--  Limit (actual time=0.03..0.05 rows=20)
--    -> Index Scan using orders_user_id_created_at_idx on orders   <- good: no Seq Scan, no Sort`,
      ex: "In a local Postgres, load a few thousand rows of sample data and: add a JSONB attributes column with a GIN index and query it; build full-text search over titles and bodies with ranking; create a materialised view for daily totals; add a partial unique index; and use EXPLAIN ANALYZE to take one slow query from a sequential scan to an index scan, recording the timings.",
      q: ["When is a materialised view a good fit?", ["For data that must be exactly real-time", "For expensive aggregate queries that can be slightly stale and are read often, such as dashboards", "To replace all tables", "To store passwords"], 1, "A materialised view stores precomputed results. Reads become fast, at the cost of refreshing periodically."]
    }
  ]
});

COURSE.push({
  n: 72, id: "orm-lessons", fills: "orm", title: "ORMs and data access", level: 2,
  blurb: "Migrations and keeping ORM code fast.",
  lessons: [
    {
      t: "Migrations and performance",
      sub: ["Alembic migrations", "The N+1 query problem", "Eager vs lazy loading", "Bulk operations"],
      body: `<p><b>Alembic</b> manages schema migrations for SQLAlchemy. <code>alembic revision --autogenerate -m "add orders.status"</code> compares your models with the database and writes a migration script with <code>upgrade()</code> and <code>downgrade()</code> functions; review it (autogenerate misses some changes, like renames, which it sees as drop plus add), commit it, and run <code>alembic upgrade head</code> on deploy. Never edit a migration that has already run in production; add a new one.</p>
<p>The <b>N+1 query problem</b> is the most common ORM performance bug: you load a list of N orders (1 query), then access <code>order.customer</code> in a loop, and the ORM silently runs one more query per order (N queries). Fine with 5 rows in development; 501 queries in production. Detect it by logging SQL (<code>echo=True</code>), counting queries in tests, or using tools like Django Debug Toolbar or Sentry performance.</p>
<p><b>Eager loading</b> fixes it by loading related data up front: in SQLAlchemy, <code>selectinload</code> (a second query with <code>WHERE id IN (...)</code>, the best default for collections) or <code>joinedload</code> (a JOIN, good for many-to-one). Django has <code>select_related</code> and <code>prefetch_related</code>. <b>Lazy loading</b> (the default) loads relationships on first access, which is fine for single objects but dangerous in loops. In async SQLAlchemy, lazy loading raises errors, which forces you to be explicit.</p>
<p><b>Bulk operations</b>: inserting or updating thousands of rows one object at a time is very slow. Use bulk inserts (<code>insert().values([...])</code>, <code>session.execute(insert(Model), rows)</code>), set-based <code>UPDATE ... WHERE</code> statements instead of loading and modifying objects, Postgres <code>COPY</code> for very large loads, and upserts (<code>ON CONFLICT DO UPDATE</code>) for syncing data. Select only the columns you need for big reads.</p>`,
      lang: "python",
      code: `# models.py (SQLAlchemy 2.0)
from sqlalchemy import ForeignKey, String, select, update, func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, selectinload, joinedload

class Base(DeclarativeBase): pass
class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    orders: Mapped[list["Order"]] = relationship(back_populates="customer")
class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)
    total: Mapped[int]
    status: Mapped[str] = mapped_column(String(20), default="pending")
    customer: Mapped[Customer] = relationship(back_populates="orders")

# N+1: 1 query for orders + 1 per order for its customer
orders = session.scalars(select(Order).limit(100)).all()
emails = [o.customer.email for o in orders]                 # 100 extra queries!

# Fixed: eager load (2 queries total, or 1 with joinedload)
orders = session.scalars(select(Order).options(joinedload(Order.customer)).limit(100)).all()
customers = session.scalars(select(Customer).options(selectinload(Customer.orders))).all()

# Bulk insert: one round trip for 10,000 rows
session.execute(insert(Order), [{"customer_id": 1, "total": 999} for _ in range(10_000)])

# Set-based update instead of a load-modify-save loop
session.execute(update(Order).where(Order.status == "pending", Order.total == 0).values(status="cancelled"))

# Upsert (sync customers from a CSV)
stmt = insert(Customer).values(rows)
stmt = stmt.on_conflict_do_update(index_elements=[Customer.email], set_={"email": stmt.excluded.email})
session.execute(stmt); session.commit()

# A test that fails if a page starts doing N+1 queries
def test_orders_page_query_count(client, count_queries):
    with count_queries() as q:
        client.get("/orders")
    assert q.count <= 3

# Alembic
#   alembic revision --autogenerate -m "add orders.status"   -> review the generated script!
#   alembic upgrade head        alembic downgrade -1`,
      ex: "Set up Alembic for a SQLAlchemy project and create three migrations (initial schema, a new column with a default, an index). Seed 1,000 customers and 20,000 orders, write an endpoint that has an N+1 problem, log and count its queries, fix it with eager loading and compare the timings. Replace a row-by-row import with a bulk insert or COPY and measure the speed-up.",
      q: ["An endpoint lists 200 posts and shows each author's name. SQL logs show 201 queries. What's the fix?", ["Add more database RAM", "Eager-load authors (joinedload/selectinload or select_related) so they're fetched in one or two queries", "Cache the HTML", "Use a NoSQL database"], 1, "It's the N+1 pattern: one query for posts and one per author. Eager loading fetches the related rows together."]
    }
  ]
});

COURSE.push({
  n: 73, id: "nosql-lessons", fills: "nosql", title: "NoSQL and search", level: 2,
  blurb: "Search engines and how to choose the right database.",
  lessons: [
    {
      t: "Search engines",
      sub: ["Inverted indexes", "Elasticsearch / OpenSearch basics", "Relevance and analyzers", "Keeping search in sync"],
      body: `<p>Databases are built to find rows by exact values. Search engines are built to find <b>documents by words</b>, ranked by relevance, fast, with typo tolerance, highlighting and facets.</p>
<p>The core structure is the <b>inverted index</b>: like the index at the back of a book, it maps every term to the list of documents containing it ("docker" → docs 3, 17, 42). A query looks up its terms and combines the lists, which is fast even over millions of documents.</p>
<p><b>Elasticsearch</b> and its open-source fork <b>OpenSearch</b> are the standard engines: documents are JSON in an <b>index</b>, with a <b>mapping</b> defining field types (<code>text</code> for full-text search, <code>keyword</code> for exact filters and aggregations, numbers, dates). They scale horizontally with shards and replicas. Lighter alternatives: Meilisearch and Typesense (great developer experience for app search), and Postgres full-text search for simpler needs.</p>
<p><b>Analyzers</b> process text at index and query time: a tokenizer splits text into terms, then filters lowercase them, remove stop words, apply stemming ("deployments" → "deploy"), synonyms and language-specific rules. <b>Relevance</b> is scored with BM25 (rarer terms and terms matching in short fields count more), adjustable with field boosts (a title match outweighs a body match), recency or popularity, and fuzziness for typos.</p>
<p><b>Keeping search in sync</b>: the database remains the source of truth, and the search index is a derived copy. Options: index on write from the application (simple, but you can miss updates on failure); publish events or use the outbox pattern and have a consumer update the index; or <b>change data capture</b> (Debezium reading the database log). Always have a full reindex job, ideally into a new index behind an alias so you can switch with no downtime.</p>`,
      lang: "python",
      code: `# pip install opensearch-py   (same ideas apply to Elasticsearch)
from opensearchpy import OpenSearch, helpers
os_client = OpenSearch("http://localhost:9200")

# Mapping: text for search, keyword for exact filters and facets
os_client.indices.create(index="lessons_v1", body={
  "settings": {"analysis": {"analyzer": {"en": {"type": "english"}}}},   # stemming + stop words
  "mappings": {"properties": {
      "title":   {"type": "text", "analyzer": "en"},
      "body":    {"type": "text", "analyzer": "en"},
      "module":  {"type": "keyword"},
      "level":   {"type": "integer"},
      "updated": {"type": "date"}}}})
os_client.indices.put_alias(index="lessons_v1", name="lessons")   # apps always query the alias

# Bulk index from the database (source of truth)
helpers.bulk(os_client, ({"_index": "lessons", "_id": l["id"], **l} for l in fetch_lessons_from_db()))

# Relevance: title matches count 3x, typo tolerance, filter by module, facet counts, highlights
res = os_client.search(index="lessons", body={
  "query": {"bool": {
      "must": {"multi_match": {"query": "dokcer volumes", "fields": ["title^3", "body"], "fuzziness": "AUTO"}},
      "filter": [{"terms": {"module": ["docker", "kubernetes"]}}]}},
  "aggs": {"by_module": {"terms": {"field": "module"}}},
  "highlight": {"fields": {"body": {}}},
  "size": 10})
for hit in res["hits"]["hits"]:
    print(round(hit["_score"], 2), hit["_source"]["title"], hit.get("highlight", {}).get("body", [""])[0])

# Zero-downtime reindex: build lessons_v2, then atomically move the alias
# os_client.indices.update_aliases(body={"actions": [
#     {"remove": {"index": "lessons_v1", "alias": "lessons"}},
#     {"add":    {"index": "lessons_v2", "alias": "lessons"}}]})`,
      ex: "Run OpenSearch or Meilisearch in Docker and index a few thousand documents (Wikipedia abstracts, product listings or your own notes). Implement search with field boosts, typo tolerance, filters, facets and highlighting. Keep it in sync with a Postgres table by publishing changes from your API to a queue consumer, and implement a full reindex that switches an alias with no downtime.",
      q: ["Why use a keyword field (not text) for a 'category' you filter and count by?", ["keyword fields are encrypted", "keyword fields are stored as exact values, which suits filtering, sorting and aggregations, while text fields are analysed into terms for search", "text fields can't store strings", "keyword fields are faster to type"], 1, "Analysing 'Machine Learning' into terms breaks exact filters and facet counts. keyword keeps the value intact."]
    },
    {
      t: "Choosing a database",
      sub: ["Consistency models and CAP", "Read and write patterns", "Polyglot persistence", "A decision checklist"],
      body: `<p>There is no best database, only one that fits your data, access patterns, consistency needs and team.</p>
<p><b>Consistency models</b>: <b>strong consistency</b> means every read sees the latest write (what relational databases give on a single primary). <b>Eventual consistency</b> means replicas converge after a delay, so a read may briefly return old data (many distributed NoSQL stores, read replicas, caches). The <b>CAP theorem</b> says that during a network partition a distributed system must choose between consistency and availability; the more practical PACELC extension adds that even without partitions there's a trade-off between latency and consistency. Money, inventory and bookings usually need strong consistency; feeds, likes and analytics tolerate eventual consistency.</p>
<p><b>Access patterns</b> matter more than data size. Ask: Is it read-heavy or write-heavy? Lookups by key or ad-hoc queries and joins? Need transactions across entities? Time-ordered appends? Full-text search? Relationships many hops deep?</p>
<ul><li><b>Relational</b> (PostgreSQL, MySQL): the default for most apps. Transactions, joins, constraints, flexible queries, and they scale much further than people assume.</li>
<li><b>Document</b> (MongoDB, Firestore): flexible nested documents read and written as a unit.</li>
<li><b>Key-value</b> (Redis, DynamoDB): very fast lookups by key, caching, sessions, counters; DynamoDB at huge scale with designed access patterns.</li>
<li><b>Wide-column</b> (Cassandra, ScyllaDB): massive write throughput across regions.</li>
<li><b>Search</b> (Elasticsearch/OpenSearch), <b>time-series</b> (TimescaleDB, InfluxDB), <b>graph</b> (Neo4j), <b>vector</b> (pgvector, Qdrant, Pinecone) and <b>analytical</b> (BigQuery, ClickHouse, DuckDB).</li></ul>
<p><b>Polyglot persistence</b> uses several stores, each for what it does best (Postgres as the source of truth, Redis for caching, OpenSearch for search), but every extra system adds operations work and sync problems. Start with Postgres and add others when a real need appears.</p>`,
      lang: "text",
      code: `DATABASE DECISION CHECKLIST

1. What are the 5 most important queries / access patterns?
     e.g. "orders for a user, newest first", "search courses by text", "revenue by day"
2. Consistency: what breaks if a read is a few seconds stale?
     money / stock / bookings -> strong          likes / views / feeds -> eventual is fine
3. Shape and relationships: tabular + joins? nested documents? deep graph traversals?
4. Volume and growth: rows/day, total size in 1-2 years, read:write ratio, peak QPS
5. Query flexibility: known key lookups only, or ad-hoc filters and reports?
6. Operations: managed service available? backups, failover, team experience, cost
7. Can Postgres (+ an extension) do it?  JSONB, full-text, pgvector, TimescaleDB, PostGIS

WORKED EXAMPLE: online learning platform
  users, courses, enrolments, payments    -> PostgreSQL (transactions, joins, constraints)
  sessions, rate limits, leaderboard      -> Redis (TTL keys, sorted sets)
  course search with typos and facets     -> Postgres FTS first; OpenSearch/Meilisearch when it outgrows it
  lesson embeddings for an AI tutor       -> pgvector in the same Postgres
  clickstream analytics (billions of rows)-> events to object storage + BigQuery / ClickHouse
  video files                             -> object storage (S3) + CDN, never the database

SMELLS
  - choosing NoSQL "because it scales" without knowing the access patterns
  - a new database per feature (each adds backups, monitoring, sync, on-call)
  - storing large files or blobs in the primary database`,
      ex: "For three products (a ride-hailing app, a chat app and an analytics SaaS), apply the checklist: list the top access patterns, consistency needs and data volumes, and choose databases for each part with written justifications. Then pick one decision and argue the opposite choice in a paragraph, to practise seeing the trade-offs.",
      q: ["Which part of an e-commerce system most needs strong consistency?", ["The 'recently viewed' list", "Inventory and payment records", "Product view counters", "Recommendation scores"], 1, "Selling stock you don't have or double-charging causes real harm. Counters and recommendations tolerate brief staleness."]
    }
  ]
});

COURSE.push({
  n: 74, id: "testing-lessons", fills: "testing", title: "Automated testing", level: 2,
  blurb: "Designing a test suite that gives confidence at low cost.",
  lessons: [
    {
      t: "Test strategy",
      sub: ["The test pyramid", "Contract tests", "Test data management", "Coverage: useful and misleading"],
      body: `<p>A test suite's job is to let you change code confidently and quickly. That means catching real bugs, running fast, and not breaking on harmless refactors.</p>
<p>The <b>test pyramid</b>: many fast <b>unit tests</b> (pure logic, milliseconds each), fewer <b>integration tests</b> (your code with a real database, queue or HTTP layer), and a small number of <b>end-to-end tests</b> through the UI for critical user journeys (sign-up, checkout). Higher tests catch more realistic bugs but are slower, flakier and harder to debug. The "testing trophy" variant puts more weight on integration tests for web apps, since that's where many bugs live. Either way: test behaviour, not implementation details.</p>
<p><b>Contract tests</b> check that services agree on their APIs without spinning up the whole system. In consumer-driven contract testing (Pact), the consumer records the requests it makes and the responses it expects; the provider's CI verifies it still satisfies every consumer's contract. Schema-based checks (OpenAPI validation, schema diffing) catch breaking changes in pull requests.</p>
<p><b>Test data</b>: each test should create the data it needs and not depend on other tests or on order. Use factories (factory_boy, Fishery, test builders) with sensible defaults, wrap tests in transactions that roll back or reset the database between tests, use realistic but fake data (Faker), and never copy production personal data into test environments.</p>
<p><b>Coverage</b> shows which lines ran during tests, which helps find untested areas. But high coverage doesn't mean good tests: a test that runs code without meaningful assertions adds coverage and no safety. Treat coverage as a flashlight, not a target; focus on critical paths, edge cases and bug fixes (every fixed bug gets a regression test). Mutation testing (mutmut, Stryker) measures whether tests actually detect changes.</p>`,
      lang: "python",
      code: `# tests/factories.py : test data builders with sensible defaults
import factory
from app.models import User, Order
class UserFactory(factory.Factory):
    class Meta: model = User
    email = factory.Sequence(lambda n: f"user{n}@example.test")
    name = factory.Faker("name", locale="en_IN")
class OrderFactory(factory.Factory):
    class Meta: model = Order
    user = factory.SubFactory(UserFactory)
    total = 1499
    status = "pending"

# Unit test: pure logic, milliseconds, many cases
import pytest
from app.pricing import apply_coupon
@pytest.mark.parametrize("total,coupon,expected", [
    (1000, "SAVE10", 900), (1000, None, 1000), (50, "SAVE10", 45), (0, "SAVE10", 0)])
def test_apply_coupon(total, coupon, expected):
    assert apply_coupon(total, coupon) == expected

# Integration test: real Postgres (test container), each test in a rolled-back transaction
@pytest.fixture
def db_session(engine):
    conn = engine.connect(); tx = conn.begin()
    session = Session(bind=conn)
    yield session
    session.close(); tx.rollback(); conn.close()      # isolation: nothing leaks between tests

def test_refund_marks_order_and_restores_credit(db_session, client):
    order = OrderFactory(status="paid"); db_session.add(order); db_session.commit()
    r = client.post(f"/orders/{order.id}/refund")
    assert r.status_code == 200
    assert db_session.get(Order, order.id).status == "refunded"   # behaviour, not internals

# Contract test (provider side, Pact): verify consumer expectations in CI
# pact-verifier --provider-base-url=http://localhost:8000 \\
#   --pact-broker-url=$PACT_BROKER --provider=orders-api --publish-verification-results

# Coverage as a flashlight, not a target
#   pytest --cov=app --cov-report=term-missing   -> look at untested branches in critical modules`,
      ex: "Audit the tests of one of your projects: classify every test as unit, integration or end-to-end, note the slowest ten, and find the critical paths with no tests. Add factories, per-test database isolation, integration tests for two critical flows, a regression test for a past bug, and run a mutation-testing tool on one module to see which changes your tests miss.",
      q: ["A module has 95% line coverage. What does this guarantee?", ["The module has no bugs", "Very little: lines ran during tests, but the tests may not assert the right behaviour or cover edge cases", "All edge cases are handled", "The tests run fast"], 1, "Coverage measures execution, not verification. Assertions on behaviour and edge cases are what catch bugs."]
    }
  ]
});

COURSE.push({
  n: 75, id: "async-systems-lessons", fills: "async-systems", title: "Concurrency, queues and real-time", level: 3,
  blurb: "Brokers, event-driven design and real-time connections.",
  lessons: [
    {
      t: "Message brokers and event-driven design",
      sub: ["RabbitMQ vs Kafka", "Pub/sub", "Event-driven architecture", "Outbox pattern"],
      body: `<p>A <b>message broker</b> sits between services so they communicate asynchronously: the sender publishes a message and moves on; consumers process it when they can. This smooths traffic spikes, decouples services and lets slow work happen in the background.</p>
<p><b>RabbitMQ</b> is a traditional <b>message queue</b>: producers send messages to exchanges, which route them to queues; each message goes to one consumer in a group and is deleted after acknowledgement. Rich routing, per-message acknowledgements, retries and dead-letter queues make it ideal for <b>task distribution</b> (send emails, process uploads). <b>Kafka</b> is a distributed <b>log</b>: messages are appended to partitioned topics and kept for a retention period; each consumer group tracks its own position (offset), so many independent consumers can read the same stream and even replay history. It handles very high throughput and suits <b>event streaming</b>, analytics pipelines and event sourcing. Managed equivalents: Amazon SQS/SNS, Google Pub/Sub, Azure Service Bus.</p>
<p><b>Pub/sub</b>: a publisher sends a message to a topic and every subscriber gets a copy, whereas a queue gives each message to only one of the competing consumers. Most systems combine both: one event fans out to several services, each with its own queue of workers.</p>
<p>In an <b>event-driven architecture</b>, services publish facts about what happened (<code>OrderPlaced</code>, <code>PaymentFailed</code>) rather than calling each other directly. New features subscribe without touching the publisher. You must design for <b>at-least-once delivery</b> (consumers must be <b>idempotent</b>), retries with backoff, dead-letter queues, versioned event schemas, and observability across async hops.</p>
<p>The <b>outbox pattern</b> solves the dual-write problem: saving to the database and publishing to the broker are two operations, and if one fails you get inconsistency. Instead, write the event into an <code>outbox</code> table in the <b>same database transaction</b> as the business change; a relay process then publishes outbox rows to the broker and marks them sent.</p>`,
      lang: "python",
      code: `# Outbox pattern: business change + event in ONE transaction
import json, uuid
from sqlalchemy import text

def place_order(session, user_id: int, total: int) -> int:
    with session.begin():                                          # atomic
        order_id = session.execute(text(
            "INSERT INTO orders (user_id, total, status) VALUES (:u, :t, 'placed') RETURNING id"),
            {"u": user_id, "t": total}).scalar_one()
        session.execute(text(
            "INSERT INTO outbox (id, topic, payload) VALUES (:id, 'orders.placed', :p)"),
            {"id": str(uuid.uuid4()), "p": json.dumps({"order_id": order_id, "user_id": user_id, "total": total})})
    return order_id

# Relay: publish unsent outbox rows (run continuously or via CDC such as Debezium)
def relay(session, producer):
    rows = session.execute(text(
        "SELECT id, topic, payload FROM outbox WHERE sent_at IS NULL ORDER BY created_at LIMIT 100 "
        "FOR UPDATE SKIP LOCKED")).all()                           # several relays can run safely
    for r in rows:
        producer.send(r.topic, key=str(r.id).encode(), value=r.payload.encode())
    producer.flush()
    session.execute(text("UPDATE outbox SET sent_at = now() WHERE id = ANY(:ids)"), {"ids": [r.id for r in rows]})
    session.commit()

# Idempotent consumer: the same event may arrive twice
def handle_order_placed(session, event_id: str, payload: dict):
    with session.begin():
        inserted = session.execute(text(
            "INSERT INTO processed_events (event_id) VALUES (:e) ON CONFLICT DO NOTHING"), {"e": event_id}).rowcount
        if not inserted:
            return                                                 # already handled: skip
        send_confirmation_email(payload["user_id"], payload["order_id"])

# Kafka consumer group (confluent-kafka)
# c = Consumer({"bootstrap.servers": "localhost:9092", "group.id": "notifications",
#               "enable.auto.commit": False, "auto.offset.reset": "earliest"})
# c.subscribe(["orders.placed"])
# while True:
#     msg = c.poll(1.0)
#     if msg and not msg.error():
#         handle_order_placed(session, msg.key().decode(), json.loads(msg.value()))
#         c.commit(msg)                                           # commit offset only after success`,
      ex: "Build an order flow with Postgres, the outbox pattern and RabbitMQ or Kafka (Docker): placing an order writes the order and an outbox row in one transaction; a relay publishes events; two consumers (email and inventory) process them idempotently. Kill the relay mid-way and restart it, deliver an event twice on purpose, and show that nothing is lost or duplicated. Add a dead-letter queue for a consumer that always fails.",
      q: ["What problem does the outbox pattern solve?", ["Slow database queries", "Inconsistency when a database write succeeds but publishing the event fails (or the reverse), by saving the event in the same transaction", "Email deliverability", "Kafka partition rebalancing"], 1, "Writing the event row atomically with the business change guarantees it will eventually be published, without distributed transactions."]
    },
    {
      t: "WebSockets and real-time",
      sub: ["Polling vs SSE vs WebSockets", "Scaling connections", "Presence", "Reconnection"],
      body: `<p>Real-time features (chat, notifications, live dashboards, collaborative editing, delivery tracking) need the server to push updates. Options, from simplest:</p>
<ul><li><b>Polling</b>: the client asks every few seconds. Simple and works everywhere, but wasteful and delayed. Fine for low-frequency updates such as checking a report's status every 10 seconds.</li>
<li><b>Server-Sent Events (SSE)</b>: one long-lived HTTP response through which the server streams events to the client. One direction only (server to client), built-in automatic reconnection in browsers, works through most proxies. Ideal for notifications, live feeds and streaming LLM output.</li>
<li><b>WebSockets</b>: a full two-way connection upgraded from HTTP. Needed when clients send frequent messages too: chat, multiplayer games, collaborative editing.</li></ul>
<p><b>Scaling connections</b>: each open connection uses memory on a server, and users connected to different server instances must still receive each other's messages. Use a shared <b>pub/sub backplane</b> (Redis pub/sub, NATS, Kafka): each instance subscribes and forwards messages to its local connections. Load balancers must support long-lived connections (configure idle timeouts). Managed services (Pusher, Ably, Supabase Realtime, AWS API Gateway WebSockets, Cloudflare Durable Objects) remove much of this work.</p>
<p><b>Presence</b> (who's online, who's typing) is tracked with heartbeats: clients ping periodically, and the server stores "last seen" with a short expiry (Redis keys with TTL); missing heartbeats mean offline.</p>
<p><b>Reconnection</b>: connections drop constantly on mobile networks. Reconnect automatically with exponential backoff and jitter (so thousands of clients don't reconnect at the same instant after a deploy), resume from the last received event ID so nothing is missed (SSE's <code>Last-Event-ID</code>, or your own sequence numbers), and show connection status in the UI.</p>`,
      lang: "javascript",
      code: `// --- Server-Sent Events (Express): server -> client stream ---
app.get("/events", (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  res.flushHeaders();
  const lastId = Number(req.get("Last-Event-ID") ?? 0);            // resume after reconnect
  for (const ev of eventsSince(lastId)) res.write(\`id: \${ev.id}\\ndata: \${JSON.stringify(ev)}\\n\\n\`);
  const unsubscribe = bus.subscribe((ev) => res.write(\`id: \${ev.id}\\ndata: \${JSON.stringify(ev)}\\n\\n\`));
  const ping = setInterval(() => res.write(": ping\\n\\n"), 25_000);   // keep proxies from closing it
  req.on("close", () => { clearInterval(ping); unsubscribe(); });
});
// Browser: reconnection and Last-Event-ID are automatic
//   const es = new EventSource("/events"); es.onmessage = (e) => render(JSON.parse(e.data));

// --- WebSockets scaled across instances with Redis pub/sub (ws + ioredis) ---
import { WebSocketServer } from "ws";
import Redis from "ioredis";
const pub = new Redis(), sub = new Redis();
const wss = new WebSocketServer({ server });
sub.subscribe("chat");
sub.on("message", (_, msg) => {                                    // fan out to local sockets
  for (const client of wss.clients) if (client.readyState === 1) client.send(msg);
});
wss.on("connection", (ws, req) => {
  const user = authenticate(req);                                  // verify a token from the URL or cookie
  if (!user) return ws.close(1008, "unauthorised");
  ws.on("message", (data) => pub.publish("chat", JSON.stringify({ from: user.name, text: String(data) })));
  // presence: heartbeat key with 30s TTL
  const beat = setInterval(() => pub.set(\`presence:\${user.id}\`, "1", "EX", 30), 10_000);
  ws.on("close", () => clearInterval(beat));
});

// --- Client reconnection with exponential backoff + jitter ---
function connect(attempt = 0) {
  const ws = new WebSocket("wss://chat.example.com/ws?token=" + token);
  ws.onopen = () => { attempt = 0; setStatus("online"); };
  ws.onclose = () => {
    setStatus("reconnecting…");
    const delay = Math.min(30_000, 1000 * 2 ** attempt) * (0.5 + Math.random() / 2);
    setTimeout(() => connect(attempt + 1), delay);
  };
  ws.onmessage = (e) => render(JSON.parse(e.data));
}`,
      ex: "Build a live notifications feed with SSE that resumes from Last-Event-ID after a reconnect, and a chat room with WebSockets that works across two server instances using Redis pub/sub, with presence ('3 online') via heartbeat keys. Kill one instance during a conversation and show clients reconnecting with backoff, with no lost messages in the SSE feed.",
      q: ["You need to stream live order-status updates from server to browser, with no client messages. Which is the simplest good fit?", ["WebSockets", "Server-Sent Events", "Polling every 100 ms", "gRPC streaming from the browser"], 1, "SSE is one-directional server push over plain HTTP, with built-in reconnection, which is exactly this use case."]
    }
  ]
});
