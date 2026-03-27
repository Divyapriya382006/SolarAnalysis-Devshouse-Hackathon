import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface SolarPanel3D {
  id: number;
  type: number;
  position: [number, number, number];
}

interface RooftopSceneProps {
  panels: SolarPanel3D[];
  sunAngle: number;
  panelColors: string[];
  timeOfDay: number; // 0-24 hours
}

/* ── Sun position from time ── */
function calcSunPosition(hour: number): [number, number, number] {
  const noon = 12;
  const t = ((hour - 6) / 12) * Math.PI; // 6am=0, 12pm=PI/2, 6pm=PI
  const x = Math.cos(t) * 12;
  const y = Math.max(Math.sin(t) * 10, 0.2);
  const z = -4 + Math.sin(t) * 2;
  return [x, y, z];
}

function SunOrb({ timeOfDay }: { timeOfDay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const [x, y, z] = calcSunPosition(timeOfDay);
  const isNight = y < 0.5;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(x, y, z);
    }
  });

  return (
    <group>
      <mesh ref={ref} position={[x, y, z]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color="#F59E0B"
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 0.3 : 2}
        />
      </mesh>
      <directionalLight
        position={[x, y, z]}
        intensity={isNight ? 0.1 : 1.5}
        color="#F59E0B"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-bias={-0.001}
      />
    </group>
  );
}

/* ── Nearby buildings that cast shadows ── */
function NearbyBuildings() {
  const buildings = useMemo(() => [
    { pos: [-8, 3, -3] as const, size: [3, 6, 4] as const, color: '#1a1a2a' },
    { pos: [-7, 4, 3] as const, size: [2.5, 8, 3] as const, color: '#1e1e30' },
    { pos: [8, 2.5, -2] as const, size: [2, 5, 5] as const, color: '#1c1c28' },
    { pos: [9, 3.5, 4] as const, size: [3, 7, 2.5] as const, color: '#1a1a2e' },
    { pos: [0, 2, -8] as const, size: [4, 4, 2] as const, color: '#1e1e2c' },
    { pos: [5, 5, -7] as const, size: [2, 10, 3] as const, color: '#161626' },
  ], []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i}>
          <mesh
            position={[b.pos[0], b.pos[1], b.pos[2]]}
            castShadow
          >
            <boxGeometry args={[b.size[0], b.size[1], b.size[2]]} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.9}
              metalness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Window lights */}
          {Array.from({ length: Math.floor(b.size[1] / 1.5) }).map((_, row) =>
            Array.from({ length: Math.floor(b.size[0] / 1.2) }).map((_, col) => (
              <mesh
                key={`w${row}-${col}`}
                position={[
                  b.pos[0] - b.size[0] / 2 + 0.6 + col * 1.2,
                  b.pos[1] - b.size[1] / 2 + 1 + row * 1.5,
                  b.pos[2] + b.size[2] / 2 + 0.01,
                ]}
              >
                <planeGeometry args={[0.4, 0.6]} />
                <meshStandardMaterial
                  color="#334155"
                  emissive="#6366F1"
                  emissiveIntensity={0.15}
                />
              </mesh>
            ))
          )}
        </group>
      ))}
    </group>
  );
}

/* ── Trees that cast shadows ── */
function Trees() {
  const trees = useMemo(() => [
    { pos: [-6, 0, 6] as const, height: 4, canopyRadius: 1.5 },
    { pos: [7, 0, 6] as const, height: 5, canopyRadius: 2 },
    { pos: [-3, 0, -7] as const, height: 3.5, canopyRadius: 1.3 },
    { pos: [10, 0, 0] as const, height: 6, canopyRadius: 2.2 },
    { pos: [-10, 0, 1] as const, height: 4.5, canopyRadius: 1.8 },
  ], []);

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.pos[0], t.pos[1], t.pos[2]]}>
          {/* Trunk */}
          <mesh position={[0, t.height / 2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, t.height, 8]} />
            <meshStandardMaterial color="#3d2914" roughness={0.95} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, t.height + t.canopyRadius * 0.5, 0]} castShadow>
            <sphereGeometry args={[t.canopyRadius, 12, 12]} />
            <meshStandardMaterial
              color="#1a4a2a"
              roughness={0.9}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Shadow receiver plane (ground) ── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <shadowMaterial transparent opacity={0.6} />
    </mesh>
  );
}

