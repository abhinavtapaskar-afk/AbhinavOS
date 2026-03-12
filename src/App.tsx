import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Zap, 
  Brain, 
  Timer,
  Plus,
  ChevronRight,
  Search,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  Dumbbell,
  Scale,
  Calendar,
  Moon,
  Coffee,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-300",
      active ? "text-bat-yellow" : "text-white/40 hover:text-white/60"
    )}
  >
    <Icon size={20} className={active ? "drop-shadow-[0_0_8px_rgba(255,208,0,0.5)]" : ""} />
    <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
  </button>
);

const Card = ({ children, title, className, icon: Icon, onClick }: { children: React.ReactNode, title?: string, className?: string, icon?: any, onClick?: () => void }) => (
  <div className={cn("bat-card", className)} onClick={onClick}>
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">{title}</h3>}
        {Icon && <Icon size={16} className="text-bat-yellow/50" />}
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ label, value, subValue, icon: Icon, color = "yellow" }: { label: string, value: string | number, subValue?: string, icon: any, color?: "yellow" | "purple" | "green" | "red" }) => {
  const colorMap = {
    yellow: "text-bat-yellow",
    purple: "text-bat-purple",
    green: "text-bat-success",
    red: "text-bat-warning"
  };
  
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-tighter text-white/40">{label}</span>
        <Icon size={14} className={colorMap[color]} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-2xl font-black tracking-tighter", colorMap[color])}>{value}</span>
        {subValue && <span className="text-[10px] text-white/30">{subValue}</span>}
      </div>
    </Card>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-bat-panel border border-white/10 rounded-2xl p-6 z-[70] shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black tracking-tighter uppercase text-bat-yellow">{title}</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1.5 mb-4">
    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">{label}</label>
    <input 
      {...props}
      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-bat-yellow/50 transition-colors"
    />
  </div>
);

