import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  ArrowRight, 
  Zap, 
  Info,
  Calendar,
  Wrench
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
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
  const [year, setYear] = useState(1);

  const currentEfficiency = 100 - (year * 0.7);
  const currentOutput = 5420 * (1 - (year * 0.007));
  const healthScore = Math.max(0, 100 - (year * 1.2));

  const activeAlerts = useMemo(() => {
    return MAINTENANCE_EVENTS.filter(e => e.year <= year && e.year > year - 5);
  }, [year]);

  return (
    <div id="digital-twin" className="min-h-screen py-24 px-8 lg:px-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent/5 -ml-64 -mt-64 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest mb-4"
          >
            <History className="w-4 h-4" />
            SOLAR DIGITAL TWIN (AGING SIMULATOR)
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Predictive Lifecycle Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Simulate your system's performance over its 25-year lifespan. 
            AI-driven insights help you plan maintenance and maximize longevity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Aging Visualization */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass p-8 aspect-video relative flex items-center justify-center overflow-hidden group rounded-2xl">
              <div className="absolute inset-0 grid-overlay opacity-50" />
              
              {/* Mock Rooftop Model */}
              <div className="relative w-full max-w-md aspect-[4/3] bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className={cn(
                  "absolute inset-0 transition-all duration-1000",
                  year > 10 ? "opacity-30 grayscale" : "opacity-100",
                  year > 20 ? "opacity-10 grayscale blur-[1px]" : ""
                )}>
                  {/* Visual representation of panels */}
                  <div className="grid grid-cols-4 gap-2 p-8 h-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "rounded-lg border border-white/10 transition-all duration-1000",
                          year > 5 ? "bg-[#1A2A4A]/80" : "bg-[#1A2A4A]",
                          year > 15 ? "bg-[#2A3A5A]/60" : ""
                        )}
                        style={{ 
                          boxShadow: year < 10 ? '0 0 20px rgba(0,229,160,0.1)' : 'none',
                          opacity: 1 - (year * 0.02)
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Dust/Aging Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                  style={{ 
                    opacity: year * 0.02,
                    backgroundImage: `radial-gradient(circle at ${Math.random()*100}% ${Math.random()*100}%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`
                  }}
                />

                <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-bold text-muted-foreground">
                  <Activity className="w-3 h-3 text-primary" />
                  YEAR {year} SIMULATION
                </div>
              </div>

              {/* Year Scrubber Overlay */}
              <div className="absolute bottom-8 left-8 right-8 glass p-6 border-white/20 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Timeline Scrubber</span>
                  <span className="text-xl font-mono font-bold text-primary">Year {year}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="25" 
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full accent-primary bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground">
                  <span>INSTALLATION</span>
                  <span>MID-LIFE</span>
                  <span>END OF LIFE</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 flex flex-col items-center text-center rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Efficiency</p>
                <p className="text-2xl font-mono font-bold text-primary">{currentEfficiency.toFixed(1)}%</p>
              </div>
              <div className="glass p-6 flex flex-col items-center text-center rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/20">
                  <Activity className="w-6 h-6 text-accent" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Health Score</p>
                <p className="text-2xl font-mono font-bold text-accent">{healthScore.toFixed(0)}</p>
              </div>
              <div className="glass p-6 flex flex-col items-center text-center rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 border border-secondary/20">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Est. Output</p>
                <p className="text-2xl font-mono font-bold text-secondary">{formatIndian(Math.round(currentOutput))}<span className="text-xs ml-1">kWh</span></p>
              </div>
            </div>
          </div>

          {/* Right: Charts & Alerts */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass p-8 h-[300px] rounded-2xl">
              <h4 className="font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Degradation Curve
              </h4>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={DEGRADATION_DATA}>
                  <defs>
                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" hide />
                  <YAxis hide domain={[70, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#6366F1" 
                    fillOpacity={1} 
                    fill="url(#colorEff)" 
                    animationDuration={2000}
                  />
                  <ReferenceLine x={year} stroke="#F59E0B" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="font-bold flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-secondary" />
                  Maintenance Timeline
                </h4>
                <a 
                  href={generateGoogleCalendarUrl({
                    title: 'Sunwise Solar System Maintenance',
                    description: 'Yearly checkup and deep cleaning of your solar system. Keep those panels shining!',
                    startDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate() + 1)), // 1 day event next year
                    recurrenceRule: 'RRULE:FREQ=YEARLY;COUNT=25',
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3 h-3" /> Add to Calendar
                </a>
              </div>
              <div className="space-y-3">
                {MAINTENANCE_EVENTS.map((event, i) => {
                  const isUpcoming = event.year > year;
                  const isPast = event.year <= year;
                  return (
                    <motion.div
                      key={event.label}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                        isPast ? "bg-success/5 border-success/20" : "glass border-white/10 opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isPast ? "bg-success/10 text-success" : "bg-white/5 text-muted-foreground"
                        )}>
                          {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{event.label}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Year {event.year}</p>
                        </div>
                      </div>
                      {isUpcoming && <span className="text-[10px] font-bold text-muted-foreground">UPCOMING</span>}
                      {isPast && <span className="text-[10px] font-bold text-success">COMPLETED</span>}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-secondary/10 border border-secondary/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-secondary" />
                <h5 className="font-bold text-sm">Smart Health Alert</h5>
              </div>
              <p className="text-xs leading-relaxed opacity-80">
                {year < 10 
                  ? "System is in peak health. Regular cleaning every 6 months will maintain 99.2% efficiency."
                  : year < 20 
                    ? "Efficiency drop detected (expected aging). Consider a professional inverter health check in Year 12."
                    : "End-of-life phase. Efficiency below 85%. Plan for system repowering or panel replacement."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
