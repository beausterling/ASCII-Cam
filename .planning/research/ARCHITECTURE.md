# Architecture Research

**Domain:** Webcam-to-ASCII Art with Real-time Audio Synthesis
**Researched:** 2026-02-13
**Confidence:** MEDIUM-HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION LAYER                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Camera    │  │   Audio     │  │  Settings   │          │
│  │   Toggle    │  │   Toggle    │  │  Controls   │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                 │                 │                │
├─────────┴─────────────────┴─────────────────┴────────────────┤
│                  PROCESSING ORCHESTRATOR                     │
│                      (main.js)                               │
│         ├─── requestVideoFrameCallback loop ───┤             │
│         │                                                    │
├─────────┴────────────────────────────────────────────────────┤
│               PARALLEL PROCESSING LAYER                      │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  ASCII Renderer  │  │ Motion Analyzer  │                 │
│  │   (p5.js)        │  │  (frame diff)    │                 │
│  │                  │  │                  │                 │
│  │ - pixel sample   │  │ - brightness avg │                 │
│  │ - char mapping   │  │ - motion delta   │                 │
│  │ - canvas draw    │  │                  │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│           └──────────┬──────────┘                            │
│                      ↓                                       │
├──────────────────────────────────────────────────────────────┤
│                   AUDIO ENGINE (Tone.js)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  AudioContext (user-gesture initialized)               │  │
│  │    ↓                                                   │  │
│  │  Synth (pad) → Effects → Gain → Master                │  │
│  │    ↑                                                   │  │
│  │  Signal mappings:                                      │  │
│  │    - brightness → frequency                            │  │
│  │    - motion → volume envelope                          │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                     DATA/STATE LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Config  │  │ Previous │  │  Audio   │                   │
│  │  Object  │  │  Frame   │  │  State   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **main.js** | Orchestration, lifecycle, loop coordination | Initialize components, start/stop processing, handle user gestures, coordinate frame processing |
| **asciiRenderer.js** | Visual transformation and display | p5.js sketch with createCapture(VIDEO), pixel sampling, character mapping, canvas rendering |
| **motionAnalyzer.js** | Frame comparison and change detection | Canvas-based frame diffing, brightness averaging, motion delta calculation |
| **audioEngine.js** | Sound synthesis and parameter mapping | Tone.js synth/effects setup, AudioContext management, signal parameter updates |
| **config.js** | Shared constants and settings | ASCII character sets, sampling density, audio mappings, visual parameters |

## Recommended Project Structure

```
ascii-cam/
├── index.html              # Single HTML file, Bootstrap 5 layout
├── css/
│   └── style.css          # Terminal aesthetic overrides
├── js/
│   ├── main.js            # Orchestrator: initialization & main loop
│   ├── asciiRenderer.js   # p5.js sketch (instance mode recommended)
│   ├── motionAnalyzer.js  # Frame diff algorithm, exports analyze()
│   ├── audioEngine.js     # Tone.js wrapper, exports init/update/stop
│   └── config.js          # Constants: ASCII_CHARS, SAMPLE_RATE, etc.
└── assets/
    └── (if needed for splash screen or icons)
```

### Structure Rationale

- **Flat JS structure:** No build tools means simple ES modules with relative imports. Each module is a single concern.
- **main.js as orchestrator:** Avoids circular dependencies. Components don't know about each other, only main knows about all.
- **p5.js instance mode:** Prevents global namespace pollution, allows multiple sketches if needed, cleaner ES module integration.
- **Separate motion analyzer:** Motion detection is expensive and independent of rendering—can be optimized or skipped frames separately from visual updates.
- **Audio engine isolation:** Handles complex AudioContext lifecycle (user gesture requirement, suspend/resume), keeps Tone.js complexity contained.

## Architectural Patterns

### Pattern 1: requestVideoFrameCallback Loop (Preferred for 2026)

**What:** Modern video processing uses `requestVideoFrameCallback()` instead of `requestAnimationFrame()` to synchronize with actual video frame delivery.

**When to use:** When processing webcam frames—ensures you only process when new frames arrive, not on every display refresh.

**Trade-offs:**
- **Pros:** Perfectly synced with video rate, no wasted processing cycles, better battery life on mobile
- **Cons:** Newer API (check browser support), requires video element (not direct p5.js capture)