const Select = ({ label, options, ...props }: { label: string, options: { value: string, label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-1.5 mb-4">
    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">{label}</label>
    <select 
      {...props}
      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-bat-yellow/50 transition-colors appearance-none"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isBodyModalOpen, setIsBodyModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  const handleAddBody = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await fetch('/api/body-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, date: new Date().toISOString().split('T')[0] })
    });
    setIsBodyModalOpen(false);
    refreshAll();
  };

  const handleAddWorkout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, date: new Date().toISOString().split('T')[0] })
    });
    setIsWorkoutModalOpen(false);
    refreshAll();
  };

  const [messages, setMessages] = useState([
    { role: 'ai', text: "Good evening, Abhinav. Your tactical systems are online. How shall we proceed with your evolution today?" }
  ]);
  const [aiInput, setAiInput] = useState('');

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [dash, miss, sk, nt] = await Promise.all([
        fetch('/api/dashboard').then(r => r.json()),
        fetch('/api/missions').then(r => r.json()),
        fetch('/api/skills').then(r => r.json()),
        fetch('/api/notes').then(r => r.json())
      ]);
      setDashboardData(dash);
      setMissions(miss);
      setSkills(sk);
      setNotes(nt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/daily-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        date: new Date().toISOString().split('T')[0],
        workout_completed: data.workout_completed === 'on' ? 1 : 0,
        meditation_completed: data.meditation_completed === 'on' ? 1 : 0,
        discipline_score: Math.floor(Math.random() * 40) + 60 // Simple mock calculation
      })
    });
    setIsLogModalOpen(false);
    refreshAll();
  };

  const handleAddMission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setIsMissionModalOpen(false);
    refreshAll();
  };

  const handleDeleteMission = async (id: number) => {
    if (!confirm('Abort mission? This action is irreversible.')) return;
    await fetch(`/api/missions/${id}`, { method: 'DELETE' });
    refreshAll();
  };

  const handleSendMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = { role: 'user', text: aiInput };
    setMessages(prev => [...prev, userMsg]);
    setAiInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "Analyzing tactical data... Based on your current progress in 'JEE Mastery', I recommend a 90-minute deep work session focusing on Physics. Your energy levels are optimal for complex problem solving." }]);
    }, 1000);
  };

  if (loading && !dashboardData) return (
    <div className="h-screen w-screen flex items-center justify-center bg-bat-bg">
      <div className="flex flex-col items-center gap-4">
        <Zap className="text-bat-yellow animate-pulse" size={48} />
        <span className="text-xs font-bold tracking-[0.3em] text-bat-yellow/50 uppercase">Syncing Batcave Systems...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bat-bg pb-24">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-bat-bg/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-bat-yellow rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,208,0,0.4)]">
            <Zap size={18} className="text-bat-bg fill-bat-bg" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase">AbhinavOS</h1>
            <p className="text-[8px] font-bold text-white/30 tracking-[0.2em] uppercase">Tactical Life Control</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsFocusMode(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Timer size={18} className="text-bat-yellow" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Settings size={18} className="text-white/60" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Discipline" value={dashboardData?.stats?.discipline_score || 0} subValue="/ 100" icon={Zap} />
                <StatCard label="Focus" value={dashboardData?.stats?.focus_score || 0} subValue="/ 100" icon={Brain} color="purple" />
                <StatCard label="Study" value={dashboardData?.stats?.study_hours || 0} subValue="HRS" icon={BookOpen} color="purple" />
                <StatCard label="Energy" value={dashboardData?.stats?.energy || 0} subValue="%" icon={Zap} color="green" />
              </div>

              <button 
                onClick={() => setIsLogModalOpen(true)}
                className="w-full py-4 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,208,0,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={16} />
                Log Daily Activity
              </button>

              {/* Progress Chart */}
              <Card title="Discipline Trend" icon={TrendingUp}>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[...(dashboardData?.recentLogs || [])].reverse()}>
                      <defs>
                        <linearGradient id="colorDisc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD000" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FFD000" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '8px' }}
                        itemStyle={{ color: '#FFD000' }}
                      />
                      <Area type="monotone" dataKey="discipline_score" stroke="#FFD000" fillOpacity={1} fill="url(#colorDisc)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Active Missions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Active Missions</h3>
                  <button onClick={() => setActiveTab('missions')} className="text-[10px] font-bold text-bat-yellow uppercase tracking-widest">View All</button>
                </div>
                {missions.filter(m => m.status === 'active').slice(0, 3).map((mission: any) => (
                  <Card key={mission.id} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold tracking-tight">{mission.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bat-yellow/10 text-bat-yellow uppercase">{mission.priority}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-bat-yellow h-full shadow-[0_0_10px_rgba(255,208,0,0.5)] transition-all duration-1000" 
                        style={{ width: `${mission.progress}%` }} 
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <Card title="The Personal Code" icon={Zap}>
                <ul className="space-y-2">
                  {[
                    "Never skip a workout.",
                    "Improve by 1% every single day.",
                    "Protect focus at all costs.",
                    "Help others without expecting return."
                  ].map((rule, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                      <div className="w-1 h-1 bg-bat-yellow rounded-full shadow-[0_0_5px_rgba(255,208,0,0.8)]" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}

          {activeTab === 'missions' && (
            <motion.div 
              key="missions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter uppercase">Mission Control</h2>
                <button 
                  onClick={() => setIsMissionModalOpen(true)}
                  className="p-2 rounded-full bg-bat-yellow text-bat-bg shadow-[0_0_15px_rgba(255,208,0,0.4)]"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {missions.map((m) => (
                  <Card key={m.id} className="group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg tracking-tight group-hover:text-bat-yellow transition-colors">{m.name}</h4>
                        <p className="text-xs text-white/40">{m.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded bg-white/5 hover:text-bat-yellow transition-colors"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteMission(m.id)} className="p-1.5 rounded bg-white/5 hover:text-bat-warning transition-colors"><Trash2 size={12} /></button>
                        </div>
                        <span className="text-xs font-black text-bat-yellow">{m.progress}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
                      <div className="bg-bat-yellow h-full" style={{ width: `${m.progress}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <div className="px-2 py-1 rounded bg-white/5 text-[8px] font-bold uppercase tracking-widest text-white/40">Priority: {m.priority}</div>
                      <div className="px-2 py-1 rounded bg-white/5 text-[8px] font-bold uppercase tracking-widest text-white/40">Due: {m.deadline}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'growth' && (
            <motion.div 
              key="growth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter uppercase">Evolution Tracker</h2>
                <button 
                  onClick={() => setIsSkillModalOpen(true)}
                  className="p-2 rounded-full bg-bat-purple text-white shadow-[0_0_15px_rgba(106,90,205,0.4)]"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <Card title="Skill Levels">
                <div className="space-y-6">
                  {skills.map((skill, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest">{skill.name}</span>
                          <button className="text-white/20 hover:text-white transition-colors"><Edit2 size={10} /></button>
                        </div>
                        <span className="text-xs font-black text-bat-purple">LVL {skill.level}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-bat-purple h-full shadow-[0_0_8px_rgba(106,90,205,0.5)]" style={{ width: `${skill.experience}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Workouts" value={dashboardData?.stats?.workout_completed ? "DONE" : "PENDING"} icon={Dumbbell} color={dashboardData?.stats?.workout_completed ? "green" : "red"} />
                <StatCard label="Meditation" value={dashboardData?.stats?.meditation_completed ? "DONE" : "PENDING"} icon={Brain} color={dashboardData?.stats?.meditation_completed ? "green" : "red"} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Dumbbell size={14} />
                  Log Workout
                </button>
                <button 
                  onClick={() => setIsBodyModalOpen(true)}
                  className="py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Scale size={14} />
                  Log Weight
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'vault' && (
            <motion.div 
              key="vault"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter uppercase">Brain Vault</h2>
                <button 
                  onClick={() => setIsNoteModalOpen(true)}
                  className="p-2 rounded-full bg-white/10 text-white"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH BRAIN VAULT..." 
                  className="w-full bg-bat-panel border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-bold tracking-widest focus:outline-none focus:border-bat-yellow/50 transition-colors"
                />
              </div>

              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id} className="flex flex-col gap-2 group">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold group-hover:text-bat-yellow transition-colors">{note.title}</h4>
                      <button onClick={async () => {
                        await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
                        refreshAll();
                      }} className="text-white/10 hover:text-bat-warning transition-colors"><Trash2 size={12} /></button>
                    </div>
                    <p className="text-xs text-white/40 line-clamp-2">{note.content}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[8px] font-bold text-bat-yellow/60 uppercase tracking-widest">#{note.category}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[calc(100vh-200px)] flex flex-col"
            >
              <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-hide">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      msg.role === 'ai' ? "bg-bat-yellow" : "bg-white/10"
                    )}>
                      {msg.role === 'ai' ? <Zap size={16} className="text-bat-bg" /> : <span className="text-[10px] font-black">A</span>}
                    </div>
                    <div className={cn(
                      "border p-3 rounded-2xl max-w-[80%]",
                      msg.role === 'ai' 
                        ? "bg-bat-panel border-white/5 rounded-tl-none" 
                        : "bg-bat-yellow/10 border-bat-yellow/20 rounded-tr-none text-bat-yellow"
                    )}>
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 relative">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="CONSULT MENTOR..." 
                  className="w-full bg-bat-panel border border-white/5 rounded-xl py-4 pl-4 pr-12 text-xs font-bold tracking-widest focus:outline-none focus:border-bat-yellow/50 transition-colors"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-bat-yellow"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bat-bg/80 backdrop-blur-xl border-t border-white/5 px-4 pb-6 pt-2 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <NavItem icon={LayoutDashboard} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={Target} label="Missions" active={activeTab === 'missions'} onClick={() => setActiveTab('missions')} />
          <NavItem icon={TrendingUp} label="Growth" active={activeTab === 'growth'} onClick={() => setActiveTab('growth')} />
          <NavItem icon={BookOpen} label="Vault" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} />
          <NavItem icon={MessageSquare} label="Mentor" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        </div>
      </nav>

      {/* Modals */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Daily Log">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Energy Level (1-100)" name="energy" type="number" defaultValue="80" required />
            <Input label="Focus Score (1-100)" name="focus_score" type="number" defaultValue="70" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sleep Hours" name="sleep_hours" type="number" step="0.1" defaultValue="7" required />
            <Input label="Study Hours" name="study_hours" type="number" step="0.1" defaultValue="4" required />
          </div>
          <Select label="Mood" name="mood" options={[
            { value: 'Motivated', label: 'Motivated' },
            { value: 'Focused', label: 'Focused' },
            { value: 'Calm', label: 'Calm' },
            { value: 'Tired', label: 'Tired' },
            { value: 'Stressed', label: 'Stressed' }
          ]} />
          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="workout_completed" className="accent-bat-yellow" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Workout Done</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="meditation_completed" className="accent-bat-yellow" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Meditation Done</span>
            </label>
          </div>
          <Input label="Notes" name="notes" placeholder="Tactical observations..." />
          <button type="submit" className="w-full py-4 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs mt-4">Save Log</button>
        </form>
      </Modal>

      <Modal isOpen={isMissionModalOpen} onClose={() => setIsMissionModalOpen(false)} title="New Mission">
        <form onSubmit={handleAddMission} className="space-y-4">
          <Input label="Mission Name" name="name" placeholder="e.g. JEE Mastery" required />
          <Input label="Description" name="description" placeholder="Strategic objective..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Deadline" name="deadline" type="date" required />
            <Select label="Priority" name="priority" options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]} />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs mt-4">Initiate Mission</button>
        </form>
      </Modal>

      <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title="New Skill">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget).entries());
          await fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          setIsSkillModalOpen(false);
          refreshAll();
        }} className="space-y-4">
          <Input label="Skill Name" name="name" placeholder="e.g. AI Development" required />
          <Input label="Initial Notes" name="notes" placeholder="Evolution path..." />
          <button type="submit" className="w-full py-4 rounded-xl bg-bat-purple text-white font-black uppercase tracking-widest text-xs mt-4">Add Skill</button>
        </form>
      </Modal>

      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="New Note">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget).entries());
          await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          setIsNoteModalOpen(false);
          refreshAll();
        }} className="space-y-4">
          <Input label="Title" name="title" required />
          <Select label="Category" name="category" options={[
            { value: 'Ideas', label: 'Ideas' },
            { value: 'Lessons', label: 'Lessons' },
            { value: 'Quotes', label: 'Quotes' },
            { value: 'Books', label: 'Books' }
          ]} />
          <div className="space-y-1.5 mb-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Content</label>
            <textarea 
              name="content"
              rows={4}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-bat-yellow/50 transition-colors"
            />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-white/10 text-white font-black uppercase tracking-widest text-xs mt-4">Save Note</button>
        </form>
      </Modal>

      <Modal isOpen={isBodyModalOpen} onClose={() => setIsBodyModalOpen(false)} title="Body Metrics">
        <form onSubmit={handleAddBody} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Weight (kg)" name="weight" type="number" step="0.1" required />
            <Input label="Energy Level (1-10)" name="energy_level" type="number" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Calories" name="calories" type="number" />
            <Input label="Protein (g)" name="protein" type="number" />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs mt-4">Update Metrics</button>
        </form>
      </Modal>

      <Modal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} title="Log Workout">
        <form onSubmit={handleAddWorkout} className="space-y-4">
          <Input label="Workout Type" name="type" placeholder="e.g. Push Day, HIIT" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (min)" name="duration_minutes" type="number" required />
            <Select label="Intensity" name="intensity" options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' }
            ]} />
          </div>
          <Input label="Notes" name="notes" placeholder="Sets, reps, or observations..." />
          <button type="submit" className="w-full py-4 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs mt-4">Record Workout</button>
        </form>
      </Modal>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bat-bg z-[100] flex flex-col items-center justify-center p-8"
          >
            <button 
              onClick={() => setIsFocusMode(false)}
              className="absolute top-8 right-8 p-2 text-white/20 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center space-y-12 w-full max-w-xs">
              <div className="space-y-2">
                <h2 className="text-[10px] font-black tracking-[0.5em] text-bat-yellow uppercase">Deep Work Protocol</h2>
                <h3 className="text-2xl font-black tracking-tighter uppercase">{missions[0]?.name || 'Active Mission'}</h3>
              </div>

              <div className="relative aspect-square flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle 
                    cx="50%" cy="50%" r="45%" 
                    className="stroke-white/5 fill-none" 
                    strokeWidth="4" 
                  />
                  <circle 
                    cx="50%" cy="50%" r="45%" 
                    className="stroke-bat-yellow fill-none drop-shadow-[0_0_10px_rgba(255,208,0,0.5)]" 
                    strokeWidth="4" 
                    strokeDasharray="283" 
                    strokeDashoffset="70"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black tracking-tighter">24:59</span>
                  <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Remaining</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-4 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,208,0,0.3)]">
                  Pause
                </button>
                <button className="flex-1 py-4 rounded-xl bg-white/5 text-white/60 font-black uppercase tracking-widest text-xs">
                  Abort
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