function Rooftop() {
  return (
    <group>
      {/* Main flat roof */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, 0.3, 8]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.9} />
      </mesh>

      {/* Parapet walls */}
      <mesh position={[0, 0.35, 4]} castShadow><boxGeometry args={[10, 0.4, 0.15]} /><meshStandardMaterial color="#3a3a4e" roughness={0.8} /></mesh>
      <mesh position={[0, 0.35, -4]} castShadow><boxGeometry args={[10, 0.4, 0.15]} /><meshStandardMaterial color="#3a3a4e" roughness={0.8} /></mesh>
      <mesh position={[-5, 0.35, 0]} castShadow><boxGeometry args={[0.15, 0.4, 8]} /><meshStandardMaterial color="#3a3a4e" roughness={0.8} /></mesh>
      <mesh position={[5, 0.35, 0]} castShadow><boxGeometry args={[0.15, 0.4, 8]} /><meshStandardMaterial color="#3a3a4e" roughness={0.8} /></mesh>

      {/* Water tank */}
      <mesh position={[3.5, 0.8, -2.8]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
        <meshStandardMaterial color="#4a6580" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[3.5, 0.25, -2.8]}>
        <boxGeometry args={[1.4, 0.2, 1.4]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Staircase head */}
      <mesh position={[-3.5, 0.9, 2.5]} castShadow>
        <boxGeometry args={[2, 1.5, 1.8]} />
        <meshStandardMaterial color="#3d3d50" roughness={0.8} />
      </mesh>
      <mesh position={[-3.5, 0.6, 3.41]}>
        <boxGeometry args={[0.7, 1.1, 0.02]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Antenna */}
      <mesh position={[4, 1.5, 3]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 6]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      <mesh position={[4, 2.5, 3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>

      {/* Shadow receiving surface on roof */}
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <shadowMaterial transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Panel({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} rotation={[-0.3, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.04, 0.6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.275, 0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.95, 0.01, 0.55]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.4} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={`v${i}`} position={[x, 0.28, 0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.005, 0.015, 0.55]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
      ))}
      {[-0.15, 0.15].map((z, i) => (
        <mesh key={`h${i}`} position={[0, 0.28, z]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.95, 0.015, 0.005]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
      ))}
      <mesh position={[-0.35, 0.1, 0.15]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color="#666" metalness={0.8} />
      </mesh>
      <mesh position={[0.35, 0.1, 0.15]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color="#666" metalness={0.8} />
      </mesh>
    </group>
  );
}

function GridFloor() {
  return (
    <Grid
      args={[20, 20]}
      position={[0, 0.16, 0]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#00E5A0"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#00E5A0"
      fadeDistance={15}
      fadeStrength={1}
      infiniteGrid={false}
    />
  );
}

/* ── Shadow analysis info overlay ── */
function ShadowIndicator({ timeOfDay }: { timeOfDay: number }) {
  const sunPos = calcSunPosition(timeOfDay);
  const isNight = sunPos[1] < 0.5;
  const shadowLength = isNight ? 0 : (1 / Math.max(Math.tan((sunPos[1] / 10) * (Math.PI / 2)), 0.1)).toFixed(1);

  return null; // shadow calcs happen via Three.js shadow maps
}

export default function RooftopScene({ panels, sunAngle, panelColors, timeOfDay }: RooftopSceneProps) {
  const panelPositions = useMemo(() => {
    return panels.map((p, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      return {
        ...p,
        position: [-2.5 + col * 1.2, 0, -2 + row * 1.0] as [number, number, number],
      };
    });
  }, [panels]);

  return (
    <Canvas
      camera={{ position: [8, 8, 8], fov: 45 }}
      shadows="soft"
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <color attach="background" args={['#0A0F1E']} />
      <fog attach="fog" args={['#0A0F1E', 20, 40]} />

      <ambientLight intensity={0.15} />
      <SunOrb timeOfDay={timeOfDay} />
      <ShadowIndicator timeOfDay={timeOfDay} />

      <Rooftop />
      <Ground />
      <NearbyBuildings />
      <Trees />
      <GridFloor />

      {panelPositions.map((p) => (
        <Panel
          key={p.id}
          position={p.position}
          color={panelColors[p.type] || '#1a3a5a'}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={25}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
