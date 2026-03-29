/**
 * RooftopScene.tsx — Geo-Spatial Digital Twin
 * 
 * Architecture:
 * - ESRI World Imagery tiles (free, no key, CORS-open)
 * - EPSG:4326 → local flat-meter grid projection
 * - Origin = user's searched address (lat/lng)
 * - Solar panels spatially anchored to real-world coordinates
 * - Constrained camera: orbit/pan/zoom locked to ~150m radius
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SolarPanel3D {
  id: number;
  type: number;
  position: [number, number, number];
  inShadow?: boolean;
}

interface RooftopSceneProps {
  panels: SolarPanel3D[];
  sunAngle: number;
  panelColors: string[];
  timeOfDay: number;
  optimalTilt: number;
  polygon: Array<[number, number]>;  // [lat, lng]
  center: { lat: number; lng: number };
  isCropping?: boolean;
  isScanning?: boolean;
  onPolygonUpdate?: (poly: Array<[number, number]>) => void;
  onMetricsUpdate?: (metrics: { totalShadowImpact: number; avgEfficiency: number }) => void;
}

// ─── GIS Math ────────────────────────────────────────────────────────────────

/**
 * Slippy Map tile formula (Web Mercator / EPSG:3857)
 * Returns fractional tile position + integer tile coords
 */
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const tileX_f = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const tileY_f = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return {
    fx: tileX_f,
    fy: tileY_f,
    tileX: Math.floor(tileX_f),
    tileY: Math.floor(tileY_f),
  };
}

/**
 * Accurate meters per tile at a given latitude and zoom level.
 * Formula: Earth_Circumference × cos(lat) / 2^zoom
 */
