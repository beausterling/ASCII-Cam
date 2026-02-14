---
phase: 02-webcam-capture
plan: 01
subsystem: webcam-access
tags: [webcam, camera, getUserMedia, p5.js, error-handling, mobile]
dependency-graph:
  requires: [p5.js-cdn, bootstrap-ui]
  provides: [camera-init, camera-switching, stream-cleanup, error-handling]
  affects: [main.js, sketch.js]
tech-stack:
  added: []
  patterns: [lazy-camera-init, stream-cleanup, error-mapping]
key-files:
  created:
    - js/webcam.js
  modified:
    - index.html
    - css/style.css
    - eslint.config.js
decisions:
  - Use "ideal" constraints (not "exact") for 320x240 resolution to prevent OverconstrainedError
  - Manual stream track cleanup before camera switching (required for Android Chrome)
  - HTTPS detection via navigator.mediaDevices check
  - All 6 getUserMedia error types mapped to user-friendly messages
metrics:
  duration: 2
  completed: 2026-02-14
  tasks: 2
  files: 4
  commits: 3
---

# Phase 2 Plan 1: Webcam Module & UI Controls Summary

**One-liner:** Camera initialization module with 320x240 ideal constraints, front/rear switching with proper track cleanup, comprehensive error handling for all 6 getUserMedia error types, and complete UI controls for camera access.

## What We Built

Created the foundational webcam access layer with:

1. **js/webcam.js module** - Complete camera management
   - `initCamera(facingMode)`: Initialize camera with getUserMedia constraints
   - `switchCamera()`: Toggle between front ("user") and rear ("environment") cameras
   - `stopCamera()`: Clean up MediaStream tracks and release camera hardware
   - `getCapture()`: Return current p5.MediaElement for use in other modules
   - `isCameraReady()`: Boolean flag for camera initialization state

2. **Camera UI controls** in index.html
   - Start Camera button (btn-success btn-lg)
   - Switch Camera button (hidden by default for mobile display)
   - Status message area for "Initializing camera..." type messages
   - Error message area with soft red styling for permission/hardware errors
   - Canvas container placeholder (ready for Plan 02)

3. **Styling** in css/style.css
   - Camera controls with centered layout
   - Muted gray status messages (min-height to prevent layout shift)
   - Soft red error display with rgba background and border
   - Body layout changed from vertical centering to padding-top (allows content to grow)

4. **ESLint configuration** updated
   - Added `createCapture` and `VIDEO` as p5.js globals

## Technical Implementation

### Camera Initialization Pattern

Used async/await with raw `navigator.mediaDevices.getUserMedia()` before creating p5 capture for better error handling:

```javascript
const constraints = {
  video: {
    width: { ideal: 320 }, // "ideal" not "exact" for compatibility
    height: { ideal: 240 },
    facingMode: facingMode, // "user" or "environment"
  },
  audio: false,
};

const stream = await navigator.mediaDevices.getUserMedia(constraints);
capture = createCapture(VIDEO);
capture.hide();
capture.elt.srcObject = stream;
```

### Stream Cleanup Pattern

Critical for Android Chrome camera switching:

```javascript
if (capture && capture.elt && capture.elt.srcObject) {
  const stream = capture.elt.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop()); // Release camera hardware
  capture.elt.srcObject = null;
}
capture.remove();
```

### Error Handling

Mapped all 6 getUserMedia error types (plus legacy aliases) to user-friendly messages:

- `NotAllowedError` / `PermissionDeniedError` → Permission instructions
- `NotFoundError` / `DevicesNotFoundError` → "No camera found"
- `NotReadableError` / `TrackStartError` → "Camera in use by another app"
- `OverconstrainedError` / `ConstraintNotSatisfiedError` → "Settings not supported"
- `TypeError` → "Configuration error, refresh page"
- `PermissionDismissedError` → "Permission dialog closed"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added p5.js globals to ESLint config**

- **Found during:** Task 1 verification
- **Issue:** ESLint threw errors for `createCapture` and `VIDEO` globals from p5.js CDN
- **Fix:** Added `createCapture: 'readonly'` and `VIDEO: 'readonly'` to `eslint.config.js` globals
- **Files modified:** `eslint.config.js`
- **Commit:** b3c6de6

This was necessary to complete Task 1 verification (lint must pass). The plan didn't specify this change, but it's a standard configuration requirement for using p5.js globals in a linted codebase.

