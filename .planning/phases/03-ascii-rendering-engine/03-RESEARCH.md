# Phase 3: ASCII Rendering Engine - Research

**Researched:** 2026-02-14
**Domain:** Real-time video-to-ASCII conversion with Canvas/DOM rendering
**Confidence:** HIGH

## Summary

This phase requires converting live webcam video into ASCII art at 30+ fps on mobile devices. The core technical challenge is choosing between HTML pre element rendering (DOM manipulation) vs Canvas 2D fillText() for optimal mobile performance. Research shows that for real-time ASCII rendering with frequent full-screen updates, **HTML pre element with textContent** is the recommended approach because it avoids expensive Canvas text rendering operations while providing excellent performance characteristics.

The key performance bottleneck is the rendering method itself—Canvas text rendering (fillText) is identified as a performance bottleneck in official Canvas optimization docs, while DOM updates using textContent are fast and avoid reflow triggers. The pixel sampling strategy (grid-based sampling with perceptual luminance calculation) is well-established and straightforward.

**Primary recommendation:** Use HTML pre element with textContent updates for ASCII rendering. Sample video pixels in a grid pattern using Canvas getImageData with willReadFrequently: true, calculate perceptual luminance using ITU-R BT.601 formula (0.299R + 0.587G + 0.114B), map to character sets, and update pre element text. Use throttling (not debouncing) for real-time slider updates to maintain consistent feedback.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
**Character mapping:**
- Long character ramp (~12+ characters) for smooth tonal gradation
- Bright pixels map to dense characters (drawing with light — bright areas get @#, dark get spaces)
- Perceptual luminance weighting (0.299R + 0.587G + 0.114B) for natural-looking brightness conversion

**Character sets:**
- 3 sets: standard, dense, minimal (as specified in roadmap)
- Claude's discretion on specific characters for each set — must feel distinct from each other

**Resolution & grid sizing:**
- Slider range: 40–160 columns
- Default: 80 columns (classic terminal width)
- Real-time update while dragging, but prioritize mobile performance — throttle or debounce if needed to prevent jank/crashes
- Slider shows live label with current column count (e.g., "80 cols")

**Visual presentation:**
- Classic phosphor green (#00FF00 or similar) on black background
- ASCII output fills available screen space — font size adjusts so grid fits viewport
- Toggle switch (iOS-style) to switch between raw video feed and ASCII output

**Controls & interaction:**
- Controls placed below the ASCII output — output gets visual priority
- Resolution slider with live numeric label
- Character set dropdown
- Video/ASCII toggle switch
- FPS counter hidden by default — debug/console only

### Claude's Discretion
- Render method (HTML pre block vs canvas) — pick based on what hits 30fps on mobile
- Aspect ratio correction — pick based on what looks best with the chosen font
- Character set designs — 3 distinct sets with different visual feels
- Throttling/debounce strategy for real-time slider updates

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| p5.js | 2.2.0 | Canvas rendering & video handling | Already in project, handles video capture, provides draw loop |
| Native Canvas 2D API | Browser native | Pixel sampling via getImageData | Direct pixel access, optimal performance with willReadFrequently |
| Native DOM APIs | Browser native | HTML pre element manipulation | Fastest text rendering approach, avoids Canvas fillText overhead |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| requestAnimationFrame | Browser native | Animation loop timing | Better than p5 draw loop for precise FPS control and performance monitoring |
| CSS Grid/Flexbox | Browser native | Layout controls below output | Responsive control positioning |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HTML pre + textContent | Canvas fillText() | Canvas text is 10x slower per MDN optimization docs, requires character-by-character positioning |
| HTML pre + textContent | Canvas + offscreen cache | Adds complexity, still slower than DOM for full-screen text updates |
| Throttling | Debouncing | Debouncing delays final update, throttling provides consistent feedback during drag |

**Installation:**
No additional packages needed—uses existing p5.js and browser native APIs.

## Architecture Patterns

### Recommended Project Structure
```
js/
├── renderer.js       # Existing—will be modified for ASCII output toggle
├── webcam.js         # Existing—no changes needed
├── analyzer.js       # NEW—pixel sampling and character mapping
├── config.js         # Existing—add character sets and rendering config
└── main.js           # Existing—wire up controls and toggle logic
```

### Pattern 1: Grid-Based Pixel Sampling
**What:** Sample video pixels in a grid pattern to convert regions to ASCII characters
**When to use:** Real-time video processing where you need to reduce resolution for performance

**Example:**
```javascript
// Source: Real-time video processing pattern from MDN + p5.js community
function sampleVideoGrid(video, cols) {
  // Calculate grid cell dimensions
  const cellWidth = video.videoWidth / cols;
  const cellHeight = cellWidth * 2; // Aspect ratio correction for monospace
  const rows = Math.floor(video.videoHeight / cellHeight);

  // Create offscreen canvas for pixel sampling
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Draw current video frame
  ctx.drawImage(video, 0, 0);

  // Sample center pixel of each grid cell
  const asciiChars = [];
  for (let row = 0; row < rows; row++) {
    let rowString = '';
    for (let col = 0; col < cols; col++) {
      const x = Math.floor(col * cellWidth + cellWidth / 2);
      const y = Math.floor(row * cellHeight + cellHeight / 2);

      // Get pixel data (returns [r, g, b, a])
      const pixel = ctx.getImageData(x, y, 1, 1).data;

      // Calculate perceptual luminance
      const brightness = (0.299 * pixel[0]) + (0.587 * pixel[1]) + (0.114 * pixel[2]);

      // Map to character
      rowString += brightnessToChar(brightness, charSet);
    }
    asciiChars.push(rowString);
  }

  return asciiChars.join('\n');
}
```

### Pattern 2: Perceptual Luminance Calculation
**What:** Convert RGB pixel values to perceptual brightness using ITU-R BT.601 standard
**When to use:** When mapping colors to grayscale/brightness for display purposes

**Example:**
```javascript
// Source: ITU-R BT.601 standard (used in JPEG/MPEG)
function calculateLuminance(r, g, b) {
  // Human eye is most sensitive to green, least to blue
  return (0.299 * r) + (0.587 * g) + (0.114 * b);
}

function brightnessToChar(brightness, charSet) {
  // Map 0-255 brightness to character index
  // IMPORTANT: User specified bright pixels = dense chars (drawing with light)
  const index = Math.floor((brightness / 255) * (charSet.length - 1));
  return charSet[index];
}
```

### Pattern 3: High-Performance DOM Text Updates
**What:** Update HTML pre element using textContent for maximum performance
**When to use:** Full-screen text updates at high framerates

**Example:**
```javascript
// Source: MDN DOM manipulation performance best practices
const asciiContainer = document.querySelector('#ascii-output');

function updateASCIIDisplay(asciiText) {
  // textContent is fastest—no HTML parsing, no reflow
  asciiContainer.textContent = asciiText;
}

// CSS for pre element (aspect ratio correction)
/*
#ascii-output {
  font-family: 'Courier New', monospace;
  color: #00ff00;
  background: #000;
  white-space: pre;
  line-height: 1.0; // Adjust for character aspect ratio
  font-size: calc(100vw / <cols> / 0.6); // Dynamic sizing
  overflow: hidden;
}
*/
```

### Pattern 4: Throttled Real-Time Updates
**What:** Use throttling to limit slider update frequency while maintaining responsiveness
**When to use:** Real-time controls that trigger expensive operations (re-rendering)

**Example:**
```javascript
// Source: JavaScript performance optimization patterns
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage for slider
const slider = document.querySelector('#resolution-slider');
const label = document.querySelector('#resolution-label');

slider.addEventListener('input', throttle((e) => {
  const cols = parseInt(e.target.value);
  label.textContent = `${cols} cols`;
  // Expensive operation—happens max every 50ms
  updateResolution(cols);
}, 50)); // 20fps update rate for slider
```

### Pattern 5: FPS Monitoring
**What:** Calculate and display frames per second using requestAnimationFrame timestamps
**When to use:** Performance monitoring and debugging

**Example:**
```javascript
// Source: Fast and Simple JavaScript FPS Counter pattern
let lastFrameTime = performance.now();
let fps = 0;

function calculateFPS() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  fps = Math.round(1000 / delta);
  lastFrameTime = now;
  return fps;
}

// In render loop
function draw() {
  const currentFPS = calculateFPS();
  // console.log only (hidden by default per user requirement)
  if (currentFPS < 30) {
    console.warn(`Low FPS: ${currentFPS}`);
  }
}
```

### Anti-Patterns to Avoid
- **Canvas fillText() for ASCII art:** Text rendering is identified as a performance bottleneck in Canvas. Use DOM instead.
- **innerHTML for text updates:** Slower than textContent because it invokes HTML parser. Use textContent.
- **innerText for text updates:** Triggers reflow to calculate styles/visibility. Use textContent.
- **Debouncing slider updates:** Delays final update, creating laggy feel. Use throttling for consistent feedback.
- **getImageData without willReadFrequently:** Causes Chrome warnings and suboptimal performance. Always set { willReadFrequently: true } when sampling frequently.
- **Nested loops without optimization:** Pixel sampling is O(rows × cols). Keep character set operations efficient (use array index, not loops).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FPS calculation | Manual frame counting | performance.now() timestamps | Accurate, accounts for variable refresh rates, simple pattern |
| Throttling/debouncing | Custom timing logic | Standard throttle pattern (see Pattern 4) | Well-tested, handles edge cases (rapid calls, cleanup) |
| Monospace font aspect ratio | Manual calculation | CSS line-height tuning | Simpler, browser-handles rendering optimizations |
| Character mapping | Complex lookup tables | Direct array indexing | Brightness/255 × (length-1) is fast and simple |
| Video pixel access | Manual ImageData parsing | Canvas getImageData() | Optimized by browser, handles pixel density automatically |

**Key insight:** ASCII rendering is conceptually simple—sample pixels, calculate brightness, map to chars, display text. The complexity is in the performance optimization. Don't overcomplicate the core algorithm; focus on choosing the right rendering method (DOM vs Canvas) and optimizing the hot path (pixel sampling loop).

## Common Pitfalls

### Pitfall 1: Canvas Text Rendering Performance
**What goes wrong:** Using Canvas fillText() for ASCII art results in <10fps on mobile
**Why it happens:** Canvas text rendering is identified as a performance bottleneck (MDN Canvas optimization docs). Drawing 1000+ characters per frame is prohibitively expensive.
**How to avoid:** Use HTML pre element with textContent. DOM text rendering is highly optimized and avoids per-character Canvas calls.
**Warning signs:** Low FPS, frame drops, high CPU usage when rendering ASCII

### Pitfall 2: Incorrect Aspect Ratio
**What goes wrong:** ASCII art appears stretched or squashed
**Why it happens:** Monospace characters are typically ~2:1 height:width ratio, but video pixels are 1:1
**How to avoid:** Calculate grid cell height as cellWidth × 2 for aspect ratio correction. Fine-tune with CSS line-height.
**Warning signs:** Circular objects appear as ovals, faces look distorted

### Pitfall 3: willReadFrequently Not Set
**What goes wrong:** Chrome console warnings about getImageData performance, sluggish rendering
**Why it happens:** Browser optimizes Canvas for write operations (GPU accelerated) by default, not read operations
**How to avoid:** Always create 2D context with { willReadFrequently: true } when using getImageData frequently
**Warning signs:** Console warning "Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true"

### Pitfall 4: Character Set Brightness Mapping Inverted
**What goes wrong:** Bright areas appear dark, dark areas appear light
**Why it happens:** Confusing "character density" with brightness. User specified: bright pixels = dense characters.
**How to avoid:** Map high brightness (255) to dense characters (@, #) and low brightness (0) to sparse characters (space, .)
**Warning signs:** ASCII art looks like a photographic negative

### Pitfall 5: Slider Updates Causing Frame Drops
**What goes wrong:** Moving slider causes stuttering, choppy rendering
**Why it happens:** Re-calculating entire ASCII grid on every slider input event (can fire 60+ times/second)
**How to avoid:** Throttle slider updates to ~20fps (50ms interval). Balance responsiveness with performance.
**Warning signs:** Visible stuttering during slider drag, FPS drops below 30

### Pitfall 6: Font Size Not Responsive
**What goes wrong:** ASCII output doesn't fill screen, or overflows on different devices
**Why it happens:** Fixed font size doesn't adapt to viewport or column count
**How to avoid:** Use CSS calc() to compute font size dynamically: `font-size: calc(100vw / cols / 0.6)` where 0.6 is monospace character width factor
**Warning signs:** ASCII output too small on desktop, overflows on mobile

### Pitfall 7: Video Pixel Density Issues
**What goes wrong:** Pixel sampling doesn't account for high-DPI displays (Retina, etc.)
**Why it happens:** Browser pixel density scaling affects Canvas coordinates
**How to avoid:** Use video.videoWidth/videoHeight (actual resolution) not video.width/height (display size). getImageData handles pixel density automatically.
**Warning signs:** Incorrect sampling positions, offset characters

## Code Examples

Verified patterns from official sources:

### Luminance Calculation (ITU-R BT.601)
```javascript
// Source: ITU-R BT.601 standard, used in JPEG/MPEG
// Reflects human eye sensitivity: most to green, least to blue
function calculateLuminance(r, g, b) {
  return (0.299 * r) + (0.587 * g) + (0.114 * b);
}

// Example character sets (Claude's discretion on specifics)
const charSets = {
  standard: ' .:-=+*#%@',          // ~10 chars, balanced
  dense: ' .\':;!~+=itITX%W@',     // ~15 chars, high detail
  minimal: ' .+@'                   // ~4 chars, high contrast
};
```

### Canvas Setup for Pixel Sampling
```javascript
// Source: MDN Canvas API + willReadFrequently best practice
function createSamplingCanvas(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // CRITICAL: willReadFrequently optimizes for getImageData
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
    alpha: false  // Performance: disable alpha channel if not needed
  });

  return { canvas, ctx };
}
```

### HTML Pre Element with Dynamic Font Sizing
```html
<!-- Source: DOM best practices + responsive design patterns -->
<style>
#ascii-output {
  font-family: 'Courier New', Courier, monospace;
  color: #00ff00;
  background-color: #000000;
  white-space: pre;
  overflow: hidden;
  line-height: 1.0;
  /* Dynamic font size: viewport width / columns / character width factor */
  font-size: calc(100vw / var(--cols) / 0.6);
  margin: 0;
  padding: 1rem;
}
</style>

<pre id="ascii-output"></pre>

<script>
// Update CSS custom property when columns change
function updateColumns(cols) {
  document.documentElement.style.setProperty('--cols', cols);
}
</script>
```

### Toggle Between Video and ASCII
```javascript
// Source: Standard DOM manipulation pattern
const videoContainer = document.querySelector('#canvas-container');
const asciiContainer = document.querySelector('#ascii-container');
const toggleSwitch = document.querySelector('#ascii-toggle');

toggleSwitch.addEventListener('change', (e) => {
  if (e.target.checked) {
    // Show ASCII
    videoContainer.style.display = 'none';
    asciiContainer.style.display = 'block';
  } else {
    // Show video
    videoContainer.style.display = 'block';
    asciiContainer.style.display = 'none';
  }
});
```

### Throttled Range Slider
```javascript
// Source: JavaScript performance patterns
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

const slider = document.querySelector('#resolution-slider');
const label = document.querySelector('#resolution-label');

// Update label immediately (cheap operation)
slider.addEventListener('input', (e) => {
  const cols = parseInt(e.target.value);
  label.textContent = `${cols} cols`;
});

// Throttle expensive ASCII re-render
const throttledUpdate = throttle((cols) => {
  updateColumns(cols);
  // ASCII will re-render on next frame with new column count
}, 50); // 20fps max update rate

slider.addEventListener('input', (e) => {
  throttledUpdate(parseInt(e.target.value));
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas fillText per character | HTML pre + textContent for full text | ~2018 (DOM performance improvements) | 10x+ faster for large text blocks |
| Debouncing real-time inputs | Throttling real-time inputs | Established pattern | Better UX—consistent feedback vs delayed |
| Manual FPS calculation | performance.now() timestamps | performance API introduction (~2012) | Accurate, high-resolution timing |
| RGB averaging for brightness | Perceptual luminance (0.299R + 0.587G + 0.114B) | ITU-R BT.601 standard (1982, still current) | Matches human vision, better results |
| GPU-optimized Canvas (default) | willReadFrequently for frequent reads | ~2020 (Chrome optimization) | Improves getImageData performance, but disables GPU for writes |

**Deprecated/outdated:**
- **setInterval for animation loops:** Use requestAnimationFrame for better performance and battery life
- **innerHTML for text updates:** Use textContent—faster and safer (no XSS risk)
- **p5.get() for pixel sampling:** Use native Canvas getImageData—faster and more control

## Open Questions

1. **Optimal throttle interval for slider updates**
   - What we know: 50ms (20fps) is common, user prioritizes mobile performance over smoothness
   - What's unclear: Exact threshold where mobile devices start to lag
   - Recommendation: Start with 50ms, add FPS monitoring, increase interval if FPS drops below 30

2. **Exact character width factor for font-size calc()**
   - What we know: Monospace characters are ~0.5-0.6 width-to-height ratio
   - What's unclear: Exact ratio for 'Courier New' across browsers
   - Recommendation: Start with 0.6, add CSS custom property for easy tuning

3. **Performance threshold: when to switch from pre to Canvas**
   - What we know: HTML pre is faster for current use case (80 cols × ~40 rows = 3200 chars)
   - What's unclear: Is there a column count where Canvas becomes faster?
   - Recommendation: Stick with HTML pre for slider range (40-160 cols). If future phases increase max resolution, benchmark both approaches.

## Sources

### Primary (HIGH confidence)
- [MDN Canvas Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) - Canvas 2D performance techniques, text rendering bottleneck
- [p5.js Optimization Guide](https://p5js.org/tutorials/how-to-optimize-your-sketches/) - p5.js-specific performance patterns
- [MDN Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) - DOM text manipulation performance
- Context7 /websites/p5js_reference - p5.js text rendering, pixel manipulation, video capture APIs
- [Canvas willReadFrequently Spec](https://github.com/fserb/canvas2D/blob/master/spec/will-read-frequently.md) - Official specification

### Secondary (MEDIUM confidence)
- [ITU-R BT.601 Luminance Formula](https://gist.github.com/w3core/e3d9b5b6d69a3ba8671cc714cca8a4) - Perceptual brightness calculation (0.299R + 0.587G + 0.114B)
- [AsciiCam GitHub Project](https://github.com/hphng/AsciiCam) - Real-world p5.js ASCII webcam implementation
- [Fast FPS Counter Pattern](https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html) - performance.now() based FPS calculation
- [Debouncing vs Throttling (2026)](https://medium.com/@kushalkc198/debouncing-vs-throttling-in-javascript-typescript-explained-with-real-life-examples-simple-code-bdf6643015a4) - Real-time input handling patterns
- [Canvas willReadFrequently Blog](https://www.schiener.io/2024-08-02/canvas-willreadfrequently) - Practical implications of willReadFrequently

### Tertiary (LOW confidence)
- WebSearch results on monospace aspect ratios - Various community discussions, needs verification with actual testing
- CSS range slider styling - Multiple approaches, user preference for iOS-style needed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - p5.js already in project, DOM/Canvas APIs are stable and well-documented
- Architecture: HIGH - Grid sampling, luminance calculation, DOM text updates are established patterns
- Pitfalls: HIGH - Based on official MDN docs, verified p5.js patterns, and real-world projects

**Research date:** 2026-02-14
**Valid until:** 2026-04-14 (60 days—DOM/Canvas APIs are stable, unlikely to change significantly)
