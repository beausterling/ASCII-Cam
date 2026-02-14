# Phase 2: Webcam Capture - Research

**Researched:** 2026-02-14
**Domain:** Browser webcam access via getUserMedia and p5.js createCapture
**Confidence:** HIGH

## Summary

Phase 2 implements webcam capture using p5.js's `createCapture()` function, which wraps the WebRTC `getUserMedia()` API. The implementation must handle camera permissions, configure low-resolution capture for mobile performance, support front/rear camera switching on mobile devices, and pause processing when the browser tab is hidden.

The primary challenge is cross-browser/cross-platform compatibility for camera switching and proper error handling. Mobile devices require explicit `facingMode` constraints to select between front ("user") and rear ("environment") cameras, and switching cameras requires manually stopping the previous MediaStream tracks on Android Chrome before creating a new capture.

**Primary recommendation:** Use p5.js `createCapture(constraints)` with explicit width/height and facingMode constraints. Implement comprehensive error handling for the six common getUserMedia errors with user-friendly messaging. Use Page Visibility API to pause processing when tab is hidden. Always test on both iOS Safari and Android Chrome, as media stream cleanup behaviors differ.

## Standard Stack

### Core

| Library             | Version            | Purpose                                     | Why Standard                                                            |
| ------------------- | ------------------ | ------------------------------------------- | ----------------------------------------------------------------------- |
| p5.js               | Already in project | Webcam capture via `createCapture()`        | Wraps getUserMedia, returns p5.MediaElement for easy canvas integration |
| Native WebRTC       | Browser API        | Underlying `getUserMedia()` for constraints | Industry standard for browser media access, widely supported since 2017 |
| Page Visibility API | Browser API        | Detect tab hidden/visible state             | Standard way to pause processing when tab inactive                      |

### Supporting

None required - all functionality available in p5.js core and browser APIs.

### Alternatives Considered

| Instead of           | Could Use                                   | Tradeoff                                                                                          |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| p5.js createCapture  | Raw `navigator.mediaDevices.getUserMedia()` | More control over MediaStream but requires manual video element management and canvas integration |
| Automatic resolution | User-selected resolution                    | Better UX but adds UI complexity; 320x240 is sufficient for ASCII conversion                      |

**Installation:**
No installation needed - p5.js already included via CDN, WebRTC and Page Visibility are native browser APIs.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── webcam.js          # Camera initialization, switching, error handling
├── sketch.js          # p5.js setup/draw, visibility handling
└── ascii.js           # (Phase 3) ASCII conversion processing
```

### Pattern 1: Lazy Camera Initialization

**What:** Don't call `createCapture()` in `setup()` - wait for user interaction (button click) to request permissions.
**When to use:** Always - autoplay camera on page load is bad UX and may fail on mobile browsers.
**Example:**

```javascript
// Source: p5.js best practices + getUserMedia patterns
let capture;
let cameraReady = false;

function setup() {
  createCanvas(640, 480);
  // Do NOT call createCapture here
}

function startCamera() {
  const constraints = {
    video: {
      width: 320,
      height: 240,
      facingMode: 'user',
    },
    audio: false,
  };

  capture = createCapture(constraints, streamReady);
  capture.hide(); // Don't show default video element
}

function streamReady() {
  cameraReady = true;
}

function draw() {
  if (cameraReady) {
    image(capture, 0, 0);
  }
}
```

### Pattern 2: Camera Switching with Stream Cleanup

**What:** When switching between front/rear cameras, manually stop MediaStream tracks before creating new capture.
**When to use:** Mobile devices with multiple cameras - required for Android Chrome, harmless on iOS Safari.
**Example:**

```javascript
// Source: https://github.com/processing/p5.js/issues/4140
let currentFacing = 'user'; // "user" or "environment"

function stopCapture() {
  if (capture && capture.elt && capture.elt.srcObject) {
    let stream = capture.elt.srcObject;
    let tracks = stream.getTracks();

    tracks.forEach((track) => track.stop());
    capture.elt.srcObject = null;
  }
}

function switchCamera() {
  stopCapture();
  capture.remove();

  currentFacing = currentFacing === 'user' ? 'environment' : 'user';

  const constraints = {
    video: {
      width: 320,
      height: 240,
      facingMode: { exact: currentFacing },
    },
    audio: false,
  };

  capture = createCapture(constraints);
  capture.hide();
}
```

### Pattern 3: Page Visibility Pause

**What:** Use `visibilitychange` event to pause processing when tab is hidden.
**When to use:** Always - saves battery and CPU on mobile, prevents unnecessary processing.
**Example:**

```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
let processingPaused = false;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    processingPaused = true;
    // Optionally pause capture stream
    if (capture && capture.elt) {
      capture.elt.pause();
    }
  } else {
    processingPaused = false;
    if (capture && capture.elt) {
      capture.elt.play();
    }
  }
});