**Example:**
```javascript
// main.js
const video = document.querySelector('video');

function processFrame(now, metadata) {
  // metadata.presentedFrames tells you when new frame arrived

  // Process ASCII rendering
  renderer.update(video);

  // Analyze motion
  const motionData = motionAnalyzer.analyze(video);

  // Update audio
  audioEngine.update(motionData);

  // Schedule next frame
  video.requestVideoFrameCallback(processFrame);
}

// Start processing after user gesture
video.requestVideoFrameCallback(processFrame);
```

### Pattern 2: Dual-Canvas Architecture

**What:** Use separate canvases for capture/processing vs. display to optimize pixel operations.

**When to use:** When doing heavy pixel manipulation (ASCII conversion, motion detection) at different resolutions than display.

**Trade-offs:**
- **Pros:** Process at low resolution (performance), display at high resolution (quality), offscreen processing doesn't trigger repaints
- **Cons:** Extra memory for second canvas, more complex data flow

**Example:**
```javascript
// asciiRenderer.js (p5.js instance mode)
export function createASCIIRenderer(containerElement) {
  let capture;
  let processCanvas; // offscreen, low-res

  const sketch = (p) => {
    p.setup = () => {
      p.createCanvas(800, 600).parent(containerElement);
      capture = p.createCapture(p.VIDEO);
      capture.size(80, 60); // low-res capture
      capture.hide();

      // Offscreen canvas for pixel analysis
      processCanvas = p.createGraphics(80, 60);

      p.textFont('Courier New');
      p.textAlign(p.CENTER, p.CENTER);
    };

    p.draw = () => {
      p.background(0);

      // Copy to offscreen for processing
      processCanvas.image(capture, 0, 0);
      processCanvas.loadPixels();

      // Sample pixels and draw ASCII to main canvas
      for (let y = 0; y < 60; y++) {
        for (let x = 0; x < 80; x++) {
          const idx = (y * 80 + x) * 4;
          const brightness = processCanvas.pixels[idx]; // R channel
          const char = mapBrightnessToChar(brightness);

          p.fill(0, 255, 0); // terminal green
          p.text(char, x * 10, y * 10);
        }
      }
    };
  };

  return new p5(sketch);
}
```

### Pattern 3: Event-Driven Audio Parameter Updates

**What:** Audio engine exposes simple update methods; orchestrator pushes data rather than audio pulling from video sources.

**When to use:** Always—keeps audio module decoupled from visual processing, easier to test, cleaner dependencies.

**Trade-offs:**
- **Pros:** Loose coupling, audio module doesn't need video/canvas access, can throttle updates independently
- **Cons:** Slight indirection, orchestrator must coordinate timing

**Example:**
```javascript
// audioEngine.js
let synth;
let currentFreq = 220;
let currentVol = -12;

export async function init() {
  await Tone.start(); // Must be called after user gesture

  synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 2, decay: 1, sustain: 0.5, release: 4 }
  }).toDestination();

  synth.volume.value = currentVol;
}

export function update({ brightness, motion }) {
  if (!synth) return;

  // Map brightness (0-255) to frequency (100-800 Hz)
  const targetFreq = 100 + (brightness / 255) * 700;

  // Map motion (0-100) to volume (-40 to -6 dB)
  const targetVol = -40 + (motion / 100) * 34;

  // Smooth ramps to avoid clicking
  synth.frequency.rampTo(targetFreq, 0.1);
  synth.volume.rampTo(targetVol, 0.1);

  currentFreq = targetFreq;
  currentVol = targetVol;
}

export function start() {
  if (synth) synth.triggerAttack(currentFreq);
}

export function stop() {
  if (synth) synth.triggerRelease();
}
```

### Pattern 4: Frame Differencing for Motion

**What:** Store previous frame, compute pixel-by-pixel difference, threshold to detect motion regions.

**When to use:** Simple motion detection without ML/heavy computation—perfect for parameter mapping.

**Trade-offs:**
- **Pros:** Lightweight (< 600 bytes gzipped), fast, good enough for ambient audio control
- **Cons:** Sensitive to lighting changes, no object tracking, just gross movement

