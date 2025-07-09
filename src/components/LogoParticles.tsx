import React, { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

/**
 * Props for the LogoParticles component
 */
type LogoParticlesProps = {
  logoUrl: string;
  particleCount?: number;
  size?: number;
  spread?: number;
  speed?: number;
  color?: string;
  opacity?: number;
  debug?: boolean;
  alphaThreshold?: number;
  densityMode?: "uniform" | "adaptive";
};

/**
 * LogoParticles component that creates animated particles based on a logo image
 */
export const LogoParticles: React.FC<LogoParticlesProps> = ({
  logoUrl,
  particleCount = 5000,
  size = 0.02,
  spread = 4,
  speed = 0.5,
  color = "#ffffff",
  opacity = 0.8,
  debug = false,
  alphaThreshold = 50,
  densityMode = "adaptive",
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useLoader(TextureLoader, logoUrl);

  // Create particle positions and colors based on logo pixels
  const { positions, colors, originalPositions, debugInfo } = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Type guard to ensure texture is a single Texture with an image
    const textureImage = Array.isArray(texture)
      ? texture[0]?.image
      : texture.image;

    if (!ctx || !textureImage) {
      console.warn("LogoParticles: Failed to load image or get canvas context");
      return {
        positions: new Float32Array(),
        colors: new Float32Array(),
        originalPositions: new Float32Array(),
        debugInfo: { totalPixels: 0, visiblePixels: 0, sampledPixels: 0 },
      };
    }

    // Set canvas size (use original image dimensions)
    canvas.width = textureImage.width;
    canvas.height = textureImage.height;

    // Clear canvas and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(textureImage, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Debug info
    const debugInfo = {
      totalPixels: data.length / 4,
      visiblePixels: 0,
      sampledPixels: 0,
      imageSize: `${canvas.width}x${canvas.height}`,
      alphaThreshold,
    };

    // First pass: count visible pixels
    const visiblePixels: Array<{
      x: number;
      y: number;
      r: number;
      g: number;
      b: number;
      a: number;
    }> = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a > alphaThreshold) {
        const pixelIndex = i / 4;
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);

        visiblePixels.push({ x, y, r, g, b, a });
        debugInfo.visiblePixels++;
      }
    }

    if (debug) {
      console.log("LogoParticles Debug Info:", debugInfo);
      console.log(
        `Found ${visiblePixels.length} visible pixels out of ${debugInfo.totalPixels} total pixels`
      );
    }

    // Sample particles to create arrays
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const fallbackColor = new THREE.Color(color);

    let particleIndex = 0;

    if (densityMode === "adaptive" && visiblePixels.length > 0) {
      // Adaptive sampling: distribute particles across visible pixels
      const step = Math.max(
        1,
        Math.floor(visiblePixels.length / particleCount)
      );

      for (
        let i = 0;
        i < visiblePixels.length && particleIndex < particleCount;
        i += step
      ) {
        const pixel = visiblePixels[i];

        // Convert pixel coordinates to normalized coordinates (0-1)
        const normalizedX = pixel.x / canvas.width;
        const normalizedY = pixel.y / canvas.height;

        // Convert to 3D coordinates (centered and scaled)
        const posX = (normalizedX - 0.5) * spread;
        const posY = -(normalizedY - 0.5) * spread; // Flip Y axis
        const posZ = (Math.random() - 0.5) * 0.2; // Add slight depth variation

        // Store positions
        originalPositions[particleIndex * 3] = posX;
        originalPositions[particleIndex * 3 + 1] = posY;
        originalPositions[particleIndex * 3 + 2] = posZ;

        positions[particleIndex * 3] = posX;
        positions[particleIndex * 3 + 1] = posY;
        positions[particleIndex * 3 + 2] = posZ;

        // Store colors - use image colors if available, fallback to prop color
        if (pixel.r > 0 || pixel.g > 0 || pixel.b > 0) {
          colors[particleIndex * 3] = pixel.r / 255;
          colors[particleIndex * 3 + 1] = pixel.g / 255;
          colors[particleIndex * 3 + 2] = pixel.b / 255;
        } else {
          colors[particleIndex * 3] = fallbackColor.r;
          colors[particleIndex * 3 + 1] = fallbackColor.g;
          colors[particleIndex * 3 + 2] = fallbackColor.b;
        }

        particleIndex++;
        debugInfo.sampledPixels++;
      }
    } else {
      // Uniform sampling: sample at regular intervals (fallback)
      const samplingRate = Math.max(
        1,
        Math.floor(data.length / 4 / particleCount)
      );

      for (
        let i = 0;
        i < data.length && particleIndex < particleCount;
        i += samplingRate * 4
      ) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > alphaThreshold) {
          const pixelIndex = i / 4;
          const x = (pixelIndex % canvas.width) / canvas.width;
          const y = Math.floor(pixelIndex / canvas.width) / canvas.height;

          // Convert to 3D coordinates (centered and scaled)
          const posX = (x - 0.5) * spread;
          const posY = -(y - 0.5) * spread; // Flip Y axis
          const posZ = (Math.random() - 0.5) * 0.2; // Add slight depth variation

          // Store positions
          originalPositions[particleIndex * 3] = posX;
          originalPositions[particleIndex * 3 + 1] = posY;
          originalPositions[particleIndex * 3 + 2] = posZ;

          positions[particleIndex * 3] = posX;
          positions[particleIndex * 3 + 1] = posY;
          positions[particleIndex * 3 + 2] = posZ;

          // Store colors
          if (r > 0 || g > 0 || b > 0) {
            colors[particleIndex * 3] = r / 255;
            colors[particleIndex * 3 + 1] = g / 255;
            colors[particleIndex * 3 + 2] = b / 255;
          } else {
            colors[particleIndex * 3] = fallbackColor.r;
            colors[particleIndex * 3 + 1] = fallbackColor.g;
            colors[particleIndex * 3 + 2] = fallbackColor.b;
          }

          particleIndex++;
          debugInfo.sampledPixels++;
        }
      }
    }

    // Fill remaining particles with random positions if needed
    while (particleIndex < particleCount && visiblePixels.length > 0) {
      // Pick a random visible pixel and add some randomness
      const randomPixel =
        visiblePixels[Math.floor(Math.random() * visiblePixels.length)];

      const normalizedX =
        (randomPixel.x + (Math.random() - 0.5) * 2) / canvas.width;
      const normalizedY =
        (randomPixel.y + (Math.random() - 0.5) * 2) / canvas.height;

      const posX = (normalizedX - 0.5) * spread;
      const posY = -(normalizedY - 0.5) * spread;
      const posZ = (Math.random() - 0.5) * 0.2;

      originalPositions[particleIndex * 3] = posX;
      originalPositions[particleIndex * 3 + 1] = posY;
      originalPositions[particleIndex * 3 + 2] = posZ;

      positions[particleIndex * 3] = posX;
      positions[particleIndex * 3 + 1] = posY;
      positions[particleIndex * 3 + 2] = posZ;

      colors[particleIndex * 3] = randomPixel.r / 255;
      colors[particleIndex * 3 + 1] = randomPixel.g / 255;
      colors[particleIndex * 3 + 2] = randomPixel.b / 255;

      particleIndex++;
      debugInfo.sampledPixels++;
    }

    if (debug) {
      console.log(
        `Generated ${debugInfo.sampledPixels} particles from ${debugInfo.visiblePixels} visible pixels`
      );
    }

    return { positions, colors, originalPositions, debugInfo };
  }, [
    texture,
    particleCount,
    spread,
    color,
    alphaThreshold,
    densityMode,
    debug,
  ]);

  // Animation
  useFrame((state) => {
    if (!pointsRef.current || positions.length === 0) return;

    const positionAttribute =
      pointsRef.current.geometry.getAttribute("position");

    if (!positionAttribute) return;

    const positionsArray = positionAttribute.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Animate particles with floating motion
    for (let i = 0; i < positionsArray.length; i += 3) {
      const originalIndex = i / 3;

      // Ensure we don't go out of bounds
      if (i + 2 >= originalPositions.length) break;

      const originalX = originalPositions[i];
      const originalY = originalPositions[i + 1];
      const originalZ = originalPositions[i + 2];

      // Add floating motion
      positionsArray[i] =
        originalX + Math.sin(time * speed + originalIndex * 0.1) * 0.1;
      positionsArray[i + 1] =
        originalY + Math.cos(time * speed + originalIndex * 0.1) * 0.1;
      positionsArray[i + 2] =
        originalZ + Math.sin(time * speed * 0.5 + originalIndex * 0.2) * 0.05;
    }

    positionAttribute.needsUpdate = true;
  });

  if (positions.length === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
