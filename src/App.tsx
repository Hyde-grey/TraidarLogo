import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  useSceneControls,
  useRenderControls,
  useParticleControls,
  useCameraControls,
} from "./hooks/useSceneControls";
import { DebugTools } from "./components/DebugTools";
import { AdvancedLogoParticles } from "./components/AdvancedLogoParticles";

import "./App.css";
import * as THREE from "three";
import { TraidarLogo } from "./Models/TraidarLogo";
import { RisingParticles } from "./Models/RisingParticles";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
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

  // Camera controls
  const cameraControls = useCameraControls();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Handle camera presets
  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const { cameraPresets } = cameraControls;

    // Define preset configurations
    const presets: Record<
      string,
      {
        position: [number, number, number];
        rotation: [number, number, number];
        fov: number;
        lookAt: [number, number, number];
      }
    > = {
      default: {
        position: [0, 0, 7] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        fov: 75,
        lookAt: [0, 0, 0] as [number, number, number],
      },
      closeup: {
        position: [0, 0, 2] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        fov: 60,
        lookAt: [0, 0, 0] as [number, number, number],
      },
      wide: {
        position: [0, 0, 10] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        fov: 90,
        lookAt: [0, 0, 0] as [number, number, number],
      },
      topdown: {
        position: [0, 8, 0] as [number, number, number],
        rotation: [-90, 0, 0] as [number, number, number],
        fov: 75,
        lookAt: [0, 0, 0] as [number, number, number],
      },
      side: {
        position: [8, 0, 0] as [number, number, number],
        rotation: [0, 90, 0] as [number, number, number],
        fov: 75,
        lookAt: [0, 0, 0] as [number, number, number],
      },
      angled: {
        position: [3, 3, 3] as [number, number, number],
        rotation: [-30, 30, 0] as [number, number, number],
        fov: 75,
        lookAt: [0, 0, 0] as [number, number, number],
      },
    };

    const preset = presets[cameraPresets];
    if (preset) {
      // Update the Leva controls to match the preset
      // Note: This would ideally update the Leva controls, but for now we'll just apply directly
      camera.position.set(...preset.position);
      camera.rotation.set(
        (preset.rotation[0] * Math.PI) / 180,
        (preset.rotation[1] * Math.PI) / 180,
        (preset.rotation[2] * Math.PI) / 180
      );
      camera.fov = preset.fov;
      camera.lookAt(...preset.lookAt);
      camera.updateProjectionMatrix();
    }
  }, [cameraControls.cameraPresets]);

  // Apply camera settings from Leva controls
  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const { cameraPosition, cameraRotation, fieldOfView, lookAtTarget } =
      cameraControls;

    camera.position.set(...cameraPosition);
    camera.rotation.set(
      (cameraRotation[0] * Math.PI) / 180,
      (cameraRotation[1] * Math.PI) / 180,
      (cameraRotation[2] * Math.PI) / 180
    );
    camera.fov = fieldOfView;
    camera.lookAt(...lookAtTarget);
    camera.updateProjectionMatrix();
  }, [
    cameraControls.cameraPosition,
    cameraControls.cameraRotation,
    cameraControls.fieldOfView,
    cameraControls.lookAtTarget,
  ]);

  // Logo particles controls
  const logoParticlesControls = useControls(
    "Logo Display",
    {
      showOriginalLogo: false,
      showParticles: true,
      showDebugTools: {
        value: false,
        label: "Show Debug Tools",
      },
      logoImage: {
        value: "/TraidarLogo.PNG",
        options: {
          TraidarLogo: "/TraidarLogo.PNG",
          // TraidarBull: "/TraidarBull.PNG",
          "Vite Logo": "/vite.svg",
          "React Logo (from assets)": "/src/assets/react.svg",
        },
      },
      particleCount: { value: 12000, min: 1000, max: 20000, step: 100 },
      particleSize: { value: 0.02, min: 0.005, max: 0.1, step: 0.005 },
      spread: { value: 5, min: 1, max: 10, step: 0.1 },
      animationSpeed: { value: 0.5, min: 0, max: 2, step: 0.1 },
      opacity: { value: 0.8, min: 0, max: 1, step: 0.1 },
      particleColor: {
        value: "#f38439",
        label: "Particle Color",
      },
    },
    { collapsed: true }
  );

  // Debug controls for LogoParticles
  const debugControls = useControls(
    "Particle Debug",
    {
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
        value: "additive",
        options: {
          "Normal (Solid Colors)": "normal",
          "Additive (Bright/Glowing)": "additive",
          "Multiply (Dark)": "multiply",
        },
      },
      useCircularParticles: {
        value: true,
        label: "Circular Particles",
      },
    },
    { collapsed: true }
  );

  return (
    <>
      {/* Debug Tools */}
      {logoParticlesControls.showDebugTools && <DebugTools />}

      {/* Camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={cameraControls.cameraPosition}
        fov={cameraControls.fieldOfView}
      />

      {/* Environment and Controls */}
      <Environment files={["/HDR/eclipse/hdr.exr"]} />
      {cameraControls.enableOrbitControls && <OrbitControls />}

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

      {logoParticlesControls.showParticles && (
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
          useCircularParticles={debugControls.useCircularParticles}
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
    </>
  );
}

function App() {
  const { toneMappingExposure } = useRenderControls();

  return (
    <Canvas
      shadows
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
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
