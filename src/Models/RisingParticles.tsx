import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * Rising Particles Component
 * Creates atmospheric orange particles rising from the bottom
 */
export function RisingParticles({
  count = 200,
  area = 20,
  height = 15,
  speed = 0.5,
  size = 0.02,
  opacity = 0.6,
  color = "#ff6b35",
}: {
  count?: number;
  area?: number;
  height?: number;
  speed?: number;
  size?: number;
  opacity?: number;
  color?: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions and properties
  const { positions, velocities, lifetimes, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const lifetimes = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random position within area
      positions[i3] = (Math.random() - 0.5) * area; // x
      positions[i3 + 1] = Math.random() * height - 5; // y (start below ground)
      positions[i3 + 2] = (Math.random() - 0.5) * area; // z

      // Random velocity for each particle
      velocities[i] = Math.random() * speed + speed * 0.5;

      // Random lifetime offset for staggered animation
      lifetimes[i] = Math.random() * 10;

      // Random scale variation for each particle
      scales[i] = Math.random() * 0.5 + 0.75;
    }

    return { positions, velocities, lifetimes, scales };
  }, [count, area, height, speed]);

  // Animation
  useFrame((state, delta) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Move particle upward
        positions[i3 + 1] += velocities[i] * delta;

        // Add slight horizontal drift and randomness
        positions[i3] +=
          Math.sin(state.clock.elapsedTime + lifetimes[i]) * 0.002;
        positions[i3 + 2] +=
          Math.cos(state.clock.elapsedTime + lifetimes[i]) * 0.002;

        // Reset particle when it goes too high
        if (positions[i3 + 1] > height) {
          positions[i3] = (Math.random() - 0.5) * area;
          positions[i3 + 1] = -5;
          positions[i3 + 2] = (Math.random() - 0.5) * area;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={count}
          args={[scales, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        transparent
        opacity={opacity}
        color={color}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
