import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useSceneControls, useRenderControls } from "./hooks/useSceneControls";
import { DebugTools } from "./components/DebugTools";

import "./App.css";
import * as THREE from "three";
import { TraidarLogo } from "./Models/TraidarLogo";
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

      {/* 3D Objects */}
      <TraidarLogo position={logoPosition} scale={logoScale} />

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
