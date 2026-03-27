import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from './GlassCard';
import { formatIndian } from '@/hooks/useCountUp';
import { Activity, Battery, Sun, Cloud, Zap, ArrowUpRight } from 'lucide-react';

export default function LiveSimulation() {
  const [timeOfDay, setTimeOfDay] = useState(50);
  const [data, setData] = useState<Array<{ time: string; gen: number }>>([]);
  const [cloudCover, setCloudCover] = useState(20);

  const hour = Math.round((timeOfDay / 100) * 24);
  const isDay = hour >= 6 && hour <= 18;
  const sunFactor = isDay ? Math.sin(((hour - 6) / 12) * Math.PI) : 0;
  const weatherFactor = 1 - cloudCover / 150;
  const currentGen = Math.round(sunFactor * weatherFactor * 4.2 * 100) / 100;
  const consumption = 1.5 + Math.random() * 0.3;
  const exporting = currentGen > consumption;
  const batterySOC = Math.min(90, Math.round(sunFactor * 60 + 30));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          gen: Math.max(0, currentGen + (Math.random() - 0.5) * 0.3),
        };
        const updated = [...prev, newPoint];
        return updated.slice(-30);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentGen]);

  return (
    <section id="live-sim" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-primary"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Real-Time Simulation
      </motion.h2>
      <motion.p
        className="text-solar-muted mb-12 max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Watch your solar system generate power in real-time. Adjust time and weather to see how output changes.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main gauge */}
        <GlassCard className="lg:col-span-2" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={20} className="text-solar-green" />
              Live Generation
            </h3>
            {exporting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-xs text-solar-green glass rounded-full px-3 py-1"
              >
                <ArrowUpRight size={12} />
                Exporting to Grid
              </motion.div>
            )}
          </div>

          {/* Arc gauge */}
          <div className="relative w-48 h-24 mx-auto mb-6 overflow-hidden">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <path d="M 20 95 A 80 80 0 0 1 180 95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
              <motion.path
                d="M 20 95 A 80 80 0 0 1 180 95"
                fill="none"
                stroke={isDay ? '#00E5A0' : '#8892A4'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="251"
                strokeDashoffset={251 - (currentGen / 5) * 251}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <div className="font-mono-data text-4xl text-solar-green">{currentGen.toFixed(1)}</div>
              <div className="text-xs text-solar-muted">kW</div>
            </div>
          </div>

          {/* Energy flow */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <Sun size={28} className={isDay ? 'text-solar-amber mx-auto mb-1' : 'text-solar-muted mx-auto mb-1'} />
              <div className="text-xs text-solar-muted">Solar</div>
              <div className="font-mono-data text-sm text-solar-green">{currentGen.toFixed(1)} kW</div>
            </div>
            <motion.div
              className="flex gap-1"
              animate={{ opacity: isDay ? [0.3, 1, 0.3] : 0.2 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-solar-green" />
              ))}
            </motion.div>
            <div className="text-center">
              <Zap size={28} className="text-solar-amber mx-auto mb-1" />
              <div className="text-xs text-solar-muted">Home</div>
              <div className="font-mono-data text-sm text-solar-amber">{consumption.toFixed(1)} kW</div>
            </div>
            <motion.div
              className="flex gap-1"
              animate={{ opacity: exporting ? [0.3, 1, 0.3] : 0.2 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-solar-green" />
              ))}
            </motion.div>
            <div className="text-center">
              <Battery size={28} className="text-solar-indigo mx-auto mb-1" />
              <div className="text-xs text-solar-muted">Battery</div>
              <div className="font-mono-data text-sm text-solar-indigo">{batterySOC}%</div>
            </div>
          </div>

          {/* Live chart */}
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={data}>
              <XAxis dataKey="time" tick={{ fill: '#8892A4', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 5]} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F0F4FF' }} />
              <Line type="monotone" dataKey="gen" stroke="#00E5A0" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Controls */}
        <div className="space-y-4">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Sun size={16} className="text-solar-amber" />
              <span className="text-sm">Time of Day</span>
              <span className="font-mono-data text-solar-amber ml-auto">{String(hour).padStart(2, '0')}:00</span>
            </div>
            <input
              type="range" min={0} max={100} value={timeOfDay}
              onChange={(e) => setTimeOfDay(Number(e.target.value))}
              className="w-full accent-solar-amber"
            />
            <div className="flex justify-between text-xs text-solar-muted mt-1">
              <span>00:00</span><span>12:00</span><span>24:00</span>
            </div>
          </GlassCard>

          <GlassCard delay={0.1}>
            <div className="flex items-center gap-2 mb-4">
              <Cloud size={16} className="text-solar-muted" />
              <span className="text-sm">Cloud Cover</span>
              <span className="font-mono-data text-solar-muted ml-auto">{cloudCover}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={cloudCover}
              onChange={(e) => setCloudCover(Number(e.target.value))}
              className="w-full"
            />
          </GlassCard>

          <GlassCard delay={0.2}>
            <div className="text-xs text-solar-muted uppercase tracking-wider mb-2">Battery SOC</div>
            <div className="relative w-full h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-solar-indigo"
                style={{ width: `${batterySOC}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="font-mono-data text-lg text-solar-indigo mt-2">{batterySOC}%</div>
          </GlassCard>

          <GlassCard delay={0.3}>
            <div className="text-xs text-solar-muted uppercase tracking-wider mb-2">Today's Generation</div>
            <div className="font-mono-data text-2xl text-solar-green">{formatIndian(Math.round(currentGen * hour * 0.6))} <span className="text-sm">Wh</span></div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
