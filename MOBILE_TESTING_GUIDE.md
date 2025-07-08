# Mobile Testing Guide - Logo Particles

## 📱 Testing Your Logo Particles on Mobile

Here are several methods to test your logo particles implementation on your phone:

## Method 1: Local Network Access (Recommended)

### Step 1: Start the Development Server
The development server is now running with network access enabled:
```bash
npx vite --host 0.0.0.0 --port 5173
```

### Step 2: Find Your Computer's IP Address

**On Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network connection (usually starts with 192.168.x.x or 10.x.x.x)

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Linux:**
```bash
hostname -I
```

### Step 3: Access from Phone
1. **Connect your phone to the same WiFi network** as your computer
2. **Open your phone's browser** (Chrome, Safari, etc.)
3. **Enter the URL**: `http://YOUR_IP_ADDRESS:5173`
   - Example: `http://192.168.1.100:5173`

## Method 2: Using Development Tools

### Option A: Ngrok (Tunneling)
```bash
# Install ngrok
npm install -g ngrok

# In a new terminal, expose your local server
ngrok http 5173
```
- Ngrok will provide a public URL like `https://abc123.ngrok.io`
- Use this URL on your phone

### Option B: Vite Network URL
When you start the dev server, look for output like:
```
Local:   http://localhost:5173/
Network: http://192.168.1.100:5173/
```
Use the "Network" URL on your phone.

## Method 3: USB Debugging (Android)

### For Android Development:
1. **Enable Developer Options** on your Android device
2. **Enable USB Debugging**
3. **Connect via USB**
4. **Port Forward**: `adb forward tcp:5173 tcp:5173`
5. **Access**: `http://localhost:5173` on your phone

## Method 4: Browser Dev Tools Mobile Simulation

### Chrome DevTools:
1. **Open Chrome** on your computer
2. **Go to**: `http://localhost:5173`
3. **Press F12** to open DevTools
4. **Click the mobile icon** (phone/tablet icon)
5. **Select device**: iPhone, Android, etc.
6. **Test responsiveness** and touch interactions

## 🎮 Interactive Testing Controls

Once you access the app on your phone, you can:

### Basic Controls:
- **Toggle between logo types**: Original 3D logo, Basic particles, Advanced particles
- **Adjust particle count**: Swipe to change density
- **Modify size and spread**: Scale and positioning
- **Animation speed**: Control movement speed

### Advanced Controls (Advanced Particles):
- **Shape Morphing**: 
  - Toggle "morphToSphere" to transform logo into sphere
  - Toggle "morphToCube" to transform into cube
- **Explosion Effect**: Slide "explosionForce" to disperse particles
- **Breathing Effect**: Adjust rhythmic scaling
- **Color Intensity**: Enhance or dim particle brightness
- **Rotation Speed**: Control continuous rotation

## 📱 Mobile-Specific Features to Test

### Touch Interactions:
- **Pinch to zoom**: Test camera controls
- **Swipe to rotate**: OrbitControls should work on mobile
- **Tap controls**: Leva controls should be touch-friendly

### Performance Testing:
- **Frame rate**: Check if particles render smoothly
- **Battery usage**: Monitor device temperature
- **Memory usage**: Test with different particle counts

### Responsive Design:
- **Portrait/Landscape**: Test both orientations
- **Different screen sizes**: Various mobile devices
- **Touch precision**: Control panel usability

## 🔧 Troubleshooting Mobile Issues

### Common Problems:

**1. Can't access the URL:**
- Ensure both devices are on the same WiFi network
- Check your computer's firewall settings
- Try a different IP address format

**2. Poor performance:**
- Reduce particle count (start with 1000-2000)
- Lower particle size
- Disable advanced effects temporarily

**3. Controls not working:**
- Ensure touch events are properly handled
- Check if Leva controls are mobile-friendly
- Try landscape orientation

**4. Particles not visible:**
- Check if WebGL is supported on your mobile browser
- Try a different browser (Chrome, Firefox, Safari)
- Ensure hardware acceleration is enabled

## 🚀 Optimization for Mobile

### Performance Tips:
```javascript
// Reduce particle count for mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const particleCount = isMobile ? 3000 : 8000;

// Adjust quality settings
const particleSize = isMobile ? 0.03 : 0.02;
const animationSpeed = isMobile ? 0.3 : 0.5;
```

### Battery Optimization:
- **Reduce animation complexity** on mobile
- **Lower frame rate** if needed
- **Pause animations** when tab is not active

## 📊 Testing Checklist

### ✅ Functionality Tests:
- [ ] Logo particles render correctly
- [ ] Shape morphing works smoothly
- [ ] Explosion effects respond to controls
- [ ] Color changes apply properly
- [ ] Rotation and breathing effects work

### ✅ Performance Tests:
- [ ] Maintains 30+ FPS on mobile
- [ ] No overheating after 5 minutes
- [ ] Smooth touch interactions
- [ ] Quick load times

### ✅ Visual Tests:
- [ ] Particles maintain logo shape
- [ ] Colors match original logo
- [ ] Animations look smooth
- [ ] No visual artifacts or glitches

### ✅ Usability Tests:
- [ ] Controls are easy to use on touch
- [ ] Text is readable on mobile
- [ ] Gestures work intuitively
- [ ] Orientation changes handled well

## 🔍 Debug Mode

To debug issues on mobile:

1. **Enable mobile debugging**:
```javascript
// Add to your code temporarily
if (window.location.search.includes('debug=true')) {
  console.log('Particle count:', particleCount);
  console.log('Device info:', navigator.userAgent);
  console.log('WebGL support:', !!window.WebGLRenderingContext);
}
```

2. **Access debug mode**: Add `?debug=true` to your URL

3. **View console logs**: Use browser dev tools or remote debugging

## 📱 Device-Specific Notes

### iOS Safari:
- May require user gesture for WebGL context
- Check for requestAnimationFrame optimization
- Test with Low Power Mode

### Android Chrome:
- Hardware acceleration should be enabled
- Test with different Android versions
- Check WebGL2 support

### General Mobile:
- Test both WiFi and cellular connections
- Various screen densities (1x, 2x, 3x)
- Different browsers (Chrome, Firefox, Safari, Samsung Internet)

## 🎯 Expected Results

When testing successfully, you should see:
- **Smooth particle animations** maintaining logo shape
- **Responsive controls** that work with touch
- **Good performance** (30+ FPS on modern devices)
- **Proper scaling** for different screen sizes
- **Intuitive interactions** for morphing and effects

Happy testing! 🚀