function metersPerTileAt(lat: number, zoom: number): number {
  return (40075016.686 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

/**
 * Converts lat/lng to local scene coordinates (meters from origin).
 * origin = { lat, lng } of the scene center.
 * Returns [x, z] — y-up convention in Three.js means lat→Z, lng→X
 */
function latlngToLocal(lat: number, lng: number, originLat: number, originLng: number): [number, number] {
  const cosLat = Math.cos((originLat * Math.PI) / 180);
  const x = (lng - originLng) * 111320 * cosLat;
  const z = -(lat - originLat) * 111320; // Negative: north is -Z in Three.js default
  return [x, z];
}

// ─── Sun Simulation ──────────────────────────────────────────────────────────

function calcSunPosition(hour: number): THREE.Vector3 {
  const t = ((hour - 6) / 12) * Math.PI;
  return new THREE.Vector3(
    Math.cos(t) * 80,
    Math.max(Math.sin(t) * 60, 0.5),
    -30 + Math.sin(t) * 20
  );
}

function SunOrb({ timeOfDay }: { timeOfDay: number }) {
  const sunPos = calcSunPosition(timeOfDay);
  const isNight = sunPos.y < 2;

  return (
    <group>
      <mesh position={sunPos}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#FBBF24"
          emissive="#FBBF24"
          emissiveIntensity={isNight ? 0.2 : 6}
        />
      </mesh>
      <directionalLight
        position={sunPos}
        intensity={isNight ? 0.1 : 3.5}
        color="#FDE68A"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-bias={-0.0002}
      />
    </group>
  );
}

// ─── Satellite Tile Layer ─────────────────────────────────────────────────────

/**
 * Renders a single ESRI World Imagery tile.
 * ESRI URL format: /tile/{z}/{y}/{x}  (note y before x — different from OSM!)
 */
function EsriTile({
  tileX, tileY, zoom, sizeM, localX, localZ,
}: {
  tileX: number; tileY: number; zoom: number;
  sizeM: number; localX: number; localZ: number;
}) {
  // Validate tile coordinates
  const maxTile = Math.pow(2, zoom);
  const validX = ((tileX % maxTile) + maxTile) % maxTile;
  const validY = Math.max(0, Math.min(maxTile - 1, tileY));

  // ESRI World Imagery — Free, no API key, open CORS
  const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${validY}/${validX}`;

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const tex = loader.load(url, undefined, undefined, () => {
      // On error: texture stays grey (fallback material handles this)
    });
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [url]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[localX, -0.02, localZ]}
      receiveShadow
      name="satellite_tile"
    >
      <planeGeometry args={[sizeM, sizeM]} />
      <meshStandardMaterial
        map={texture}
        roughness={1}
        metalness={0}
        color="#ffffff"
      />
    </mesh>
  );
}

/**
 * 5×5 tile grid anchored to the user's building coordinate.
 * Covers approximately 250m × 250m at zoom 19.
 */
function SatelliteGround({
  centerLat, centerLng, onClick,
}: {
  centerLat: number; centerLng: number; onClick?: (e: any) => void;
}) {
  const ZOOM = 19;
  const GRID = 2; // radius: renders (2*2+1)^2 = 25 tiles = 5×5

  const { tileData, sizeM } = useMemo(() => {
    if (!isFinite(centerLat) || !isFinite(centerLng)) return { tileData: [], sizeM: 0 };

    const { fx, fy, tileX: cTX, tileY: cTY } = latLngToTile(centerLat, centerLng, ZOOM);
    const sizeM = metersPerTileAt(centerLat, ZOOM);

    // Sub-pixel offset: how far into the center tile are we?
    const subX = (fx - cTX - 0.5) * sizeM; // meters from tile center
    const subZ = (fy - cTY - 0.5) * sizeM;

    const tileData = [];
    for (let dx = -GRID; dx <= GRID; dx++) {
      for (let dy = -GRID; dy <= GRID; dy++) {
        tileData.push({
          tileX: cTX + dx,
          tileY: cTY + dy,
          localX: dx * sizeM - subX,
          localZ: dy * sizeM - subZ,
        });
      }
    }
    return { tileData, sizeM };
  }, [centerLat, centerLng]);

  if (!tileData.length || !sizeM) return null;

  return (
    <group onClick={onClick}>
      {/* Fallback dark plane so scene is never "blank" */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[sizeM * (2 * GRID + 1), sizeM * (2 * GRID + 1)]} />
        <meshStandardMaterial color="#0a1628" roughness={1} />
      </mesh>

      {/* Satellite tiles */}
      {tileData.map((t, i) => (
        <EsriTile
          key={i}
          tileX={t.tileX}
          tileY={t.tileY}
          zoom={ZOOM}
          sizeM={sizeM}
          localX={t.localX}
          localZ={t.localZ}
        />
      ))}
    </group>
  );
}

// ─── Rooftop Polygon ─────────────────────────────────────────────────────────

function RooftopPolygon({ points }: { points: Array<{ x: number; z: number }> }) {
  const shape = useMemo(() => {
    if (points.length < 3) return null;
    const s = new THREE.Shape();
    // CRITICAL FIX: group rotation [-PI/2,0,0] maps shapeY → -WorldZ.
    // Must negate z: shapeY = -p.z → WorldZ = -(-p.z) = p.z (matches panels).
    s.moveTo(points[0].x, -points[0].z);
    for (let i = 1; i < points.length; i++) s.lineTo(points[i].x, -points[i].z);
    s.closePath();
    return s;
  }, [points]);

  if (!shape) return null;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Surface highlight */}
      <mesh name="rooftop" receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color="#00E5A0"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Extruded border */}
      <mesh>
        <extrudeGeometry args={[shape, { depth: 0.12, bevelEnabled: false }]} />
        <meshStandardMaterial
          color="#00E5A0"
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.7}
          wireframe={false}
        />
      </mesh>
    </group>
  );
}

// ─── Solar Panel ─────────────────────────────────────────────────────────────

function SolarPanel({
  position, color, tiltDeg, inShadow,
}: {
  position: [number, number, number]; color: string; tiltDeg: number; inShadow?: boolean;
}) {
  const tiltRad = (tiltDeg * Math.PI) / 180; // positive = north edge up (south-facing)
  const W = 5.0;  // width east-west (5× for visibility)
  const L = 8.5;  // length north-south (5× for visibility)
  const T = 0.18; // thickness (scaled)

  // Place panel so south edge sits at y=0.05 (just above roof)
  // Panel center Y = 0.05 + (L/2)*sin(tilt)
  const cY = 0.05 + (L / 2) * Math.sin(tiltRad);
  const legH = (L / 2) * Math.sin(tiltRad) + 0.05;
  const legZ = (L / 2) * Math.cos(tiltRad);

  return (
    <group position={position}>
      {/* Frame — tilted: rotation[-tiltRad] around X = south edge down, north up */}
      <mesh position={[0, cY, 0]} rotation={[-tiltRad, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, T, L]} />
        <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Cell glass surface */}
      <mesh position={[0, cY + T, 0]} rotation={[-tiltRad, 0, 0]}>
        <boxGeometry args={[W * 0.93, T * 0.4, L * 0.95]} />
        <meshStandardMaterial
          color={inShadow ? '#1e1b4b' : color}
          roughness={0.04}
          metalness={0.5}
          emissive={inShadow ? '#000' : color}
          emissiveIntensity={inShadow ? 0 : 0.28}
        />
      </mesh>
      {/* South mounting leg */}
      <mesh position={[0, legH / 2, legZ]}>
        <boxGeometry args={[W * 0.45, legH, 0.05]} />
        <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.7} />
      </mesh>
    </group>
  );
}

// ─── Shadow Analyzer ─────────────────────────────────────────────────────────

function ShadowAnalyzer({
  panels, timeOfDay, onUpdate,
}: {
  panels: SolarPanel3D[]; timeOfDay: number; onUpdate: (d: SolarPanel3D[]) => void;
}) {
  const { scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const frameCount = useRef(0);

  useFrame(() => {
    // Only run every 30 frames to avoid perf issues
    frameCount.current++;
    if (frameCount.current % 30 !== 0) return;

    const sunPos = calcSunPosition(timeOfDay);
    const sunVec = sunPos.clone().normalize();
    const isNight = sunPos.y < 2;

    const updated = panels.map((p) => {
      if (isNight) return { ...p, inShadow: true };
      const worldPos = new THREE.Vector3(p.position[0], p.position[1] + 0.1, p.position[2]);
      const dir = sunPos.clone().sub(worldPos).normalize();
      raycaster.current.set(worldPos, dir);
      const hits = raycaster.current.intersectObjects(scene.children, true);
      const sunDist = worldPos.distanceTo(sunPos);
      const blocked = hits.some(
        (h) => h.distance > 0.2 && h.distance < sunDist && !h.object.name.startsWith('satellite')
      );
      return { ...p, inShadow: blocked };
    });

    onUpdate(updated);
  });

  return null;
}

// ─── Crop Overlay ─────────────────────────────────────────────────────────────

function CropOverlay({
  points, centroidLat, centroidLng
}: {
  points: Array<{ x: number; z: number }>;
  centroidLat: number;
  centroidLng: number;
}) {
  if (points.length === 0) return null;

  const linePoints = points.map((p) => new THREE.Vector3(p.x, 0.15, p.z));
  if (points.length > 1) linePoints.push(linePoints[0]); // close the loop visually

  return (
    <group>
      {/* Corner markers */}
      {points.map((p, i) => (
        <mesh key={i} position={[p.x, 0.18, p.z]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color="#00E5A0" />
        </mesh>
      ))}
      {/* Line */}
      {points.length > 1 && (
        <Line points={linePoints} color="#00E5A0" lineWidth={2.5} />
      )}
    </group>
  );
}

// ─── HUD Label ────────────────────────────────────────────────────────────────

function CompassLabel({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <Html center position={position}>
      <div className="text-[9px] font-black text-green-400 tracking-[0.25em] uppercase opacity-50 px-2 py-0.5 border border-green-400/20 rounded whitespace-nowrap bg-black/30 backdrop-blur-sm pointer-events-none">
        {text}
      </div>
    </Html>
  );
}

// ─── Interactive Ground (Crop Mode Click Handler) ─────────────────────────────

function ClickPlane({
  centerLat, centerLng, isCropping, onPointAdd,
}: {
  centerLat: number; centerLng: number; isCropping: boolean;
  onPointAdd: (lat: number, lng: number) => void;
}) {
  const handleClick = (e: any) => {
    if (!isCropping) return;
    e.stopPropagation();
    const pt: THREE.Vector3 = e.point;
    // Reverse local→latlng
    const cosLat = Math.cos((centerLat * Math.PI) / 180);
    const lng = centerLng + pt.x / (111320 * cosLat);
    const lat = centerLat - pt.z / 111320; // z is negative north
    onPointAdd(lat, lng);
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// ─── Main Scene (inside Canvas) ───────────────────────────────────────────────

function SceneContent({
  panels, panelColors, timeOfDay, optimalTilt,
  polygon, center, isCropping, isScanning,
  onPolygonUpdate, onMetricsUpdate,
}: RooftopSceneProps) {
  const [panelStats, setPanelStats] = useState<SolarPanel3D[]>(panels);

  // Sync panels when parent changes them
  useEffect(() => { setPanelStats(panels); }, [panels]);

  // Convert lat/lng polygon to local scene coordinates
  const localPolygon = useMemo(() =>
    polygon.map(([lat, lng]) => {
      const [x, z] = latlngToLocal(lat, lng, center.lat, center.lng);
      return { x, z };
    }),
    [polygon, center]
  );

  // Report shadow metrics upward
  useEffect(() => {
    const shadowed = panelStats.filter((p) => p.inShadow).length;
    const impact = panels.length > 0 ? (shadowed / panels.length) * 100 : 0;
    onMetricsUpdate?.({ totalShadowImpact: impact, avgEfficiency: 100 - impact });
  }, [panelStats]);

  const siteR = 60; // compass label radius

  return (
    <>
      <ambientLight intensity={1.8} />
      <SunOrb timeOfDay={timeOfDay} />
      <fog attach="fog" args={['#020617', 200, 800]} />

      {/* GIS Satellite Layer */}
      <SatelliteGround centerLat={center.lat} centerLng={center.lng} />

      {/* Click plane for polygon crop */}
      <ClickPlane
        centerLat={center.lat}
        centerLng={center.lng}
        isCropping={!!isCropping}
        onPointAdd={(lat, lng) => onPolygonUpdate?.([...polygon, [lat, lng]])}
      />

      {/* Rooftop Polygon Overlay */}
      {localPolygon.length >= 3 && <RooftopPolygon points={localPolygon} />}

      {/* Active cropping markers */}
      {isCropping && (
        <CropOverlay
          points={localPolygon}
          centroidLat={center.lat}
          centroidLng={center.lng}
        />
      )}

      {/* Solar Panels — positioned in local scene coords */}
      {panelStats.map((p) => (
        <SolarPanel
          key={p.id}
          position={p.position}
          color={panelColors[p.type] || '#1a3a5e'}
          tiltDeg={optimalTilt}
          inShadow={p.inShadow}
        />
      ))}

      {/* AI Scan Overlay */}
      {isScanning && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial color="#6366F1" transparent opacity={0.2} side={THREE.DoubleSide} />
          <Html center>
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="w-14 h-14 border-4 border-green-400 border-t-transparent animate-spin rounded-full" />
              <div className="px-4 py-2 rounded-lg bg-black/60 text-green-400 font-black uppercase tracking-widest text-[10px] border border-green-400/30 backdrop-blur-sm">
                AI Scanning Imagery
              </div>
            </div>
          </Html>
        </mesh>
      )}

      {/* Shadow Analysis */}
      <ShadowAnalyzer panels={panels} timeOfDay={timeOfDay} onUpdate={setPanelStats} />

      {/* Engineering Grid */}
      <Grid
        position={[0, -0.01, 0]}
        args={[300, 300]}
        cellSize={5}
        cellThickness={0.15}
        cellColor="#00E5A0"
        sectionSize={25}
        sectionThickness={0.4}
        sectionColor="#00E5A0"
        fadeDistance={80}
        fadeStrength={3}
      />

      {/* Compass HUD */}
      <CompassLabel position={[0, 0.5, -siteR]} text="▲ NORTH" />
      <CompassLabel position={[0, 0.5, siteR]} text="▼ SOUTH" />
      <CompassLabel position={[siteR, 0.5, 0]} text="▶ EAST" />
      <CompassLabel position={[-siteR, 0.5, 0]} text="◀ WEST" />

      {/* Locked Camera */}
      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={8}
        maxDistance={120}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        enablePan
        screenSpacePanning
        panSpeed={0.8}
      />
    </>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function RooftopScene(props: RooftopSceneProps) {
  const { center, polygon, optimalTilt } = props;
  const centroidLat =
    polygon.length > 0
      ? polygon.reduce((s, p) => s + p[0], 0) / polygon.length
      : center.lat;
  const centroidLng =
    polygon.length > 0
      ? polygon.reduce((s, p) => s + p[1], 0) / polygon.length
      : center.lng;

  return (
    <div className="relative w-full h-full">
      {/* GIS HUD Overlay */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="rounded-xl p-3 border border-green-400/20 bg-black/50 backdrop-blur-xl shadow-2xl space-y-1 min-w-[150px]">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">GIS Anchor</p>
          <p className="text-[11px] font-mono text-green-400">{centroidLat.toFixed(5)}° N</p>
          <p className="text-[11px] font-mono text-green-400">{centroidLng.toFixed(5)}° E</p>
          <div className="border-t border-white/10 pt-1 mt-1">
            <p className="text-[9px] text-white/40">Tilt: <span className="text-amber-400 font-mono">{optimalTilt.toFixed(1)}°</span></p>
            <p className="text-[9px] text-white/40">Azimuth: <span className="text-amber-400 font-mono">180° S</span></p>
          </div>
        </div>
      </div>

      {/* Mode Badge */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-black/60 border border-green-400/30 backdrop-blur-xl">
          <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">
            {props.isCropping ? '✏ CROP MODE — Click to add points' : '⬡ AR DESIGN MODE'}
          </span>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 60, 60], fov: 40, near: 0.1, far: 1000 }}
        shadows="soft"
        style={{ background: '#020617' }}
        gl={{
          alpha: false,
          antialias: true,
          logarithmicDepthBuffer: true,
          powerPreference: 'high-performance',
        }}
      >
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
}
