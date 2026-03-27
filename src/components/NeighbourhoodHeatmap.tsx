import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useCountUp, formatIndian } from '@/hooks/useCountUp';
import { Map, Users, Trophy, Share2, Leaf, Zap, IndianRupee } from 'lucide-react';

const leaderboard = [
  { name: 'Prestige Lakeside', city: 'Bengaluru', adoption: 34 },
  { name: 'DLF Phase 5', city: 'Gurugram', adoption: 28 },
  { name: 'Hiranandani Gardens', city: 'Mumbai', adoption: 25 },
  { name: 'Anna Nagar West', city: 'Chennai', adoption: 22 },
  { name: 'Salt Lake Sector V', city: 'Kolkata', adoption: 18 },
];

export default function NeighbourhoodHeatmap() {
  const [co2Counter, setCo2Counter] = useState(12450);
  const [savingsCounter, setSavingsCounter] = useState(2845000);
  const [kwhCounter, setKwhCounter] = useState(384200);

  useEffect(() => {
    const interval = setInterval(() => {
      setCo2Counter(prev => prev + Math.round(Math.random() * 5));
      setSavingsCounter(prev => prev + Math.round(Math.random() * 200));
      setKwhCounter(prev => prev + Math.round(Math.random() * 30));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const co2Display = useCountUp(co2Counter, 500, co2Counter - 5, true);
  const savingsDisplay = useCountUp(savingsCounter, 500, savingsCounter - 200, true);
  const kwhDisplay = useCountUp(kwhCounter, 500, kwhCounter - 30, true);

  const handleShare = () => {
    const message = encodeURIComponent("Hamari colony mein solar lagao aur ₹ bachao! 🌞 Solar Bharat AI se apne ghar ka solar plan banao.");
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <section id="heatmap" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-primary"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Neighbourhood Solar Map
      </motion.h2>
      <motion.p
        className="text-solar-muted mb-12 max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        See how your neighbourhood is adopting solar. Join the movement!
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map placeholder */}
        <GlassCard className="lg:col-span-2 min-h-[400px] relative overflow-hidden" hover={false}>
          <div className="absolute inset-0 grid-overlay opacity-30" />
          {/* Mock map with markers */}
          <div className="relative h-full flex items-center justify-center">
            <Map size={64} className="text-solar-green/20" />
            <p className="absolute text-solar-muted text-sm">Interactive solar adoption heatmap</p>
            {/* Mock markers */}
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-solar-green"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                  boxShadow: '0 0 8px rgba(0,229,160,0.4)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.7 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.05, type: 'spring' }}
              />
            ))}
          </div>
        </GlassCard>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Solar Mohalla Challenge */}
          <GlassCard glow="primary">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-solar-amber" />
              Solar Mohalla Challenge
            </h3>
            <div className="text-sm text-solar-muted mb-2">Prestige Lakeside Habitat</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-solar-green"
                  initial={{ width: 0 }}
                  whileInView={{ width: '34%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                />
              </div>
              <span className="font-mono-data text-sm text-solar-green">34%</span>
            </div>
            <div className="text-xs text-solar-muted mb-4">85 of 250 households gone solar</div>

            <button
              onClick={handleShare}
              className="w-full py-2.5 rounded-xl bg-solar-green text-solar-navy font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Share2 size={14} />
              Challenge Your Neighbours
            </button>
          </GlassCard>

          {/* Leaderboard */}
          <GlassCard delay={0.1}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Users size={16} className="text-solar-amber" />
              Top Colonies
            </h3>
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center justify-between text-sm py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-solar-amber w-4">{i + 1}</span>
                    <span className="text-solar-text">{entry.name}</span>
                  </div>
                  <span className="font-mono-data text-solar-green text-xs">{entry.adoption}%</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Live impact ticker */}
          <GlassCard delay={0.2}>
            <h3 className="text-sm font-semibold mb-4">Colony Impact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Leaf size={16} className="text-solar-green" />
                <div>
                  <div className="font-mono-data text-lg text-solar-green">{formatIndian(co2Display)} kg</div>
                  <div className="text-[10px] text-solar-muted">CO₂ saved</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IndianRupee size={16} className="text-solar-amber" />
                <div>
                  <div className="font-mono-data text-lg text-solar-amber">₹{formatIndian(savingsDisplay)}</div>
                  <div className="text-[10px] text-solar-muted">Total saved</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-solar-indigo" />
                <div>
                  <div className="font-mono-data text-lg text-solar-indigo">{formatIndian(kwhDisplay)} kWh</div>
                  <div className="text-[10px] text-solar-muted">Generated</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
