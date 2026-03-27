import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useCountUp, formatIndian } from '@/hooks/useCountUp';
import { Zap, Sun, Grid3X3, RotateCw, Trash2, Lock } from 'lucide-react';

const panelTypes = [
  { name: 'Mono 400W', watt: 400, color: '#1a1a2e', efficiency: 21.5 },
  { name: 'Poly 330W', watt: 330, color: '#1e3a5f', efficiency: 17.8 },
  { name: 'Bifacial 450W', watt: 450, color: '#0d2137', efficiency: 23.1 },
];

interface ARDesignerProps {
  onCommit: (data: { panelCount: number; totalKw: number; annualKwh: number }) => void;
}

export default function ARDesigner({ onCommit }: ARDesignerProps) {
  const [panels, setPanels] = useState<Array<{ type: number; x: number; y: number; id: number }>>([]);
  const [selectedType, setSelectedType] = useState(0);
  const [snapGrid, setSnapGrid] = useState(true);
  const [nextId, setNextId] = useState(1);
  const [sunAngle, setSunAngle] = useState(50);

  const totalKw = panels.reduce((sum, p) => sum + panelTypes[p.type].watt, 0) / 1000;
  const annualKwh = Math.round(totalKw * 1400);
  const coverage = Math.min(panels.length * 4, 100);

  const panelCount = useCountUp(panels.length, 500, 0, true);
  const totalKwDisplay = useCountUp(Math.round(totalKw * 100), 500, 0, true);
  const annualKwhDisplay = useCountUp(annualKwh, 800, 0, true);

  const addPanel = () => {
    const x = 50 + (panels.length % 8) * 70;
    const y = 50 + Math.floor(panels.length / 8) * 50;
    setPanels([...panels, { type: selectedType, x, y, id: nextId }]);
    setNextId(nextId + 1);
  };

  const removePanel = (id: number) => {
    setPanels(panels.filter(p => p.id !== id));
  };

  return (
    <section id="ar-designer" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-primary"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        AR Rooftop Designer
      </motion.h2>
      <motion.p
        className="text-solar-muted mb-10 max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Design your solar layout interactively. Place panels, check shading, and optimize your rooftop.
      </motion.p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel tray */}
        <div className="lg:w-48 flex lg:flex-col gap-3">
          {panelTypes.map((pt, i) => (
            <GlassCard
              key={i}
              delay={i * 0.1}
              glow={selectedType === i ? 'primary' : 'none'}
              className={`cursor-pointer text-center ${selectedType === i ? '' : 'opacity-60'}`}
            >
              <button onClick={() => setSelectedType(i)} className="w-full">
                <div className="w-12 h-8 mx-auto rounded mb-2" style={{ background: pt.color, border: '1px solid rgba(0,229,160,0.3)' }}>
                  <div className="w-full h-full grid grid-cols-3 gap-px p-0.5">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="bg-solar-green/20 rounded-sm" />
                    ))}
                  </div>
                </div>
                <div className="font-mono-data text-xs text-solar-green">{pt.watt}W</div>
                <div className="text-[10px] text-solar-muted">{pt.name}</div>
              </button>
            </GlassCard>
          ))}
          <button
            onClick={addPanel}
            className="w-full py-3 glass rounded-xl text-solar-green text-sm font-semibold hover:glow-primary transition-all"
          >
            + Add Panel
          </button>
        </div>

        {/* 3D Viewport (simulated) */}
        <GlassCard className="flex-1 min-h-[400px] lg:min-h-[500px] relative overflow-hidden" hover={false}>
          {/* Grid */}
          <div className="absolute inset-4 grid-overlay rounded-lg" style={{ opacity: 0.3 }} />

          {/* Rooftop base */}
          <div className="absolute inset-6 rounded-lg" style={{
            background: 'linear-gradient(135deg, rgba(30,40,60,0.8), rgba(20,30,50,0.9))',
            border: '2px solid rgba(255,255,255,0.1)',
            perspective: '1000px',
            transform: 'perspective(1000px) rotateX(15deg) rotateY(-5deg)',
          }}>
            {/* Exclusion zones */}
            <div className="absolute inset-0 border-4 border-solar-danger/20 rounded-lg pointer-events-none" />

            {/* Water tank */}
            <div className="absolute top-3 right-3 w-16 h-12 rounded glass flex items-center justify-center"
              style={{ border: '1px solid rgba(245,158,11,0.4)' }}
            >
              <span className="text-[8px] text-solar-amber">Tank</span>
            </div>

            {/* Staircase head */}
            <div className="absolute bottom-3 left-3 w-14 h-10 rounded glass flex items-center justify-center"
              style={{ border: '1px solid rgba(245,158,11,0.4)' }}
            >
              <span className="text-[8px] text-solar-amber">Stairs</span>
            </div>

            {/* Placed panels */}
            {panels.map((panel) => (
              <motion.div
                key={panel.id}
                initial={{ y: -50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute cursor-pointer group"
                style={{ left: panel.x, top: panel.y }}
                onClick={() => removePanel(panel.id)}
              >
                <div
                  className="w-14 h-9 rounded-sm relative"
                  style={{
                    background: panelTypes[panel.type].color,
                    border: '1px solid rgba(0,229,160,0.4)',
                    boxShadow: '0 0 10px rgba(0,229,160,0.15)',
                  }}
                >
                  <div className="absolute inset-0 grid grid-cols-3 gap-px p-0.5">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="bg-solar-green/10 rounded-sm" />
                    ))}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-solar-danger opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Trash2 size={6} className="text-foreground" />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty state */}
            {panels.length === 0 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-center">
                  <Grid3X3 size={32} className="text-solar-green mx-auto mb-2" />
                  <p className="text-solar-muted text-sm">Click "Add Panel" to begin</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sun position */}
          <motion.div
            className="absolute top-4 right-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sun size={24} className="text-solar-amber" style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.5))' }} />
          </motion.div>

          {/* Controls */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              onClick={() => setSnapGrid(!snapGrid)}
              className={`px-3 py-1.5 text-xs rounded-lg glass transition-all ${snapGrid ? 'glow-primary text-solar-green' : 'text-solar-muted'}`}
            >
              <Grid3X3 size={12} className="inline mr-1" />
              Snap
            </button>
            <button className="px-3 py-1.5 text-xs rounded-lg glass text-solar-muted hover:text-solar-green transition-colors">
              <RotateCw size={12} className="inline mr-1" />
              Rotate
            </button>
          </div>

          {/* Sun slider */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Sun size={12} className="text-solar-amber" />
            <input
              type="range"
              min={0}
              max={100}
              value={sunAngle}
              onChange={(e) => setSunAngle(Number(e.target.value))}
              className="w-20 accent-solar-amber"
            />
          </div>
        </GlassCard>

        {/* Stats sidebar */}
        <div className="lg:w-64 flex flex-col gap-4">
          <GlassCard delay={0.1}>
            <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">Panels</div>
            <div className="font-mono-data text-3xl text-solar-green">{panelCount}</div>
          </GlassCard>
          <GlassCard delay={0.15}>
            <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">Total Capacity</div>
            <div className="font-mono-data text-3xl text-solar-green">{(totalKwDisplay / 100).toFixed(1)} <span className="text-base">kW</span></div>
          </GlassCard>
          <GlassCard delay={0.2}>
            <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">Est. Annual</div>
            <div className="font-mono-data text-2xl text-solar-amber">{formatIndian(annualKwhDisplay)} <span className="text-sm">kWh</span></div>
          </GlassCard>
          <GlassCard delay={0.25}>
            <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">Coverage</div>
            <div className="w-full h-2 rounded-full bg-muted mt-2">
              <motion.div
                className="h-full rounded-full bg-solar-green"
                style={{ width: `${coverage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="font-mono-data text-sm text-solar-green mt-1">{coverage}%</div>
          </GlassCard>

          {panels.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onCommit({ panelCount: panels.length, totalKw, annualKwh })}
              className="w-full py-3 rounded-xl bg-solar-green text-solar-navy font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              style={{ boxShadow: '0 0 30px rgba(0,229,160,0.3)' }}
            >
              <Lock size={14} />
              Commit Layout
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
