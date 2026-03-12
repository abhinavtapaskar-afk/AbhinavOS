import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("abhinavos.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    personal_code TEXT
  );

  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0,
    deadline TEXT,
    priority TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS mission_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(mission_id) REFERENCES missions(id)
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    energy INTEGER,
    discipline_score INTEGER,
    focus_score INTEGER,
    sleep_hours REAL,
    study_hours REAL,
    workout_completed INTEGER,
    mood TEXT,
    meditation_minutes INTEGER
  );

  CREATE TABLE IF NOT EXISTS personality_traits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    trait TEXT,
    value INTEGER
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    category TEXT,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER,
    duration_minutes INTEGER,
    date TEXT,
    FOREIGN KEY(mission_id) REFERENCES missions(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/dashboard", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const stats = db.prepare("SELECT * FROM daily_logs WHERE date = ?").get(today);
    const recentLogs = db.prepare("SELECT * FROM daily_logs ORDER BY date DESC LIMIT 7").all();
    const activeMissions = db.prepare("SELECT * FROM missions WHERE status = 'active'").all();
    
    res.json({ stats, recentLogs, activeMissions });
  });

  app.post("/api/daily-log", (req, res) => {
    const { date, energy, discipline_score, focus_score, sleep_hours, study_hours, workout_completed, mood } = req.body;
    const stmt = db.prepare(`
      INSERT INTO daily_logs (date, energy, discipline_score, focus_score, sleep_hours, study_hours, workout_completed, mood)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        energy=excluded.energy,
        discipline_score=excluded.discipline_score,
        focus_score=excluded.focus_score,
        sleep_hours=excluded.sleep_hours,
        study_hours=excluded.study_hours,
        workout_completed=excluded.workout_completed,
        mood=excluded.mood
    `);
    stmt.run(date, energy, discipline_score, focus_score, sleep_hours, study_hours, workout_completed, mood);
    res.json({ success: true });
  });

  app.get("/api/missions", (req, res) => {
    const missions = db.prepare("SELECT * FROM missions").all();
    res.json(missions);
  });

  app.post("/api/missions", (req, res) => {
    const { name, description, deadline, priority } = req.body;
    const stmt = db.prepare("INSERT INTO missions (name, description, deadline, priority) VALUES (?, ?, ?, ?)");
    const result = stmt.run(name, description, deadline, priority);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/skills", (req, res) => {
    const skills = db.prepare("SELECT * FROM skills").all();
    res.json(skills);
  });

  app.get("/api/notes", (req, res) => {
    const notes = db.prepare("SELECT * FROM notes ORDER BY created_at DESC").all();
    res.json(notes);
  });

  app.post("/api/notes", (req, res) => {
    const { title, content, category, tags } = req.body;
    const stmt = db.prepare("INSERT INTO notes (title, content, category, tags) VALUES (?, ?, ?, ?)");
    stmt.run(title, content, category, tags);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AbhinavOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
