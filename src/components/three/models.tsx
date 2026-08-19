/**
 * Procedural 3D primitives: the pickleball (sphere + fibonacci-lattice
 * holes), a float/bob group and a themed light rig. Generated at runtime —
 * no models or textures — and recolored from `theme.three.palette`.
 */
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Dispose a prop-passed GL resource when it is replaced or unmounted (R3F
 * only auto-disposes JSX-declared ones). One hook per resource, so a palette
 * change that rebuilds a material never disposes a still-in-use geometry.
 */
function useDispose(resource: { dispose(): void }) {
  useEffect(() => () => resource.dispose(), [resource]);
}

/* ------------------------------------------------------------------ */
/* Pickleball — wiffle ball with recessed holes                        */
/* ------------------------------------------------------------------ */

/** Evenly distributes n points on a sphere (fibonacci lattice). */
function fibonacciSphere(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
  }
  return pts;
}

interface PickleballProps {
  radius?: number;
  holes?: number;
  color?: string;
  holeColor?: string;
  roughness?: number;
  metalness?: number;
  /** Extra props forwarded to the group. */
  [key: string]: unknown;
}

export function Pickleball({
  radius = 1,
  holes = 26,
  color = "#f3ead9",
  holeColor = "#c9b9a8",
  roughness = 0.42,
  metalness = 0.05,
  ...props
}: PickleballProps) {
  const holeData = useMemo(() => {
    return fibonacciSphere(holes).map((dir) => {
      const pos = dir.clone().multiplyScalar(radius * 0.985);
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
      return { pos, quat };
    });
  }, [holes, radius]);

  const holeGeom = useMemo(() => new THREE.CircleGeometry(radius * 0.16, 20), [radius]);
  const holeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: holeColor,
        roughness: 0.85,
        metalness: 0,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    [holeColor]
  );
  useDispose(holeGeom);
  useDispose(holeMat);

  return (
    <group {...props}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      </mesh>
      {holeData.map(({ pos, quat }, i) => (
        <mesh key={i} geometry={holeGeom} material={holeMat} position={pos} quaternion={quat} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* FloatGroup — gentle bobbing/rocking wrapper                         */
/* ------------------------------------------------------------------ */

interface FloatGroupProps {
  children: ReactNode;
  amplitude?: number;
  rotAmplitude?: number;
  speed?: number;
  /** Phase offset so several floaters don't move in lockstep. */
  phase?: number;
  [key: string]: unknown;
}

export function FloatGroup({
  children,
  amplitude = 0.18,
  rotAmplitude = 0.08,
  speed = 1,
  phase = 0,
  ...props
}: FloatGroupProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.getElapsedTime() * speed + phase;
    g.position.y = Math.sin(t * 0.8) * amplitude;
    g.rotation.x = Math.sin(t * 0.6) * rotAmplitude;
    g.rotation.z = Math.cos(t * 0.5) * rotAmplitude * 0.6;
  });

  // Caller transforms (position/rotation/scale) live on the outer group; the
  // bob/rock animates the inner group relative to it instead of overwriting it.
  return (
    <group {...props}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* SceneLights — themed light rig                                      */
/* ------------------------------------------------------------------ */

interface SceneLightsProps {
  intensity?: number;
  /** Warm key/fill color (theme.three.palette.light). */
  light?: string;
  /** Colored rim light (theme.three.palette.secondary). */
  rim?: string;
  /** Low fill (theme.three.palette.primary). */
  fill?: string;
}

export function SceneLights({ intensity = 1, light = "#ffffff", rim = "#8b9c7e", fill = "#b6786c" }: SceneLightsProps) {
  return (
    <>
      <ambientLight intensity={0.45 * intensity} color={light} />
      <directionalLight position={[4, 6, 5]} intensity={1.3 * intensity} color={light} />
      <directionalLight position={[-6, -2, -4]} intensity={0.6 * intensity} color={rim} />
      <pointLight position={[0, -3, 3]} intensity={0.4 * intensity} color={fill} />
    </>
  );
}
