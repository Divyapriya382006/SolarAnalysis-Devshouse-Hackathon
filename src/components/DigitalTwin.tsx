import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useCountUp, formatIndian } from '@/hooks/useCountUp';
import { Clock, AlertTriangle, Wrench, Activity } from 'lucide-react';

const maintenanceAlerts = [
  { year: 3, message: 'Inverter service due', icon: Wrench },
  { year: 5, message: 'Panel cleaning recommended', icon: Activity },
  { year: 10, message: 'String combiner check', icon: AlertTriangle },
  { year: 12, message: 'Deep cleaning recommended', icon: Activity },
  { year: 15, message: 'Inverter replacement likely', icon: Wrench },
  { year: 20, message: 'Battery replacement due', icon: AlertTriangle },
];

interface DigitalTwinProps {
  systemData: { panelCount: number; totalKw: number; annualKwh: number };
}

export default function DigitalTwin({ systemData }: DigitalTwinProps) {
  const [year, setYear] = useState(1);

  const degradation = 1 - (year * 0.007);
  const currentEfficiency = Math.round(degradation * 100);
  const currentOutput = Math.round(systemData.annualKwh * degradation);
  const healthScore = Math.max(0, Math.round(100 - year * 2.5));
  const activeAlerts = maintenanceAlerts.filter(a => a.year <= year);

  const effDisplay = useCountUp(currentEfficiency, 400, 100, true);
  const outputDisplay = useCountUp(currentOutput, 600, systemData.annualKwh, true);
  const healthDisplay = useCountUp(healthScore, 400, 100, true);

  return (
    <section id="digital-twin" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-indigo"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Solar Digital Twin
      </motion.h2>
      <motion.p
        className="text-solar-muted mb-12 max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Simulate 25 years of system performance. Drag the timeline to see degradation, maintenance needs, and aging effects.
      </motion.p>

      {/* Timeline scrubber */}
      <GlassCard className="mb-8" hover={false}>
        <div className="flex items-center gap-4 mb-4">
          <Clock size={20} className="text-solar-indigo" />
          <span className="text-sm text-solar-muted">Year</span>
          <span className="font-mono-data text-3xl text-solar-indigo">{year}</span>
          <span className="text-sm text-solar-muted">of 25</span>
        </div>
        <input
          type="range"
          min={1}
          max={25}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full accent-solar-indigo h-2"
          style={{ accentColor: '#6366F1' }}
        />
        <div className="flex justify-between text-xs text-solar-muted mt-2">
          <span>Year 1</span>
          <span>Year 25</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health gauge */}
        <GlassCard glow={healthScore < 60 ? 'none' : 'indigo'}>
          <h3 className="text-lg font-semibold mb-6">System Health</h3>
          <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke={healthScore > 70 ? '#00E5A0' : healthScore > 40 ? '#F59E0B' : '#EF4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${healthScore * 2.64} 264`}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="font-mono-data text-3xl" style={{ color: healthScore > 70 ? '#00E5A0' : healthScore > 40 ? '#F59E0B' : '#EF4444' }}>
                {healthDisplay}
              </div>
              <div className="text-xs text-solar-muted">Health Score</div>
            </div>
          </div>
        </GlassCard>

        {/* Performance stats */}
        <GlassCard delay={0.1}>
          <h3 className="text-lg font-semibold mb-6">Performance at Year {year}</h3>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-solar-muted uppercase tracking-wider mb-1">Efficiency</div>
              <div className="font-mono-data text-2xl text-solar-green">{effDisplay}%</div>
              <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ width: `${currentEfficiency}%`, background: currentEfficiency > 85 ? '#00E5A0' : '#F59E0B' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-solar-muted mt-1">0.7%/year degradation</div>
            </div>
            <div>
              <div className="text-xs text-solar-muted uppercase tracking-wider mb-1">Annual Output</div>
              <div className="font-mono-data text-2xl text-solar-amber">{formatIndian(outputDisplay)} <span className="text-sm">kWh</span></div>
            </div>
            <div>
              <div className="text-xs text-solar-muted uppercase tracking-wider mb-1">Dust Factor</div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-solar-amber/60"
                  style={{ width: `${Math.min(year * 4, 80)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-solar-muted mt-1">{year < 5 ? 'Low' : year < 15 ? 'Moderate' : 'High'} accumulation</div>
            </div>
          </div>
        </GlassCard>

        {/* Maintenance alerts */}
        <GlassCard delay={0.2}>
          <h3 className="text-lg font-semibold mb-6">Maintenance Alerts</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="text-solar-muted text-sm text-center py-8">No maintenance due yet</div>
            ) : (
              activeAlerts.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 glass rounded-lg p-3"
                >
                  <alert.icon size={16} className="text-solar-amber mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Year {alert.year}</div>
                    <div className="text-xs text-solar-muted">{alert.message}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
