---
phase: 02-webcam-capture
plan: 02
subsystem: webcam-rendering
tags: [p5.js, canvas, webcam, visibility-api, mobile, camera-switching]
dependency-graph:
  requires: [camera-init, camera-switching, stream-cleanup, error-handling]
  provides: [canvas-rendering, visibility-pause, button-wiring, camera-ui]
  affects: [renderer.js, main.js]
tech-stack:
  added: []
  patterns: [raw-video-element, drawingContext-drawImage, visibility-pause, exact-facingMode]
key-files:
  created: []
  modified:
    - js/renderer.js
    - js/main.js
    - js/webcam.js
    - eslint.config.js
decisions:
  - Use raw HTMLVideoElement instead of p5 createElement/createCapture for direct stream control
  - Use drawingContext.drawImage() (Canvas 2D API) instead of p5 image() for HTMLVideoElement compatibility
  - Use { exact: facingMode } when switching cameras to force browser to pick the other camera
  - Auto-resize canvas to match actual video dimensions (prevents aspect ratio stretching on mobile)
  - Touch detection heuristic ('ontouchstart' in window) for showing Switch Camera button on mobile
metrics:
  duration: 15
  completed: 2026-02-14
  tasks: 3
  files: 4
  commits: 5
---

# Phase 2 Plan 2: p5.js Sketch Integration & Button Wiring Summary

**One-liner:** p5.js canvas rendering live webcam feed via Canvas 2D API, visibility pause/resume with noLoop()/loop(), start/stop camera toggle, switch camera with exact facingMode constraint, and auto-resizing canvas to match video aspect ratio.

## What We Built

Wired the complete end-to-end webcam experience:

1. **js/renderer.js** - p5.js sketch with webcam rendering
   - `window.setup()`: Creates canvas in #canvas-container, black background
   - `window.draw()`: Renders webcam frames via `drawingContext.drawImage()`
   - Auto-resizes canvas to match actual video dimensions (fixes mobile stretch)
   - Visibility API listener pauses/resumes both video and p5 draw loop

2. **js/main.js** - Button handlers and module orchestration
   - Start Camera: async init with disabled state, status updates, error display
   - Stop Camera: toggle behavior (green Start ↔ red Stop)
   - Switch Camera: shown on mobile via touch detection, uses exact facingMode
   - Status/error helper functions for UI feedback

3. **js/webcam.js** - Bug fixes for mobile
   - Raw HTMLVideoElement instead of p5 createElement (fixes image() compatibility)
   - `forceExact` parameter for `{ exact: facingMode }` constraint (fixes camera switching)
   - Proper stream cleanup on raw video element

## Technical Implementation

### Raw Video Element Pattern

Replaced p5's `createCapture(VIDEO)` and `createElement('video')` with a plain HTMLVideoElement:

```javascript
const stream = await navigator.mediaDevices.getUserMedia(constraints);
const video = document.createElement('video');
video.srcObject = stream;
video.setAttribute('playsinline', '');
video.muted = true;
video.onloadedmetadata = () => { video.play(); cameraReady = true; };
```

This avoids p5.MediaElement type issues and gives full control over constraints.

### Canvas 2D Drawing

Used `drawingContext.drawImage()` instead of p5's `image()`:

```javascript
drawingContext.drawImage(capture, 0, 0, width, height);
```

This is the standard Canvas 2D API that works directly with HTMLVideoElement.

### Exact FacingMode for Camera Switching

```javascript
facingMode: forceExact ? { exact: facingMode } : facingMode
```

Plain string facingMode is treated as "ideal" (a preference the browser can ignore). Using `{ exact: mode }` forces the browser to pick the specified camera.

### Auto-Resize Canvas

```javascript
const vw = capture.videoWidth;
const vh = capture.videoHeight;
if (vw && vh && (width !== vw || height !== vh)) {
  resizeCanvas(vw, vh);
}
```

Mobile cameras often return different aspect ratios than 320x240. Auto-resizing prevents horizontal stretching.

## Deviations from Plan

### Bug Fixes During Human Verification

**1. [Rule 3 - Blocking] Camera switching not working on mobile**

- **Found during:** Human verification (Task 3)
- **Issue:** `facingMode` passed as plain string was treated as "ideal" preference, browser ignored it
- **Fix:** Added `forceExact` parameter, `switchCamera()` passes `true` to use `{ exact: facingMode }`
- **Files modified:** `js/webcam.js`

**2. [Rule 3 - Blocking] Video stretched horizontally on mobile**

- **Found during:** Human verification (Task 3)
- **Issue:** Canvas hardcoded to 320x240 but mobile cameras return different aspect ratios
- **Fix:** Auto-resize canvas in draw() to match actual `videoWidth`/`videoHeight`
- **Files modified:** `js/renderer.js`

**3. [Rule 3 - Blocking] Black screen after createElement('video') change**

- **Found during:** First fix attempt
- **Issue:** p5's `createElement('video')` creates generic p5.Element, `image()` needs p5.MediaElement
- **Fix:** Use raw `document.createElement('video')` + `drawingContext.drawImage()` (Canvas 2D API)
- **Files modified:** `js/webcam.js`, `js/renderer.js`

## Key Files

### Modified

- **js/renderer.js** (111 lines)
  - p5.js setup/draw with drawingContext rendering
  - Visibility API pause/resume
  - Auto-resize canvas to video dimensions

- **js/main.js** (95 lines)
  - Button click handlers with async/await
  - Start/Stop camera toggle
  - Switch camera with mobile detection
  - Status and error UI helpers

- **js/webcam.js** (168 lines)
  - Raw HTMLVideoElement stream management
  - forceExact facingMode for camera switching
  - Simplified stopCamera() for raw elements

- **eslint.config.js** (+2 lines)
  - Added resizeCanvas, drawingContext to p5 globals

## Verification Results

All success criteria met (human verified on mobile device):

- ✓ Clicking Start Camera shows live webcam feed on canvas
- ✓ Processing pauses automatically when browser tab is hidden
- ✓ Processing resumes when browser tab becomes visible again
- ✓ Switch Camera button appears and toggles between front/rear cameras on mobile
- ✓ Error messages display in the error area when camera fails
- ✓ Status messages update during camera initialization
- ✓ Video aspect ratio correct on mobile (no stretching)
- ✓ npm run lint passes (0 errors, 4 warnings in pre-existing files)
- ✓ npm run format:check passes
- ✓ No new CDN dependencies

## Commits

1. **92ff765** - `feat(02-02): implement p5.js sketch with visibility pause`
2. **6087512** - `feat(02-02): wire camera button handlers and UI integration`
3. **016e3b1** - `feat(02-02): add start/stop camera toggle`
4. **4fc5846** - `chore(02-02): prettier formatting of 02-01-SUMMARY.md`
5. **4f9bbc2** - `fix(02-02): camera switching and aspect ratio on mobile`

## Self-Check: PASSED

**Files modified:**

- ✓ FOUND: js/renderer.js
- ✓ FOUND: js/main.js
- ✓ FOUND: js/webcam.js
- ✓ FOUND: eslint.config.js

**Commits exist:**

- ✓ FOUND: 92ff765
- ✓ FOUND: 6087512
- ✓ FOUND: 016e3b1
- ✓ FOUND: 4fc5846
- ✓ FOUND: 4f9bbc2