**2. [Rule 2 - Missing Critical Functionality] Improved camera initialization error handling**

- **Found during:** Task 1 implementation
- **Issue:** Plan specified using createCapture directly, but this provides poor error handling visibility
- **Fix:** Use raw `getUserMedia()` first for explicit error catching, then pass stream to createCapture
- **Files modified:** `js/webcam.js`
- **Commit:** b3c6de6

This approach provides better error handling while still using p5.js for the MediaElement creation. The Research doc (Pattern 4) showed both approaches, and combining them gives the best of both worlds.

## Key Files

### Created

- **js/webcam.js** (189 lines)
  - 5 exported functions
  - Error message mapping object with 12 error types
  - Module-level state tracking (capture, cameraReady, currentFacing)
  - Comprehensive inline comments in student voice

### Modified

- **index.html** (+35 lines)
  - Camera controls section with 2 buttons
  - Status and error display areas
  - Canvas container placeholder
  - Maintains Bootstrap dark theme structure

- **css/style.css** (+49 lines)
  - Body layout change (flex → padding-top)
  - 4 new style classes for camera UI
  - Min-height for status area (prevent layout shift)
  - Soft red error styling with rgba

- **eslint.config.js** (+2 lines)
  - Added p5.js globals for createCapture and VIDEO

## Integration Points

### Provides for Plan 02 (Camera Integration)

- `initCamera()` - Call on "Start Camera" button click
- `switchCamera()` - Call on "Switch Camera" button click
- `getCapture()` - Access video stream in p5.js draw() loop
- `isCameraReady()` - Check before processing video frames

### DOM Elements for main.js

- `#btn-start-camera` - Attach click handler
- `#btn-switch-camera` - Attach click handler, show/hide on mobile
- `#camera-status` - Update with status messages
- `#camera-error` - Display error messages from initCamera() result
- `#canvas-container` - Parent for p5.js canvas (Plan 02)

## Verification Results

All success criteria met:

- ✓ js/webcam.js exists with 5 exported functions
- ✓ initCamera uses 320x240 ideal constraints
- ✓ All 6 getUserMedia error types handled with user-friendly messages
- ✓ Stream tracks stopped before camera switching
- ✓ HTTPS detection via navigator.mediaDevices check
- ✓ index.html has all UI elements (buttons, status, error, canvas container)
- ✓ css/style.css has camera control styles
- ✓ Body layout changed from vertical centering to padding-top
- ✓ npm run lint passes (0 errors, 3 warnings in unrelated Phase 1 files)
- ✓ npm run format:check passes
- ✓ No new CDN dependencies (pure p5.js + browser APIs)
- ✓ All code has student-voice inline comments

## Next Steps

Plan 02 will:

1. Wire up button click handlers in main.js
2. Create p5.js sketch.js for canvas setup
3. Integrate webcam video display in p5.js draw() loop
4. Add visibility pause (Page Visibility API)
5. Test camera switching on mobile devices

## Commits

1. **b3c6de6** - `feat(02-01): create webcam module with camera init and error handling`
   - Created js/webcam.js with 5 exported functions
   - Updated ESLint config for p5.js globals

2. **3b5ddea** - `feat(02-01): add camera UI controls and styles`
   - Updated index.html with camera controls UI
   - Updated css/style.css with camera styles

3. **65cb67e** - `chore(02-01): prettier formatting of planning docs and webcam.js`
   - Prettier formatting pass on modified files

## Self-Check: PASSED

**Files created:**

- ✓ FOUND: js/webcam.js

**Files modified:**

- ✓ FOUND: index.html
- ✓ FOUND: css/style.css
- ✓ FOUND: eslint.config.js

**Commits exist:**

- ✓ FOUND: b3c6de6
- ✓ FOUND: 3b5ddea
- ✓ FOUND: 65cb67e

**Exported functions in webcam.js:**

- ✓ initCamera
- ✓ switchCamera
- ✓ stopCamera
- ✓ getCapture
- ✓ isCameraReady

**UI elements in index.html:**

- ✓ btn-start-camera
- ✓ btn-switch-camera
- ✓ camera-status
- ✓ camera-error
- ✓ canvas-container

**CSS styles:**

- ✓ .camera-controls
- ✓ .camera-status
- ✓ .camera-error
- ✓ .canvas-container
