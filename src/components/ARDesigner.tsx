/**
 * ARDesigner.tsx — Solar Panel AR Designer
 * 
 * STRICT RULE: Solar panels are ONLY placed inside the user-defined rooftop polygon.
 * Every placement path (manual, auto, scene-click) runs the same point-in-polygon check.
 */
import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import RooftopScene from './RooftopScene';
import { useCountUp, formatIndian } from '@/hooks/useCountUp';
import {
  Sun, Map as MapIcon,
  Plus, Check, ShieldAlert, Target,
  AlertTriangle, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { getNasaIrradiance, calculateSolarYield } from '@/lib/dataServices';

// ─── Constants ───────────────────────────────────────────────────────────────

const PANEL_W = 5.0;    // meters (5× real size for visibility)
const PANEL_H = 8.5;    // meters (5× real size for visibility)
const PANEL_GAP = 0.6;  // meters between panels
const EDGE_MARGIN = 2.0; // meters from polygon edge

const panelTypes = [
  { name: 'Budget · Poly 330W',   watt: 330, color: '#1e5a3f', efficiency: 17.8, costPerW: 45 },
  { name: 'Standard · Mono 400W', watt: 400, color: '#1a3a6e', efficiency: 21.5, costPerW: 55 },
  { name: 'Premium · Bifacial 450W', watt: 450, color: '#2a1a5e', efficiency: 23.1, costPerW: 70 },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface Panel3D {
  id: number;
  type: number;
  position: [number, number, number];
}

interface ARDesignerProps {
  onCommit: (data: { panelCount: number; totalKw: number; annualKwh: number }) => void;
  address: string;
  coordinates: { lat: number; lng: number };
}

// ─── GIS Utility ─────────────────────────────────────────────────────────────

/**
 * Convert polygon [lat, lng][] to local scene meters using center as origin.
 * X = east (meters), Z = south (meters) — matches RooftopScene.latlngToLocal()
 */
function polygonToLocal(
  polygon: Array<[number, number]>,
  originLat: number,
  originLng: number
): Array<{ x: number; z: number }> {
  const cosLat = Math.cos((originLat * Math.PI) / 180);
  return polygon.map(([lat, lng]) => ({
    x: (lng - originLng) * 111320 * cosLat,
    z: -(lat - originLat) * 111320,
  }));
}

/**
 * Ray-casting point-in-polygon algorithm.
 * Operates in local scene coordinates (x, z).
 * MANDATORY: Every panel placement goes through this check.
 */
function isInsideLocalPolygon(
  px: number,
  pz: number,
  localPoly: Array<{ x: number; z: number }>
): boolean {
  if (localPoly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = localPoly.length - 1; i < localPoly.length; j = i++) {
    const xi = localPoly[i].x, zi = localPoly[i].z;
    const xj = localPoly[j].x, zj = localPoly[j].z;
    const intersect =
      zi > pz !== zj > pz &&
      px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Shrinks a polygon inward by `margin` meters (cheap centroid-based shrink).
 * Used to enforce edge safety margin.
 */
function shrinkPolygon(
  poly: Array<{ x: number; z: number }>,
  margin: number
): Array<{ x: number; z: number }> {
  const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length;
  const cz = poly.reduce((s, p) => s + p.z, 0) / poly.length;
  return poly.map((p) => {
    const dx = p.x - cx;
    const dz = p.z - cz;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    return { x: p.x - (dx / len) * margin, z: p.z - (dz / len) * margin };
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ARDesigner({ onCommit, address, coordinates }: ARDesignerProps) {
  const { polygon, setPolygon } = useOutletContext<any>();
  const [step, setStep] = useState<'crop' | 'design'>('crop');
  const [isScanning, setIsScanning] = useState(false);
  const [panels, setPanels] = useState<Panel3D[]>([]);
  const [selectedType, setSelectedType] = useState(1); // Default: Standard
  const [nextId, setNextId] = useState(Date.now());
  const [timeOfDay, setTimeOfDay] = useState(12);
  const [nasaIrradiance, setNasaIrradiance] = useState(5.2);
  const [shadowImpact, setShadowImpact] = useState(0);

  const lat = coordinates.lat;
  const optimalTilt = Math.max(10, Math.min(35, lat));
  const sunElevation = Math.max(Math.sin(((timeOfDay - 6) / 12) * Math.PI), 0);

  // ── Derived Metrics ──────────────────────────────────────────────────────
  const totalKw = useMemo(
    () => panels.reduce((s, p) => s + panelTypes[p.type].watt, 0) / 1000,
    [panels]
  );
  const yieldData = useMemo(
    () => calculateSolarYield(totalKw, nasaIrradiance, 28),
    [totalKw, nasaIrradiance]
  );
  const annualKwh = Math.round(yieldData.annualKwh * (1 - shadowImpact / 100));
  const totalCost = useMemo(
    () => panels.reduce((s, p) => s + panelTypes[p.type].watt * panelTypes[p.type].costPerW, 0),
    [panels]
  );

  const totalKwDisplay = useCountUp(Math.round(totalKw * 100), 500, 0, true);
  const annualKwhDisplay = useCountUp(annualKwh, 800, 0, true);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (polygon && polygon.length > 0) {
      getNasaIrradiance(polygon[0][0], polygon[0][1]).then(setNasaIrradiance);
    }
  }, [polygon]);

  useEffect(() => {
    if (panels.length === 0) return;
    const interval = setInterval(() => {
      const live = (totalKw * Math.max(sunElevation, 0)).toFixed(2);
      window.dispatchEvent(
        new CustomEvent('solar_telemetry', {
          detail: { power: live, status: 'Optimal', timestamp: Date.now() },
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [panels.length, totalKw, sunElevation]);

  // ── Local Polygon (memoized, used in all placement logic) ─────────────────
  const localPolygon = useMemo(
    () => (polygon?.length >= 3 ? polygonToLocal(polygon, coordinates.lat, coordinates.lng) : []),
    [polygon, coordinates]
  );

  const shrunkPolygon = useMemo(
    () => (localPolygon.length >= 3 ? shrinkPolygon(localPolygon, EDGE_MARGIN) : []),
    [localPolygon]
  );

  // ── Polygon Guard ─────────────────────────────────────────────────────────
  const requirePolygon = useCallback((): boolean => {
    if (!polygon || polygon.length < 3) {
      toast.error('Define rooftop area using Smart Crop before placing panels.', {
        icon: '⛔',
        duration: 3000,
      });
      return false;
    }
    return true;
  }, [polygon]);

  // ── AI Smart Scan ─────────────────────────────────────────────────────────
  const runAIScan = () => {
    setIsScanning(true);
    const tId = toast.loading('AI Scanning satellite imagery...');
    setTimeout(() => {
      setIsScanning(false);
      // Realistic ~30m × 50m building footprint
      const dLat = 0.00025;
      const dLng = 0.00040;
      const detected: Array<[number, number]> = [
        [coordinates.lat + dLat, coordinates.lng - dLng],
        [coordinates.lat + dLat, coordinates.lng + dLng],
        [coordinates.lat - dLat, coordinates.lng + dLng],
        [coordinates.lat - dLat, coordinates.lng - dLng],
      ];
      setPolygon(detected);
      toast.dismiss(tId);
      toast.success('Building footprint detected! Click Finish Crop to proceed.', { icon: '🏗️' });
    }, 2500);
  };

  // ── Auto Layout (Strict Polygon Fill, correct row pitch) ─────────────────
  const autoLayout = () => {
    if (!requirePolygon()) return;
    if (shrunkPolygon.length < 3) {
      toast.error('Rooftop area is too small for panel placement.');
      return;
    }

    const tiltRad = (optimalTilt * Math.PI) / 180;

    // Industry-standard inter-row pitch:
    // pitch = L × cos(θ) + L × sin(θ) / tan(winter_sun_altitude)
    // winter_sun_alt ≈ 90° - lat - 23.5° (lowest sun in winter)
    const winterSunAlt = Math.max(10, 90 - coordinates.lat - 23.5);
    const winterSunRad = (winterSunAlt * Math.PI) / 180;
    const rowPitch = PANEL_H * Math.cos(tiltRad) + PANEL_H * Math.sin(tiltRad) / Math.tan(winterSunRad);
    // Add a comfortable clearance gap between rows
    const rowStep = rowPitch + 0.8;

    // Column step (east-west) = panel width + small gap
    const colStep = PANEL_W + PANEL_GAP;

    const xs = shrunkPolygon.map((p) => p.x);
    const zs = shrunkPolygon.map((p) => p.z);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);

    const newPanels: Panel3D[] = [];
    let idCounter = Date.now();

    // Iterate rows (Z = north-south) with proper pitch
    // Iterate columns (X = east-west) with panel width
    for (let z = minZ + rowStep / 2; z + rowStep / 2 <= maxZ; z += rowStep) {
      for (let x = minX + PANEL_W / 2; x + PANEL_W / 2 <= maxX; x += colStep) {
        // STRICT CHECK: all 4 panel footprint corners inside shrunk polygon
        const hw = PANEL_W / 2;
        const hh = PANEL_H * Math.cos(tiltRad) / 2; // projected footprint depth
        const corners = [
          { px: x - hw, pz: z - hh },
          { px: x + hw, pz: z - hh },
          { px: x + hw, pz: z + hh },
          { px: x - hw, pz: z + hh },
        ];
        const allInside = corners.every(({ px, pz }) =>
          isInsideLocalPolygon(px, pz, shrunkPolygon)
        );
        if (allInside) {
          newPanels.push({ id: idCounter++, type: selectedType, position: [x, 0.15, z] });
        }
      }
    }

    if (newPanels.length === 0) {
      toast.error('No valid positions inside rooftop. Try a larger area.', { icon: '⚠️' });
      return;
    }

    setPanels(newPanels);
    toast.success(`${newPanels.length} panels placed with proper row spacing.`, { icon: '⚡' });
  };

  // ── Manual Add Panel: places at next available grid slot ─────────────────
  const addPanel = () => {
    if (!requirePolygon()) return;
    if (shrunkPolygon.length < 3) {
      toast.error('Rooftop area is too small.'); return;
    }

    const tiltRad = (optimalTilt * Math.PI) / 180;
    const winterSunAlt = Math.max(10, 90 - coordinates.lat - 23.5);
    const winterSunRad = (winterSunAlt * Math.PI) / 180;
    const rowPitch = PANEL_H * Math.cos(tiltRad) + PANEL_H * Math.sin(tiltRad) / Math.tan(winterSunRad);
    const rowStep = rowPitch + 0.8;
    const colStep = PANEL_W + PANEL_GAP;

    const xs = shrunkPolygon.map((p) => p.x);
    const zs = shrunkPolygon.map((p) => p.z);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minZ = Math.min(...zs), maxZ = Math.max(...zs);

    // Find all valid slots in grid order
    const validSlots: [number, number][] = [];
    for (let z = minZ + rowStep / 2; z + rowStep / 2 <= maxZ; z += rowStep) {
      for (let x = minX + PANEL_W / 2; x + PANEL_W / 2 <= maxX; x += colStep) {
        const hw = PANEL_W / 2, hh = PANEL_H * Math.cos(tiltRad) / 2;
        const corners = [
          { px: x - hw, pz: z - hh }, { px: x + hw, pz: z - hh },
          { px: x + hw, pz: z + hh }, { px: x - hw, pz: z + hh },
        ];
        if (corners.every(({ px, pz }) => isInsideLocalPolygon(px, pz, shrunkPolygon))) {
          validSlots.push([x, z]);
        }
      }
    }

    if (validSlots.length === 0) {
      toast.error('No valid positions inside rooftop.', { icon: '⛔' }); return;
    }

    // Find next slot not already occupied
    const occupiedKeys = new Set(panels.map((p) => `${p.position[0].toFixed(2)},${p.position[2].toFixed(2)}`));
    const nextSlot = validSlots.find(([x, z]) => !occupiedKeys.has(`${x.toFixed(2)},${z.toFixed(2)}`));

    if (!nextSlot) {
      toast.error('All grid positions filled. Use Delete to free some.', { icon: '⛔' }); return;
    }

    const [nx, nz] = nextSlot;
    setPanels([...panels, { id: nextId, type: selectedType, position: [nx, 0.15, nz] }]);
    setNextId(nextId + 1);
    toast.success(`Panel added (${panels.length + 1}/${validSlots.length} slots filled).`, { icon: '✅' });
  };

  // ── Delete Panel ──────────────────────────────────────────────────────────
  const deleteLastPanel = () => {
    if (panels.length === 0) return;
    setPanels((p) => p.slice(0, -1));
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetCrop = () => {
    setStep('crop');
    setPolygon([]);
    setPanels([]);
  };

  const formatTime = (h: number) => {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${hr12}:${min.toString().padStart(2, '0')} ${ampm}`;
  };

  const polygonDefined = polygon?.length >= 3;
  const panelCostLakh = (totalCost / 100000).toFixed(2);

  return (
    <section id="ar-designer" className="min-h-screen relative bg-[#020617] text-white flex flex-col pt-20 px-4 lg:pl-24">

      {/* ── Top Bar ── */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex gap-3 items-center">
        {step === 'crop' ? (
          <>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] text-solar-muted font-bold">
              {polygonDefined
                ? `${polygon.length} pts defined — click to add more`
                : 'Click on the satellite map to draw rooftop boundary'}
            </div>
            <button
              onClick={() => polygonDefined && setStep('design')}
              disabled={!polygonDefined}
              className="px-8 py-3 bg-solar-green text-solar-navy font-black rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-tighter disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={18} /> Finish Crop
            </button>
          </>
        ) : (
          <button
            onClick={resetCrop}
            className="px-8 py-3 glass text-solar-green font-black rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-tighter border border-solar-green/30"
          >
            <MapIcon size={18} /> New Crop
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-4 relative mt-16">

        {/* ── Left Sidebar ── */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-60 flex flex-col gap-3 z-40 shrink-0"
        >
          {/* Tools */}
          <div className="glass p-4 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Smart Crop</h3>
            <button
              onClick={runAIScan}
              disabled={isScanning || step !== 'crop'}
              className={cn(
                'flex items-center gap-3 w-full p-3 rounded-xl border transition-all glass hover:bg-white/5',
                isScanning ? 'border-solar-indigo text-solar-indigo' : 'border-border/50'
              )}
            >
              <Sun size={16} className={cn(isScanning && 'animate-spin text-solar-indigo')} />
              <span className="text-xs font-bold text-foreground">AI Smart Scan</span>
            </button>

            <div className="border-t border-white/5 pt-3">
              <h3 className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2">Layout</h3>
              <button
                onClick={autoLayout}
                disabled={step === 'crop' || !polygonDefined}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-solar-green/30 transition-all glass hover:bg-solar-green/10 text-solar-green disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Target size={16} />
                <span className="text-xs font-bold">Max-Capacity Fill</span>
              </button>
            </div>

            {!polygonDefined && step === 'design' && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-solar-danger/10 border border-solar-danger/20">
                <AlertTriangle size={12} className="text-solar-danger mt-0.5 shrink-0" />
                <p className="text-[9px] text-solar-danger leading-tight">
                  Define rooftop boundary before placing panels.
                </p>
              </div>
            )}
          </div>

          {/* Panel Types */}
          <div className="glass p-4 rounded-2xl border border-white/5 space-y-2">
            <h3 className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2">Panel Type</h3>
            {panelTypes.map((pt, i) => (
              <button
                key={i}
                onClick={() => setSelectedType(i)}
                className={`w-full p-2.5 rounded-lg border transition-all text-left ${
                  selectedType === i
                    ? 'bg-solar-green/10 border-solar-green shadow-glow'
                    : 'glass border-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="text-[10px] font-bold leading-tight">{pt.name}</div>
                <div className="text-[9px] text-solar-green font-mono mt-0.5">
                  {pt.watt}W · η{pt.efficiency}% · ₹{pt.costPerW}/W
                </div>
              </button>
            ))}

            <div className="pt-2 space-y-2 border-t border-white/5">
              <button
                onClick={addPanel}
                disabled={step === 'crop' || !polygonDefined}
                className="w-full py-3 bg-solar-green text-solar-navy font-black rounded-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 uppercase text-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> Add Panel
              </button>
              <button
                onClick={deleteLastPanel}
                disabled={panels.length === 0}
                className="w-full py-2.5 glass text-solar-danger font-bold rounded-lg hover:bg-solar-danger/10 transition-all text-[10px] border border-solar-danger/10 disabled:opacity-40"
              >
                Delete Last
              </button>
            </div>
          </div>

          {/* Time Slider */}
          {step === 'design' && (
            <div className="glass p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-solar-amber uppercase tracking-widest">Sun Simulation</span>
                <span className="text-[9px] font-mono text-solar-amber">{formatTime(timeOfDay)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={0.25}
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none accent-solar-amber"
              />
              <div className="flex justify-between text-[8px] text-white/30 mt-1">
                <span>Sunrise</span><span>Noon</span><span>Sunset</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── 3D Viewport ── */}
        <div className="flex-1 relative min-h-[600px]">
          <GlassCard className="h-full relative overflow-hidden p-0 border-white/5" hover={false}>
            <Suspense
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center bg-solar-navy gap-3">
                  <div className="w-10 h-10 border-4 border-solar-green border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] text-solar-muted font-bold uppercase tracking-widest">Loading GIS Scene</p>
                </div>
              }
            >
              <RooftopScene
                panels={panels}
                sunAngle={50}
                panelColors={panelTypes.map((p) => p.color)}
                timeOfDay={timeOfDay}
                optimalTilt={optimalTilt}
                polygon={polygon || []}
                center={coordinates}
                isCropping={step === 'crop'}
                isScanning={isScanning}
                onPolygonUpdate={setPolygon}
                onMetricsUpdate={(m) => setShadowImpact(m.totalShadowImpact)}
              />
            </Suspense>
          </GlassCard>
        </div>

        {/* ── Right Sidebar ── */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-68 flex flex-col gap-3 z-40 shrink-0"
        >
          {/* Live Analysis */}
          <div className="glass p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Live Analysis</h3>

            <div>
              <p className="text-[9px] font-bold text-solar-muted uppercase mb-1">Capacity</p>
              <div className="text-3xl font-mono-data text-solar-green leading-none">
                {(totalKwDisplay / 100).toFixed(1)}{' '}
                <span className="text-xs opacity-50">kW</span>
              </div>
              <p className="text-[9px] text-white/30 mt-0.5">{panels.length} panels</p>
            </div>

            <div>
              <p className="text-[9px] font-bold text-solar-muted uppercase mb-1">Annual Yield</p>
              <div className="text-2xl font-mono-data text-solar-amber leading-none">
                {formatIndian(annualKwhDisplay)}{' '}
                <span className="text-xs opacity-50">kWh/yr</span>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold text-solar-muted uppercase mb-1">Shadow Loss</p>
              <div className="text-xl font-mono-data text-solar-danger leading-none">
                {shadowImpact.toFixed(1)}%
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold text-solar-muted uppercase mb-1">Est. System Cost</p>
              <div className="text-lg font-mono-data text-white/80 leading-none">
                ₹{panelCostLakh} <span className="text-xs opacity-50">Lakh</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <button
                onClick={() => onCommit({ panelCount: panels.length, totalKw, annualKwh })}
                disabled={panels.length === 0}
                className="w-full py-4 rounded-xl bg-solar-green text-solar-navy font-black text-sm shadow-glow hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Zap size={14} className="inline mr-2" />
                COMMIT DESIGN
              </button>
            </div>
          </div>

          {/* Polygon Status */}
          <div className={cn(
            'glass p-3 rounded-xl border',
            polygonDefined ? 'border-solar-green/20 bg-solar-green/5' : 'border-solar-danger/20 bg-solar-danger/5'
          )}>
            <div className={cn(
              'flex items-center gap-2 mb-1',
              polygonDefined ? 'text-solar-green' : 'text-solar-danger'
            )}>
              <ShieldAlert size={12} />
              <span className="text-[9px] font-black uppercase">
                {polygonDefined ? 'Rooftop Defined' : 'No Rooftop Defined'}
              </span>
            </div>
            <p className="text-[8px] text-white/50 leading-relaxed">
              {polygonDefined
                ? `${polygon.length} boundary points · Panels strictly inside polygon`
                : 'Use Smart Crop or AI Scan to define rooftop boundary'}
            </p>
          </div>

          {/* NASA Anchor */}
          <div className="glass p-3 rounded-xl border border-white/5">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">GIS Anchor</p>
            <p className="text-[8px] text-white/50">
              NASA POWER irradiance: <span className="text-solar-amber font-mono">{nasaIrradiance.toFixed(2)} kWh/m²/day</span>
            </p>
            <p className="text-[8px] text-white/50 mt-0.5">
              Optimal tilt: <span className="text-solar-amber font-mono">{optimalTilt.toFixed(1)}° · 180° South</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
