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
    name TEXT,
    personal_code TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    sleep_hours REAL DEFAULT 0,
    energy INTEGER DEFAULT 50,
    mood TEXT,
    focus_score INTEGER DEFAULT 0,
    study_hours REAL DEFAULT 0,
    workout_done INTEGER DEFAULT 0,
    meditation_done INTEGER DEFAULT 0,
    wake_up_time TEXT,
    tasks_completed INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    notes TEXT,
    discipline_score INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    progress_percent INTEGER DEFAULT 0,
    deadline TEXT,
    priority TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS brain_vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    total_practice_minutes INTEGER DEFAULT 0,
    notes TEXT
  );
`);

// --- Discipline Engine Logic ---
function calculateDisciplineScore(log: any) {
  let score = 0;
  
  // 1. Wake up time (Target: before 06:00)
  if (log.wake_up_time) {
    const [hours, minutes] = log.wake_up_time.split(':').map(Number);
    if (hours < 6) score += 25;
    else if (hours === 6 && minutes === 0) score += 20;
    else if (hours < 8) score += 10;
  }

  // 2. Study hours (Target: 6hrs)
  const studyScore = Math.min((log.study_hours / 6) * 30, 30);
  score += studyScore;

  // 3. Workout (Binary)
  if (log.workout_done) score += 25;

  // 4. Task completion percentage
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
        date, sleep_hours, energy, mood, focus_score, study_hours, 
        workout_done, meditation_done, wake_up_time, tasks_completed, 
        total_tasks, notes, discipline_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        sleep_hours=excluded.sleep_hours,
        energy=excluded.energy,
        mood=excluded.mood,
        focus_score=excluded.focus_score,
        study_hours=excluded.study_hours,
        workout_done=excluded.workout_done,
        meditation_done=excluded.meditation_done,
        wake_up_time=excluded.wake_up_time,
        tasks_completed=excluded.tasks_completed,
        total_tasks=excluded.total_tasks,
        notes=excluded.notes,
        discipline_score=excluded.discipline_score
    `);
    
    stmt.run(
      log.date, log.sleep_hours, log.energy, log.mood, log.focus_score, 
      log.study_hours, log.workout_done ? 1 : 0, log.meditation_done ? 1 : 0, 
      log.wake_up_time, log.tasks_completed, log.total_tasks, log.notes, 
      discipline_score
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
    const notes = db.prepare("SELECT * FROM brain_vault ORDER BY created_at DESC").all();
    res.json(notes);
  });

  app.post("/api/notes", (req, res) => {
    const { title, content, category, tags } = req.body;
    const stmt = db.prepare("INSERT INTO brain_vault (title, content, category, tags) VALUES (?, ?, ?, ?)");
    stmt.run(title, content, category, tags);
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
