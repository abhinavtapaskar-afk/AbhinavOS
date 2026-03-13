import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { Auth } from './components/Auth';
import { getAiResponse } from './services/geminiService';
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
  Smile,
  Shield,
  Activity,
  Cpu,
  Terminal,
  AlertTriangle
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

const SidebarItem = ({ icon: Icon, label, active, onClick, id }: { icon: any, label: string, active: boolean, onClick: () => void, id: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group relative",
      active ? "bg-bat-yellow/10 text-bat-yellow" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
    )}
  >
    <div className="relative">
      <Icon size={20} className={cn("transition-all duration-300", active ? "drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "group-hover:scale-110")} />
      {active && <motion.div layoutId="activeGlow" className="absolute -inset-2 bg-bat-yellow/20 blur-md rounded-full -z-10" />}
    </div>
    <div className="flex flex-col items-start">
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{id}</span>
      <span className="text-xs font-bold tracking-tight">{label}</span>
    </div>
    {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-bat-yellow rounded-r-full shadow-[0_0_10px_rgba(234,179,8,0.8)]" />}
  </button>
);

const Card = ({ children, title, className, icon: Icon, onClick, flickerDelay = 0 }: { children: React.ReactNode, title?: string, className?: string, icon?: any, onClick?: () => void, flickerDelay?: number }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: flickerDelay }}
    className={cn("bat-card animate-flicker", className)} 
    onClick={onClick}
  >
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</h3>}
        {Icon && <Icon size={14} className="text-bat-yellow/40" />}
      </div>
    )}
    {children}
  </motion.div>
);

