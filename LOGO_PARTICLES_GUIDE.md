# Logo to Particles Guide - React Three Fiber

## Overview

This guide shows you how to correctly convert your logo into particles using React Three Fiber while maintaining the logo's shape. The implementation uses pixel sampling to create particles that form the exact shape of your logo.

## Key Components

### 1. Basic Logo Particles (`LogoParticles.jsx`)

A simple implementation that:
- Samples pixels from an image to create particles
- Maintains the original logo shape
- Adds subtle floating animations
- Preserves original colors from the logo

### 2. Advanced Logo Particles (`AdvancedLogoParticles.jsx`)

An enhanced version with:
- Shape morphing (logo → sphere → cube)
- Interactive controls via Leva
- Explosion effects
- Breathing animations
- Color intensity controls
- Rotation capabilities

## How It Works

### 1. Pixel Sampling Process

```javascript
// Load the logo image as a texture
const texture = useLoader(TextureLoader, logoUrl);

// Create a canvas to analyze pixel data
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Draw the image and get pixel data
ctx.drawImage(texture.image, 0, 0);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data; // RGBA values for each pixel
```

### 2. Particle Position Generation

```javascript
// For each visible pixel (alpha > 50):
const x = (pixelIndex % canvas.width) / canvas.width;
const y = (Math.floor(pixelIndex / canvas.width)) / canvas.height;

// Convert to 3D coordinates (centered and scaled)
const posX = (x - 0.5) * spread;
const posY = -(y - 0.5) * spread; // Flip Y axis for correct orientation
const posZ = (Math.random() - 0.5) * 0.2; // Add depth variation
```

### 3. Shape Preservation

The key to maintaining the logo's shape is:
- Only creating particles for visible pixels (alpha > threshold)
- Maintaining the spatial relationship between pixels
- Using UV coordinates to map 2D pixels to 3D space

## Usage Examples

### Basic Usage

```jsx
import { LogoParticles } from './components/LogoParticles';

function Scene() {
  return (
    <LogoParticles
      logoUrl="/path/to/your/logo.png"
      particleCount={5000}
      size={0.02}
      spread={4}
      speed={0.5}
      opacity={0.8}
    />
  );
}
```

### Advanced Usage with Controls

```jsx
import { AdvancedLogoParticles } from './components/AdvancedLogoParticles';

function Scene() {
  return (
    <AdvancedLogoParticles
      logoUrl="/path/to/your/logo.png"
      particleCount={8000}
      particleSize={0.015}
      spread={3}
      animationSpeed={0.5}
      enableMorphing={true}
      morphSpeed={0.3}
    />
  );
}
```

## Best Practices

### 1. Logo Image Preparation

- **Format**: Use PNG with transparency for best results
- **Size**: 512x512 or 1024x1024 pixels recommended
- **Contrast**: High contrast logos work better
- **Alpha Channel**: Clean alpha channel for precise particle placement

### 2. Performance Optimization

```javascript
// Optimize particle count based on image complexity
const optimalParticleCount = Math.min(
  10000, // Maximum particles
  Math.floor(visiblePixels * 0.5) // 50% of visible pixels
);

// Use efficient sampling
const samplingRate = Math.max(1, Math.floor(data.length / 4 / particleCount));
```

### 3. Animation Tips

- **Subtle Motion**: Keep wave amplitudes small (0.1-0.3)
- **Varied Timing**: Use particle index for unique timing per particle
- **Smooth Transitions**: Use THREE.MathUtils.lerp for morphing

## Advanced Features

### Shape Morphing

```javascript
// Morph between logo and sphere
if (morphToSphere) {
  const morphFactor = Math.min(1, morphSpeed * 2);
  targetX = THREE.MathUtils.lerp(targetX, sphereX, morphFactor);
  targetY = THREE.MathUtils.lerp(targetY, sphereY, morphFactor);
  targetZ = THREE.MathUtils.lerp(targetZ, sphereZ, morphFactor);
}
```

### Interactive Controls

The advanced version includes Leva controls for:
- **Morphing**: Switch between logo, sphere, and cube shapes
- **Explosion**: Radial particle displacement
- **Breathing**: Rhythmic scaling effect
- **Color Intensity**: Enhance or dim particle colors
- **Animation Speed**: Control wave motion speed

## Troubleshooting

### Common Issues

1. **Particles not appearing**: Check image alpha channel and threshold
2. **Wrong orientation**: Ensure Y-axis is flipped for correct display
3. **Performance issues**: Reduce particle count or optimize sampling rate
4. **Blurry particles**: Adjust particle size and sizeAttenuation

### Performance Optimization

```javascript
// For large logos, use instanced rendering
const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({
  size: 0.02,
  transparent: true,
  alphaTest: 0.5, // Helps with performance
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
```

## Integration with Existing Project

The components integrate with your existing React Three Fiber setup:

```jsx
// In your App.tsx or main scene component
const logoParticlesControls = useControls("Logo Display", {
  showOriginalLogo: true,
  showBasicParticles: false,
  showAdvancedParticles: false,
  logoImage: { 
    value: "/react.svg",
    options: ["/react.svg", "/vite.svg", "/your-logo.png"]
  },
  particleCount: { value: 5000, min: 1000, max: 20000, step: 100 },
  particleSize: { value: 0.02, min: 0.005, max: 0.1, step: 0.005 },
  spread: { value: 3, min: 1, max: 10, step: 0.1 },
  animationSpeed: { value: 0.5, min: 0, max: 2, step: 0.1 },
  opacity: { value: 0.8, min: 0, max: 1, step: 0.1 }
});
```

## Next Steps

1. **Test with your logo**: Replace the sample images with your actual logo
2. **Adjust parameters**: Tweak particle count, size, and spread for your specific logo
3. **Add custom animations**: Extend the animation system for unique effects
4. **Optimize performance**: Profile and optimize for your target devices

## Additional Resources

- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Points Documentation](https://threejs.org/docs/#api/en/objects/Points)
- [Particle System Techniques](https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/)

This implementation provides a solid foundation for turning any logo into beautiful, animated particles while maintaining the recognizable shape of your brand.