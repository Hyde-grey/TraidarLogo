import { useControls } from "leva";

/**
 * Custom hook for scene controls using Leva
 * Provides interactive controls for lighting, logo positioning, and scene parameters
 */
export function useSceneControls() {
  const sceneControls = useControls(
    "Scene",
    {
      // Lighting Controls
      lightPosition: { value: [1, 3, 2], step: 0.1 },
      lightIntensity: { value: 6, min: 0, max: 20, step: 0.1 },
      ambientIntensity: { value: 1, min: 0, max: 5, step: 0.1 },

      // Logo Controls
      logoPosition: { value: [0, 0, 0], step: 0.1 },
      logoScale: { value: 0.5, min: 0.1, max: 1.0, step: 0.01 },
      backgroundColor: { value: "#0a0a0a", label: "Background Color" },
    },
    { collapsed: true }
  );

  return sceneControls;
}

/**
 * Custom hook for glass material controls
 * Provides interactive controls for glass material properties
 */
export function useGlassControls() {
  const glassControls = useControls(
    "Glass Material",
    {
      transmission: { value: 1.0, min: 0, max: 1, step: 0.01 },
      thickness: { value: 0.5, min: 0, max: 2, step: 0.01 },
      roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
      ior: { value: 1.5, min: 1, max: 2.5, step: 0.01 },
      clearcoat: { value: 1.0, min: 0, max: 1, step: 0.01 },
      clearcoatRoughness: { value: 0.0, min: 0, max: 1, step: 0.01 },
    },
    { collapsed: true }
  );

  return glassControls;
}

/**
 * Custom hook for rising particles controls
 * Provides controls for the atmospheric rising particles with bottom-dense distribution
 */
export function useParticleControls() {
  const particleControls = useControls(
    "Rising Particles",
    {
      // Basic Properties
      count: { value: 200, min: 50, max: 3000, step: 10 },
      area: { value: 20, min: 10, max: 40, step: 1 },
      height: { value: 15, min: 5, max: 25, step: 1 },
      speed: { value: 0.5, min: 0.1, max: 2.0, step: 0.1 },
      size: { value: 0.66, min: 0.005, max: 0.9, step: 0.01 },
      opacity: { value: 0.6, min: 0.1, max: 1.0, step: 0.05 },
      color: { value: "#ffa989" },

      // Bottom-Dense Distribution Controls
      bottomDensity: {
        value: 3.0,
        min: 1.0,
        max: 5.0,
        step: 0.1,
        label: "Bottom Density Bias",
      },
      velocityGradient: {
        value: 0.7,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        label: "Velocity Gradient",
      },
      sizeGradient: {
        value: 0.7,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        label: "Size Gradient",
      },
      opacityGradient: {
        value: 0.6,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        label: "Opacity Gradient",
      },

      // Animation Controls
      pulseSpeed: {
        value: 1.5,
        min: 0.5,
        max: 3.0,
        step: 0.1,
        label: "Pulse Speed",
      },
      pulseIntensity: {
        value: 0.2,
        min: 0.0,
        max: 0.5,
        step: 0.05,
        label: "Pulse Intensity",
      },
      driftIntensity: {
        value: 0.002,
        min: 0.0,
        max: 0.01,
        step: 0.001,
        label: "Drift Intensity",
      },
    },
    { collapsed: true }
  );

  return particleControls;
}

/**
 * Custom hook for mouse interactivity controls
 * Controls how the logo responds to mouse movement
 */
export function useMouseControls() {
  const mouseControls = useControls(
    "Mouse Interactivity",
    {
      enabled: { value: true },
      sensitivity: { value: 0.3, min: 0.1, max: 1.0, step: 0.05 },
      smoothing: { value: 0.1, min: 0.01, max: 0.3, step: 0.01 },
      maxRotation: { value: 0.2, min: 0.1, max: 0.5, step: 0.05 },
      maxPosition: { value: 0.5, min: 0.1, max: 2.0, step: 0.1 },
    },
    { collapsed: true }
  );

  return mouseControls;
}

/**
 * Custom hook for camera controls
 * Provides interactive controls for camera position, rotation, and field of view
 */
export function useCameraControls() {
  const cameraControls = useControls(
    "Camera",
    {
      // Camera Position
      cameraPosition: {
        value: [0, 0, 7],
        step: 0.1,
        label: "Position [X, Y, Z]",
      },

      // Camera Rotation (in degrees for easier control)
      cameraRotation: {
        value: [0, 0, 0],
        step: 1,
        label: "Rotation [X°, Y°, Z°]",
      },

      // Field of View
      fieldOfView: {
        value: 75,
        min: 10,
        max: 120,
        step: 1,
        label: "FOV",
      },

      // Camera lookAt target
      lookAtTarget: {
        value: [0, 0, 0],
        step: 0.1,
        label: "Look At [X, Y, Z]",
      },

      // Quick presets
      cameraPresets: {
        value: "Default",
        options: {
          Default: "default",
          "Close Up": "closeup",
          "Wide View": "wide",
          "Top Down": "topdown",
          "Side View": "side",
          Angled: "angled",
        },
        label: "Camera Presets",
      },

      // Enable/disable OrbitControls
      enableOrbitControls: {
        value: false,
        label: "Enable Orbit Controls",
      },
    },
    { collapsed: true }
  );

  return cameraControls;
}

/**
 * Custom hook for global rendering controls
 * Provides controls for tone mapping and other global canvas settings
 */
export function useRenderControls() {
  const renderControls = useControls(
    "Rendering",
    {
      toneMappingExposure: { value: 1, min: 0.1, max: 3, step: 0.1 },
    },
    { collapsed: true }
  );

  return renderControls;
}