const MetricCard = ({ label, value, subValue, icon: Icon, color = "yellow", flickerDelay = 0 }: { label: string, value: string | number, subValue?: string, icon: any, color?: "yellow" | "purple" | "green" | "red", flickerDelay?: number }) => {
  const colorMap = {
    yellow: "text-bat-yellow",
    purple: "text-bat-purple",
    green: "text-bat-success",
    red: "text-bat-warning"
  };
  
  return (
    <Card flickerDelay={flickerDelay} className="flex flex-col gap-1 border-l-2 border-l-bat-yellow/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
        <Icon size={12} className={colorMap[color]} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-3xl font-black tracking-tighter", colorMap[color])}>{value}</span>
        {subValue && <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{subValue}</span>}
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
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-bat-panel border border-bat-yellow/20 rounded-2xl p-8 z-[70] shadow-bat-glow"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-bat-yellow/50 uppercase tracking-[0.3em]">System Input</span>
              <h2 className="text-xl font-black tracking-tighter uppercase text-bat-yellow">{title}</h2>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
          </div>
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2 mb-6">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">{label}</label>
    <input 
      {...props}
      className="w-full bg-zinc-900/50 border border-bat-yellow/10 rounded-xl py-4 px-5 text-sm font-bold tracking-tight focus:outline-none focus:border-bat-yellow/50 focus:bg-zinc-900 transition-all"
    />
  </div>
);

const Select = ({ label, options, ...props }: { label: string, options: { value: string, label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-2 mb-6">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">{label}</label>
    <div className="relative">
      <select 
        {...props}
        className="w-full bg-zinc-900/50 border border-bat-yellow/10 rounded-xl py-4 px-5 text-sm font-bold tracking-tight focus:outline-none focus:border-bat-yellow/50 focus:bg-zinc-900 transition-all appearance-none"
      >
        {options.map(opt => <option key={opt.value} value={opt.value} className="bg-bat-panel">{opt.label}</option>)}
      </select>
      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-500 pointer-events-none" />
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>({
    stats: { discipline_score: 0, focus_score: 0, study_hours: 0, sleep_hours: 0, energy: 0 },
    recentLogs: [],
    profile: { level: 1 }
  });
  const [missions, setMissions] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Form States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const [messages, setMessages] = useState([
    { role: 'ai', text: "Systems online. AbhinavOS tactical HUD initialized. Your current discipline score is optimal. Shall we review the mission parameters?" }
  ]);
  const [aiInput, setAiInput] = useState('');

  const calculateDisciplineScore = (data: any) => {
    let score = 0;
    if (data.wake_up_time === '05:00') score += 20;
    score += Math.min(40, (Number(data.study_hours) / 6) * 40);
    if (data.workout_done === 'on') score += 20;
    const taskRatio = Number(data.total_tasks) > 0 ? Number(data.tasks_completed) / Number(data.total_tasks) : 0;
    score += Math.min(20, taskRatio * 20);
    return Math.round(score);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("SYSTEM ERROR: Security Keys Missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await refreshAll(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Auth init error:', err);
        setError(`AUTH ERROR: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        setLoading(true);
        refreshAll(currentUser.id);
      } else {
        setLoading(false);
        // Reset state on logout
        setMissions([]);
        setSkills([]);
        setNotes([]);
        setDashboardData({
          stats: { discipline_score: 0, focus_score: 0, study_hours: 0, sleep_hours: 0, energy: 0 },
          recentLogs: [],
          profile: { level: 1 }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshAll = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const [missRes, skRes, ntRes, logRes] = await Promise.all([
        supabase.from('missions').select('*').eq('user_id', targetUserId),
        supabase.from('skills').select('*').eq('user_id', targetUserId),
        supabase.from('brain_vault').select('*').eq('user_id', targetUserId),
        supabase.from('daily_logs').select('*').eq('user_id', targetUserId).order('date', { ascending: false }).limit(7)
      ]);

      if (missRes.error) throw missRes.error;
      if (skRes.error) throw skRes.error;
      if (ntRes.error) throw ntRes.error;
      if (logRes.error) throw logRes.error;

      setMissions(missRes.data || []);
      setSkills(skRes.data || []);
      setNotes(ntRes.data || []);
      
      const recentLogs = logRes.data || [];
      const latestLog = recentLogs[0] || {};
      
      setDashboardData({
        stats: {
          discipline_score: latestLog.discipline_score || 0,
          focus_score: (latestLog.energy_level || 0) * 10,
          study_hours: latestLog.study_hours || 0,
          sleep_hours: latestLog.sleep_hours || 0,
          energy: (latestLog.energy_level || 0) * 10
        },
        recentLogs: recentLogs,
        profile: { level: 1 }
      });
    } catch (err: any) {
      console.error('Supabase fetch error:', err);
      setError(`DATA ERROR: ${err.message || 'Failed to fetch tactical data'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return alert("Unauthorized: No user session found.");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const { error } = await supabase.from('daily_logs').insert([{
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        sleep_hours: Number(data.sleep_hours),
        study_hours: Number(data.study_hours),
        energy_level: Math.floor(Number(data.energy) / 10),
        mood: data.mood as string,
        workout_status: data.workout_done === 'on',
        wake_up_on_time: data.wake_up_time === '05:00',
        tasks_completed: Number(data.tasks_completed),
        total_tasks: Number(data.total_tasks),
        discipline_score: calculateDisciplineScore(data)
      }]);

      if (error) throw error;
      setIsLogModalOpen(false);
      refreshAll();
    } catch (err: any) {
      console.error('Insert error:', err);
      alert(`Failed to save log: ${err.message}`);
    }
  };

  const handleSaveMission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return alert("Unauthorized");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const { error } = await supabase.from('missions').insert([{
        user_id: user.id,
        title: data.title as string,
        category: data.category as string,
        priority: data.priority as string,
        deadline: data.deadline as string,
        progress_percent: 0,
        status: 'active'
      }]);
      if (error) throw error;
      setIsMissionModalOpen(false);
      refreshAll();
    } catch (err: any) {
      console.error(err);
      alert(`Mission deployment failed: ${err.message}`);
    }
  };

  const handleSaveSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return alert("Unauthorized");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const { error } = await supabase.from('skills').insert([{
        user_id: user.id,
        name: data.name as string,
        level: Number(data.level),
        total_minutes_practiced: 0
      }]);
      if (error) throw error;
      setIsSkillModalOpen(false);
      refreshAll();
    } catch (err: any) {
      console.error(err);
      alert(`Skill acquisition failed: ${err.message}`);
    }
  };

  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return alert("Unauthorized");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const { error } = await supabase.from('brain_vault').insert([{
        user_id: user.id,
        content: data.content as string,
        category: data.category as string,
        tags: (data.tags as string).split(',').map(t => t.trim())
      }]);
      if (error) throw error;
      setIsNoteModalOpen(false);
      refreshAll();
    } catch (err: any) {
      console.error(err);
      alert(`Intel storage failed: ${err.message}`);
    }
  };

  const handleSendMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = { role: 'user', text: aiInput };
    setMessages(prev => [...prev, userMsg]);
    setAiInput('');
    
    try {
      const response = await getAiResponse(aiInput, {
        stats: dashboardData?.stats,
        missions,
        skills
      });
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Neural Net error. Connection lost." }]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (error) return (
    <div className="h-screen w-screen flex items-center justify-center bg-bat-bg p-6">
      <div className="max-w-md w-full bat-card border-bat-warning/50 animate-flicker flex flex-col items-center text-center gap-6">
        <div className="relative">
          <AlertTriangle className="text-bat-warning" size={64} />
          <div className="absolute -inset-4 bg-bat-warning/20 blur-xl rounded-full" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-bat-warning uppercase tracking-tighter">System Critical Error</h2>
          <p className="text-xs font-bold text-zinc-400 leading-relaxed font-mono">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 rounded-xl bg-bat-warning text-bat-bg font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        >
          Reboot System
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-bat-bg">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Zap className="text-bat-yellow animate-pulse" size={64} />
          <div className="absolute -inset-4 bg-bat-yellow/20 blur-xl rounded-full animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-black tracking-[0.5em] text-bat-yellow uppercase">AbhinavOS</span>
          <span className="text-[10px] font-bold text-zinc-600 tracking-[0.2em] uppercase">Initializing Tactical HUD...</span>
        </div>
      </div>
    </div>
  );

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-bat-bg flex">
      {/* Sidebar (The Utility Belt) */}
      <aside className="w-64 border-r border-bat-yellow/10 bg-zinc-950/50 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-bat-yellow rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            <Shield size={22} className="text-bat-bg fill-bat-bg" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none">AbhinavOS</h1>
            <span className="text-[8px] font-black text-bat-yellow/50 tracking-[0.3em] uppercase">Level {dashboardData?.profile?.level || 1} Operator</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem id="01" icon={LayoutDashboard} label="Tactical HUD" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem id="02" icon={Target} label="Mission Log" active={activeTab === 'missions'} onClick={() => setActiveTab('missions')} />
          <SidebarItem id="03" icon={TrendingUp} label="Bio-System" active={activeTab === 'growth'} onClick={() => setActiveTab('growth')} />
          <SidebarItem id="04" icon={BookOpen} label="The Vault" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} />
          <SidebarItem id="05" icon={MessageSquare} label="Neural Net" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-bat-yellow/5 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-bat-warning transition-colors group"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-bat-yellow transition-colors group">
            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
          </button>
          <div className="bg-bat-yellow/5 border border-bat-yellow/10 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">System Integrity</span>
              <span className="text-[8px] font-black text-bat-success uppercase">Optimal</span>
            </div>
            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
              <div className="bg-bat-success h-full w-[94%]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Status Vital Bar */}
        <div className="sticky top-0 z-40 bg-bat-bg/80 backdrop-blur-md border-b border-bat-yellow/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Active Mission</span>
              <span className="text-xs font-black uppercase tracking-tight text-bat-yellow">{missions.find(m => m.status === 'active')?.title || 'No Active Mission'}</span>
            </div>
            <div className="h-8 w-px bg-bat-yellow/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Energy Level</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-bat-success h-full transition-all duration-1000" style={{ width: `${dashboardData?.stats?.energy || 0}%` }} />
                </div>
                <span className="text-[10px] font-black text-bat-success">{dashboardData?.stats?.energy || 0}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">System Time</span>
              <span className="text-xs font-black font-mono text-bat-yellow">{new Date().toLocaleTimeString([], { hour12: false })}</span>
            </div>
            <button 
              onClick={() => setIsFocusMode(true)}
              className="p-2.5 rounded-xl bg-bat-yellow/10 border border-bat-yellow/20 text-bat-yellow hover:bg-bat-yellow hover:text-bat-bg transition-all shadow-bat-glow"
            >
              <Timer size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-4 gap-6">
                  <MetricCard label="Discipline" value={dashboardData?.stats?.discipline_score || 0} subValue="Score" icon={Shield} flickerDelay={0.1} />
                  <MetricCard label="Neural Focus" value={dashboardData?.stats?.focus_score || 0} subValue="Index" icon={Brain} color="purple" flickerDelay={0.2} />
                  <MetricCard label="Study Hours" value={dashboardData?.stats?.study_hours || 0} subValue="Hours" icon={BookOpen} color="purple" flickerDelay={0.3} />
                  <MetricCard label="Sleep Cycle" value={dashboardData?.stats?.sleep_hours || 0} subValue="Hours" icon={Moon} color="green" flickerDelay={0.4} />
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-2 space-y-8">
                    {/* Discipline Trend */}
                    <Card title="Discipline Engine Analytics" icon={TrendingUp} flickerDelay={0.5}>
                      <div className="h-[300px] w-full mt-4">
                        {dashboardData?.recentLogs?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...(dashboardData?.recentLogs || [])].reverse()}>
                              <defs>
                                <linearGradient id="colorDisc" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="date" hide />
                              <YAxis hide domain={[0, 100]} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #eab30820', borderRadius: '12px', fontSize: '10px' }}
                                itemStyle={{ color: '#eab308' }}
                              />
                              <Area type="monotone" dataKey="discipline_score" stroke="#eab308" fillOpacity={1} fill="url(#colorDisc)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center border border-dashed border-bat-yellow/10 rounded-xl">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Awaiting Bio-Data...</span>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={() => setIsLogModalOpen(true)}
                        className="group relative overflow-hidden p-6 rounded-2xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-sm shadow-bat-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          <Terminal size={20} />
                          Log Daily Intel
                        </div>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      </button>
                      <button 
                        onClick={() => setIsMissionModalOpen(true)}
                        className="group relative overflow-hidden p-6 rounded-2xl bg-zinc-900 border border-bat-yellow/20 text-bat-yellow font-black uppercase tracking-widest text-sm transition-all hover:bg-zinc-800"
                      >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          <Plus size={20} />
                          Initiate Mission
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Mission Control Widget */}
                    <Card title="Mission Control" icon={Target} flickerDelay={0.6}>
                      <div className="space-y-6 mt-4">
                        {missions.filter(m => m.status === 'active').slice(0, 3).map((mission: any) => (
                          <div key={mission.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold tracking-tight uppercase">{mission.title}</span>
                              <span className="text-[10px] font-black text-bat-yellow">{mission.progress_percent}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-bat-yellow h-full shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000" 
                                style={{ width: `${mission.progress_percent}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                        {missions.length === 0 && <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center py-4">No active missions</p>}
                      </div>
                    </Card>

                    {/* Personal Code */}
                    <Card title="The Personal Code" icon={Shield} flickerDelay={0.7}>
                      <div className="space-y-4 mt-4">
                        {[
                          "Never skip a workout.",
                          "Improve by 1% every single day.",
                          "Protect focus at all costs.",
                          "Help others without return."
                        ].map((rule, i) => (
                          <div key={i} className="flex items-start gap-3 group">
                            <div className="w-1.5 h-1.5 bg-bat-yellow rounded-full mt-1.5 shadow-[0_0_8px_rgba(234,179,8,0.8)] group-hover:scale-150 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-relaxed">{rule}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
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
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Active Operations</h2>
                  <button 
                    onClick={() => setIsMissionModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-[10px] shadow-bat-glow hover:scale-105 transition-all"
                  >
                    <Plus size={16} />
                    New Mission
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {missions.map((mission) => (
                    <Card key={mission.id} title={mission.category} className="relative group">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-black uppercase tracking-tight text-white">{mission.title}</h3>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                          mission.priority === 'High' ? "border-red-500/50 text-red-500 bg-red-500/10" : "border-bat-yellow/50 text-bat-yellow bg-bat-yellow/10"
                        )}>
                          {mission.priority} Priority
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          <span>Progress</span>
                          <span className="text-bat-yellow">{mission.progress_percent}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-bat-yellow h-full shadow-bat-glow transition-all duration-1000" 
                            style={{ width: `${mission.progress_percent}%` }} 
                          />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest pt-2">
                          <Calendar size={12} />
                          Deadline: {new Date(mission.deadline).toLocaleDateString()}
                        </div>
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
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Skill Matrix</h2>
                  <button 
                    onClick={() => setIsSkillModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-[10px] shadow-bat-glow hover:scale-105 transition-all"
                  >
                    <Plus size={16} />
                    Acquire Skill
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {skills.map((skill) => (
                    <Card key={skill.id} className="text-center p-8 border-t-2 border-t-bat-yellow/20">
                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-bat-yellow/10">
                        <Zap size={24} className="text-bat-yellow" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">{skill.name}</h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-[10px] font-black text-bat-yellow uppercase tracking-widest">Level {skill.level}</span>
                      </div>
                      <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {skill.total_minutes_practiced} Minutes Practiced
                      </div>
                    </Card>
                  ))}
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
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black tracking-tighter uppercase text-white">The Brain Vault</h2>
                  <button 
                    onClick={() => setIsNoteModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-[10px] shadow-bat-glow hover:scale-105 transition-all"
                  >
                    <Plus size={16} />
                    Store Intel
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {notes.map((note) => (
                    <Card key={note.id} title={note.category} className="flex flex-col gap-4">
                      <p className="text-sm text-zinc-300 leading-relaxed italic">"{note.content}"</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {note.tags?.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-zinc-900 text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-bat-yellow/5">
                            #{tag}
                          </span>
                        ))}
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
                className="h-[calc(100vh-180px)] flex flex-col gap-6"
              >
                <div className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-hide">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-bat-glow",
                        msg.role === 'ai' ? "bg-bat-yellow text-bat-bg" : "bg-zinc-800 text-zinc-400"
                      )}>
                        {msg.role === 'ai' ? <Cpu size={20} /> : <span className="text-xs font-black">OP</span>}
                      </div>
                      <div className={cn(
                        "p-5 rounded-2xl max-w-[70%] border",
                        msg.role === 'ai' 
                          ? "bg-bat-panel border-bat-yellow/10 rounded-tl-none" 
                          : "bg-bat-yellow/5 border-bat-yellow/20 rounded-tr-none text-bat-yellow"
                      )}>
                        <p className="text-xs leading-relaxed font-medium">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="CONSULT NEURAL NET..." 
                    className="w-full bg-bat-panel border border-bat-yellow/10 rounded-2xl py-5 pl-6 pr-16 text-xs font-bold tracking-[0.2em] focus:outline-none focus:border-bat-yellow/50 transition-all shadow-bat-glow"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-bat-yellow hover:scale-110 transition-transform"
                  >
                    <Terminal size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Intelligence Log">
        <form onSubmit={handleAddLog} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Wake Up Time" name="wake_up_time" type="time" defaultValue="05:00" required />
            <Input label="Energy Level (1-100)" name="energy" type="number" defaultValue="80" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sleep Hours" name="sleep_hours" type="number" step="0.1" defaultValue="7" required />
            <Input label="Study Hours" name="study_hours" type="number" step="0.1" defaultValue="4" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tasks Completed" name="tasks_completed" type="number" defaultValue="5" required />
            <Input label="Total Tasks" name="total_tasks" type="number" defaultValue="8" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Focus Index" name="focus_score" type="number" defaultValue="75" required />
            <Select label="Current Mood" name="mood" options={[
              { value: 'Motivated', label: 'Motivated' },
              { value: 'Focused', label: 'Focused' },
              { value: 'Calm', label: 'Calm' },
              { value: 'Tired', label: 'Tired' }
            ]} />
          </div>
          <div className="flex gap-8 py-4 px-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name="workout_done" className="w-5 h-5 rounded border-bat-yellow/20 bg-zinc-900 accent-bat-yellow" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-bat-yellow transition-colors">Workout Complete</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name="meditation_done" className="w-5 h-5 rounded border-bat-yellow/20 bg-zinc-900 accent-bat-yellow" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-bat-yellow transition-colors">Meditation Complete</span>
            </label>
          </div>
          <button type="submit" className="w-full py-5 rounded-2xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs mt-4 shadow-bat-glow hover:scale-[1.02] transition-all">Commit to Database</button>
        </form>
      </Modal>

      <Modal isOpen={isMissionModalOpen} onClose={() => setIsMissionModalOpen(false)} title="Initiate Mission">
        <form onSubmit={handleSaveMission} className="space-y-4">
          <Input label="Mission Title" name="title" placeholder="e.g., Crack JEE" required />
          <Input label="Category" name="category" placeholder="e.g., Academics" required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" name="priority" options={[
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' }
            ]} />
            <Input label="Deadline" name="deadline" type="date" required />
          </div>
          <button type="submit" className="w-full py-5 rounded-2xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs mt-4 shadow-bat-glow hover:scale-[1.02] transition-all">Deploy Mission</button>
        </form>
      </Modal>

      <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title="Acquire Skill">
        <form onSubmit={handleSaveSkill} className="space-y-4">
          <Input label="Skill Name" name="name" placeholder="e.g., Quantum Physics" required />
          <Input label="Initial Level" name="level" type="number" defaultValue="1" required />
          <button type="submit" className="w-full py-5 rounded-2xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs mt-4 shadow-bat-glow hover:scale-[1.02] transition-all">Register Skill</button>
        </form>
      </Modal>

      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Store Intel">
        <form onSubmit={handleSaveNote} className="space-y-4">
          <div className="space-y-2 mb-6">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Intel Content</label>
            <textarea 
              name="content"
              required
              rows={4}
              className="w-full bg-zinc-900/50 border border-bat-yellow/10 rounded-xl py-4 px-5 text-sm font-bold tracking-tight focus:outline-none focus:border-bat-yellow/50 focus:bg-zinc-900 transition-all text-white"
              placeholder="Enter tactical data..."
            />
          </div>
          <Input label="Category" name="category" placeholder="e.g., Strategy" required />
          <Input label="Tags (comma separated)" name="tags" placeholder="e.g., physics, exam, formula" />
          <button type="submit" className="w-full py-5 rounded-2xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs mt-4 shadow-bat-glow hover:scale-[1.02] transition-all">Commit to Vault</button>
        </form>
      </Modal>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bat-bg z-[100] flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#eab308_0%,transparent_70%)]" />
              <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            <button 
              onClick={() => setIsFocusMode(false)}
              className="absolute top-12 right-12 p-3 text-zinc-700 hover:text-bat-yellow transition-all hover:rotate-90"
            >
              <X size={32} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-16 w-full max-w-md relative z-10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="h-px w-12 bg-bat-yellow/20" />
                  <h2 className="text-[10px] font-black tracking-[0.8em] text-bat-yellow uppercase">Deep Work Protocol</h2>
                  <div className="h-px w-12 bg-bat-yellow/20" />
                </div>
                <h3 className="text-4xl font-black tracking-tighter uppercase text-white">{missions.find(m => m.status === 'active')?.title || 'Active Mission'}</h3>
              </div>

              <div className="relative aspect-square flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                  <circle 
                    cx="50%" cy="50%" r="45%" 
                    className="stroke-zinc-900 fill-none" 
                    strokeWidth="2" 
                  />
                  <motion.circle 
                    cx="50%" cy="50%" r="45%" 
                    className="stroke-bat-yellow fill-none" 
                    strokeWidth="4" 
                    strokeDasharray="283" 
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 70 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-8xl font-black tracking-tighter font-mono text-white">24:59</span>
                  <span className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-2">Remaining</span>
                </div>
              </div>

              <div className="flex gap-6">
                <button className="flex-1 py-5 rounded-2xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 transition-all">
                  Pause Session
                </button>
                <button className="flex-1 py-5 rounded-2xl bg-zinc-900 border border-bat-yellow/20 text-bat-yellow font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all">
                  Abort Protocol
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
