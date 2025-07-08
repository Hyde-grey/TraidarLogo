import { useControls } from "leva";

/**
 * Custom hook for scene controls using Leva
 * Provides interactive controls for lighting, logo positioning, and scene parameters
 */
export function useSceneControls() {
  const sceneControls = useControls("Scene", {
    // Lighting Controls
    lightPosition: { value: [1, 3, 2], step: 0.1 },
    lightIntensity: { value: 6, min: 0, max: 20, step: 0.1 },
    ambientIntensity: { value: 1, min: 0, max: 5, step: 0.1 },

    // Logo Controls
    logoPosition: { value: [0, 0, 0], step: 0.1 },
    logoScale: { value: 0.5, min: 0.1, max: 1.0, step: 0.01 },
    backgroundColor: { value: "#0a0a0a", label: "Background Color" },
  });

  return sceneControls;
}

/**
 * Custom hook for glass material controls
 * Provides interactive controls for glass material properties
 */
export function useGlassControls() {
  const glassControls = useControls("Glass Material", {
    transmission: { value: 1.0, min: 0, max: 1, step: 0.01 },
    thickness: { value: 0.5, min: 0, max: 2, step: 0.01 },
    roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 2.5, step: 0.01 },
    clearcoat: { value: 1.0, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0.0, min: 0, max: 1, step: 0.01 },
  });

  return glassControls;
}

/**
 * Custom hook for global rendering controls
 * Provides controls for tone mapping and other global canvas settings
 */
export function useRenderControls() {
  const renderControls = useControls("Rendering", {
    toneMappingExposure: { value: 1, min: 0.1, max: 3, step: 0.1 },
  });

  return renderControls;
}
