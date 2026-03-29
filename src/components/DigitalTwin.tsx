import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Calendar,
  Wrench,
  Monitor,
  LayoutDashboard,
  Search,
  Battery,
  Info
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { formatIndian } from '@/hooks/useCountUp';
import { generateGoogleCalendarUrl } from '@/lib/calendar';

const DEGRADATION_DATA = Array.from({ length: 26 }, (_, i) => ({
  year: i,
  efficiency: 100 - (i * 0.7),
  output: 5420 * (1 - (i * 0.007))
}));

const MAINTENANCE_EVENTS = [
  { year: 3, label: 'Inverter Service', type: 'service' },
  { year: 10, label: 'String Combiner Check', type: 'check' },
  { year: 12, label: 'Panel Deep Cleaning', type: 'cleaning' },
  { year: 20, label: 'Battery Replacement', type: 'replacement' },
];

export default function DigitalTwin() {
  const [mode, setMode] = useState<'lifecycle' | 'live'>('lifecycle');
  const [year, setYear] = useState(1);
  const [projectId, setProjectId] = useState('S-32B-2025');
  const [liveGen, setLiveGen] = useState(4.2);
  const [liveCons, setLiveCons] = useState(1.5);
  const [history, setHistory] = useState<any[]>([]);

  // Live Telemetry Integration
  useEffect(() => {
    const handleTelemetry = (e: CustomEvent) => {
      if (mode === 'live') {
        const { power } = e.detail;
        const newGen = parseFloat(power);
        const newCons = 1.0 + (Math.random() * 1.5); // Still simulate consumption for now
        setLiveGen(newGen);
        setLiveCons(newCons);
        setHistory(prev => [...prev.slice(-19), { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          gen: newGen, 
          cons: newCons 
        }]);
      }
    };

    window.addEventListener('solar_telemetry' as any, handleTelemetry);
    
    // Fallback simulation if no live feed is active
    let interval: any;
    if (mode === 'live' && history.length === 0) {
      interval = setInterval(() => {
        const newGen = 3.5 + (Math.random() * 2);
        const newCons = 1.2 + (Math.random() * 1);
        setLiveGen(newGen);
        setLiveCons(newCons);
        setHistory(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), gen: newGen, cons: newCons }]);
      }, 5000);
    }

    return () => {
      window.removeEventListener('solar_telemetry' as any, handleTelemetry);
      if (interval) clearInterval(interval);
    };
  }, [mode, history.length]);

  const currentEfficiency = 100 - (year * 0.7);
  const currentOutput = 5420 * (1 - (year * 0.007));
  const healthScore = Math.max(0, 100 - (year * 1.2));

  return (
    <div id="digital-twin" className="min-h-screen py-24 px-6 lg:px-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Management Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-2">Management Console</h2>
            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Real-time Asset Monitoring
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 self-start">
             <button 
                onClick={() => setMode('lifecycle')}
                className={cn("px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all", mode === 'lifecycle' ? "bg-primary text-solar-navy shadow-lg" : "text-muted-foreground hover:text-white")}
              >
               <History size={14} /> Lifecycle
             </button>
             <button 
                onClick={() => setMode('live')}
                className={cn("px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all", mode === 'live' ? "bg-primary text-solar-navy shadow-lg" : "text-muted-foreground hover:text-white")}
              >
               <Activity size={14} /> Live Ops
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Visualizer */}
          <div className="lg:col-span-8 space-y-8">
            <GlassCard className="aspect-video relative overflow-hidden p-0" hover={false}>
               <div className="absolute inset-0 grid-overlay opacity-30" />
               
               <AnimatePresence mode="wait">
                  {mode === 'lifecycle' ? (
                    <motion.div 
                      key="lifecycle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="w-full h-full p-12 flex flex-col items-center justify-center"
                    >
                      <div className="relative w-full max-w-lg aspect-[4/3] bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className={cn("grid grid-cols-4 gap-2 p-8 h-full transition-all duration-1000", year > 15 ? "grayscale opacity-40" : "")}>
                           {Array.from({ length: 12 }).map((_, i) => (
                             <div key={i} className="bg-[#1A2A4A] border border-white/10 rounded-lg shadow-[0_0_15px_rgba(0,229,160,0.1)]" style={{ opacity: 1 - (year * 0.02) }} />
                           ))}
                        </div>
                        <div className="absolute bottom-6 left-6 glass px-3 py-1 rounded-full text-[9px] font-black text-primary border-primary/20">YEAR {year} AGING SIMULATION</div>
                      </div>
                      
                      <div className="absolute bottom-8 left-8 right-8 glass p-6 border-white/20 rounded-2xl">
                        <div className="flex justify-between items-center mb-4 text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                          <span>Predictive Timeline</span>
                          <span className="text-lg text-primary">Year {year}</span>
                        </div>
                        <input type="range" min="1" max="25" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="live"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="w-full h-full p-8 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border-primary/20 bg-background/50">
                          <Search size={14} className="text-muted-foreground" />
                          <input 
                            value={projectId} 
                            onChange={(e) => setProjectId(e.target.value)}
                            className="bg-transparent border-none outline-none font-mono text-sm text-white" 
                          />
                        </div>
                        <div className="flex gap-2">
                           <div className="glass px-3 py-1 rounded-lg text-[9px] font-black text-green-400 border-green-400/20 uppercase">Grid Online</div>
                           <div className="glass px-3 py-1 rounded-lg text-[9px] font-black text-blue-400 border-blue-400/20 uppercase">Inverter Sync</div>
                        </div>
                      </div>

                      <div className="flex-1 flex items-center justify-between gap-8 max-w-4xl mx-auto w-full">
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_50px_rgba(0,229,160,0.2)]">
                               <Zap size={40} className="text-primary" />
                            </div>
                            <div className="text-center font-black">
                               <p className="text-[10px] text-muted-foreground uppercase">Generation</p>
                               <p className="text-2xl text-white">{liveGen.toFixed(2)} kW</p>
                            </div>
                         </div>
                         <div className="flex-1 h-0.5 bg-white/5 relative overflow-hidden">
                            <motion.div 
                              animate={{ x: ['-100%', '100%'] }} 
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent" 
                            />
                         </div>
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                               <Monitor size={40} className="text-accent" />
                            </div>
                            <div className="text-center font-black">
                               <p className="text-[10px] text-muted-foreground uppercase">Consumption</p>
                               <p className="text-2xl text-white">{liveCons.toFixed(2)} kW</p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="mt-auto h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={history}>
                            <Line type="monotone" dataKey="gen" stroke="#00E5A0" strokeWidth={3} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="cons" stroke="#6366F1" strokeWidth={3} dot={false} isAnimationActive={false} />
                            <Tooltip contentStyle={{ background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="glass p-6 flex flex-col items-center text-center rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                    <Info size={12} />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Efficiency Grade</p>
                  <p className="text-2xl font-mono font-bold text-primary">{currentEfficiency.toFixed(1)}%</p>
               </div>
               <div className="glass p-6 flex flex-col items-center text-center rounded-2xl relative">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Asset Health</p>
                  <p className="text-2xl font-mono font-bold text-accent">{healthScore.toFixed(0)}/100</p>
               </div>
               <div className="glass p-6 flex flex-col items-center text-center rounded-2xl relative">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Daily Yield</p>
                  <p className="text-2xl font-mono font-bold text-secondary">
                    {(liveGen * 5.2).toFixed(1)} <span className="text-[10px]">kWh</span>
                  </p>
               </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             <div className="glass p-8 rounded-3xl">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-muted-foreground flex items-center gap-2">
                  <Battery size={14} className="text-primary" /> Energy Storage
                </h4>
                <div className="h-12 w-full bg-white/5 rounded-2xl p-2 relative mb-4 border border-white/5">
                   <motion.div 
                      animate={{ width: `${85}%` }}
                      className="h-full bg-primary rounded-xl"
                   />
                   <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white">85% SOC</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[8px] font-black text-muted-foreground uppercase tracking-tighter">
                   <div className="glass p-2 rounded-lg">Voltage: 48.2V</div>
                   <div className="glass p-2 rounded-lg">Cycle: #124</div>
                </div>
             </div>

             <div className="glass p-8 rounded-3xl">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-muted-foreground flex items-center gap-2">
                  <Wrench size={14} className="text-secondary" /> Smart Maintenance
                </h4>
                <div className="space-y-3">
                   {MAINTENANCE_EVENTS.filter(e => e.year > year).slice(0, 2).map((e, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 rounded-2xl glass border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                          <Calendar size={18} />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-white">{e.label}</p>
                           <p className="text-[10px] text-muted-foreground">Year {e.year}</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-6 py-4 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Request Service
                </button>
             </div>

             <div className="p-8 bg-primary/10 border border-primary/20 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={20} className="text-primary" />
                  <h5 className="font-bold text-white">AI Diagnostics</h5>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                   System operating within nominal parameters. Predicted efficiency for next 12 months is <span className="text-primary font-bold">98.4%</span>. No hardware fatigue detected.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
