import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * Rising Particles Component
 * Creates atmospheric particles with custom shader
 */
export function RisingParticles({
  count = 200,
  area = 20,
  height = 15,
  speed = 0.5,
  size = 0.2,
  opacity = 0.6,
  color = "#ffdacc",
  bottomDensity = 3.0,
  velocityGradient = 0.7,
  sizeGradient = 0.7,
  opacityGradient = 0.6,
  pulseSpeed = 1.5,
  pulseIntensity = 0.2,
  driftIntensity = 0.002,
}: {
  count?: number;
  area?: number;
  height?: number;
  speed?: number;
  size?: number;
  opacity?: number;
  color?: string;
  bottomDensity?: number;
  velocityGradient?: number;
  sizeGradient?: number;
  opacityGradient?: number;
  pulseSpeed?: number;
  pulseIntensity?: number;
  driftIntensity?: number;
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

      // Dense at bottom distribution - use power function to bias toward bottom
      const bottomBias = Math.pow(Math.random(), bottomDensity); // Higher power = more bottom-heavy
      positions[i3 + 1] = bottomBias * height - 5; // y (heavily weighted toward bottom)

      positions[i3 + 2] = (Math.random() - 0.5) * area; // z

      // Random velocity for each particle - slower particles at bottom
      const baseVelocity = Math.random() * speed + speed * 0.5;
      // Slower velocity for particles starting lower (creates natural acceleration effect)
      const heightFactor = (positions[i3 + 1] + 5) / height; // 0 at bottom, 1 at top
      velocities[i] = baseVelocity * (0.3 + heightFactor * velocityGradient); // 30% to variable speed

      // Random lifetime offset for staggered animation
      lifetimes[i] = Math.random() * 10;

      // Smaller particles at the bottom, larger as they rise
      const bottomScale = 0.5 + Math.random() * 0.5; // Random base scale
      scales[i] = bottomScale * (0.3 + heightFactor * sizeGradient); // Scale with height
    }

    return { positions, velocities, lifetimes, scales };
  }, [
    count,
    area,
    height,
    speed,
    bottomDensity,
    velocityGradient,
    sizeGradient,
  ]);

  // Create custom particle shader material
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: size * 500 },
        uOpacity: { value: opacity },
        uColor: { value: new THREE.Color(color) },
        uPulseSpeed: { value: pulseSpeed },
        uPulseIntensity: { value: pulseIntensity },
        uOpacityGradient: { value: opacityGradient },
        uSizeGradient: { value: sizeGradient },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        uniform float uPulseSpeed;
        uniform float uPulseIntensity;
        uniform float uOpacityGradient;
        uniform float uSizeGradient;
        
        attribute float scale;
        
        varying float vScale;
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          vScale = scale;
          
          // Calculate height-based effects
          float heightFactor = (position.y + 5.0) / 20.0;
          heightFactor = clamp(heightFactor, 0.0, 1.0);
          
          // Dynamic sizing based on height and scale - configurable gradient
          float finalSize = uSize * scale * (0.3 + heightFactor * uSizeGradient);
          
          // Add configurable pulsing effect
          float pulse = sin(uTime * uPulseSpeed + position.x * 0.1 + position.z * 0.1) * uPulseIntensity + 1.0;
          finalSize *= pulse;
          
          // Calculate opacity based on height - configurable gradient
          vOpacity = mix(1.0, 1.0 - uOpacityGradient, heightFactor);
          
          // Color variation based on height - warmer at bottom, cooler at top
          vColor = vec3(1.0, 0.8 + heightFactor * 0.2, 0.7 + heightFactor * 0.3);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = finalSize * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform vec3 uColor;
        
        varying float vScale;
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          // Create circular particle
          vec2 center = gl_PointCoord - 0.5;
          float distance = length(center) * 2.0;
          
          // Circular falloff
          float alpha = 1.0 - smoothstep(0.0, 1.0, distance);
          
          // Inner and outer glow
          float innerGlow = 1.0 - smoothstep(0.0, 0.4, distance);
          float outerGlow = 1.0 - smoothstep(0.4, 1.0, distance);
          
          // Combine glow effects
          float glowStrength = innerGlow * 2.0 + outerGlow * 0.8;
          
          // Final color
          vec3 finalColor = uColor * vColor * glowStrength;
          
          // Final alpha
          float finalAlpha = alpha * uOpacity * vOpacity * 0.8;
          
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [
    size,
    opacity,
    color,
    pulseSpeed,
    pulseIntensity,
    opacityGradient,
    sizeGradient,
  ]);

  // Animation
  useFrame((state, delta) => {
    // Update shader uniforms
    if (particleMaterial) {
      particleMaterial.uniforms.uTime.value = state.clock.elapsedTime;
      particleMaterial.uniforms.uSize.value = size * 500;
      particleMaterial.uniforms.uOpacity.value = opacity;
      particleMaterial.uniforms.uColor.value.set(color);
      particleMaterial.uniforms.uPulseSpeed.value = pulseSpeed;
      particleMaterial.uniforms.uPulseIntensity.value = pulseIntensity;
      particleMaterial.uniforms.uOpacityGradient.value = opacityGradient;
      particleMaterial.uniforms.uSizeGradient.value = sizeGradient;
    }
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Move particle upward
        positions[i3 + 1] += velocities[i] * delta;

        // Add configurable horizontal drift and randomness
        positions[i3] +=
          Math.sin(state.clock.elapsedTime + lifetimes[i]) * driftIntensity;
        positions[i3 + 2] +=
          Math.cos(state.clock.elapsedTime + lifetimes[i]) * driftIntensity;

        // Reset particle when it goes too high
        if (positions[i3 + 1] > height) {
          positions[i3] = (Math.random() - 0.5) * area;

          // Maintain bottom-heavy distribution for recycled particles
          const bottomBias = Math.pow(Math.random(), bottomDensity);
          positions[i3 + 1] = bottomBias * (height * 0.3) - 5; // Reset to bottom 30% of area

          positions[i3 + 2] = (Math.random() - 0.5) * area;

          // Reset velocity based on new position (slower at bottom)
          const heightFactor = (positions[i3 + 1] + 5) / height;
          const baseVelocity = Math.random() * speed + speed * 0.5;
          velocities[i] =
            baseVelocity * (0.3 + heightFactor * velocityGradient);
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
      <primitive object={particleMaterial} />
    </points>
  );
}
