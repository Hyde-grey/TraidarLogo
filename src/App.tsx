import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import {
  useSceneControls,
  useRenderControls,
  useParticleControls,
} from "./hooks/useSceneControls";
import { DebugTools } from "./components/DebugTools";
import { LogoParticles } from "./components/LogoParticles";
import { AdvancedLogoParticles } from "./components/AdvancedLogoParticles";

import "./App.css";
import * as THREE from "three";
import { TraidarLogo } from "./Models/TraidarLogo";
import { RisingParticles } from "./Models/RisingParticles";
import { useControls } from "leva";
// import AsphaltPlane from "./Models/AsphaltPlane";

function Scene() {
  // Use our custom hooks for controls
  const {
    lightPosition,
    lightIntensity,
    ambientIntensity,
    logoPosition,
    logoScale,
    backgroundColor,
  } = useSceneControls();

  const particleControls = useParticleControls();

  // Logo particles controls
  const logoParticlesControls = useControls("Logo Display", {
    showOriginalLogo: true,
    showBasicParticles: false,
    showAdvancedParticles: false,
    logoImage: {
      value: "/TraidarLogo.PNG",
      options: {
        TraidarLogo: "/TraidarLogo.PNG",
        "Vite Logo": "/vite.svg",
        "React Logo (from assets)": "/src/assets/react.svg",
      },
    },
    particleCount: { value: 5000, min: 1000, max: 20000, step: 100 },
    particleSize: { value: 0.02, min: 0.005, max: 0.1, step: 0.005 },
    spread: { value: 3, min: 1, max: 10, step: 0.1 },
    animationSpeed: { value: 0.5, min: 0, max: 2, step: 0.1 },
    opacity: { value: 0.8, min: 0, max: 1, step: 0.1 },
    particleColor: {
      value: "#f38439",
      label: "Particle Color",
    },
  });

  // Debug controls for LogoParticles
  const debugControls = useControls("Particle Debug", {
    enableDebug: false,
    forceFallbackColor: true, // Enable by default to test orange color
    alphaThreshold: { value: 50, min: 0, max: 255, step: 1 },
    densityMode: {
      value: "adaptive",
      options: {
        "Adaptive (Better)": "adaptive",
        "Uniform (Fallback)": "uniform",
      },
    },
    blendMode: {
      value: "normal",
      options: {
        "Normal (Solid Colors)": "normal",
        "Additive (Bright/Glowing)": "additive",
        "Multiply (Dark)": "multiply",
      },
    },
  });

  return (
    <>
      {/* Debug Tools */}
      <DebugTools />

      {/* Environment and Controls */}
      <Environment files={["/HDR/eclipse/hdr.exr"]} />
      <OrbitControls />

      {/* Dark gradient background that matches your website */}
      <color attach="background" args={[backgroundColor]} />

      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={lightPosition}
        intensity={lightIntensity}
        castShadow
      />

      {/* Logo Display Options */}
      {logoParticlesControls.showOriginalLogo && (
        <TraidarLogo position={logoPosition} scale={logoScale} />
      )}

      {logoParticlesControls.showBasicParticles && (
        <LogoParticles
          logoUrl={logoParticlesControls.logoImage}
          particleCount={logoParticlesControls.particleCount}
          size={logoParticlesControls.particleSize}
          spread={logoParticlesControls.spread}
          speed={logoParticlesControls.animationSpeed}
          opacity={logoParticlesControls.opacity}
          color={logoParticlesControls.particleColor}
          debug={debugControls.enableDebug}
          forceFallbackColor={debugControls.forceFallbackColor}
          alphaThreshold={debugControls.alphaThreshold}
          densityMode={debugControls.densityMode as "uniform" | "adaptive"}
          blendMode={
            debugControls.blendMode as "normal" | "additive" | "multiply"
          }
        />
      )}

      {logoParticlesControls.showAdvancedParticles && (
        <AdvancedLogoParticles
          logoUrl={logoParticlesControls.logoImage}
          particleCount={logoParticlesControls.particleCount}
          particleSize={logoParticlesControls.particleSize}
          spread={logoParticlesControls.spread}
          animationSpeed={logoParticlesControls.animationSpeed}
          opacity={logoParticlesControls.opacity}
          color={logoParticlesControls.particleColor}
          debug={debugControls.enableDebug}
          forceFallbackColor={debugControls.forceFallbackColor}
          alphaThreshold={debugControls.alphaThreshold}
          densityMode={debugControls.densityMode as "uniform" | "adaptive"}
          blendMode={
            debugControls.blendMode as "normal" | "additive" | "multiply"
          }
        />
      )}

      {/* Atmospheric Effects */}
      <RisingParticles
        count={particleControls.count}
        area={particleControls.area}
        height={particleControls.height}
        speed={particleControls.speed}
        size={particleControls.size}
        opacity={particleControls.opacity}
        color={particleControls.color}
        bottomDensity={particleControls.bottomDensity}
        velocityGradient={particleControls.velocityGradient}
        sizeGradient={particleControls.sizeGradient}
        opacityGradient={particleControls.opacityGradient}
        pulseSpeed={particleControls.pulseSpeed}
        pulseIntensity={particleControls.pulseIntensity}
        driftIntensity={particleControls.driftIntensity}
      />

      {/* <AsphaltPlane scale={10} position={[0, 0, -5]} rotation={[0, 0, 0]} />
      <AsphaltPlane
        scale={10}
        position={[0, -5, 0]}
        rotation={[-Math.PI * 0.5, 0, 0]}
      /> */}
    </>
  );
}

function App() {
  const { toneMappingExposure } = useRenderControls();

  return (
    <Canvas
      shadows
      gl={{
        toneMapping: THREE.ReinhardToneMapping,
        toneMappingExposure,
        antialias: true,
        alpha: true,
      }}
    >
      <Scene />
    </Canvas>
  );
}

export default App;
