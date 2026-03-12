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
  X
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
  Area
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

const Card = ({ children, title, className, icon: Icon }: { children: React.ReactNode, title?: string, className?: string, icon?: any }) => (
  <div className={cn("bat-card", className)}>
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">{title}</h3>}
        {Icon && <Icon size={16} className="text-bat-yellow/50" />}
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ label, value, subValue, icon: Icon, color = "yellow" }: { label: string, value: string | number, subValue?: string, icon: any, color?: "yellow" | "purple" | "green" }) => {
  const colorMap = {
    yellow: "text-bat-yellow",
    purple: "text-bat-purple",
    green: "text-bat-success"
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

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Good evening, Abhinav. Your discipline score is up by 12% this week. I've analyzed your sleep patterns and noticed a correlation with your focus sessions. Shall we review the strategy for tomorrow?" }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Simulate AI response for now or call service if implemented
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "Analyzing your request... I recommend prioritizing your 'JEE Mastery' mission today as your energy levels are peak." }]);
    }, 1000);
  };

  const PersonalCode = () => (
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
  );

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-bat-bg">
      <div className="flex flex-col items-center gap-4">
        <Zap className="text-bat-yellow animate-pulse" size={48} />
        <span className="text-xs font-bold tracking-[0.3em] text-bat-yellow/50 uppercase">Initializing AbhinavOS...</span>
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

              {/* Progress Chart */}
              <Card title="Discipline Trend" icon={TrendingUp}>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData?.recentLogs?.reverse() || []}>
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
                  <ChevronRight size={14} className="text-white/20" />
                </div>
                {dashboardData?.activeMissions?.map((mission: any) => (
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

              <PersonalCode />
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
                <button className="p-2 rounded-full bg-bat-yellow text-bat-bg shadow-[0_0_15px_rgba(255,208,0,0.4)]">
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {['JEE Mastery', 'Aesthetic Physique', 'Public Speaking'].map((m, i) => (
                  <Card key={i} className="group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg tracking-tight group-hover:text-bat-yellow transition-colors">{m}</h4>
                        <p className="text-xs text-white/40">Strategic objective for Q1 2026</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-bat-yellow">75%</span>
                        <p className="text-[8px] uppercase tracking-widest text-white/20">Progress</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-2 py-1 rounded bg-white/5 text-[8px] font-bold uppercase tracking-widest text-white/40">12 Tasks Left</div>
                      <div className="px-2 py-1 rounded bg-white/5 text-[8px] font-bold uppercase tracking-widest text-white/40">Due in 14d</div>
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
              <h2 className="text-xl font-black tracking-tighter uppercase">Evolution Tracker</h2>
              
              <Card title="Skill Levels">
                <div className="space-y-4">
                  {[
                    { name: 'AI Development', level: 4, xp: 60 },
                    { name: 'Communication', level: 7, xp: 20 },
                    { name: 'Strategic Thinking', level: 5, xp: 85 }
                  ].map((skill, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-widest">{skill.name}</span>
                        <span className="text-xs font-black text-bat-purple">LVL {skill.level}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-bat-purple h-full" style={{ width: `${skill.xp}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Personality Radar">
                <div className="h-48 flex items-center justify-center border border-white/5 rounded-lg bg-white/2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">Personality Matrix Visualization</span>
                </div>
              </Card>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH BRAIN VAULT..." 
                  className="w-full bg-bat-panel border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-bold tracking-widest focus:outline-none focus:border-bat-yellow/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['Ideas', 'Lessons', 'Quotes', 'Books'].map((cat, i) => (
                  <Card key={i} className="flex flex-col items-center justify-center py-8 gap-2 hover:bg-white/5 cursor-pointer">
                    <BookOpen size={24} className="text-bat-yellow/40" />
                    <span className="text-xs font-bold uppercase tracking-widest">{cat}</span>
                  </Card>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Recent Reflections</h3>
                {[1, 2].map((_, i) => (
                  <Card key={i} className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold">The Compound Effect in Coding</h4>
                    <p className="text-xs text-white/40 line-clamp-2">Consistency is more important than intensity. Small daily improvements lead to massive long-term results...</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[8px] font-bold text-bat-yellow/60">#STRATEGY</span>
                      <span className="text-[8px] font-bold text-bat-yellow/60">#GROWTH</span>
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
                <h3 className="text-2xl font-black tracking-tighter uppercase">JEE Mastery</h3>
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
