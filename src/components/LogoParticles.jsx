import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

export const LogoParticles = ({
  logoUrl,
  particleCount = 5000,
  size = 0.02,
  spread = 4,
  speed = 0.5,
  color = '#ffffff',
  opacity = 0.8
}) => {
  const pointsRef = useRef();
  const texture = useLoader(TextureLoader, logoUrl);
  
  // Create particle positions and colors based on logo pixels
  const { positions, colors, originalPositions } = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx || !texture.image) return { 
      positions: new Float32Array(), 
      colors: new Float32Array(), 
      originalPositions: new Float32Array() 
    };
    
    // Set canvas size
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    
    // Draw image to canvas
    ctx.drawImage(texture.image, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Sample pixels to create particles
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    
    let particleIndex = 0;
    const samplingRate = Math.floor(data.length / 4 / particleCount);
    
    for (let i = 0; i < data.length && particleIndex < particleCount; i += samplingRate * 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Only create particles for visible pixels
      if (a > 50) {
        const pixelIndex = i / 4;
        const x = (pixelIndex % canvas.width) / canvas.width;
        const y = (Math.floor(pixelIndex / canvas.width)) / canvas.height;
        
        // Convert to 3D coordinates (centered and scaled)
        const posX = (x - 0.5) * spread;
        const posY = -(y - 0.5) * spread; // Flip Y axis
        const posZ = (Math.random() - 0.5) * 0.2; // Add slight depth variation
        
        // Store original and current positions
        originalPositions[particleIndex * 3] = posX;
        originalPositions[particleIndex * 3 + 1] = posY;
        originalPositions[particleIndex * 3 + 2] = posZ;
        
        positions[particleIndex * 3] = posX;
        positions[particleIndex * 3 + 1] = posY;
        positions[particleIndex * 3 + 2] = posZ;
        
        // Store colors
        colors[particleIndex * 3] = r / 255;
        colors[particleIndex * 3 + 1] = g / 255;
        colors[particleIndex * 3 + 2] = b / 255;
        
        particleIndex++;
      }
    }
    
    return { positions, colors, originalPositions };
  }, [texture, particleCount, spread]);
  
  // Animation
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;
    
    // Animate particles with floating motion
    for (let i = 0; i < positions.length; i += 3) {
      const originalIndex = i / 3;
      const originalX = originalPositions[i];
      const originalY = originalPositions[i + 1];
      const originalZ = originalPositions[i + 2];
      
      // Add floating motion
      positions[i] = originalX + Math.sin(time * speed + originalIndex * 0.1) * 0.1;
      positions[i + 1] = originalY + Math.cos(time * speed + originalIndex * 0.1) * 0.1;
      positions[i + 2] = originalZ + Math.sin(time * speed * 0.5 + originalIndex * 0.2) * 0.05;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  if (positions.length === 0) return null;
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
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