**Example:**
```javascript
// motionAnalyzer.js
let previousFrame = null;
const MOTION_THRESHOLD = 20; // pixel difference threshold

export function analyze(videoElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Downsample for performance (10% of original)
  canvas.width = videoElement.videoWidth * 0.1;
  canvas.height = videoElement.videoHeight * 0.1;

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data; // Uint8ClampedArray

  let totalBrightness = 0;
  let motionPixels = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const brightness = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
    totalBrightness += brightness;

    if (previousFrame) {
      const diff = Math.abs(brightness - previousFrame[i/4]);
      if (diff > MOTION_THRESHOLD) motionPixels++;
    }
  }

  const avgBrightness = totalBrightness / (pixels.length / 4);
  const motionPercent = previousFrame
    ? (motionPixels / (pixels.length / 4)) * 100
    : 0;

  // Store current frame for next comparison
  previousFrame = new Float32Array(pixels.length / 4);
  for (let i = 0; i < pixels.length; i += 4) {
    previousFrame[i/4] = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
  }

  return {
    brightness: avgBrightness,  // 0-255
    motion: motionPercent        // 0-100
  };
}
```

### Pattern 5: User Gesture Gatekeeper

**What:** Create AudioContext inside or after user gesture, provide clear UI affordance for audio activation.

**When to use:** Always—required by all modern browsers for Web Audio API.

**Trade-offs:**
- **Pros:** Meets autoplay policy, user expectations aligned (click = sound starts)
- **Cons:** Adds initialization complexity, need error handling for suspended contexts

**Example:**
```javascript
// main.js
let audioInitialized = false;

document.getElementById('start-button').addEventListener('click', async () => {
  if (!audioInitialized) {
    try {
      await audioEngine.init(); // Tone.start() happens here
      audioInitialized = true;
      console.log('Audio initialized');
    } catch (err) {
      console.error('Audio init failed:', err);
      // Show user-friendly error
    }
  }

  audioEngine.start(); // Begin synth tone
  startVideoProcessing();
});

document.getElementById('stop-button').addEventListener('click', () => {
  audioEngine.stop();
  stopVideoProcessing();
});
```

## Data Flow

### Primary Processing Flow

```
User Click "Start"
    ↓
Initialize AudioContext (Tone.start)
    ↓
Start Video Capture (p5.js createCapture)
    ↓
┌─────────────────────────────────────────────┐
│  requestVideoFrameCallback Loop (60fps)     │
│                                             │
│  1. New video frame arrives                 │
│      ↓                                      │
│  2. asciiRenderer.draw()                    │
│      - Sample pixels (every Nth pixel)      │
│      - Map brightness → ASCII char          │
│      - Draw chars to canvas                 │
│      ↓                                      │
│  3. motionAnalyzer.analyze(videoElement)    │
│      - Get current frame pixels             │
│      - Diff with previous frame             │
│      - Calculate avg brightness & motion %  │
│      ↓                                      │
│  4. audioEngine.update({ brightness, motion })│
│      - brightness → synth frequency         │
│      - motion → synth volume                │
│      - Smooth ramp to new values            │
│      ↓                                      │
│  5. Schedule next frame                     │
│      - video.requestVideoFrameCallback(loop)│
└─────────────────────────────────────────────┘
```

### State Management (Minimal)

```
Global State (main.js)
├── isRunning: boolean
├── audioInitialized: boolean
└── components: { renderer, analyzer, audio }
    ↓
Component Internal State
├── asciiRenderer
│   ├── p5 instance
│   ├── capture element
│   └── processCanvas
├── motionAnalyzer
│   └── previousFrame: Float32Array
└── audioEngine
    ├── AudioContext
    ├── synth: Tone.Synth
    └── currentParams: { freq, vol }
```

### Key Data Flows

1. **Video → Visual:** WebRTC video stream → p5.js capture → pixel sampling → ASCII character rendering → canvas display
2. **Video → Analysis:** Video frame → canvas pixel extraction → brightness/motion calculation → numerical data object
3. **Analysis → Audio:** { brightness, motion } object → parameter mapping functions → Tone.js Signal.rampTo() → Web Audio API synthesis
4. **User → All:** Click event → AudioContext resume → video.play() → animation loop start → audio.triggerAttack()

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **Mobile (primary target)** | Aggressive downsampling (80x60 or smaller), skip motion analysis every other frame, use CSS-based terminal aesthetic instead of per-character fills, consider OffscreenCanvas + Web Worker for pixel processing |
| **Desktop** | Can increase resolution (120x90), enable higher-quality audio effects (reverb, delay), use full 60fps processing, add visual effects (glow, scan lines) |
| **Multiple simultaneous users** | No backend, fully client-side—scales infinitely (static hosting) |

