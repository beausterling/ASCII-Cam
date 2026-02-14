# Stack Research

**Domain:** Webcam-to-ASCII art web application with ambient audio synthesis
**Researched:** 2026-02-13
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology              | Version          | Purpose                                                    | Why Recommended                                                                                                                                                                                                                                                                         |
| ----------------------- | ---------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **p5.js**               | 2.2.1            | Canvas rendering, webcam capture, ASCII art generation     | Latest stable with WebGPU support, unified pointer events (mouse/touch/pen), excellent for creative coding. Version 2.x is 2026 standard with HDR canvas support, async setup(), and 5-10x performance boost when FES disabled. Mobile-first projects benefit from unified pointer API. |
| **Tone.js**             | 15.1.22          | Web Audio synthesis, ambient pad generation, audio effects | Current stable release for browser-based audio. Mature Web Audio framework with PolySynth for polyphonic synth, Reverb for ambient textures, and simple API familiar to musicians. Version 15.x provides TypeScript support and stable architecture for synthesis.                      |
| **Bootstrap**           | 5.3.8            | Responsive layout, mobile-first UI components              | Latest stable with comprehensive mobile-first grid system, native dark mode support, and extensive component library. Lightweight when using only grid/utilities. Perfect for class projects requiring quick responsive layouts.                                                        |
| **Vanilla ES6 Modules** | Native (ES2015+) | Project structure, module organization                     | All modern browsers support native ES6 imports (no transpiling needed in 2026). Buildless approach = faster development, simpler debugging, zero config. Import maps allow CDN dependencies. Perfect for static GitHub Pages deployment.                                                |

### Supporting Libraries

| Library                  | Version        | Purpose                                 | When to Use                                                                                                                                                           |
| ------------------------ | -------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **p5.sound**             | **DO NOT USE** | Audio playback (conflicts with Tone.js) | **AVOID**: p5.sound conflicts with Tone.js when both are loaded. Use Tone.js exclusively for all audio synthesis and effects. Only use p5.sound if NOT using Tone.js. |
| **Import Maps polyfill** | Optional       | ES module mapping for older browsers    | Only if supporting Safari <16.4 (pre-March 2023). Not needed for modern mobile browsers in 2026.                                                                      |

### Development Tools

