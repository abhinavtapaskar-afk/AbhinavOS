import Database from "better-sqlite3";

const db = new Database("abhinavos.db");

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

// Seed Daily Logs
const seedLogs = [
  { date: twoDaysAgo, energy: 85, discipline_score: 90, focus_score: 80, sleep_hours: 7.5, study_hours: 6, workout_completed: 1, mood: 'Focused' },
  { date: yesterday, energy: 70, discipline_score: 65, focus_score: 60, sleep_hours: 6, study_hours: 4, workout_completed: 0, mood: 'Tired' },
  { date: today, energy: 95, discipline_score: 95, focus_score: 90, sleep_hours: 8, study_hours: 8, workout_completed: 1, mood: 'Motivated' }
];

const insertLog = db.prepare(`
  INSERT OR REPLACE INTO daily_logs (date, energy, discipline_score, focus_score, sleep_hours, study_hours, workout_completed, mood)
  VALUES (@date, @energy, @discipline_score, @focus_score, @sleep_hours, @study_hours, @workout_completed, @mood)
`);

for (const log of seedLogs) {
  insertLog.run(log);
}

// Seed Missions
const seedMissions = [
  { name: 'JEE Mastery', description: 'Achieve top rank in JEE Advanced', progress: 65, deadline: '2026-06-01', priority: 'high' },
  { name: 'Aesthetic Physique', description: 'Reach 10% body fat with significant muscle mass', progress: 40, deadline: '2026-12-31', priority: 'medium' },
  { name: 'Master Communication', description: 'Become a world-class public speaker', progress: 20, deadline: '2026-09-15', priority: 'medium' }
];

const insertMission = db.prepare(`
  INSERT INTO missions (name, description, progress, deadline, priority)
  VALUES (@name, @description, @progress, @deadline, @priority)
`);

for (const mission of seedMissions) {
  insertMission.run(mission);
}

// Seed Skills
const seedSkills = [
  { name: 'AI Development', level: 4, experience: 60 },
  { name: 'Strategic Thinking', level: 5, experience: 85 },
  { name: 'Public Speaking', level: 3, experience: 40 }
];

const insertSkill = db.prepare(`
  INSERT OR REPLACE INTO skills (name, level, experience)
  VALUES (@name, @level, @experience)
`);

for (const skill of seedSkills) {
  insertSkill.run(skill);
}

console.log("Database seeded successfully.");
db.close();
