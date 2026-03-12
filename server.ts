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
    FOREIGN KEY(mission_id) REFERENCES missions(id) ON DELETE CASCADE
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
    meditation_completed INTEGER,
    mood TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS skill_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id INTEGER,
    duration_minutes INTEGER,
    date TEXT,
    notes TEXT,
    FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    category TEXT,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS body_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    weight REAL,
    calories INTEGER,
    protein INTEGER,
    energy_level INTEGER
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    type TEXT,
    duration_minutes INTEGER,
    intensity TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER,
    duration_minutes INTEGER,
    date TEXT,
    FOREIGN KEY(mission_id) REFERENCES missions(id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- DASHBOARD ---
  app.get("/api/dashboard", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const stats = db.prepare("SELECT * FROM daily_logs WHERE date = ?").get(today);
    const recentLogs = db.prepare("SELECT * FROM daily_logs ORDER BY date DESC LIMIT 14").all();
    const activeMissions = db.prepare("SELECT * FROM missions WHERE status = 'active'").all();
    const skills = db.prepare("SELECT * FROM skills").all();
    
    res.json({ stats, recentLogs, activeMissions, skills });
  });

  // --- MISSIONS ---
  app.get("/api/missions", (req, res) => {
    const missions = db.prepare("SELECT * FROM missions").all();
    const missionsWithTasks = missions.map(m => ({
      ...m,
      tasks: db.prepare("SELECT * FROM mission_tasks WHERE mission_id = ?").all(m.id)
    }));
    res.json(missionsWithTasks);
  });

  app.post("/api/missions", (req, res) => {
    const { name, description, deadline, priority } = req.body;
    const stmt = db.prepare("INSERT INTO missions (name, description, deadline, priority) VALUES (?, ?, ?, ?)");
    const result = stmt.run(name, description, deadline, priority);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/missions/:id", (req, res) => {
    const { name, description, progress, deadline, priority, status } = req.body;
    const stmt = db.prepare("UPDATE missions SET name=?, description=?, progress=?, deadline=?, priority=?, status=? WHERE id=?");
    stmt.run(name, description, progress, deadline, priority, status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/missions/:id", (req, res) => {
    db.prepare("DELETE FROM missions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- MISSION TASKS ---
  app.post("/api/missions/:id/tasks", (req, res) => {
    const { task } = req.body;
    const stmt = db.prepare("INSERT INTO mission_tasks (mission_id, task) VALUES (?, ?)");
    const result = stmt.run(req.params.id, task);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/tasks/:id", (req, res) => {
    const { completed } = req.body;
    db.prepare("UPDATE mission_tasks SET completed = ? WHERE id = ?").run(completed ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  // --- DAILY LOGS ---
  app.get("/api/daily-logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM daily_logs ORDER BY date DESC").all();
    res.json(logs);
  });

  app.post("/api/daily-log", (req, res) => {
    const { date, energy, discipline_score, focus_score, sleep_hours, study_hours, workout_completed, meditation_completed, mood, notes } = req.body;
    const stmt = db.prepare(`
      INSERT INTO daily_logs (date, energy, discipline_score, focus_score, sleep_hours, study_hours, workout_completed, meditation_completed, mood, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        energy=excluded.energy,
        discipline_score=excluded.discipline_score,
        focus_score=excluded.focus_score,
        sleep_hours=excluded.sleep_hours,
        study_hours=excluded.study_hours,
        workout_completed=excluded.workout_completed,
        meditation_completed=excluded.meditation_completed,
        mood=excluded.mood,
        notes=excluded.notes
    `);
    stmt.run(date, energy, discipline_score, focus_score, sleep_hours, study_hours, workout_completed, meditation_completed, mood, notes);
    res.json({ success: true });
  });

  // --- SKILLS ---
  app.get("/api/skills", (req, res) => {
    const skills = db.prepare("SELECT * FROM skills").all();
    res.json(skills);
  });

  app.post("/api/skills", (req, res) => {
    const { name, notes } = req.body;
    const stmt = db.prepare("INSERT INTO skills (name, notes) VALUES (?, ?)");
    const result = stmt.run(name, notes);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/skills/:id", (req, res) => {
    const { level, experience, notes } = req.body;
    db.prepare("UPDATE skills SET level=?, experience=?, notes=? WHERE id=?").run(level, experience, notes, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/skills/:id", (req, res) => {
    db.prepare("DELETE FROM skills WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- BRAIN VAULT ---
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