function draw() {
  if (processingPaused || !cameraReady) {
    return; // Skip processing
  }
  // Normal draw logic here
}
```

### Pattern 4: Comprehensive Error Handling

**What:** Handle all six common getUserMedia errors with user-friendly messages.
**When to use:** Always - permissions and hardware failures are common, especially on mobile.
**Example:**

```javascript
// Source: https://blog.addpipe.com/common-getusermedia-errors/
function startCamera() {
  const constraints = {
    video: { width: 320, height: 240, facingMode: 'user' },
    audio: false,
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      // Success - create p5 capture from stream
      // (Or use createCapture directly - it handles this internally)
      cameraReady = true;
    })
    .catch((err) => {
      handleCameraError(err);
    });
}

function handleCameraError(err) {
  let userMessage = '';

  switch (err.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      userMessage =
        'Please grant camera permissions in your browser settings to continue.';
      break;

    case 'NotFoundError':
    case 'DevicesNotFoundError':
      userMessage = 'No camera found. Please connect a camera and try again.';
      break;

    case 'NotReadableError':
    case 'TrackStartError':
      userMessage =
        'Your camera is already in use by another application. Please close other programs and try again.';
      break;

    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      userMessage =
        "Your device doesn't support the requested video settings. Please try with a different camera.";
      break;

    case 'TypeError':
      userMessage =
        'Configuration error. Please refresh the page and try again.';
      break;

    case 'PermissionDismissedError':
      userMessage =
        'Permission dialog was closed. Please try again and allow access when prompted.';
      break;

    default:
      userMessage = `Camera error: ${err.name}. Please try again.`;
  }

  console.error('Camera error:', err);
  displayErrorMessage(userMessage); // Show in UI
}
```

### Anti-Patterns to Avoid

- **Calling createCapture() in draw():** Creates new capture every frame, crashes the browser. Always create in setup() or on user interaction, never in draw().
- **Not calling capture.hide():** Shows both the default video element AND your canvas, confusing UX.
- **Using exact constraints without fallback:** `{ exact: "environment" }` fails if rear camera unavailable. Use preference `"environment"` or handle error gracefully.
- **Not stopping tracks before switching cameras:** Works on iOS Safari but fails on Android Chrome with OverconstrainedError.
- **Testing only on desktop:** Mobile has different permission flows, camera switching, and performance characteristics.

## Don't Hand-Roll

| Problem                                   | Don't Build                       | Use Instead                             | Why                                                                                                                            |
| ----------------------------------------- | --------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Video element creation and stream binding | Custom video element management   | `p5.createCapture()`                    | Handles browser differences, autoplay policies, track binding                                                                  |
| Permission request UI                     | Custom browser permission dialogs | Native browser prompts via getUserMedia | Only native prompts can grant actual permissions; custom UIs are pre-prompts only                                              |
| Cross-browser error normalization         | Error name mapping tables         | Detect error by name, map to category   | Browsers use different names (NotAllowedError vs PermissionDeniedError); mapping needed but don't rebuild getUserMedia wrapper |
| Resolution downscaling                    | Manual canvas resize/sample       | getUserMedia constraints with ideal/max | Browser can downscale natively, often with hardware acceleration                                                               |
| Tab visibility detection                  | setInterval checking focus/blur   | Page Visibility API                     | focus/blur don't fire reliably; visibilitychange is the standard                                                               |

**Key insight:** The WebRTC getUserMedia API has complex browser differences and edge cases (iOS vs Android, Chrome vs Firefox, permission persistence). Use p5.js's `createCapture()` wrapper to handle most of this, and focus custom code on error messaging and camera switching logic.

## Common Pitfalls

### Pitfall 1: HTTPS Requirement Not Met

**What goes wrong:** `navigator.mediaDevices` is `undefined`, causing TypeError before getUserMedia is even called.
**Why it happens:** WebRTC APIs only work in secure contexts (HTTPS, localhost, or file://).
**How to avoid:** Always develop on `localhost` or use HTTPS in production. Test with `if (navigator.mediaDevices)` before calling getUserMedia.
**Warning signs:** "Cannot read property 'getUserMedia' of undefined" error, only happens in deployed environment not local dev.

### Pitfall 2: Camera Already in Use

**What goes wrong:** NotReadableError (Firefox) or TrackStartError (Chrome) when requesting camera access.
**Why it happens:** Another tab, app, or process has exclusive lock on camera. On Windows especially, only one app can access webcam at a time.
**How to avoid:** Properly stop tracks when switching cameras or closing app. Show helpful error message directing user to close other apps.
**Warning signs:** Works on first load, fails on second load without page refresh. Works on Mac, fails on Windows.

### Pitfall 3: Mobile Camera Switching Fails

**What goes wrong:** OverconstrainedError when trying to switch from front to rear camera or vice versa.
**Why it happens:** Previous MediaStream tracks not stopped before requesting new facingMode. Android Chrome keeps old stream alive, new constraint conflicts.
**How to avoid:** Always call `track.stop()` on all tracks of `capture.elt.srcObject` before calling `capture.remove()` and creating new capture.
**Warning signs:** Works on iOS Safari, fails on Android Chrome. First camera works, switching fails.

### Pitfall 4: Low Confidence in Resolution Support

**What goes wrong:** Requested 320x240 resolution not available on device, getUserMedia returns different resolution.
**Why it happens:** Not all devices support all resolutions. Browser may downscale from native resolution or reject with OverconstrainedError.
**How to avoid:** Use `ideal: 320` instead of `exact: 320` for width/height. Browser will get as close as possible. Verify actual resolution with `capture.width` after stream starts.
**Warning signs:** Works on some devices, fails on others. Error mentions "OverconstrainedError" with width or height constraint name.

### Pitfall 5: Permission Denied Silently

**What goes wrong:** User denies permission, app shows loading spinner forever with no error message.
**Why it happens:** getUserMedia promise rejected but error not caught or displayed to user.
**How to avoid:** Always add `.catch()` handler to getUserMedia promise (or use try/catch with async/await). Show user-friendly error message in UI.
**Warning signs:** Permission prompt shown, user clicks "Block", nothing happens in app UI.

### Pitfall 6: Processing Continues When Tab Hidden

**What goes wrong:** Battery drains quickly, device heats up, even though user can't see the app.
**Why it happens:** p5.js draw() loop continues at 60fps even when tab is hidden. Webcam keeps capturing, ASCII conversion keeps processing.
**How to avoid:** Add `visibilitychange` event listener, set flag to skip draw() processing when `document.hidden` is true.
**Warning signs:** Mobile device gets hot when app tab is in background. Battery drains faster than expected.

## Code Examples

Verified patterns from official sources:

### Basic Webcam Capture with p5.js

```javascript
// Source: https://p5js.org/reference/p5/createCapture/
let capture;

