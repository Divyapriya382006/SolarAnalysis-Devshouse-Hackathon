import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Home, 
  Battery, 
  TrendingUp, 
  Activity,
  Sun, 
  Moon, 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/lib/utils';
import { useLiveWeather } from '@/lib/weatherSocket';

const FlowLine = ({ active, color, direction = 'right' }: any) => {
  return (
    <div className="relative flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
      {active && (
        <motion.div
          initial={{ x: direction === 'right' ? '-100%' : '100%' }}
          animate={{ x: direction === 'right' ? '100%' : '-100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex gap-4"
        >
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-4 h-full rounded-full" style={{ backgroundColor: color }} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default function LiveSimulation() {
  const [time, setTime] = useState(12); // 12 PM
  const [generation, setGeneration] = useState(4.2);
  const [consumption, setConsumption] = useState(1.8);
  const [batterySoc, setBatterySoc] = useState(85);
  const [history, setHistory] = useState<any[]>([]);
  const weather = useLiveWeather();

  useEffect(() => {
    const interval = setInterval(() => {
      // Mock live fluctuations using WebSocket Weather Data
      const baseSunlightCurve = Math.max(0, Math.sin((time - 6) * (Math.PI / 12)) * 5);
      const weatherImpact = weather.sunlight / 1000;
      const genBase = baseSunlightCurve * weatherImpact;
      const newGen = Math.max(0, genBase + (Math.random() - 0.5) * 0.2);
      const newCons = 1.5 + (Math.random() - 0.5) * 0.5 + (weather.temp > 35 ? Math.random() * 1.5 : 0); // High temp = ACs running
      
      setGeneration(newGen);
      setConsumption(newCons);
      setHistory(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), gen: newGen, cons: newCons }]);
      
      // Battery logic
      if (newGen > newCons) {
        setBatterySoc(prev => Math.min(100, prev + 0.1));
      } else {
        setBatterySoc(prev => Math.max(10, prev - 0.05));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [time, weather]);

  const isExporting = generation > consumption;
  const netFlow = Math.abs(generation - consumption);

  return (
    <div id="live-sim" className="min-h-screen py-24 px-8 lg:px-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Activity className="w-4 h-4" />
              REAL-TIME ENERGY SIMULATION
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Live Energy Flow
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience your solar system in action. Adjust the time-of-day slider 
              to see how generation and consumption patterns shift.
            </p>
          </div>

          <div className="glass p-6 flex flex-col gap-4 w-full lg:w-80 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Time of Day</span>
              <span className="text-xs font-mono font-bold text-primary">{time}:00</span>
            </div>
            <div className="flex items-center gap-4">
              <Moon className="w-4 h-4 text-accent" />
              <input 
                type="range" 
                min="0" 
                max="23" 
                value={time}
                onChange={(e) => setTime(parseInt(e.target.value))}
                className="flex-1 accent-primary bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
              />
              <Sun className="w-4 h-4 text-secondary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Flow Diagram */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] rounded-2xl">
              <div className="absolute inset-0 grid-overlay opacity-30" />
              
              <div className="relative w-full flex items-center justify-between gap-4 max-w-4xl">
                {/* Solar Panels */}
                <div className="flex flex-col items-center gap-4 z-10">
                  <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center border transition-all duration-500",
                    generation > 0 ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_30px_rgba(0,229,160,0.2)]" : "bg-white/5 border-white/10 text-muted-foreground"
                  )}>
                    <Zap className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Solar Panels</p>
                    <p className="text-xl font-mono font-bold">{generation.toFixed(2)}<span className="text-xs ml-1">kW</span></p>
                  </div>
                </div>

                <FlowLine active={generation > 0} color="#00E5A0" />

                {/* Inverter */}
                <div className="flex flex-col items-center gap-4 z-10">
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-20" />
                    <Activity className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inverter</p>
                    <p className="text-xs font-bold text-success">ONLINE</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <FlowLine active={true} color="#6366F1" />
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Home className="w-8 h-8 text-accent" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Home</p>
                        <p className="text-sm font-mono font-bold">{consumption.toFixed(2)}kW</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FlowLine active={isExporting} color="#00E5A0" direction={isExporting ? 'right' : 'left'} />
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all",
                        isExporting ? "bg-success/10 border-success/30 text-success" : "bg-secondary/10 border-secondary/30 text-secondary"
                      )}>
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Grid</p>
                        <p className="text-sm font-mono font-bold">{netFlow.toFixed(2)}kW</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-8 right-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isExporting ? 'export' : 'import'}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                      isExporting ? "bg-success/10 border-success/30 text-success" : "bg-secondary/10 border-secondary/30 text-secondary"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", isExporting ? "bg-success" : "bg-secondary")} />
                    {isExporting ? 'Exporting to Grid' : 'Importing from Grid'}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="glass p-8 h-[300px] rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Live Generation vs Consumption
                </h4>
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> GEN</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent" /> CONS</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={history}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 6]} />
                  <Tooltip 
                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gen" 
                    stroke="#00E5A0" 
                    strokeWidth={3} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cons" 
                    stroke="#6366F1" 
                    strokeWidth={3} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Stats & Battery */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass p-8 flex flex-col items-center text-center rounded-2xl">
              <div className="relative w-40 h-40 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="transparent"
                    stroke="#00E5A0"
                    strokeWidth="12"
                    strokeDasharray={440}
                    animate={{ strokeDashoffset: 440 - (440 * generation) / 6 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-mono font-bold text-primary">{generation.toFixed(1)}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Current kW</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Sun className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold text-muted-foreground">Peak Sun Hours</span>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold flex items-center gap-2 text-sm">
                  <Battery className="w-4 h-4 text-primary" />
                  Battery Storage
                </h4>
                <span className="text-xs font-mono font-bold text-primary">{batterySoc.toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden mb-4 p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${batterySoc}%` }}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    batterySoc > 20 ? "bg-primary" : "bg-destructive"
                  )}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>10kWh System</span>
                <span>{isExporting ? 'Charging' : 'Discharging'}</span>
              </div>
            </div>

            <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h5 className="font-bold text-sm">Live System Metrics</h5>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Local Weather</span>
                  <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded-full border", weather.status.includes('Rain') || weather.status.includes('Overcast') ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-primary/10 text-primary border-primary/30")}>
                    {weather.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Cloud Cover & Shadow</span>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{weather.cloudiness}% / <span className="text-red-400">{weather.shadowImpact}% drop</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Amb/Panel Temp</span>
                  <span className="text-xs font-mono font-bold">{weather.temp}°C / {(weather.temp + 12).toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Live Sun Irradiance</span>
                  <span className="text-xs font-mono font-bold text-amber-500">{weather.sunlight} W/m²</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
