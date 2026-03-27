import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from './GlassCard';
import { useCountUp, formatIndian } from '@/hooks/useCountUp';
import { Leaf, TreePine, Zap, TrendingUp, Sun } from 'lucide-react';

const donutData = [
  { name: 'Self-consumption', value: 65, color: '#00E5A0' },
  { name: 'Grid Export', value: 25, color: '#F59E0B' },
  { name: 'Battery Storage', value: 10, color: '#6366F1' },
];

const monthlyData = [
  { month: 'Jan', kwh: 380, type: 'winter' },
  { month: 'Feb', kwh: 420, type: 'winter' },
  { month: 'Mar', kwh: 520, type: 'summer' },
  { month: 'Apr', kwh: 580, type: 'summer' },
  { month: 'May', kwh: 610, type: 'summer' },
  { month: 'Jun', kwh: 450, type: 'monsoon' },
  { month: 'Jul', kwh: 380, type: 'monsoon' },
  { month: 'Aug', kwh: 400, type: 'monsoon' },
  { month: 'Sep', kwh: 470, type: 'monsoon' },
  { month: 'Oct', kwh: 520, type: 'winter' },
  { month: 'Nov', kwh: 440, type: 'winter' },
  { month: 'Dec', kwh: 360, type: 'winter' },
];

interface EnergyPredictionProps {
  systemData: { panelCount: number; totalKw: number; annualKwh: number };
}

export default function EnergyPrediction({ systemData }: EnergyPredictionProps) {
  const annualKwh = useCountUp(systemData.annualKwh, 1200, 0, true);
  const peakKw = useCountUp(Math.round(systemData.totalKw * 100), 800, 0, true);
  const co2 = useCountUp(Math.round(systemData.annualKwh * 0.82), 1000, 0, true);
  const trees = useCountUp(Math.round(systemData.annualKwh * 0.82 / 22), 800, 0, true);
  const efficiency = useCountUp(86, 600, 0, true);
  const cuf = useCountUp(19, 500, 0, true);

  const scaledMonthly = monthlyData.map(m => ({
    ...m,
    kwh: Math.round(m.kwh * systemData.totalKw / 3),
  }));

  return (
    <section id="prediction" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-amber"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Energy Prediction
      </motion.h2>
      <motion.p
        className="text-solar-muted mb-12 max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        AI-powered generation forecast based on your location, panel layout, and weather patterns.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Charts */}
        <div className="space-y-8">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-6">Annual Energy Breakdown</h3>
            <div className="flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={240} height={240}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F0F4FF' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="font-mono-data text-2xl text-solar-green">{formatIndian(annualKwh)}</div>
                  <div className="text-solar-muted text-xs">kWh/yr</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {donutData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-solar-muted">{d.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.1}>
            <h3 className="text-lg font-semibold mb-6">Monthly Generation</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scaledMonthly}>
                <XAxis dataKey="month" tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F0F4FF' }}
                  formatter={(value: number) => [`${formatIndian(value)} kWh`, 'Generation']}
                />
                <Bar dataKey="kwh" radius={[4, 4, 0, 0]} animationDuration={1200}>
                  {scaledMonthly.map((entry, i) => (
                    <Cell key={i} fill={entry.type === 'summer' ? '#F59E0B' : entry.type === 'monsoon' ? '#6366F1' : '#00E5A0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Right - Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Annual Generation', value: `${formatIndian(annualKwh)}`, unit: 'kWh', icon: Zap, color: 'text-solar-green' },
            { label: 'Peak Power', value: `${(peakKw / 100).toFixed(1)}`, unit: 'kW', icon: Sun, color: 'text-solar-amber' },
            { label: 'System Efficiency', value: `${efficiency}`, unit: '%', icon: TrendingUp, color: 'text-solar-green' },
            { label: 'Capacity Factor', value: `${cuf}`, unit: '%', icon: TrendingUp, color: 'text-solar-indigo' },
            { label: 'CO₂ Avoided', value: `${formatIndian(co2)}`, unit: 'kg/yr', icon: Leaf, color: 'text-solar-green' },
            { label: 'Trees Equivalent', value: `${formatIndian(trees)}`, unit: 'trees', icon: TreePine, color: 'text-solar-green' },
          ].map((stat, i) => (
            <GlassCard key={i} delay={i * 0.08}>
              <stat.icon size={20} className={`${stat.color} mb-3`} />
              <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">{stat.label}</div>
              <div className={`font-mono-data text-2xl ${stat.color}`}>
                {stat.value}
                <span className="text-sm ml-1 text-solar-muted">{stat.unit}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