### Scaling Priorities

1. **First bottleneck: Pixel processing on mobile**
   - **Symptom:** Frame drops, stuttering animation, janky audio
   - **Fix:** Reduce video resolution (createCapture size), increase pixel sampling interval (every 4th pixel instead of every pixel), use Typed Arrays consistently, move pixel operations to Web Worker with OffscreenCanvas

2. **Second bottleneck: Audio context on mobile Safari**
   - **Symptom:** Crackling, audio glitches, high battery drain
   - **Fix:** Throttle audio parameter updates (max 15fps update rate), use longer ramp times (0.2s instead of 0.1s), reduce reverb/effects, consider Tone.js performance mode

3. **Third bottleneck: Canvas rendering**
   - **Symptom:** Display lag separate from processing
   - **Fix:** Switch from individual p5.text() calls to single drawingContext manipulation, pre-render ASCII characters to image cache, use CSS transforms for effects instead of redrawing

## Anti-Patterns

### Anti-Pattern 1: Processing Every Pixel on Every Frame

**What people do:** Loop through all pixels at full webcam resolution (640x480 or higher) every frame.

**Why it's wrong:** 640x480 = 307,200 pixels × 4 bytes × 60fps = 73 MB/s of data to process. Mobile devices choke, batteries drain fast.

**Do this instead:**
- Downsample video capture to 80x60 or lower (createCapture size parameter)
- Sample every Nth pixel (stride pattern: `for (let i = 0; i < pixels.length; i += 16)`)
- Use Typed Arrays (Uint8ClampedArray) instead of regular arrays
- Consider OffscreenCanvas + Web Worker for pixel operations

### Anti-Pattern 2: Creating New Objects in Animation Loop

**What people do:**
```javascript
// BAD: Creates new objects 60 times per second
function draw() {
  const data = motionAnalyzer.analyze(); // returns new object
  audioEngine.update({ brightness: data.brightness, motion: data.motion }); // another new object
}
```

**Why it's wrong:** Causes garbage collection pauses, leading to frame drops and audio glitches.

**Do this instead:**
```javascript
// GOOD: Reuse object references
const analysisResult = { brightness: 0, motion: 0 };

function draw() {
  motionAnalyzer.analyze(analysisResult); // mutates existing object
  audioEngine.update(analysisResult); // no new allocations
}
```

### Anti-Pattern 3: Calling Tone.js triggerAttack/Release Repeatedly

**What people do:** Retrigger synth note on every frame or motion event.

**Why it's wrong:** Creates clicks/pops, overwhelms audio thread, doesn't create smooth ambient sound.

**Do this instead:**
- `triggerAttack()` once when starting
- Use `frequency.rampTo()` and `volume.rampTo()` for smooth parameter changes
- `triggerRelease()` only when stopping

### Anti-Pattern 4: Initializing AudioContext Without User Gesture

**What people do:**
```javascript
// BAD: Won't work in modern browsers
const audioEngine = new AudioEngine(); // tries to create AudioContext on import
```

**Why it's wrong:** Browsers require user interaction before audio can play. AudioContext will be in "suspended" state, no sound plays.

**Do this instead:**
```javascript
// GOOD: Gate behind user gesture
document.getElementById('start-button').addEventListener('click', async () => {
  await Tone.start(); // Only call after user clicks
  synth.triggerAttack();
});
```

### Anti-Pattern 5: Mixing p5.js Global and Instance Mode

**What people do:** Use global p5 functions (`setup()`, `draw()`) alongside ES modules.

**Why it's wrong:** Global mode pollutes namespace, makes module imports awkward, prevents multiple sketches, harder to test.

**Do this instead:**
```javascript
// GOOD: Instance mode
export function createRenderer(container) {
  const sketch = (p) => {
    p.setup = () => { /* ... */ };
    p.draw = () => { /* ... */ };
  };
  return new p5(sketch, container);
}
```

## Integration Points

### External Browser APIs

