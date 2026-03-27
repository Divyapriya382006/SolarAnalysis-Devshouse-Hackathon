import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useCountUp, formatIndian } from '@/hooks/useCountUp';
import { Leaf, TreePine, Car, Plane, Award, Sparkles } from 'lucide-react';
import { useState } from 'react';

const recPriceHistory = [
  { year: '2019', price: 1200 }, { year: '2020', price: 1500 },
  { year: '2021', price: 2200 }, { year: '2022', price: 2800 },
  { year: '2023', price: 3200 }, { year: '2024', price: 3000 },
  { year: '2025', price: 3400 },
];

const steps = [
  { title: 'Register System', desc: 'Register with your state DISCOM' },
  { title: 'Get Approval', desc: 'Obtain DISCOM technical approval' },
  { title: 'List on Exchange', desc: 'List RECs on IEX/PXIL platform' },
  { title: 'Receive Payment', desc: 'Monthly REC credit settlements' },
];

interface CarbonCreditsProps {
  systemData: { annualKwh: number };
}

export default function CarbonCredits({ systemData }: CarbonCreditsProps) {
  const [recPrice, setRecPrice] = useState(3000);

  const recs = systemData.annualKwh / 1000;
  const annualValue = Math.round(recs * recPrice);
  const co2Offset = Math.round(systemData.annualKwh * 0.82);
  const treesEquiv = Math.round(co2Offset / 22);
  const carTrips = Math.round(co2Offset / 4.6);
  const flights = Math.round(co2Offset / 255);

  const recsDisplay = useCountUp(Math.round(recs * 10), 800, 0, true);
  const valueDisplay = useCountUp(annualValue, 1000, 0, true);

  return (
    <section id="carbon" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-indigo"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Carbon Credit Engine
      </motion.h2>

      {/* Hero stat */}
      <GlassCard className="mb-10 text-center max-w-xl mx-auto" glow="indigo">
        <div className="font-mono-data text-5xl text-solar-indigo">{(recsDisplay / 10).toFixed(1)}</div>
        <div className="text-solar-muted text-sm mt-1">RECs per Year</div>
        <div className="font-mono-data text-3xl text-solar-green mt-3">₹{formatIndian(valueDisplay)}</div>
        <div className="text-solar-muted text-sm">Estimated Annual Value</div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECs Calculator */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award size={20} className="text-solar-indigo" />
            RECs Calculator
          </h3>
          <motion.div
            className="space-y-2 text-sm mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 font-mono-data">
              <span className="text-solar-muted">{formatIndian(systemData.annualKwh)} kWh</span>
              <span className="text-solar-muted">÷</span>
              <span className="text-solar-muted">1,000</span>
              <span className="text-solar-muted">=</span>
              <span className="text-solar-indigo font-bold">{recs.toFixed(1)} RECs</span>
            </div>
          </motion.div>
          <div className="mb-4">
            <label className="text-xs text-solar-muted uppercase tracking-wider block mb-2">Market Price per REC</label>
            <input
              type="range" min={1500} max={4500} value={recPrice}
              onChange={(e) => setRecPrice(Number(e.target.value))}
              className="w-full" style={{ accentColor: '#6366F1' }}
            />
            <div className="flex justify-between text-xs text-solar-muted mt-1">
              <span>₹1,500</span>
              <span className="font-mono-data text-solar-indigo">₹{formatIndian(recPrice)}</span>
              <span>₹4,500</span>
            </div>
          </div>
        </GlassCard>

        {/* Carbon equivalences */}
        <GlassCard delay={0.1}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Leaf size={20} className="text-solar-green" />
            Carbon Offset
          </h3>
          <div className="space-y-4">
            {[
              { icon: TreePine, value: treesEquiv, label: 'trees planted', color: 'text-solar-green' },
              { icon: Car, value: carTrips, label: 'car trips avoided', color: 'text-solar-amber' },
              { icon: Plane, value: flights, label: 'flights offset', color: 'text-solar-indigo' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                className="flex items-center gap-4 glass rounded-lg p-3"
              >
                <item.icon size={24} className={item.color} />
                <div>
                  <div className={`font-mono-data text-xl ${item.color}`}>{formatIndian(item.value)}</div>
                  <div className="text-xs text-solar-muted">{item.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Monetisation pathway */}
        <GlassCard delay={0.2}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-solar-amber" />
            Monetisation Steps
          </h3>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-solar-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-solar-green">{i + 1}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{step.title}</div>
                  <div className="text-xs text-solar-muted">{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
