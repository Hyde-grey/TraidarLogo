import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { useControls } from 'leva';

export const AdvancedLogoParticles = ({
  logoUrl,
  particleCount = 8000,
  enableMorphing = true,
  morphSpeed = 0.3,
  particleSize = 0.015,
  spread = 3,
  animationSpeed = 0.5,
  color = '#ffffff',
  opacity = 0.9
}) => {
  const pointsRef = useRef();
  const materialRef = useRef();
  const texture = useLoader(TextureLoader, logoUrl);
  
  // Controls for interactive tweaking
  const {
    morphToSphere,
    morphToCube,
    explosionForce,
    rotationSpeed,
    breathingEffect,
    colorIntensity,
    waveAmplitude,
    particleOpacity,
    particleScale
  } = useControls('Logo Particles', {
    morphToSphere: false,
    morphToCube: false,
    explosionForce: { value: 0, min: 0, max: 5, step: 0.1 },
    rotationSpeed: { value: 0.2, min: 0, max: 2, step: 0.1 },
    breathingEffect: { value: 0.5, min: 0, max: 2, step: 0.1 },
    colorIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
    waveAmplitude: { value: 0.3, min: 0, max: 1, step: 0.1 },
    particleOpacity: { value: 0.8, min: 0, max: 1, step: 0.1 },
    particleScale: { value: 1, min: 0.1, max: 3, step: 0.1 }
  });

  // Create particle data from logo pixels
  const { positions, colors, originalPositions, spherePositions, cubePositions } = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx || !texture.image) return { 
      positions: new Float32Array(), 
      colors: new Float32Array(), 
      originalPositions: new Float32Array(),
      spherePositions: new Float32Array(),
      cubePositions: new Float32Array()
    };
    
    // Set canvas size and draw image
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    ctx.drawImage(texture.image, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Arrays for particle data
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const spherePositions = new Float32Array(particleCount * 3);
    const cubePositions = new Float32Array(particleCount * 3);
    
    let particleIndex = 0;
    const samplingRate = Math.max(1, Math.floor(data.length / 4 / particleCount));
    
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
        const posZ = (Math.random() - 0.5) * 0.5; // Add depth variation
        
        // Store original logo positions
        originalPositions[particleIndex * 3] = posX;
        originalPositions[particleIndex * 3 + 1] = posY;
        originalPositions[particleIndex * 3 + 2] = posZ;
        
        // Current positions (start with original)
        positions[particleIndex * 3] = posX;
        positions[particleIndex * 3 + 1] = posY;
        positions[particleIndex * 3 + 2] = posZ;
        
        // Generate sphere positions
        const sphereRadius = spread * 0.8;
        const phi = Math.acos(1 - 2 * Math.random());
        const theta = Math.random() * Math.PI * 2;
        spherePositions[particleIndex * 3] = sphereRadius * Math.sin(phi) * Math.cos(theta);
        spherePositions[particleIndex * 3 + 1] = sphereRadius * Math.sin(phi) * Math.sin(theta);
        spherePositions[particleIndex * 3 + 2] = sphereRadius * Math.cos(phi);
        
        // Generate cube positions
        const cubeSize = spread * 0.6;
        cubePositions[particleIndex * 3] = (Math.random() - 0.5) * cubeSize;
        cubePositions[particleIndex * 3 + 1] = (Math.random() - 0.5) * cubeSize;
        cubePositions[particleIndex * 3 + 2] = (Math.random() - 0.5) * cubeSize;
        
        // Store colors with intensity
        colors[particleIndex * 3] = r / 255;
        colors[particleIndex * 3 + 1] = g / 255;
        colors[particleIndex * 3 + 2] = b / 255;
        
        particleIndex++;
      }
    }
    
    return { positions, colors, originalPositions, spherePositions, cubePositions };
  }, [texture, particleCount, spread]);

  // Animation loop
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array;
    const colors = pointsRef.current.geometry.attributes.color.array;
    const time = state.clock.elapsedTime;
    
    // Update particle positions and colors
    for (let i = 0; i < positions.length; i += 3) {
      const particleIndex = i / 3;
      
      // Get original positions
      const originalX = originalPositions[i];
      const originalY = originalPositions[i + 1];
      const originalZ = originalPositions[i + 2];
      
      // Get morph target positions
      const sphereX = spherePositions[i];
      const sphereY = spherePositions[i + 1];
      const sphereZ = spherePositions[i + 2];
      
      const cubeX = cubePositions[i];
      const cubeY = cubePositions[i + 1];
      const cubeZ = cubePositions[i + 2];
      
      // Calculate base position (original logo shape)
      let targetX = originalX;
      let targetY = originalY;
      let targetZ = originalZ;
      
      // Apply morphing
      if (morphToSphere) {
        const morphFactor = Math.min(1, morphSpeed * 2);
        targetX = THREE.MathUtils.lerp(targetX, sphereX, morphFactor);
        targetY = THREE.MathUtils.lerp(targetY, sphereY, morphFactor);
        targetZ = THREE.MathUtils.lerp(targetZ, sphereZ, morphFactor);
      }
      
      if (morphToCube) {
        const morphFactor = Math.min(1, morphSpeed * 2);
        targetX = THREE.MathUtils.lerp(targetX, cubeX, morphFactor);
        targetY = THREE.MathUtils.lerp(targetY, cubeY, morphFactor);
        targetZ = THREE.MathUtils.lerp(targetZ, cubeZ, morphFactor);
      }
      
      // Apply explosion force
      if (explosionForce > 0) {
        const distance = Math.sqrt(targetX * targetX + targetY * targetY + targetZ * targetZ);
        const normalizedX = distance > 0 ? targetX / distance : 0;
        const normalizedY = distance > 0 ? targetY / distance : 0;
        const normalizedZ = distance > 0 ? targetZ / distance : 0;
        
        targetX += normalizedX * explosionForce;
        targetY += normalizedY * explosionForce;
        targetZ += normalizedZ * explosionForce;
      }
      
      // Apply wave animation
      const waveX = Math.sin(time * animationSpeed + particleIndex * 0.1) * waveAmplitude;
      const waveY = Math.cos(time * animationSpeed + particleIndex * 0.1) * waveAmplitude;
      const waveZ = Math.sin(time * animationSpeed * 0.5 + particleIndex * 0.2) * waveAmplitude * 0.5;
      
      // Apply breathing effect
      const breathingScale = 1 + Math.sin(time * breathingEffect) * 0.1;
      
      // Set final positions
      positions[i] = (targetX + waveX) * breathingScale;
      positions[i + 1] = (targetY + waveY) * breathingScale;
      positions[i + 2] = (targetZ + waveZ) * breathingScale;
      
      // Update colors with intensity
      const originalR = colors[i];
      const originalG = colors[i + 1];
      const originalB = colors[i + 2];
      
      colors[i] = originalR * colorIntensity;
      colors[i + 1] = originalG * colorIntensity;
      colors[i + 2] = originalB * colorIntensity;
    }
    
    // Rotate the entire system
    if (rotationSpeed > 0) {
      pointsRef.current.rotation.y = time * rotationSpeed;
      pointsRef.current.rotation.x = Math.sin(time * rotationSpeed * 0.3) * 0.1;
    }
    
    // Update material properties
    if (materialRef.current) {
      materialRef.current.opacity = particleOpacity;
      materialRef.current.size = particleSize * particleScale;
    }
    
    // Mark for update
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
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
        ref={materialRef}
        size={particleSize}
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