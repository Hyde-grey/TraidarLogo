import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { useControls } from "leva";

/**
 * GSAP Scroll-Triggered Morphing Example:
 *
 * ```tsx
 * import { useEffect, useRef, useState } from 'react';
 * import { gsap } from 'gsap';
 * import { ScrollTrigger } from 'gsap/ScrollTrigger';
 *
 * gsap.registerPlugin(ScrollTrigger);
 *
 * function ScrollTriggeredLogo() {
 *   const [sphereProgress, setSphereProgress] = useState(0);
 *   const [cubeProgress, setCubeProgress] = useState(0);
 *   const progressRef = useRef({ sphere: 0, cube: 0 });
 *
 *   useEffect(() => {
 *     const tl = gsap.timeline({
 *       scrollTrigger: {
 *         trigger: ".logo-section",
 *         start: "top center",
 *         end: "bottom center",
 *         scrub: 1, // Smooth scrubbing
 *         onUpdate: (self) => {
 *           // Morph to sphere in first half of scroll
 *           if (self.progress < 0.5) {
 *             progressRef.current.sphere = self.progress * 2;
 *             progressRef.current.cube = 0;
 *           }
 *           // Morph to cube in second half
 *           else {
 *             progressRef.current.sphere = Math.max(0, 2 - self.progress * 2);
 *             progressRef.current.cube = (self.progress - 0.5) * 2;
 *           }
 *           setSphereProgress(progressRef.current.sphere);
 *           setCubeProgress(progressRef.current.cube);
 *         }
 *       }
 *     });
 *
 *     return () => tl.kill();
 *   }, []);
 *
 *   return (
 *     <div className="logo-section" style={{ height: '200vh' }}>
 *       <AdvancedLogoParticles
 *         logoUrl="/logo.png"
 *         enableMorphing={true}
 *         morphToSphereProgress={sphereProgress}
 *         morphToCubeProgress={cubeProgress}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Props for the AdvancedLogoParticles component
 */
type AdvancedLogoParticlesProps = {
  /** URL of the logo image to convert to particles */
  logoUrl: string;
  /** Number of particles to generate (default: 8000) */
  particleCount?: number;
  /** Enable morphing controls and functionality (default: true) */
  enableMorphing?: boolean;
  /** Morphing sequence progress (0-1, for external animation control) - 0: sphere, 0.4-0.6: bull (buffer), 1: logo */
  morphSequenceProgress?: number;
  /** Speed of morphing animations when using internal controls (default: 0.3) */
  morphSpeed?: number;
  /** Size of individual particles (default: 0.015) */
  particleSize?: number;
  /** How much to spread the logo in 3D space (default: 5) */
  spread?: number;
  /** Speed of wave animations (default: 0.5) */
  animationSpeed?: number;
  /** Fallback color for particles (default: "#f38439") */
  color?: string;
  /** Overall opacity of particles (default: 0.9) */
  opacity?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Alpha threshold for pixel visibility (default: 50) */
  alphaThreshold?: number;
  /** Sampling mode: "adaptive" or "uniform" (default: "adaptive") */
  densityMode?: "uniform" | "adaptive";
  /** Blending mode: "normal", "additive", or "multiply" (default: "normal") */
  blendMode?: "normal" | "additive" | "multiply";
  /** Force use of fallback color instead of image colors (default: false) */
  forceFallbackColor?: boolean;
  /** Use circular particles instead of square ones (default: true) */
  useCircularParticles?: boolean;
};