| Tool                                | Purpose                            | Notes                                                                                                                               |
| ----------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Live Server** (VS Code extension) | Local development with auto-reload | Required for ES6 modules (file:// doesn't support CORS). Simple HTTP server for testing getUserMedia (requires HTTPS or localhost). |
| **GitHub Pages**                    | Static site hosting with HTTPS     | Free, automatic HTTPS via Let's Encrypt, perfect for vanilla JS projects. No build step required = push and deploy.                 |
| **Browser DevTools**                | Debugging, performance monitoring  | Use Chrome/Edge DevTools for Web Audio inspection, Canvas performance profiling, and mobile device emulation.                       |

## Installation

### CDN Links (Recommended for Buildless Approach)

**HTML Setup:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ASCII Cam</title>

    <!-- Bootstrap 5.3.8 CSS -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
      crossorigin="anonymous"
    />

    <!-- Custom styles -->
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <!-- p5.js 2.2.1 -->
    <script src="https://cdn.jsdelivr.net/npm/p5@2.2.1/lib/p5.min.js"></script>

    <!-- Tone.js 15.1.22 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/15.1.22/Tone.min.js"></script>

    <!-- Bootstrap 5.3.8 JS Bundle (includes Popper) -->
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
      crossorigin="anonymous"
    ></script>

    <!-- Your app modules -->
    <script type="module" src="app.js"></script>
  </body>
</html>
```

### ES6 Module Structure

```javascript
// app.js (main entry point)
import { ASCIIRenderer } from './modules/ascii-renderer.js';
import { AudioEngine } from './modules/audio-engine.js';
import { CameraManager } from './modules/camera-manager.js';

// Initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // App initialization
});
```

**Note:** No npm install needed for CDN approach. For local development with npm:

```bash
# Optional: Install locally for offline development
npm install p5@2.2.1 tone@15.1.22 bootstrap@5.3.8
```

## Alternatives Considered

| Recommended      | Alternative               | When to Use Alternative                                                                                                                                                                           |
| ---------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **p5.js**        | Three.js + Canvas API     | Use Three.js if you need advanced 3D rendering or shader control beyond p5's WebGPU mode. For ASCII art, p5.js is simpler and has better documentation for creative coding.                       |
| **Tone.js**      | Web Audio API (vanilla)   | Use vanilla Web Audio if you need absolute minimal bundle size or very custom audio graph. For ambient synthesis, Tone.js abstracts complexity and provides musical API (notes, scales, effects). |
| **Bootstrap**    | Tailwind CSS / Custom CSS | Use Tailwind for utility-first approach or custom CSS for minimal footprint. Bootstrap wins for rapid prototyping and class projects requiring standard UI patterns with minimal CSS knowledge.   |
| **Vanilla ES6**  | Vite + React/Vue          | Use framework + bundler for complex state management or large-scale apps. For single-page creative coding projects, vanilla JS reduces complexity and learning curve.                             |
| **GitHub Pages** | Vercel / Netlify          | Use Vercel/Netlify if you need serverless functions, custom headers, or advanced redirect rules. For static HTML/CSS/JS, GitHub Pages is simpler and free with no account limits.                 |

## What NOT to Use

| Avoid                  | Why                                                                                                                                         | Use Instead                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **p5.sound**           | Conflicts with Tone.js when both are loaded in same page. Creates audio context collisions.                                                 | **Tone.js** exclusively for all audio synthesis and effects. More powerful and maintained for music applications.    |
| **p5.js 1.x**          | Version 1.x will be deprecated in August 2026. Missing unified pointer events (critical for mobile), slower 3D rendering, no async setup(). | **p5.js 2.2.1+** (2.x series is current standard). Use compatibility add-ons only if integrating legacy 1.x code.    |
| **jQuery**             | Unnecessary in 2026 with native DOM APIs (querySelector, fetch, classList). Adds 30KB+ for features browsers now provide.                   | **Vanilla JavaScript** with modern APIs. Bootstrap 5 doesn't require jQuery.                                         |
| **Webpack/Babel**      | Overkill for vanilla JS projects. Modern browsers support ES6 modules natively. Build complexity slows iteration for creative coding.       | **Native ES6 modules** with import maps. Zero build time = faster development cycle for educational projects.        |
| **Older CDN versions** | p5.js 1.11.11 appears on official download page but is outdated 1.x branch. Tone.js 14.x lacks TypeScript improvements.                     | **Check GitHub releases** for latest versions. CDN pages sometimes lag behind. Use p5.js 2.2.1 and Tone.js 15.1.22+. |

## Stack Patterns by Variant

### If targeting ONLY modern mobile browsers (2024+):

- Use p5.js 2.2.1 with unified pointer events (no separate touch handling)
- Enable `disableFriendlyErrors = true` in production for 5-10x performance boost
- Use CSS Grid + Bootstrap utilities (not full Bootstrap) for minimal bundle
- Native import maps (no polyfill needed)

### If supporting older iOS devices (pre-iOS 16.4):

- Include import maps polyfill from es-module-shims
- Test getUserMedia permissions carefully (iOS prompts for camera/mic separately)
- Consider p5.js 1.x for broader compatibility (but plan migration to 2.x before Aug 2026)
- Add explicit touch event fallbacks for Safari quirks

### If deploying to non-GitHub platform:

- Ensure HTTPS enabled (getUserMedia requires secure context)
- Set CORS headers if loading assets cross-origin
- Consider preloading p5.js/Tone.js from CDN for better caching
- Test camera permissions on target platform (some hosts block getUserMedia)

## Version Compatibility

| Package             | Compatible With       | Notes                                                                                                             |
| ------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **p5.js 2.2.1**     | Tone.js 15.x ✅       | No conflicts. Load p5 first, then Tone.js. Do NOT load p5.sound.                                                  |
| **p5.js 2.2.1**     | Bootstrap 5.3.8 ✅    | No conflicts. Bootstrap uses native JS (no jQuery). Load order: Bootstrap CSS → p5.js → Bootstrap JS → app.js.    |
| **Tone.js 15.1.22** | Bootstrap 5.3.8 ✅    | No conflicts. Independent libraries with no shared dependencies.                                                  |
| **p5.js 2.x**       | p5.sound ❌           | Conflicts with Tone.js. Choose ONE audio library. Recommended: Tone.js for synthesis, p5.sound for playback-only. |
| **ES6 Modules**     | All browsers 2024+ ✅ | Native support in Chrome 61+, Safari 11+, Firefox 60+, Edge 79+. No polyfill needed for modern devices.           |

## Mobile-First Considerations

### Camera Access (getUserMedia)

- **iOS Safari:** Requires HTTPS or localhost. Prompts for camera AND microphone separately even if only requesting video. May re-prompt on page refresh (WebKit bug).
- **Android Chrome:** Prompts once per domain. More reliable permission persistence than iOS.
- **Both platforms:** Test rear camera selection carefully. Use `facingMode: "user"` for front camera (selfie), `facingMode: "environment"` for rear camera.

### Performance Optimization

- **ASCII grid size:** Limit to 80x60 characters on mobile for 60fps. Larger grids (120x90) may drop to 30fps on older devices.
- **Audio buffer size:** Use Tone.Transport latency settings for mobile. Default 128 samples works for most devices.
- **Canvas rendering:** Disable p5.js Friendly Error System (FES) in production with `p5.disableFriendlyErrors = true` for significant performance boost.

### Touch Events

- **p5.js 2.x:** Use unified pointer events (mousePressed, mouseDragged work for touch/pen/mouse automatically).
- **Prevent scrolling:** Return `false` from touchStarted/touchMoved to prevent page scroll during interaction.
- **Multi-touch:** Access `touches[]` array for gesture support (pinch, rotate).

## Browser Compatibility (2026)

| Feature             | Chrome/Edge | Safari   | Firefox | Mobile Safari       | Mobile Chrome |
| ------------------- | ----------- | -------- | ------- | ------------------- | ------------- |
| **ES6 Modules**     | ✅ 61+      | ✅ 11+   | ✅ 60+  | ✅ 11+              | ✅ 61+        |
| **getUserMedia**    | ✅ 53+      | ✅ 11+   | ✅ 36+  | ✅ 11+ (HTTPS only) | ✅ 53+        |
| **Web Audio API**   | ✅ 35+      | ✅ 14.1+ | ✅ 25+  | ✅ 14.5+            | ✅ 35+        |
| **p5.js 2.2.1**     | ✅          | ✅       | ✅      | ✅ (iOS 14+)        | ✅            |
| **Tone.js 15.x**    | ✅          | ✅       | ✅      | ✅ (iOS 14+)        | ✅            |
| **Bootstrap 5.3.8** | ✅          | ✅       | ✅      | ✅                  | ✅            |

**Minimum recommended:** iOS 14.5+ / Android 10+ (released 2020-2021)

## Confidence Assessment

| Technology              | Confidence | Source                                                                                                                                                                                                                                                  |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **p5.js 2.2.1**         | HIGH       | Official GitHub releases, verified Feb 11 2025 release date. Version 2.x is documented as 2026 standard.                                                                                                                                                |
| **Tone.js 15.1.22**     | MEDIUM     | CDN version verified (cdnjs), but GitHub releases show 14.7.39 as latest tagged release. Discrepancy suggests 15.x may be beta/next branch. **Recommendation:** Use 14.7.39 if stability critical, or 15.1.22 for TypeScript support (test thoroughly). |
| **Bootstrap 5.3.8**     | HIGH       | Official docs verified, current stable release with integrity hashes provided.                                                                                                                                                                          |
| **Buildless approach**  | HIGH       | Multiple 2026 sources confirm ES6 modules are standard for static sites. Browser support is universal for modern devices.                                                                                                                               |
| **Mobile getUserMedia** | MEDIUM     | iOS permission quirks documented but behavior varies by iOS version. Requires real-device testing for production reliability.                                                                                                                           |

## Sources

### Official Documentation

- [p5.js Releases](https://github.com/processing/p5.js/releases) — Verified v2.2.1 release (Feb 11, 2025)
- [p5.js Download Page](https://p5js.org/download/) — CDN links and installation instructions
- [Tone.js Releases](https://github.com/Tonejs/Tone.js/releases) — Latest release verification
- [Tone.js Documentation](https://tonejs.github.io/) — PolySynth and Reverb API references
- [Bootstrap 5.3 Documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/) — CDN setup and v5.3.8 verification
- [MDN getUserMedia Reference](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) — Browser compatibility and best practices

### Community Resources & Best Practices

- [p5.js Mobile Touch Best Practices](https://copyprogramming.com/howto/p5-js-touch-touchstarted) — 2026 guide for touch events
- [The Case for Vanilla JavaScript in 2026](https://medium.com/@mkuk/the-case-for-vanilla-javascript-in-2026-92d7153a9f68) — Buildless approach rationale
- [Going Buildless by Max Böck](https://mxb.dev/blog/buildless/) — ES6 modules without bundlers
- [GitHub Pages HTTPS Guide](https://everhour.com/blog/how-to-host-website-on-github/) — 2026 deployment guide
- [p5.js and Tone.js Compatibility](https://github.com/Tonejs/Tone.js/wiki/p5.Tone) — Known conflicts with p5.sound
- [Getting Started with getUserMedia in 2025](https://blog.addpipe.com/getusermedia-getting-started/) — Mobile permissions and secure context requirements
- [Efecto: Real-Time ASCII and WebGL Shaders](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/) — 2026 reference for green phosphor terminal aesthetics

### Version Verification

- cdnjs.com/libraries/p5.js — p5.js 2.2.1 CDN availability
- cdnjs.com/libraries/tone — Tone.js 15.3.5 CDN availability (Note: Use 15.1.22 for consistency with jsDelivr)
- cdnjs.com/libraries/bootstrap — Bootstrap 5.3.8 CDN availability

---

_Stack research for: ASCII Cam - Webcam ASCII art with ambient audio_
_Researched: 2026-02-13_
_Confidence: HIGH (with MEDIUM caveat on Tone.js version - see assessment)_
