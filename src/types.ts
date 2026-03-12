export interface DailyLog {
  id?: number;
  date: string;
  energy: number;
  discipline_score: number;
  focus_score: number;
  sleep_hours: number;
  study_hours: number;
  workout_completed: boolean;
  mood: string;
}

export interface Mission {
  id: number;
  name: string;
  description: string;
  progress: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'archived';
}

export interface Skill {
  id: number;
  name: string;
  level: number;
  experience: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string;
  created_at: string;
}
