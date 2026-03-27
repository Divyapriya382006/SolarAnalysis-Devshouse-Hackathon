import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import RooftopScene from './RooftopScene';
import GoogleMapPreview from './GoogleMapPreview';
import { useCountUp, formatIndian } from '@/hooks/useCountUp';
import { Sun, Grid3X3, RotateCw, Lock, Eye, Map, Clock, Building2, TreePine, AlertTriangle } from 'lucide-react';

const panelTypes = [
  { name: 'Mono 400W', watt: 400, color: '#1a3a6e', efficiency: 21.5 },
  { name: 'Poly 330W', watt: 330, color: '#1e5a3f', efficiency: 17.8 },
  { name: 'Bifacial 450W', watt: 450, color: '#2a1a5e', efficiency: 23.1 },
];

interface ARDesignerProps {
  onCommit: (data: { panelCount: number; totalKw: number; annualKwh: number }) => void;
  address: string;
  coordinates: { lat: number, lng: number };
}

export default function ARDesigner({ onCommit, address, coordinates }: ARDesignerProps) {
  const [panels, setPanels] = useState<Array<{ id: number; type: number; position: [number, number, number] }>>([]);
  const [selectedType, setSelectedType] = useState(0);
  const [snapGrid, setSnapGrid] = useState(true);
  const [nextId, setNextId] = useState(1);
  const [sunAngle, setSunAngle] = useState(50);
  const [timeOfDay, setTimeOfDay] = useState(12);
  const [viewMode, setViewMode] = useState<'3d' | 'map'>('3d');
  const [showShadowAnalysis, setShowShadowAnalysis] = useState(true);

  // Use real coordinates from props
  const lat = coordinates.lat;
  const lng = coordinates.lng;

  // Optimal tilt is roughly equal to latitude in India
  const optimalTilt = Math.max(10, Math.min(35, lat)); 
  const optimalAzimuth = 180; // True South in Northern Hemisphere

  // Shadow calculations
  const sunElevation = Math.max(Math.sin(((timeOfDay - 6) / 12) * Math.PI), 0);
  const shadowMultiplier = sunElevation > 0.05 ? (1 / Math.tan(sunElevation * (Math.PI / 2))).toFixed(1) : '∞';
  const isNightTime = timeOfDay < 6 || timeOfDay > 18;
  const shadowImpactPct = isNightTime ? 100 : Math.round(Math.max(0, (1 - sunElevation) * 60));
  const formatTime = (h: number) => {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${hr12}:${min.toString().padStart(2, '0')} ${ampm}`;
  };

  const totalKw = panels.reduce((sum, p) => sum + panelTypes[p.type].watt, 0) / 1000;
  const annualKwh = Math.round(totalKw * 1400);
  const coverage = Math.min(panels.length * 4, 100);

  const panelCount = useCountUp(panels.length, 500, 0, true);
  const totalKwDisplay = useCountUp(Math.round(totalKw * 100), 500, 0, true);
  const annualKwhDisplay = useCountUp(annualKwh, 800, 0, true);

  const addPanel = () => {
    const col = panels.length % 6;
    const row = Math.floor(panels.length / 6);
    setPanels([...panels, {
      type: selectedType,
      position: [-2.5 + col * 1.2, 0, -2 + row * 1.0],
      id: nextId,
    }]);
    setNextId(nextId + 1);
  };

  const removeLastPanel = () => {
    setPanels(panels.slice(0, -1));
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
        Design your solar layout on an interactive 3D rooftop. Place panels, adjust sun position, and optimize placement.
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
                <div className="text-[9px] text-solar-muted">{pt.efficiency}% eff</div>
              </button>
            </GlassCard>
          ))}
          <button
            onClick={addPanel}
            className="w-full py-3 glass rounded-xl text-solar-green text-sm font-semibold hover:glow-primary transition-all"
          >
            + Add Panel
          </button>
          {panels.length > 0 && (
            <button
              onClick={removeLastPanel}
              className="w-full py-2 glass rounded-xl text-solar-danger text-xs hover:border-solar-danger/30 transition-all"
              style={{ color: '#EF4444' }}
            >
              Remove Last
            </button>
          )}
        </div>

        {/* Main viewport area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* View toggle + controls bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === '3d' ? 'bg-solar-green text-solar-navy' : 'glass text-solar-muted hover:text-solar-text'
                }`}
              >
                <Eye size={14} />
                3D Rooftop
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map' ? 'bg-solar-green text-solar-navy' : 'glass text-solar-muted hover:text-solar-text'
                }`}
              >
                <Map size={14} />
                Location Map
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSnapGrid(!snapGrid)}
                className={`px-3 py-1.5 text-xs rounded-lg glass transition-all ${snapGrid ? 'glow-primary text-solar-green' : 'text-solar-muted'}`}
              >
                <Grid3X3 size={12} className="inline mr-1" />
                Snap
              </button>
              <button
                onClick={() => setShowShadowAnalysis(!showShadowAnalysis)}
                className={`px-3 py-1.5 text-xs rounded-lg glass transition-all ${showShadowAnalysis ? 'glow-primary text-solar-green' : 'text-solar-muted'}`}
              >
                <Building2 size={12} className="inline mr-1" />
                Shadows
              </button>
            </div>
          </div>

          {/* Viewport */}
          <GlassCard className="h-[450px] lg:h-[520px] relative overflow-hidden p-0" hover={false}>
            {viewMode === '3d' ? (
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-solar-green border-t-transparent animate-spin mx-auto mb-3" />
                    <p className="text-solar-muted text-sm">Loading 3D scene...</p>
                  </div>
                </div>
              }>
                <RooftopScene
                  panels={panels}
                  sunAngle={sunAngle}
                  panelColors={panelTypes.map(p => p.color)}
                  timeOfDay={timeOfDay}
                  optimalTilt={optimalTilt}
                />
              </Suspense>
            ) : (
              <GoogleMapPreview address={address} lat={lat} lng={lng} className="w-full h-full" />
            )}

            {/* Overlay AR VR info */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <div className="glass rounded-lg px-3 py-1.5 text-[10px] text-solar-muted">
                {viewMode === '3d' ? '3D VR Mode • Drag to orbit • Scroll to zoom' : 'Satellite location preview'}
              </div>
              {viewMode === '3d' && (
                <div className="glass rounded-lg px-3 py-2 text-xs border border-primary/20 bg-background/50 backdrop-blur-md">
                  <div className="font-bold text-primary mb-1 border-b border-primary/20 pb-1">AR Calibration</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-[10px]">
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="font-mono text-foreground text-right">{lat.toFixed(2)}° N</span>
                    <span className="text-muted-foreground">Opt. Tilt:</span>
                    <span className="font-mono text-green-400 text-right">{optimalTilt.toFixed(1)}°</span>
                    <span className="text-muted-foreground">Azimuth:</span>
                    <span className="font-mono text-amber-400 text-right">{optimalAzimuth}° (South)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Panel count badge */}
            {panels.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 glass rounded-lg px-3 py-1.5 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-solar-green" />
                <span className="font-mono-data text-xs text-solar-green">{panels.length} panels placed</span>
              </motion.div>
            )}

            {/* Empty state */}
            {panels.length === 0 && viewMode === '3d' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="glass rounded-xl px-4 py-2 text-xs text-solar-green flex items-center gap-2"
                >
                  <span>↑</span>
                  Click "Add Panel" to place solar panels on the roof
                </motion.div>
              </div>
            )}
          </GlassCard>

          {/* Time-of-day shadow scrubber */}
          {viewMode === '3d' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl px-4 py-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-solar-amber" />
                  <span className="text-xs font-semibold text-solar-text">Shadow Timeline</span>
                </div>
                <span className="font-mono-data text-sm text-solar-amber">{formatTime(timeOfDay)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={0.25}
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(Number(e.target.value))}
                className="w-full accent-solar-amber h-2"
              />
              <div className="flex justify-between text-[9px] text-solar-muted font-mono-data">
                <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span>
              </div>
              {showShadowAnalysis && (
                <div className="flex gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Building2 size={10} className="text-solar-indigo" />
                    <span className="text-solar-muted">6 buildings</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <TreePine size={10} className="text-solar-green" />
                    <span className="text-solar-muted">5 trees</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {isNightTime ? (
                      <AlertTriangle size={10} className="text-solar-danger" />
                    ) : (
                      <Sun size={10} className="text-solar-amber" />
                    )}
                    <span className={isNightTime ? 'text-solar-danger' : 'text-solar-muted'}>
                      {isNightTime ? 'No sun' : `Shadow impact: ${shadowImpactPct}%`}
                    </span>
                  </div>
                  {!isNightTime && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-solar-muted">Shadow length: {shadowMultiplier}×</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Stats sidebar */}
        <div className="lg:w-56 flex flex-col gap-4">
          {/* Mini map in 3D mode */}
          {viewMode === '3d' && address && (
            <GlassCard className="p-0 overflow-hidden" hover={false}>
              <GoogleMapPreview address={address} lat={lat} lng={lng} className="h-32" />
            </GlassCard>
          )}

          <GlassCard delay={0.1}>
            <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">Panels</div>
            <div className="font-mono-data text-3xl text-solar-green">{panelCount}</div>
          </GlassCard>
          <GlassCard delay={0.15}>
            <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">Total Capacity</div>
            <div className="font-mono-data text-3xl text-solar-green">
              {(totalKwDisplay / 100).toFixed(1)} <span className="text-base">kW</span>
            </div>
          </GlassCard>
          <GlassCard delay={0.2}>
            <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">Est. Annual</div>
            <div className="font-mono-data text-2xl text-solar-amber">
              {formatIndian(annualKwhDisplay)} <span className="text-sm">kWh</span>
            </div>
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

          {/* Shadow analysis card */}
          {showShadowAnalysis && (
            <GlassCard delay={0.3} glow={isNightTime ? 'none' : shadowImpactPct > 40 ? 'none' : 'primary'}>
              <div className="text-solar-muted text-xs uppercase tracking-wider mb-1">Shadow Analysis</div>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${isNightTime ? 'bg-solar-danger' : shadowImpactPct > 40 ? 'bg-solar-amber' : 'bg-solar-green'}`} />
                <span className="font-mono-data text-sm text-solar-text">
                  {isNightTime ? 'Night' : shadowImpactPct > 40 ? 'High shadow' : 'Low shadow'}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted mt-2">
                <motion.div
                  className={`h-full rounded-full ${isNightTime ? 'bg-solar-danger' : shadowImpactPct > 40 ? 'bg-solar-amber' : 'bg-solar-green'}`}
                  style={{ width: `${100 - shadowImpactPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="font-mono-data text-[10px] text-solar-muted mt-1">
                {isNightTime ? 'No generation' : `${100 - shadowImpactPct}% usable sunlight`}
              </div>
            </GlassCard>
          )}

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
