import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
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
}

function SunOrb({ angle }: { angle: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const rad = (angle / 100) * Math.PI;
  const x = Math.cos(rad) * 8;
  const y = Math.sin(rad) * 6 + 1;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(x, y, -2);
    }
  });

  return (
    <group>
      <mesh ref={ref} position={[x, y, -2]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[x, y, -2]} intensity={1.5} color="#F59E0B" distance={20} />
    </group>
  );
}

function Rooftop() {
  return (
    <group>
      {/* Main flat roof */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[10, 0.3, 8]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.9} />
      </mesh>

      {/* Parapet walls */}
      {/* Front */}
      <mesh position={[0, 0.35, 4]}>
        <boxGeometry args={[10, 0.4, 0.15]} />
        <meshStandardMaterial color="#3a3a4e" roughness={0.8} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.35, -4]}>
        <boxGeometry args={[10, 0.4, 0.15]} />
        <meshStandardMaterial color="#3a3a4e" roughness={0.8} />
      </mesh>
      {/* Left */}
      <mesh position={[-5, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#3a3a4e" roughness={0.8} />
      </mesh>
      {/* Right */}
      <mesh position={[5, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#3a3a4e" roughness={0.8} />
      </mesh>

      {/* Water tank */}
      <mesh position={[3.5, 0.8, -2.8]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
        <meshStandardMaterial color="#4a6580" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Tank stand */}
      <mesh position={[3.5, 0.25, -2.8]}>
        <boxGeometry args={[1.4, 0.2, 1.4]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Staircase head */}
      <mesh position={[-3.5, 0.9, 2.5]} castShadow>
        <boxGeometry args={[2, 1.5, 1.8]} />
        <meshStandardMaterial color="#3d3d50" roughness={0.8} />
      </mesh>
      {/* Staircase door */}
      <mesh position={[-3.5, 0.6, 3.41]}>
        <boxGeometry args={[0.7, 1.1, 0.02]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Antenna */}
      <mesh position={[4, 1.5, 3]}>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 6]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      {/* Antenna cross */}
      <mesh position={[4, 2.5, 3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>

      {/* Exclusion zone (red border) */}
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.5, 5.7, 4]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Panel({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);

  return (
    <group ref={ref} position={position}>
      {/* Panel frame */}
      <mesh position={[0, 0.25, 0]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.0, 0.04, 0.6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Panel glass surface */}
      <mesh position={[0, 0.275, 0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.95, 0.01, 0.55]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.4} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      {/* Grid lines on panel */}
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
      {/* Mounting legs */}
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

export default function RooftopScene({ panels, sunAngle, panelColors }: RooftopSceneProps) {
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
      shadows
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <color attach="background" args={['#0A0F1E']} />
      <fog attach="fog" args={['#0A0F1E', 15, 30]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 3]} intensity={0.8} castShadow />

      <SunOrb angle={sunAngle} />
      <Rooftop />
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
        maxDistance={20}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