function setup() {
  createCanvas(640, 480);
  capture = createCapture(VIDEO);
  capture.hide();
}

function draw() {
  image(capture, 0, 0, 640, 480);
}
```

### Low Resolution Capture with Constraints

```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
const constraints = {
  audio: false,
  video: {
    width: { ideal: 320 },
    height: { ideal: 240 },
    facingMode: 'user',
  },
};

capture = createCapture(constraints);
capture.hide();
```

### Switching Between Front and Rear Cameras

```javascript
// Source: https://github.com/processing/p5.js/issues/4140
function switchCamera() {
  // Stop existing stream
  if (capture && capture.elt && capture.elt.srcObject) {
    let stream = capture.elt.srcObject;
    let tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    capture.elt.srcObject = null;
  }

  capture.remove();

  // Toggle facing mode
  const newFacing = currentFacing === 'user' ? 'environment' : 'user';
  currentFacing = newFacing;

  // Create new capture
  const constraints = {
    video: {
      width: { ideal: 320 },
      height: { ideal: 240 },
      facingMode: { exact: newFacing },
    },
    audio: false,
  };

  capture = createCapture(constraints);
  capture.hide();
}
```

### Pausing Processing When Tab Hidden

```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
let isPaused = false;

document.addEventListener('visibilitychange', () => {
  isPaused = document.hidden;
});