/**
 * AdvancedLogoParticles component with morphing capabilities and interactive controls.
 *
 * Features:
 * - Converts logo images to particle systems with circular or square particles
 * - State-driven morphing to sphere and cube shapes (perfect for GSAP animations)
 * - Explosion, wave, and mouse interaction effects (faces camera by default)
 * - Interactive mouse repulsion/attraction with configurable radius and strength
 * - Interactive Leva controls when not using external control
 * - Adaptive and uniform sampling modes
 * - Multiple blending modes for different visual effects
 *
 * @example
 * ```tsx
 * // Internal controls (Leva sliders)
 * <AdvancedLogoParticles
 *   logoUrl="/logo.png"
 *   enableMorphing={true}
 * />
 *
 * // External control (perfect for GSAP)
 * const [sphereProgress, setSphereProgress] = useState(0);
 * <AdvancedLogoParticles
 *   logoUrl="/logo.png"
 *   enableMorphing={true}
 *   morphToSphereProgress={sphereProgress}
 * />
 *
 * // GSAP animation example
 * gsap.to(setSphereProgress, {
 *   duration: 2,
 *   ease: "power2.inOut",
 *   onUpdate: () => setSphereProgress(gsap.getProperty(this, "progress"))
 * });
 * ```
 */
export const AdvancedLogoParticles: React.FC<AdvancedLogoParticlesProps> = ({
  logoUrl,
  particleCount = 12000,
  enableMorphing = true,
  morphSequenceProgress,
  particleSize = 0.15,
  spread = 5,
  animationSpeed = 0.5,
  color = "#f38439",
  opacity = 0.9,
  debug = false,
  alphaThreshold = 50,
  densityMode = "adaptive",
  blendMode = "additive",
  forceFallbackColor = false,
  useCircularParticles = true,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const texture = useLoader(TextureLoader, logoUrl);
  const { mouse, camera, size } = useThree();

  // Raycaster for accurate 3D mouse interactions
  const raycaster = useRef(new THREE.Raycaster());
  const mouse3D = useRef(new THREE.Vector2());
  const intersectionPlane = useRef(
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  );
  const mouseWorldPosition = useRef(new THREE.Vector3());

  // Create circular particle texture
  const circleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const size = 64; // Higher resolution for smoother circles
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Create radial gradient for smooth circle
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Full opacity center
    gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.8)"); // Slight fade
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // Transparent edges

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Internal state for morphing when external progress props aren't provided
  // Internal state for sequence progress (when no external progress provided)
  const [internalSphereProgress, setInternalSphereProgress] = useState(0);

  // State for tracking bull image loading
  const [bullImageData, setBullImageData] = useState<{
    image: HTMLImageElement;
    pixels: Array<{ x: number; y: number }>;
    canvasWidth: number;
    canvasHeight: number;
  } | null>(null);

  // Preload and process bull image
  useEffect(() => {
    const loadAndProcessBullImage = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        // Create promise for image loading
        const imageLoadPromise = new Promise<HTMLImageElement>(
          (resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () =>
              reject(new Error("Failed to load TraidarBull.PNG"));
          }
        );

        img.src = "/TraidarBull.PNG";
        const loadedImage = await imageLoadPromise;

        // Process the image to extract pixels
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get canvas context for bull image");
        }

        canvas.width = loadedImage.width;
        canvas.height = loadedImage.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(loadedImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Extract visible pixels
        const pixels: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a > alphaThreshold) {
            const pixelIndex = i / 4;
            const x = pixelIndex % canvas.width;
            const y = Math.floor(pixelIndex / canvas.width);
            pixels.push({ x, y });
          }
        }

        // Shuffle for better distribution
        for (let i = pixels.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
        }

        setBullImageData({
          image: loadedImage,
          pixels,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
        });

        if (debug) {
          console.log(
            `✅ Loaded bull image: ${loadedImage.width}x${loadedImage.height}, ${pixels.length} pixels`
          );
        }
      } catch (error) {
        console.error("❌ Failed to load bull image:", error);
        setBullImageData(null);
      }
    };

    loadAndProcessBullImage();
  }, [debug, alphaThreshold]);

  // Configure texture for better color handling
  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  // Controls for interactive tweaking - conditionally include morphing controls
  const controlsConfig = {
    explosionForce: { value: 0, min: 0, max: 5, step: 0.1 },
    waveAmplitude: { value: 0.02, min: 0, max: 0.5, step: 0.01 },
    mouseInteraction: {
      value: 2,
      min: 0,
      max: 5,
      step: 0.1,
      label: "Mouse Force",
    },
    mouseRadius: {
      value: 1.0,
      min: 0.1,
      max: 4,
      step: 0.1,
      label: "Mouse Radius",
    },
    particleScale: { value: 1.5, min: 0.1, max: 3, step: 0.1 },
    circularParticles: {
      value: useCircularParticles,
      label: "Circular Particles",
    },
    // Include morphing progress controls if enableMorphing is true
    ...(enableMorphing && {
      sequenceProgress: {
        value: internalSphereProgress, // Reuse this state for sequence progress
        min: 0,
        max: 1,
        step: 0.01,
        onChange: setInternalSphereProgress,
        label: "Sequence Progress (0=Sphere, 0.4-0.6=Bull, 1=Logo)",
      },
      // Preset buttons for quick testing
      morphPresets: {
        value: "Logo",
        options: {
          Sphere: "sphere",
          Bull: "bull",
          Logo: "logo",
          Reset: "reset",
        },
        onChange: (preset: string) => {
          switch (preset) {
            case "sphere":
              setInternalSphereProgress(0.0); // Start of sequence
              break;
            case "bull":
              setInternalSphereProgress(0.5); // Middle of buffer range
              break;
            case "logo":
              setInternalSphereProgress(1.0); // End of sequence
              break;
            case "reset":
              setInternalSphereProgress(0.0);
              break;
          }
        },
        label: "Morph Sequence",
      },
    }),
  };

  const {
    sequenceProgress: controlSequenceProgress,
    morphPresets,
    explosionForce,
    waveAmplitude,
    mouseInteraction,
    mouseRadius,
    particleScale,
    circularParticles,
  } = useControls("Advanced Logo Particles", controlsConfig);

  // Sync internal state with Leva controls when they change
  useEffect(() => {
    if (controlSequenceProgress !== undefined) {
      setInternalSphereProgress(controlSequenceProgress);
    }
  }, [controlSequenceProgress]);

  // Calculate sequence-based progress values
  const sequenceProgress =
    morphSequenceProgress ??
    (morphPresets === "logo"
      ? 1.0
      : morphPresets === "bull"
        ? 0.5
        : morphPresets === "sphere"
          ? 0.0
          : internalSphereProgress);

  // Convert sequence progress to individual morph amounts
  // 0.0: 100% sphere
  // 0.4-0.6: 100% bull (buffer range)
  // 1.0: 100% logo
  let sphereAmount, bullAmount, logoAmount;

  if (sequenceProgress < 0.4) {
    // First phase (0.0 to 0.4): sphere to bull transition
    sphereAmount = 1.0 - sequenceProgress / 0.4;
    bullAmount = sequenceProgress / 0.4;
    logoAmount = 0.0;
  } else if (sequenceProgress <= 0.6) {
    // Buffer phase (0.4 to 0.6): pure bull - stays visible longer
    sphereAmount = 0.0;
    bullAmount = 1.0;
    logoAmount = 0.0;
  } else {
    // Final phase (0.6 to 1.0): bull to logo transition
    sphereAmount = 0.0;
    bullAmount = 1.0 - (sequenceProgress - 0.6) / 0.4;
    logoAmount = (sequenceProgress - 0.6) / 0.4;
  }

  // Create particle data from logo pixels - with preloaded images
  const particleData = useMemo(() => {
    // Wait for both logo texture and bull image to be ready
    if (!bullImageData) {
      if (debug) {
        console.log("⏳ Waiting for bull image to load...");
      }
      return null; // Return null while loading
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Type guard to ensure texture is a single Texture with an image
    const textureImage = Array.isArray(texture)
      ? texture[0]?.image
      : texture.image;

    if (!ctx || !textureImage) {
      if (debug) {
        console.warn(
          "AdvancedLogoParticles: Failed to load logo texture or get canvas context"
        );
      }
      return null;
    }

    // Set canvas size and draw image
    canvas.width = textureImage.width;
    canvas.height = textureImage.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(textureImage, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Arrays for particle data
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const spherePositions = new Float32Array(particleCount * 3);
    const cubePositions = new Float32Array(particleCount * 3);
    const bullPositions = new Float32Array(particleCount * 3);

    // Use the color prop as fallback color (controllable from Leva)
    const fallbackColor = new THREE.Color(color);

    // First pass: collect all visible pixels for adaptive sampling
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
      }
    }

    // Shuffle visible pixels to break sequential patterns and ensure uniform distribution
    for (let i = visiblePixels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [visiblePixels[i], visiblePixels[j]] = [
        visiblePixels[j],
        visiblePixels[i],
      ];
    }

    // Use preloaded bull image data
    const bullVisiblePixels = bullImageData.pixels;
    const bullCanvas = {
      width: bullImageData.canvasWidth,
      height: bullImageData.canvasHeight,
    };

    if (debug) {
      console.log(
        `AdvancedLogoParticles: Processing ${textureImage.width}x${textureImage.height} image`
      );
      console.log(
        `Found ${visiblePixels.length} visible pixels out of ${
          data.length / 4
        } total pixels`
      );
      console.log(
        `Alpha threshold: ${alphaThreshold}, Force fallback: ${forceFallbackColor}`
      );
      console.log(`Fallback color: ${color}`);
      console.log(`Density mode: ${densityMode}`);
      console.log(`Morphing enabled: ${enableMorphing ? "YES" : "NO"}`);
      console.log(
        `Bull pixels available: ${bullVisiblePixels.length} (from preloaded image)`
      );
      if (enableMorphing) {
        console.log(
          `🎯 Sequence progress: ${sequenceProgress.toFixed(
            2
          )} (0=Sphere, 0.4-0.6=Bull, 1=Logo)`
        );
        console.log(`🔵 Sphere amount: ${sphereAmount.toFixed(2)}`);
        console.log(`🔶 Bull amount: ${bullAmount.toFixed(2)}`);
        console.log(`🟠 Logo amount: ${logoAmount.toFixed(2)}`);
        console.log(
          `✅ Blend sum: ${(sphereAmount + bullAmount + logoAmount).toFixed(
            2
          )} (should be 1.0)`
        );

        // Show which shape should be dominant at current progress
        const dominantShape =
          sphereAmount > bullAmount && sphereAmount > logoAmount
            ? "SPHERE"
            : bullAmount > sphereAmount && bullAmount > logoAmount
              ? "BULL"
              : logoAmount > sphereAmount && logoAmount > bullAmount
                ? "LOGO"
                : "TRANSITIONING";

        if (dominantShape === "SPHERE") {
          console.log("🔵 Currently showing: SPHERE");
        } else if (dominantShape === "BULL") {
          console.log("🔶 Currently showing: BULL (diamond pattern)");
        } else if (dominantShape === "LOGO") {
          console.log("🟠 Currently showing: LOGO");
        } else {
          console.log("🔄 Currently transitioning between shapes");
        }

        console.log(
          `Using external progress: ${
            morphSequenceProgress !== undefined ? "YES" : "NO"
          }`
        );
        if (morphPresets) {
          console.log(`Current preset: ${morphPresets}`);
        }
      }
      console.log(
        `Using circular particles: ${circularParticles ? "YES" : "NO"}`
      );
    }

    // Sample particles from visible pixels
    let particleIndex = 0;

    if (densityMode === "adaptive" && visiblePixels.length > 0) {
      // Improved uniform sampling: use stratified sampling for better distribution
      const totalPixels = visiblePixels.length;
      const samplesPerPixel = particleCount / totalPixels;

      // If we have fewer particles than pixels, use evenly spaced selection
      if (samplesPerPixel < 1) {
        const step = totalPixels / particleCount;

        for (let i = 0; i < particleCount; i++) {
          const pixelIndex = Math.floor(i * step);
          const pixel = visiblePixels[pixelIndex];

          if (!pixel) continue;

          const x = pixel.x / canvas.width;
          const y = pixel.y / canvas.height;

          // Convert to 3D coordinates (centered and scaled) - reduced randomness
          const posX = (x - 0.5) * spread;
          const posY = -(y - 0.5) * spread; // Flip Y axis
          const posZ = (Math.random() - 0.5) * 0.02; // Even less depth variation

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
          spherePositions[particleIndex * 3] =
            sphereRadius * Math.sin(phi) * Math.cos(theta);
          spherePositions[particleIndex * 3 + 1] =
            sphereRadius * Math.sin(phi) * Math.sin(theta);
          spherePositions[particleIndex * 3 + 2] = sphereRadius * Math.cos(phi);

          // Generate cube positions
          const cubeSize = spread * 0.6;
          cubePositions[particleIndex * 3] = (Math.random() - 0.5) * cubeSize;
          cubePositions[particleIndex * 3 + 1] =
            (Math.random() - 0.5) * cubeSize;
          cubePositions[particleIndex * 3 + 2] =
            (Math.random() - 0.5) * cubeSize;

          // Generate bull positions (guaranteed to have pixels from either image or fallback pattern)
          const bullPixel =
            bullVisiblePixels[particleIndex % bullVisiblePixels.length];
          const bullX = (bullPixel.x / bullCanvas.width - 0.5) * spread;
          const bullY = -(bullPixel.y / bullCanvas.height - 0.5) * spread;
          const bullZ = (Math.random() - 0.5) * 0.02;

          bullPositions[particleIndex * 3] = bullX;
          bullPositions[particleIndex * 3 + 1] = bullY;
          bullPositions[particleIndex * 3 + 2] = bullZ;

          // Store colors - use fallback if forced, otherwise use image colors
          if (forceFallbackColor) {
            colors[particleIndex * 3] = fallbackColor.r;
            colors[particleIndex * 3 + 1] = fallbackColor.g;
            colors[particleIndex * 3 + 2] = fallbackColor.b;
          } else {
            colors[particleIndex * 3] = pixel.r / 255;
            colors[particleIndex * 3 + 1] = pixel.g / 255;
            colors[particleIndex * 3 + 2] = pixel.b / 255;
          }

          particleIndex++;
        }
      } else {
        // If we have more particles than pixels, place multiple particles per pixel
        const particlesPerPixel = Math.ceil(samplesPerPixel);

        for (
          let pixelIdx = 0;
          pixelIdx < totalPixels && particleIndex < particleCount;
          pixelIdx++
        ) {
          const pixel = visiblePixels[pixelIdx];

          // Place multiple particles around this pixel position
          for (
            let p = 0;
            p < particlesPerPixel && particleIndex < particleCount;
            p++
          ) {
            const x = pixel.x / canvas.width;
            const y = pixel.y / canvas.height;

            // Add very small jitter to avoid exact overlaps
            const jitterX = (Math.random() - 0.5) * 0.001; // Tiny jitter
            const jitterY = (Math.random() - 0.5) * 0.001;

            // Convert to 3D coordinates (centered and scaled)
            const posX = (x + jitterX - 0.5) * spread;
            const posY = -(y + jitterY - 0.5) * spread; // Flip Y axis
            const posZ = (Math.random() - 0.5) * 0.02; // Minimal depth variation

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
            spherePositions[particleIndex * 3] =
              sphereRadius * Math.sin(phi) * Math.cos(theta);
            spherePositions[particleIndex * 3 + 1] =
              sphereRadius * Math.sin(phi) * Math.sin(theta);
            spherePositions[particleIndex * 3 + 2] =
              sphereRadius * Math.cos(phi);

            // Generate cube positions
            const cubeSize = spread * 0.6;
            cubePositions[particleIndex * 3] = (Math.random() - 0.5) * cubeSize;
            cubePositions[particleIndex * 3 + 1] =
              (Math.random() - 0.5) * cubeSize;
            cubePositions[particleIndex * 3 + 2] =
              (Math.random() - 0.5) * cubeSize;

            // Generate bull positions (guaranteed to have pixels from either image or fallback pattern)
            const bullPixel =
              bullVisiblePixels[particleIndex % bullVisiblePixels.length];
            const bullX = (bullPixel.x / bullCanvas.width - 0.5) * spread;
            const bullY = -(bullPixel.y / bullCanvas.height - 0.5) * spread;
            const bullZ = (Math.random() - 0.5) * 0.02;

            bullPositions[particleIndex * 3] = bullX;
            bullPositions[particleIndex * 3 + 1] = bullY;
            bullPositions[particleIndex * 3 + 2] = bullZ;

            // Store colors - use fallback if forced, otherwise use image colors
            if (forceFallbackColor) {
              colors[particleIndex * 3] = fallbackColor.r;
              colors[particleIndex * 3 + 1] = fallbackColor.g;
              colors[particleIndex * 3 + 2] = fallbackColor.b;
            } else {
              colors[particleIndex * 3] = pixel.r / 255;
              colors[particleIndex * 3 + 1] = pixel.g / 255;
              colors[particleIndex * 3 + 2] = pixel.b / 255;
            }

            particleIndex++;
          }
        }
      }
    } else {
      // Uniform sampling: old method as fallback
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
          const posZ = (Math.random() - 0.5) * 0.02; // Reduced depth variation

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
          spherePositions[particleIndex * 3] =
            sphereRadius * Math.sin(phi) * Math.cos(theta);
          spherePositions[particleIndex * 3 + 1] =
            sphereRadius * Math.sin(phi) * Math.sin(theta);
          spherePositions[particleIndex * 3 + 2] = sphereRadius * Math.cos(phi);

          // Generate cube positions
          const cubeSize = spread * 0.6;
          cubePositions[particleIndex * 3] = (Math.random() - 0.5) * cubeSize;
          cubePositions[particleIndex * 3 + 1] =
            (Math.random() - 0.5) * cubeSize;
          cubePositions[particleIndex * 3 + 2] =
            (Math.random() - 0.5) * cubeSize;

          // Generate bull positions (guaranteed to have pixels from either image or fallback pattern)
          const bullPixel =
            bullVisiblePixels[particleIndex % bullVisiblePixels.length];
          const bullX = (bullPixel.x / bullCanvas.width - 0.5) * spread;
          const bullY = -(bullPixel.y / bullCanvas.height - 0.5) * spread;
          const bullZ = (Math.random() - 0.5) * 0.02;

          bullPositions[particleIndex * 3] = bullX;
          bullPositions[particleIndex * 3 + 1] = bullY;
          bullPositions[particleIndex * 3 + 2] = bullZ;

          // Store colors - use fallback if forced, otherwise use image colors
          if (forceFallbackColor) {
            colors[particleIndex * 3] = fallbackColor.r;
            colors[particleIndex * 3 + 1] = fallbackColor.g;
            colors[particleIndex * 3 + 2] = fallbackColor.b;
          } else {
            colors[particleIndex * 3] = r / 255;
            colors[particleIndex * 3 + 1] = g / 255;
            colors[particleIndex * 3 + 2] = b / 255;
          }

          particleIndex++;
        }
      }
    }

    // Fill remaining particles with more uniform distribution if needed
    while (particleIndex < particleCount && visiblePixels.length > 0) {
      // Use round-robin approach to distribute remaining particles evenly
      const pixelIndex = particleIndex % visiblePixels.length;
      const pixel = visiblePixels[pixelIndex];

      // Minimal jitter to avoid exact overlaps
      const jitterX = (Math.random() - 0.5) * 0.002;
      const jitterY = (Math.random() - 0.5) * 0.002;

      const normalizedX = (pixel.x + jitterX) / canvas.width;
      const normalizedY = (pixel.y + jitterY) / canvas.height;

      const posX = (normalizedX - 0.5) * spread;
      const posY = -(normalizedY - 0.5) * spread;
      const posZ = (Math.random() - 0.5) * 0.02;

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
      spherePositions[particleIndex * 3] =
        sphereRadius * Math.sin(phi) * Math.cos(theta);
      spherePositions[particleIndex * 3 + 1] =
        sphereRadius * Math.sin(phi) * Math.sin(theta);
      spherePositions[particleIndex * 3 + 2] = sphereRadius * Math.cos(phi);

      // Generate cube positions
      const cubeSize = spread * 0.6;
      cubePositions[particleIndex * 3] = (Math.random() - 0.5) * cubeSize;
      cubePositions[particleIndex * 3 + 1] = (Math.random() - 0.5) * cubeSize;
      cubePositions[particleIndex * 3 + 2] = (Math.random() - 0.5) * cubeSize;

      // Generate bull positions (guaranteed to have pixels from either image or fallback pattern)
      const bullPixel =
        bullVisiblePixels[particleIndex % bullVisiblePixels.length];
      const bullX = (bullPixel.x / bullCanvas.width - 0.5) * spread;
      const bullY = -(bullPixel.y / bullCanvas.height - 0.5) * spread;
      const bullZ = (Math.random() - 0.5) * 0.02;

      bullPositions[particleIndex * 3] = bullX;
      bullPositions[particleIndex * 3 + 1] = bullY;
      bullPositions[particleIndex * 3 + 2] = bullZ;

      // Store colors - use fallback if forced, otherwise use pixel colors
      if (forceFallbackColor) {
        colors[particleIndex * 3] = fallbackColor.r;
        colors[particleIndex * 3 + 1] = fallbackColor.g;
        colors[particleIndex * 3 + 2] = fallbackColor.b;
      } else {
        colors[particleIndex * 3] = pixel.r / 255;
        colors[particleIndex * 3 + 1] = pixel.g / 255;
        colors[particleIndex * 3 + 2] = pixel.b / 255;
      }

      particleIndex++;
    }

    if (debug) {
      console.log(
        `AdvancedLogoParticles: Generated ${particleIndex} particles from ${visiblePixels.length} visible pixels`
      );
      console.log(
        `Using fallback color: ${color} (THREE.Color:`,
        fallbackColor,
        ")"
      );
    }

    return {
      positions,
      colors,
      originalPositions,
      spherePositions,
      cubePositions,
      bullPositions,
    };
  }, [
    texture,
    particleCount,
    spread,
    color,
    alphaThreshold,
    densityMode,
    forceFallbackColor,
    debug,
    bullImageData,
  ]);

  // Destructure particle data with defaults
  const {
    positions,
    colors,
    originalPositions,
    spherePositions,
    cubePositions,
    bullPositions,
  } = particleData || {
    positions: new Float32Array(0),
    colors: new Float32Array(0),
    originalPositions: new Float32Array(0),
    spherePositions: new Float32Array(0),
    cubePositions: new Float32Array(0),
    bullPositions: new Float32Array(0),
  };

  // Get the appropriate blending mode
  const getBlendingMode = () => {
    switch (blendMode) {
      case "additive":
        return THREE.AdditiveBlending;
      case "multiply":
        return THREE.MultiplyBlending;
      case "normal":
      default:
        return THREE.NormalBlending;
    }
  };

  // Animation loop
  useFrame((state) => {
    if (!pointsRef.current || positions.length === 0) return;

    const positionAttribute =
      pointsRef.current.geometry.getAttribute("position");
    const colorAttribute = pointsRef.current.geometry.getAttribute("color");

    if (!positionAttribute || !colorAttribute) return;

    const positionsArray = positionAttribute.array as Float32Array;
    const colorsArray = colorAttribute.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Update mouse position using raycaster for accurate 3D coordinates
    mouse3D.current.x = mouse.x;
    mouse3D.current.y = mouse.y;

    raycaster.current.setFromCamera(mouse3D.current, camera);

    // Find intersection with plane at z=0 (where particles are)
    const intersectionPoint = new THREE.Vector3();
    if (
      raycaster.current.ray.intersectPlane(
        intersectionPlane.current,
        intersectionPoint
      )
    ) {
      mouseWorldPosition.current.copy(intersectionPoint);
    }

    // Update particle positions and colors
    for (let i = 0; i < positionsArray.length; i += 3) {
      const particleIndex = i / 3;

      // Ensure we don't go out of bounds
      if (i + 2 >= originalPositions.length) break;

      // Get original positions
      const originalX = originalPositions[i];
      const originalY = originalPositions[i + 1];
      const originalZ = originalPositions[i + 2];

      // Get morph target positions
      const sphereX = spherePositions[i];
      const sphereY = spherePositions[i + 1];
      const sphereZ = spherePositions[i + 2];

      const bullX = bullPositions?.[i] ?? originalX;
      const bullY = bullPositions?.[i + 1] ?? originalY;
      const bullZ = bullPositions?.[i + 2] ?? originalZ;

      // Calculate target position using weighted blend of all three shapes
      let targetX, targetY, targetZ;

      // Apply morphing only if enableMorphing prop is true
      if (enableMorphing) {
        // Weighted blend between sphere, bull, and logo positions
        // The amounts should always sum to 1.0 for proper blending
        targetX =
          sphereAmount * sphereX + bullAmount * bullX + logoAmount * originalX;
        targetY =
          sphereAmount * sphereY + bullAmount * bullY + logoAmount * originalY;
        targetZ =
          sphereAmount * sphereZ + bullAmount * bullZ + logoAmount * originalZ;
      } else {
        // No morphing - use original logo positions
        targetX = originalX;
        targetY = originalY;
        targetZ = originalZ;
      }

      // Apply explosion force
      if (explosionForce > 0) {
        const distance = Math.sqrt(
          targetX * targetX + targetY * targetY + targetZ * targetZ
        );
        const normalizedX = distance > 0 ? targetX / distance : 0;
        const normalizedY = distance > 0 ? targetY / distance : 0;
        const normalizedZ = distance > 0 ? targetZ / distance : 0;

        targetX += normalizedX * explosionForce;
        targetY += normalizedY * explosionForce;
        targetZ += normalizedZ * explosionForce;
      }

      // Apply wave animation
      const waveX =
        Math.sin(time * animationSpeed + particleIndex * 0.1) * waveAmplitude;
      const waveY =
        Math.cos(time * animationSpeed + particleIndex * 0.1) * waveAmplitude;
      const waveZ =
        Math.sin(time * animationSpeed * 0.5 + particleIndex * 0.2) *
        waveAmplitude *
        0.5;

      // Apply mouse interaction force
      let mouseForceX = 0;
      let mouseForceY = 0;

      if (mouseInteraction > 0) {
        const particleWorldX = targetX + waveX;
        const particleWorldY = targetY + waveY;

        // Calculate distance from mouse to particle
        const deltaX = particleWorldX - mouseWorldPosition.current.x;
        const deltaY = particleWorldY - mouseWorldPosition.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Apply force if within radius
        if (distance < mouseRadius && distance > 0) {
          const normalizedX = deltaX / distance;
          const normalizedY = deltaY / distance;

          // Force decreases with distance (inverse falloff)
          const falloff = 1 - distance / mouseRadius;
          const force = mouseInteraction * falloff * falloff;

          // Repulsion force (push particles away from mouse)
          mouseForceX = normalizedX * force;
          mouseForceY = normalizedY * force;
        }
      }

      // Set final positions
      positionsArray[i] = targetX + waveX + mouseForceX;
      positionsArray[i + 1] = targetY + waveY + mouseForceY;
      positionsArray[i + 2] = targetZ + waveZ;

      // Colors are already set from the image data, no need to modify them
    }

    // Keep particles facing camera (no rotation)

    // Update material properties
    if (materialRef.current) {
      materialRef.current.size = particleSize * particleScale;
    }

    // Mark for update
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  });

  if (positions.length === 0) return null;

  return (
    <points ref={pointsRef} rotation={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={particleSize}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation={true}
        depthWrite={false}
        blending={getBlendingMode()}
        map={circularParticles ? circleTexture : undefined}
        alphaTest={circularParticles ? 0.001 : 0}
      />
    </points>
  );
};