| API | Integration Pattern | Notes |
|-----|---------------------|-------|
| **getUserMedia (via p5.js)** | `createCapture(VIDEO)` in p5 setup | Triggers permission prompt, handle denial gracefully |
| **Web Audio API (via Tone.js)** | `Tone.start()` after user gesture | Check `Tone.context.state`, resume if suspended |
| **requestVideoFrameCallback** | Call on video element, not p5 capture | May need to extract underlying HTMLVideoElement from p5 |
| **requestAnimationFrame** | Fallback if rVFC unavailable | Less efficient but broader support |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **main.js ↔ asciiRenderer.js** | Function calls: `setup()`, `start()`, `stop()` | Main doesn't reach into p5 internals |
| **main.js ↔ motionAnalyzer.js** | Function call: `analyze(videoEl) → { brightness, motion }` | Pass video element, receive data object |
| **main.js ↔ audioEngine.js** | Function calls: `init()`, `update(data)`, `start()`, `stop()` | Main coordinates lifecycle, audio is stateless consumer |
| **asciiRenderer.js ↔ config.js** | Import constants: `ASCII_CHARS`, `SAMPLE_DENSITY` | Renderer reads but never writes config |
| **motionAnalyzer.js ↔ asciiRenderer.js** | **NO DIRECT COMMUNICATION** | Both accessed only by main.js orchestrator |

## Build Order Recommendations

### Phase 1: Foundation (No dependencies)
1. **config.js** — Define all constants first (ASCII chars, mappings, thresholds)
2. **index.html** — Bootstrap 5 layout, terminal CSS, placeholder UI

### Phase 2: Visual Core (Depends on: config.js)
3. **asciiRenderer.js** — p5.js sketch, static ASCII rendering from webcam
4. **Manual test:** Should see green ASCII art in browser

### Phase 3: Analysis Layer (Depends on: asciiRenderer.js for video element)
5. **motionAnalyzer.js** — Frame differencing algorithm
6. **Manual test:** Console.log brightness/motion values, move in front of camera

### Phase 4: Audio Layer (Depends on: config.js)
7. **audioEngine.js** — Tone.js synth, basic drone sound
8. **Manual test:** Click button → hear tone (no video mapping yet)

### Phase 5: Integration (Depends on: all modules)
9. **main.js** — Wire everything together, orchestrate loop
10. **Integration test:** Move → ASCII changes + sound changes

### Phase 6: Polish (Depends on: working MVP)
11. Add smooth parameter mapping, visual effects, settings UI

### Dependency Rationale
- **Config first:** Prevents magic numbers scattered across modules
- **Visual before analysis:** Can test rendering independently, provides video element for analysis
- **Audio independent:** Can develop/test sound design without video
- **Main.js last:** Orchestrator needs all pieces ready to wire together

## Sources

**Webcam ASCII Art Implementations:**
- [Webcam stream to ASCII art with JavaScript](https://medium.com/@sasha.kub95/webcam-stream-to-ascii-art-with-javascript-2a2f9a39befb)
- [idevelop/ascii-camera - GitHub](https://github.com/idevelop/ascii-camera)
- [ASCII-ME | Live Webcam ASCII Art](https://apih99.github.io/ascii-me/)

**p5.js Best Practices:**
- [Optimizing p5.js Code for Performance - GitHub Wiki](https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance)
- [p5.js in 2026: A Practical, Maintainable Creative-Coding Workflow](https://thelinuxcode.com/p5js-in-2026-a-practical-maintainable-creative-coding-workflow/)

**Tone.js Architecture:**
- [Tone.js Official Documentation](https://tonejs.github.io/)
- [Tone.js GitHub Repository](https://github.com/Tonejs/Tone.js)

**Motion Detection:**
- [diffyjs - GitHub](https://github.com/maniart/diffyjs)
- [Motion Detection with JavaScript](https://codersblock.com/blog/motion-detection-with-javascript/)

**Web Audio Best Practices:**
- [Web Audio API best practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [Autoplay guide for media and Web Audio APIs - MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

**Video Processing:**
- [requestVideoFrameCallback - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)
- [Visualizations with Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)

**Canvas Performance:**
- [Optimizing canvas - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [Optimize Image Processing via Canvas Pixel Data](https://www.slingacademy.com/article/optimize-image-processing-via-canvas-pixel-data-in-javascript/)

**ES Modules 2026:**
- [JavaScript Modules in 2026](https://thelinuxcode.com/javascript-modules-in-2026-practical-patterns-with-commonjs-and-es-modules/)
- [The Case for Vanilla JavaScript in 2026](https://medium.com/@mkuk/the-case-for-vanilla-javascript-in-2026-92d7153a9f68)

---
*Architecture research for: ASCII Cam*
*Researched: 2026-02-13*