function draw() {
  if (isPaused) return;

  // Normal processing here
  image(capture, 0, 0);
}
```

### Error Handling with User Feedback

```javascript
// Source: https://blog.addpipe.com/common-getusermedia-errors/
function startCamera() {
  const constraints = {
    video: { width: { ideal: 320 }, height: { ideal: 240 } },
    audio: false,
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      // Success
      cameraActive = true;
    })
    .catch((err) => {
      // Map error to user message
      const errorMessages = {
        NotAllowedError: 'Please allow camera access in your browser.',
        PermissionDeniedError: 'Please allow camera access in your browser.',
        NotFoundError: 'No camera found. Please connect a camera.',
        DevicesNotFoundError: 'No camera found. Please connect a camera.',
        NotReadableError: 'Camera is in use by another application.',
        TrackStartError: 'Camera is in use by another application.',
        OverconstrainedError:
          "Your camera doesn't support the requested settings.",
        ConstraintNotSatisfiedError:
          "Your camera doesn't support the requested settings.",
      };

      const message = errorMessages[err.name] || `Camera error: ${err.message}`;
      showError(message);
    });
}
```

## State of the Art

| Old Approach                              | Current Approach                                      | When Changed | Impact                                                |
| ----------------------------------------- | ----------------------------------------------------- | ------------ | ----------------------------------------------------- |
| navigator.getUserMedia() (callback-based) | navigator.mediaDevices.getUserMedia() (Promise-based) | ~2016        | Old API deprecated; use Promises or async/await       |
| Vendor prefixes (webkit, moz)             | Unprefixed standard API                               | ~2017        | No prefixes needed in modern browsers                 |
| Global constraints object                 | Per-call constraints                                  | ~2018        | Each getUserMedia call can have different constraints |
| No facingMode support                     | facingMode: "user" / "environment"                    | ~2017        | Mobile camera selection now standard                  |

**Deprecated/outdated:**

- `navigator.getUserMedia()`: Use `navigator.mediaDevices.getUserMedia()` instead
- Vendor-prefixed APIs (`navigator.webkitGetUserMedia`): No longer needed in 2026
- `exact` constraints for everything: Use `ideal` for better compatibility, reserve `exact` for critical requirements like facingMode

## Open Questions

1. **Does p5.js createCapture support all getUserMedia constraints?**
   - What we know: p5.js documentation states "with reference to W3C specification for possible properties"
   - What's unclear: Whether p5.js passes through ALL constraints or only a subset
   - Recommendation: Test advanced constraints (frameRate, aspectRatio) and fall back to raw getUserMedia if needed

2. **How to detect mobile device capabilities before showing camera switch button?**
   - What we know: Can check for multiple video input devices via `navigator.mediaDevices.enumerateDevices()`
   - What's unclear: Whether this requires camera permission first, or works before permission granted
   - Recommendation: Show camera switch button on all mobile devices (user-agent detection), hide if switch fails

3. **What happens to webcam stream when device goes to sleep?**
   - What we know: Page Visibility API fires when tab hidden, but sleep may be different
   - What's unclear: Whether stream stops automatically, needs manual cleanup, or continues
   - Recommendation: Test on actual mobile devices, add beforeunload cleanup as safety net

## Sources

### Primary (HIGH confidence)

- [p5.js createCapture() Reference](https://p5js.org/reference/p5/createCapture/) - Official p5.js API documentation
- [MDN: getUserMedia() method](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) - Official WebRTC API documentation
- [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) - Official browser API documentation
- [p5.js Issue #4140: Switching cameras](https://github.com/processing/p5.js/issues/4140) - Verified solution for camera switching

### Secondary (MEDIUM confidence)

- [DigitalOcean: Front and Rear Camera Access](https://www.digitalocean.com/community/tutorials/front-and-rear-camera-access-with-javascripts-getusermedia) - Tutorial with code examples
- [AddPipe: Common getUserMedia Errors](https://blog.addpipe.com/common-getusermedia-errors/) - Comprehensive error catalog
- [AddPipe: getUserMedia Video Constraints](https://blog.addpipe.com/getusermedia-video-constraints/) - Constraints reference
- [WebRTC Samples: getUserMedia Resolution](https://webrtc.github.io/samples/src/content/getusermedia/resolution/) - Interactive resolution testing

### Tertiary (LOW confidence)

- [MDN Blog: Using Page Visibility API](https://developer.mozilla.org/en-US/blog/using-the-page-visibility-api/) - Usage examples (blog, not official spec)
- [p5.js Wiki: Optimizing Code for Performance](https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance) - Community wiki

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - p5.js createCapture and getUserMedia are well-documented, widely used APIs
- Architecture: HIGH - Patterns verified from official p5.js issues and MDN documentation
- Pitfalls: HIGH - Error types and behaviors documented in official MDN spec and verified by AddPipe's testing
- Mobile camera switching: MEDIUM - Solution verified in GitHub issue, but platform differences exist
- Resolution support: MEDIUM - Behavior varies by device; ideal vs exact constraints mitigate issues

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - stable APIs, but browser updates may affect edge cases)
