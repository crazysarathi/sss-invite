/**
 * BallCanvas — a small R3F canvas holding one procedural 3D pickleball:
 * themed light rig + the ball floating and slowly turning. Used twice:
 * the wax-seal ball on the opening envelope, and the hero ball.
 *
 * Movement of the ball as an OBJECT (bounce in, roll off, scroll parallax)
 * is GSAP on the HTML container, not three — keep the scene dumb.
 * Renders on demand under reduced motion and only while `active`.
 */
import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ThemeThree } from "@/themes/types";
import { useIsCoarsePointer } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { FloatGroup, Pickleball, SceneLights } from "@/components/three/models";

interface BallCanvasProps {
  palette: ThemeThree["palette"];
  /** Continuous y-rotation speed (rad/s). */
  spin?: number;
  /** Idle bob amplitude (scene units). */
  float?: number;
  /** Run the frameloop (false when offscreen). */
  active?: boolean;
  /** Ball radius relative to the canvas (1.02 fills it at fov 32 / z 4.2). */
  radius?: number;
}

function Spinner({ spin, children }: { spin: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * spin;
  });
  return (
    <group ref={ref} rotation={[0.35, 0.6, 0.15]}>
      {children}
    </group>
  );
}

export default function BallCanvas({ palette, spin = 0.45, float = 0.05, active = true, radius = 1.02 }: BallCanvasProps) {
  const coarse = useIsCoarsePointer();
  const reduced = usePrefersReducedMotion();
  return (
    <div className="pointer-events-none h-full w-full" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.2], fov: 32 }}
        frameloop={reduced ? "demand" : active ? "always" : "never"}
        // The container is scaled by GSAP (pops in from 0): measure layout
        // size, not the transformed bounding box, or the canvas never sizes.
        resize={{ offsetSize: true, scroll: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <SceneLights light={palette.light} rim={palette.secondary} fill={palette.primary} intensity={1.35} />
        <FloatGroup amplitude={float} rotAmplitude={0.12} speed={0.8}>
          <Spinner spin={spin}>
            <Pickleball
              radius={radius}
              holes={coarse ? 20 : 26}
              color={palette.ball}
              holeColor={palette.holes}
              roughness={0.4}
            />
          </Spinner>
        </FloatGroup>
      </Canvas>
    </div>
  );
}
