import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import GlassCard from './GlassCard';
import { useCountUp, formatIndian } from '@/hooks/useCountUp';
import { IndianRupee, TrendingDown, Award, Zap } from 'lucide-react';

const states = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
  'Uttar Pradesh', 'Madhya Pradesh', 'Kerala', 'Telangana', 'Delhi'
];

const stateSubsidies: Record<string, number> = {
  'Maharashtra': 10000, 'Karnataka': 15000, 'Tamil Nadu': 12000, 'Gujarat': 20000,
  'Rajasthan': 18000, 'Uttar Pradesh': 8000, 'Madhya Pradesh': 10000,
  'Kerala': 14000, 'Telangana': 11000, 'Delhi': 22000,
};

interface CostCalculatorProps {
  systemData: { panelCount: number; totalKw: number; annualKwh: number };
}

export default function CostCalculator({ systemData }: CostCalculatorProps) {
  const [selectedState, setSelectedState] = useState('Karnataka');

  const totalKw = systemData.totalKw;
  const panelCost = Math.round(totalKw * 25000);
  const inverterCost = Math.round(totalKw * 8000);
  const mountingCost = Math.round(totalKw * 4000);
  const wiringCost = Math.round(totalKw * 2000);
  const labourCost = Math.round(totalKw * 3000);
  const subtotal = panelCost + inverterCost + mountingCost + wiringCost + labourCost;
  const gst = Math.round(subtotal * 0.05);
  const grossCost = subtotal + gst;

  // PM Surya Ghar subsidy
  const subsidyPer = totalKw <= 2 ? 30000 : totalKw <= 3 ? 18000 : 12000;
  const centralSubsidy = Math.round(Math.min(totalKw, 3) * subsidyPer);
  const stateSubsidy = stateSubsidies[selectedState] || 0;
  const netCost = grossCost - centralSubsidy - stateSubsidy;

  const annualSavings = Math.round(systemData.annualKwh * 7.5);
  const paybackYears = netCost / annualSavings;
  const totalSavings25 = annualSavings * 25 - netCost;

  const roiData = Array.from({ length: 26 }, (_, yr) => ({
    year: yr,
    savings: yr * annualSavings,
    cost: netCost,
  }));

  const costBreakdown = [
    { name: 'Panels', cost: panelCost },
    { name: 'Inverter', cost: inverterCost },
    { name: 'Mounting', cost: mountingCost },
    { name: 'Wiring', cost: wiringCost },
    { name: 'Labour', cost: labourCost },
    { name: 'GST (5%)', cost: gst },
  ];

  const grossCostUp = useCountUp(grossCost, 1000, 0, true);
  const netCostUp = useCountUp(netCost, 1000, 0, true);
  const paybackUp = useCountUp(Math.round(paybackYears * 10), 800, 0, true);
  const totalSavingsUp = useCountUp(totalSavings25, 1200, 0, true);

  return (
    <section id="calculator" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-primary"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Cost, ROI & Subsidies
      </motion.h2>
      <motion.p
        className="text-solar-muted mb-12 max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Complete financial breakdown with government subsidies and payback analysis.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost breakdown */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <IndianRupee size={20} className="text-solar-amber" />
            <h3 className="text-lg font-semibold">Installation Cost</h3>
          </div>
          <div className="space-y-3 mb-6">
            {costBreakdown.map((item, i) => (
              <motion.div
                key={i}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-solar-muted">{item.name}</span>
                  <span className="font-mono-data text-solar-text">₹{formatIndian(item.cost)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-solar-amber"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(item.cost / grossCost) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-solar-muted">Total</span>
              <span className="font-mono-data text-2xl text-solar-amber">₹{formatIndian(grossCostUp)}</span>
            </div>
          </div>
        </GlassCard>

        {/* Subsidies */}
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-2 mb-6">
            <Award size={20} className="text-solar-green" />
            <h3 className="text-lg font-semibold">Government Subsidies</h3>
          </div>

          <div className="glass rounded-lg p-4 mb-4">
            <div className="text-xs text-solar-muted uppercase tracking-wider mb-1">PM Surya Ghar Yojana</div>
            <div className="font-mono-data text-xl text-solar-green">-₹{formatIndian(centralSubsidy)}</div>
            <div className="text-xs text-solar-muted mt-1">
              {totalKw <= 2 ? '₹30,000/kW (up to 2kW)' : '₹18,000/kW (2-3kW tier)'}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-solar-muted uppercase tracking-wider block mb-2">State Subsidy</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-muted text-solar-text rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-solar-green"
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="font-mono-data text-lg text-solar-green mt-2">-₹{formatIndian(stateSubsidy)}</div>
          </div>

          <div className="glass rounded-lg p-4 glow-primary">
            <div className="text-xs text-solar-muted uppercase tracking-wider mb-1">Net Cost After Subsidies</div>
            <div className="font-mono-data text-3xl text-solar-green">₹{formatIndian(netCostUp)}</div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-solar-muted">
            <Zap size={12} className="text-solar-amber" />
            <span>Net metering eligible — sell excess power back</span>
          </div>
        </GlassCard>

        {/* ROI */}
        <GlassCard delay={0.2}>
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown size={20} className="text-solar-green" />
            <h3 className="text-lg font-semibold">ROI Timeline</h3>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={roiData}>
              <XAxis dataKey="year" tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F0F4FF' }}
                formatter={(v: number) => [`₹${formatIndian(v)}`, '']}
              />
              <Area type="monotone" dataKey="savings" stroke="#00E5A0" fill="rgba(0,229,160,0.1)" strokeWidth={2} animationDuration={1200} />
              <Area type="monotone" dataKey="cost" stroke="#EF4444" fill="rgba(239,68,68,0.05)" strokeWidth={1} strokeDasharray="5 5" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-xs text-solar-muted uppercase tracking-wider mb-1">Payback Period</div>
              <div className="font-mono-data text-2xl text-solar-amber">{(paybackUp / 10).toFixed(1)} <span className="text-sm">yrs</span></div>
            </div>
            <div className="text-center">
              <div className="text-xs text-solar-muted uppercase tracking-wider mb-1">25-Year Savings</div>
              <div className="font-mono-data text-2xl text-solar-green">₹{formatIndian(totalSavingsUp)}</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
