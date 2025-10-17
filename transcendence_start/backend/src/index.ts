import Fastify from "fastify";
import cors from "@fastify/cors";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fastifySocketIO from "fastify-socket.io";
import bcrypt from "bcryptjs";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = process.env.DATABASE_FILE || path.join(__dirname, "..", "data", "db.sqlite");
const dataDir = path.dirname(dbFile);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbFile);
db.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)").run();
db.prepare("CREATE TABLE IF NOT EXISTS matches (id INTEGER PRIMARY KEY AUTOINCREMENT, player1 TEXT, player2 TEXT, score1 INTEGER, score2 INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)").run();

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// register socket.io
await app.register(fastifySocketIO, {
  // options
  cors: { origin: "*" }
});

app.get("/api/health", async () => ({ status: "ok" }));

app.get("/api/users", async () => {
  const rows = db.prepare("SELECT id, name, created_at FROM users").all();
  return rows;
});

app.post("/api/users", async (request, reply) => {
  const body = request.body as any;
  if (!body || !body.name || !body.password) {
    reply.code(400);
    return { error: "name and password required" };
  }
  const hash = bcrypt.hashSync(body.password, 10);
  const info = db.prepare("INSERT INTO users (name, password) VALUES (?, ?)").run(body.name, hash);
  return { id: info.lastInsertRowid, name: body.name };
});

app.post("/api/matches", async (request, reply) => {
  const b = request.body as any;
  const info = db.prepare("INSERT INTO matches (player1, player2, score1, score2) VALUES (?, ?, ?, ?)").run(b.player1, b.player2, b.score1, b.score2);
  return { id: info.lastInsertRowid };
});

app.io.on("connection", (socket) => {
  app.log.info(`socket connected: ${socket.id}`);
  socket.on("join_room", (room) => {
    socket.join(room);
    socket.emit("joined", room);
  });
  socket.on("player_move", (data) => {
    if (data && data.room) {
      app.io.to(data.room).emit("player_move", data);
    }
  });
  socket.on("disconnect", () => {
    app.log.info(`socket disconnected: ${socket.id}`);
  });
});

const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    app.log.info("Backend listening on 3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
