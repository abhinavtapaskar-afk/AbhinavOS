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
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE,
    nickname TEXT DEFAULT 'Abhinav',
    personal_code TEXT, -- JSON array string
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    sleep_hours REAL DEFAULT 0,
    energy_level INTEGER DEFAULT 5, -- 1-10
    mood TEXT,
    study_hours REAL DEFAULT 0,
    workout_status INTEGER DEFAULT 0, -- 0 or 1
    wake_up_on_time INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    discipline_score INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    progress_percent INTEGER DEFAULT 0,
    deadline TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    total_minutes_practiced INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS brain_vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    tags TEXT, -- JSON array string
    category TEXT
  );
`);

// --- Discipline Engine Logic ---
function calculateDisciplineScore(log: any) {
  let score = 0;
  
  // 1. Wake up on time (20%)
  if (log.wake_up_on_time) score += 20;

  // 2. Study hours (40%) - Target: 6hrs
  const studyScore = Math.min((log.study_hours / 6) * 40, 40);
  score += studyScore;

  // 3. Workout completion (20%)
  if (log.workout_status) score += 20;

  // 4. Daily Task completion (20%)
  if (log.total_tasks > 0) {
    const taskScore = (log.tasks_completed / log.total_tasks) * 20;
    score += taskScore;
  }

  return Math.round(score);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- DASHBOARD HUD ---
  app.get("/api/dashboard", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const stats = db.prepare("SELECT * FROM daily_logs WHERE date = ?").get(today);
    const recentLogs = db.prepare("SELECT * FROM daily_logs ORDER BY date DESC LIMIT 14").all();
    const activeMissions = db.prepare("SELECT * FROM missions WHERE status = 'active' ORDER BY priority DESC LIMIT 3").all();
    const profile = db.prepare("SELECT * FROM profiles LIMIT 1").get() || { name: "Abhinav", level: 1 };
    
    res.json({ stats, recentLogs, activeMissions, profile });
  });

  // --- DAILY LOGS (Single Source of Truth) ---
  app.post("/api/daily-log", (req, res) => {
    const log = req.body;
    const discipline_score = calculateDisciplineScore(log);
    
    const stmt = db.prepare(`
      INSERT INTO daily_logs (
        date, sleep_hours, energy_level, mood, study_hours, 
        workout_status, wake_up_on_time, tasks_completed, 
        total_tasks, discipline_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        sleep_hours=excluded.sleep_hours,
        energy_level=excluded.energy_level,
        mood=excluded.mood,
        study_hours=excluded.study_hours,
        workout_status=excluded.workout_status,
        wake_up_on_time=excluded.wake_up_on_time,
        tasks_completed=excluded.tasks_completed,
        total_tasks=excluded.total_tasks,
        discipline_score=excluded.discipline_score
    `);
    
    stmt.run(
      log.date, log.sleep_hours, log.energy_level, log.mood, 
      log.study_hours, log.workout_status ? 1 : 0, log.wake_up_on_time ? 1 : 0, 
      log.tasks_completed, log.total_tasks, discipline_score
    );
    
    res.json({ success: true, discipline_score });
  });

  // --- MISSIONS ---
  app.get("/api/missions", (req, res) => {
    const missions = db.prepare("SELECT * FROM missions").all();
    res.json(missions);
  });

  app.post("/api/missions", (req, res) => {
    const { title, description, deadline, priority } = req.body;
    const stmt = db.prepare("INSERT INTO missions (title, description, deadline, priority) VALUES (?, ?, ?, ?)");
    const result = stmt.run(title, description, deadline, priority);
    res.json({ id: result.lastInsertRowid });
  });

  // --- BRAIN VAULT ---
  app.get("/api/notes", (req, res) => {
    const notes = db.prepare("SELECT * FROM brain_vault").all();
    res.json(notes);
  });

  app.post("/api/notes", (req, res) => {
    const { content, category, tags } = req.body;
    const stmt = db.prepare("INSERT INTO brain_vault (content, category, tags) VALUES (?, ?, ?)");
    stmt.run(content, category, JSON.stringify(tags));
    res.json({ success: true });
  });

  // --- SKILLS ---
  app.get("/api/skills", (req, res) => {
    const skills = db.prepare("SELECT * FROM skills").all();
    res.json(skills);
  });

  app.delete("/api/notes/:id", (req, res) => {
    db.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- BODY & WORKOUTS ---
  app.get("/api/body-metrics", (req, res) => {
    const metrics = db.prepare("SELECT * FROM body_metrics ORDER BY date DESC").all();
    res.json(metrics);
  });

  app.post("/api/body-metrics", (req, res) => {
    const { date, weight, calories, protein, energy_level } = req.body;
    const stmt = db.prepare(`
      INSERT INTO body_metrics (date, weight, calories, protein, energy_level)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        weight=excluded.weight,
        calories=excluded.calories,
        protein=excluded.protein,
        energy_level=excluded.energy_level
    `);
    stmt.run(date, weight, calories, protein, energy_level);
    res.json({ success: true });
  });

  app.get("/api/workouts", (req, res) => {
    const workouts = db.prepare("SELECT * FROM workouts ORDER BY date DESC").all();
    res.json(workouts);
  });

  app.post("/api/workouts", (req, res) => {
    const { date, type, duration_minutes, intensity, notes } = req.body;
    const stmt = db.prepare("INSERT INTO workouts (date, type, duration_minutes, intensity, notes) VALUES (?, ?, ?, ?, ?)");
    stmt.run(date, type, duration_minutes, intensity, notes);
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
