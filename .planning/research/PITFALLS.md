# Pitfalls Research

**Domain:** Webcam ASCII Art + Web Audio Applications
**Researched:** 2026-02-13
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: HTTPS-Only Requirement Not Met Until Deployment

**What goes wrong:**
Developers build locally using `file://` or `http://localhost`, test successfully, then deploy to GitHub Pages only to discover getUserMedia() silently fails in production because the app requires HTTPS for camera access. navigator.mediaDevices becomes undefined in insecure contexts, causing TypeError.

**Why it happens:**
MDN documentation states: "getUserMedia() must only be used in secure contexts (HTTPS or localhost)." Developers test locally where localhost is exempt from the HTTPS requirement, then deploy to non-HTTPS environments or forget that some hosting platforms require manual HTTPS configuration.

**How to avoid:**
- GitHub Pages automatically serves content via HTTPS (https://username.github.io/repo), but verify the published URL uses https:// not http://
- Always check `if (navigator.mediaDevices === undefined)` before attempting getUserMedia() calls
- Test in production-like HTTPS environment before final deployment (use GitHub Pages preview branches)

**Warning signs:**
- Camera works locally but not after deployment
- Console shows "navigator.mediaDevices is undefined"
- TypeError when calling getUserMedia()

**Phase to address:**
Foundation phase (initial setup) - verify HTTPS context and add defensive checks before implementing camera features.

---

### Pitfall 2: Audio Context Starts Before User Gesture (Mobile Autoplay Policy)

**What goes wrong:**
Audio fails silently on mobile devices. Developers call Tone.start() or attempt to play audio on page load, but mobile browsers (iOS Safari, Chrome Android) block autoplay. AudioContext remains in "suspended" state indefinitely, and no sound plays despite code appearing to execute correctly.

**Why it happens:**
Tone.js documentation explicitly states: "Most browsers will not play any audio until a user clicks something (like a play button)." Browsers enforce strict autoplay policies to prevent unwanted audio on mobile data connections. AudioContext state transitions from "suspended" to "running" only after explicit user interaction.

**How to avoid:**
- ALWAYS invoke `await Tone.start()` inside a user event handler (button click, tap)
- Add a visible "Start Audio" or "Enable Sound" button that users must click before audio plays
- Check Tone.context.state and only proceed if state === "running"
- Never attempt Tone.Transport.start() or synth.triggerAttack() before Tone.start() completes

**Warning signs:**
- Audio works in desktop Chrome but not on mobile Safari or Chrome Android
- Console shows no errors but audio doesn't play
- AudioContext.state logs as "suspended" after attempting playback

**Phase to address:**
Audio integration phase - implement user gesture requirement from the start, not as an afterthought. Build UI with explicit "start" button.

---

### Pitfall 3: Camera Tracks Not Stopped, Causing Resource Leaks

**What goes wrong:**
Camera light stays on after user navigates away or closes the app. Multiple camera instances accumulate in memory, draining battery and eventually crashing the browser on mobile devices. Users report "creepy" privacy concerns when camera indicator persists.

**Why it happens:**
MDN documentation warns: "Stop existing tracks before switching cameras." Calling getUserMedia() creates MediaStreamTracks that continue running until explicitly stopped. Developers forget to call track.stop() when switching cameras, closing modals, or navigating between pages.

**How to avoid:**
```javascript
// CRITICAL: Stop all tracks before switching or closing
function stopCamera(mediaStream) {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => {
      track.stop(); // Release camera hardware
    });
  }
}

// Before switching cameras
stopCamera(currentStream);
const newStream = await navigator.mediaDevices.getUserMedia(constraints);

// On page unload
window.addEventListener('beforeunload', () => {
  stopCamera(videoStream);
});
```

**Warning signs:**
- Camera light remains on after switching views
- Mobile device battery drains faster than expected
- Browser DevTools shows multiple active MediaStreamTracks
- Memory usage grows continuously

**Phase to address:**
Camera implementation phase - build cleanup into camera initialization from the beginning. Add beforeunload and visibility change handlers.

---

### Pitfall 4: Canvas Animation Loop Never Stops (Battery Drain)

**What goes wrong:**
requestAnimationFrame() continues running at 60fps even when browser tab is hidden or user switches apps on mobile. Battery drains rapidly (30-40% per hour), device overheats, and users abandon the app. On iOS, continuous animation prevents garbage collection, causing memory to balloon.

**Why it happens:**
Developers start animation loop with requestAnimationFrame() but never cancel it. Research shows "constant request for animation frames is killing battery life on mobile device" and browsers only throttle (don't stop) RAF in background tabs. For webcam ASCII art, continuously processing 30+ video frames per second and redrawing canvas is extremely expensive.

**How to avoid:**
```javascript
let animationId = null;
let isRunning = false;

function startAnimation() {
  if (!isRunning) {
    isRunning = true;
    animate();
  }
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
    isRunning = false;
  }
}

function animate() {
  if (!isRunning) return;

  // Process video frame, render ASCII

  animationId = requestAnimationFrame(animate);
}

// Stop when tab hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAnimation();
  } else {
    startAnimation();
  }
});
```

**Warning signs:**
- Mobile device becomes hot during use
- Battery percentage drops rapidly
- Browser DevTools Performance tab shows continuous activity in background
- Users complain about battery drain

**Phase to address:**
Animation/rendering phase - implement pause/resume controls and visibility change handlers from the start.

---

### Pitfall 5: Processing Full-Resolution Video Instead of Downsampling

**What goes wrong:**
App requests 1280x720 or 1920x1080 video, then processes every pixel every frame. On mobile, this means analyzing 900,000+ pixels 30 times per second. Frame rate drops to 5-10fps, UI becomes unresponsive, and mobile browsers crash with "Total canvas memory use exceeds the maximum limit."

**Why it happens:**
Developers don't realize that ASCII art doesn't need high resolution input. For a 80x24 character terminal display (1,920 characters), processing 1920x1080 video (2,073,600 pixels) is 1000x more data than needed. p5.js documentation warns: "canvas size indeed impacts sketch's performance, and written code quality is even more important."

**How to avoid:**
- Request low-resolution video: `{ video: { width: { ideal: 320 }, height: { ideal: 240 } } }`
- Or downsample after capture: draw video to small canvas, sample pixels from downsampled version
- Match video resolution to ASCII grid dimensions (80 chars wide ≈ 320px input)
- On mobile, use CSS to scale small canvas to full screen instead of rendering large canvas

```javascript
// Good: Small canvas, CSS scaled
const asciiCanvas = createCanvas(320, 240);
asciiCanvas.style('width', '100%');
asciiCanvas.style('height', 'auto');

// Bad: Full HD canvas on mobile
const asciiCanvas = createCanvas(1920, 1080); // WILL CRASH
```

**Warning signs:**
- Frame rate below 15fps on mobile
- Browser shows "Canvas exceeds memory limit" error
- Visible lag between user movement and ASCII update
- Mobile Safari force-reloads page due to memory pressure

**Phase to address:**
Camera setup phase - constrain resolution from the start. Test on actual mobile devices, not just desktop Chrome DevTools mobile emulation.

---

### Pitfall 6: Using p5.js Friendly Error System in Production

**What goes wrong:**
App runs 5-10x slower than expected. Animation that should run at 60fps struggles to reach 20fps. p5.js documentation explicitly states: "The Friendly Error System can significantly slow down your code, up to ~10x in some cases."

**Why it happens:**
Developers use p5.js development build during production. The Friendly Error System adds runtime checks for every function call to provide helpful error messages, but this overhead is catastrophic for performance-critical applications like real-time video processing.

**How to avoid:**
- Use p5.min.js (minified production build) for deployment
- Disable Friendly Error System explicitly: `p5.disableFriendlyErrors = true;` at top of sketch
- Verify in browser DevTools: production build should be minified single-line code
- Test performance with production build before final deployment

```html
<!-- Development -->
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>

<!-- Production -->
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js"></script>
```

**Warning signs:**
- Profiler shows p5.js internal functions consuming 40%+ execution time
- Frame rate improves dramatically when disabling features
- Mobile performance significantly worse than desktop despite similar hardware specs

**Phase to address:**
Build/deployment phase - configure production build process to use minified libraries.

---

### Pitfall 7: iOS Camera Switching Requires Complete Stream Restart

**What goes wrong:**
User taps "switch camera" button. On Android, camera switches instantly. On iOS Safari, button does nothing or causes app to freeze. Multiple taps create duplicate video streams, memory leaks, and eventually crash mobile Safari.

**Why it happens:**
iOS Safari bug documented in WebKit: "iOS calling getUserMedia() again kills video display of first getUserMedia()." iOS browsers also "don't expose actual camera device IDs due to privacy restrictions," making device-based switching ineffective. Additionally, "on iOS the camera initially shown as selected may not be the same as the camera that's actually in use."

**How to avoid:**
```javascript
// iOS-safe camera switching
async function switchCamera() {
  // 1. Stop existing stream completely
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }

  // 2. Toggle facing mode
  useFrontCamera = !useFrontCamera;

  // 3. Request new stream with facingMode constraint
  try {
    const constraints = {
      video: {
        facingMode: useFrontCamera ? 'user' : 'environment'
      }
    };
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);

    // 4. Update video element
    videoElement.srcObject = currentStream;
  } catch (err) {
    console.error('Camera switch failed:', err);
    // Fallback: retry with opposite camera
  }
}
```

**Warning signs:**
- Camera switching works on Chrome Android but not iOS Safari
- Video element goes black after switch attempt
- Multiple camera permission prompts on iOS
- Memory usage spikes when switching cameras

**Phase to address:**
Camera controls phase - implement iOS-specific switching logic from the start. Test on actual iOS devices (simulator doesn't accurately reproduce camera behavior).

---

### Pitfall 8: Permission Denied Has No Recovery UI

**What goes wrong:**
User accidentally clicks "Block" on camera permission prompt. App shows blank screen or error message with no way to recover. User doesn't know how to manually reset permissions in browser settings, abandons the app.

**Why it happens:**
Developers only handle the success case of getUserMedia(). MDN documentation lists 6+ error types (NotAllowedError, NotFoundError, NotReadableError, OverconstrainedError, SecurityError, TypeError), but developers rarely implement user-friendly recovery for each. Once permission is denied, calling getUserMedia() again immediately rejects without showing the prompt.

**How to avoid:**
```javascript
async function requestCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return stream;
  } catch (err) {
    switch(err.name) {
      case 'NotAllowedError':
        showPermissionHelp({
          title: 'Camera Access Blocked',
          message: 'To use ASCII Cam, you need to allow camera access.',
          instructions: {
            chrome: 'Click the camera icon in the address bar and select "Allow"',
            safari: 'Go to Settings > Safari > Camera and select "Allow"',
            firefox: 'Click the permissions icon and enable camera'
          }
        });
        break;
      case 'NotFoundError':
        showError('No camera found. Please connect a camera and refresh.');
        break;
      case 'NotReadableError':
        showError('Camera is already in use by another application.');
        break;
      default:
        showError(`Camera error: ${err.message}`);
    }
    throw err;
  }
}
```

**Warning signs:**
- Users report "app doesn't work" without specifics
- High bounce rate on initial load
- Support requests asking how to "turn camera back on"

**Phase to address:**
Camera permission handling phase - build comprehensive error UI before implementing main features.

---

### Pitfall 9: Exact Constraints Cause OverconstrainedError on Mobile

**What goes wrong:**
App requests exact resolution or frame rate that mobile device doesn't support. getUserMedia() promise rejects with OverconstrainedError, leaving user with blank screen. What worked perfectly on developer's 1080p webcam fails on 720p phone camera.

**Why it happens:**
Developers use `exact` constraints for testing without realizing mobile devices have limited camera capabilities. MDN warns: "If you use exact or min modifiers that can't be satisfied, the promise will reject with OverconstrainedError." Different mobile devices support different resolutions, and iOS devices may only have one facing mode available.

**How to avoid:**
```javascript
// Bad: Exact constraints (fragile)
const constraints = {
  video: {
    width: { exact: 1280 },
    height: { exact: 720 },
    frameRate: { exact: 30 }
  }
};

// Good: Ideal constraints with fallback
const constraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 }
  }
};

// Best: Prefer facingMode over device ID
const constraints = {
  video: {
    facingMode: 'user', // Prefer front camera (not exact)
    width: { ideal: 640 }
  }
};
```

**Warning signs:**
- App works on some devices but not others
- OverconstrainedError in console showing which constraint failed
- Browser returns different resolution than requested but app expects exact match

**Phase to address:**
Camera constraints phase - use ideal/min/max instead of exact. Test on multiple device types.

---

### Pitfall 10: Audio Context Interrupted State Not Handled (iOS)

**What goes wrong:**
Audio plays successfully on iOS, then user receives phone call or plugs/unplugs headphones. Audio stops but never restarts, even after interruption ends. App appears broken with no indication of what happened.

**Why it happens:**
Safari and mobile Safari interrupt AudioContext for phone calls, browser dialogs, or headphone jack changes. AudioContext enters "interrupted" state (not just "suspended"). Tone.js issue #767 notes: "Safari and mobile Safari will interrupt the audio context... Tone's context.resume() only checks for a suspended state."

**How to avoid:**
```javascript
// Listen for interruptions
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    // Page hidden - pause audio
    await Tone.Transport.pause();
  } else {
    // Page visible - check context state
    if (Tone.context.state === 'suspended' ||
        Tone.context.state === 'interrupted') {
      try {
        await Tone.context.resume();
        await Tone.Transport.start();
      } catch (err) {
        console.error('Failed to resume audio:', err);
        // Show UI to restart audio
      }
    }
  }
});

// iOS-specific: Handle interruption end
Tone.context.addEventListener('statechange', () => {
  if (Tone.context.state === 'running' && wasInterrupted) {
    // Resume playback
    Tone.Transport.start();
    wasInterrupted = false;
  }
});
```

**Warning signs:**
- Audio stops working after phone call on iOS
- Users report needing to refresh page to hear sound again
- AudioContext.state shows "interrupted" instead of "running" or "suspended"

**Phase to address:**
Audio resilience phase - implement interruption handling after basic audio works.

---

### Pitfall 11: Memory Leaks from Canvas drawImage() in Animation Loop

**What goes wrong:**
App starts smooth at 60fps, but after 2-3 minutes, frame rate drops to 15fps, then 5fps, then browser tab crashes. Memory usage grows from 100MB to 2GB+. Mobile devices crash faster due to limited RAM.

**Why it happens:**
Electron issue #22417 documents: "Calling CanvasRenderingContext2D.drawImage allocates memory in the renderer process that isn't released until the canvas is displayed. Calling the method 5 times per second for a few minutes can allocate more than 4GB of memory." For webcam ASCII art, drawing video frame to canvas 30+ times per second creates massive memory pressure.

**How to avoid:**
- Reuse same canvas instead of creating new ones
- Clear canvas between frames: `ctx.clearRect(0, 0, canvas.width, canvas.height)`
- Don't create new Image objects every frame
- Use single video element as source, don't clone
- For p5.js: avoid `loadImage()` in draw loop
- Test for 5+ minutes continuously to catch slow memory leaks

```javascript
// Bad: Creates memory leak
function draw() {
  const tempCanvas = createCanvas(width, height); // NEW CANVAS EVERY FRAME
  tempCanvas.drawImage(video, 0, 0);
}

// Good: Reuse canvas
let offscreenCanvas = createCanvas(width, height);
function draw() {
  offscreenCanvas.clear(); // Reuse same canvas
  offscreenCanvas.drawImage(video, 0, 0);
}
```

**Warning signs:**
- Performance degradation over time (not immediate)
- Chrome DevTools Memory profiler shows continuous growth
- Browser "Page Unresponsive" warning after several minutes
- Mobile Safari force-reloads due to memory pressure

**Phase to address:**
Performance optimization phase - use Chrome DevTools Memory profiler to detect leaks during extended testing.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using p5.js development build | Helpful error messages during debugging | 5-10x performance penalty, unusable on mobile | Only during initial development, never in production |
| Skipping camera track cleanup | Fewer lines of code, simpler logic | Resource leaks, battery drain, privacy concerns | Never acceptable |
| Hardcoding video resolution to 1920x1080 | Looks sharp on developer's monitor | Crashes on mobile, OverconstrainedError on many devices | Never acceptable |
| No error handling for getUserMedia | Faster initial prototype | Users with blocked permissions see blank screen | Only in first 2 hours of prototyping |
| Starting audio on page load without user gesture | Convenient UX in desktop testing | Silent failure on all mobile devices | Never acceptable (violates browser policies) |
| Using native Math.random() instead of p5.random() | 33% faster (284ms vs 190ms per 10M calls) | Loses p5.js randomSeed() reproducibility | Acceptable for non-deterministic animations |
| CSS scaling small canvas to full screen | Smooth performance on mobile | Pixelated appearance (retro aesthetic may be acceptable) | Acceptable for ASCII art (pixelation matches aesthetic) |
| Processing every video frame | Responsive to motion | Unnecessary CPU/battery usage | Only if frame rate throttling implemented (process every 2nd or 3rd frame) |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages | Deploying without verifying HTTPS URL | Check published URL is https://username.github.io/repo, not http:// |
| Bootstrap 5 | Using Bootstrap modals containing camera - camera stops when modal closes | Stop camera tracks in modal close handler, or use custom modal without Bootstrap's JavaScript |
| Tone.js Transport | Starting Transport before Tone.start() completes | Always await Tone.start() in user gesture handler before Transport.start() |
| p5.js CDN | Forgetting to switch from p5.js to p5.min.js in production | Use separate index.html for dev/prod or build script to swap CDN URLs |
| iOS Safari | Assuming facingMode 'user' is always available | Use preference `facingMode: 'user'` not exact, handle OverconstrainedError if only rear camera exists |
| Chrome Mobile | Requesting microphone for audio output (Tone.js only needs output, not input) | Only request video: `getUserMedia({ video: true, audio: false })` |
| Video element | Forgetting autoplay/playsInline/muted on iOS | Add all three attributes: `<video autoplay playsinline muted>` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Processing full HD video (1920x1080) | Frame rate < 15fps, UI lag, crashes | Request 320x240 or downsample, match ASCII grid size | Immediately on mobile, after 30s on desktop |
| No animation loop cancellation | Battery drain, overheating, background CPU usage | Implement cancelAnimationFrame() on visibility change | After 5-10 minutes, faster on mobile |
| Allocating objects in draw() loop | Garbage collection pauses, stuttering animation | Preallocate arrays/objects in setup(), reuse in draw() | After 2-3 minutes of continuous use |
| Text rendering for 80x24 ASCII grid every frame | Low frame rate despite small canvas | Use monospace font, measure once, cache character positions | 40+ character columns at 60fps |
| High frame rate (60fps) for ambient pad sound | Unnecessary CPU for slowly changing audio | Update audio parameters at 10-15fps, render video at 30fps | Mobile battery drains 30-40%/hour |
| ConvolverNode reverb on mobile | Audio glitches, distortion, silence | Use delay + EQ for reverb effect instead of convolution | Immediately on low-end mobile devices |
| HRTF panning in Tone.js | Crackling audio, high CPU | Use equalpower panning mode instead | Immediately on mobile |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Not checking for secure context before getUserMedia | Silent failures, confusing user errors | Always verify `if (navigator.mediaDevices === undefined)` first |
| Exposing raw camera stream to third-party scripts | Privacy violation, user trust loss | Never pass MediaStream to untrusted code, process locally only |
| Storing camera frames in localStorage/IndexedDB | Privacy violation, storage quota exceeded | Process frames in memory only, never persist |
| Missing Permissions-Policy headers on embedded iframe | Camera blocked in embedded contexts | Add `allow="camera"` to iframe or set CSP headers |
| Not displaying recording indicator | Users unaware camera is active | Browser shows indicator automatically, but provide visible UI confirmation too |
| Requesting microphone when only camera needed | Unnecessary permission, privacy concern | Only request `{ video: true, audio: false }` for ASCII art app |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state between permission grant and camera start | User sees blank screen for 2-5 seconds, appears broken | Show "Starting camera..." spinner after permission granted |
| Permission prompt appears immediately on page load | Feels intrusive, high denial rate | Show app preview first, require button click to trigger permission |
| No indication that audio requires separate interaction | User expects audio to start with camera, confusion when silent | Display "Tap to Enable Sound" button prominently after camera starts |
| Camera switching button visible when device has only one camera | Button doesn't work, feels broken | Use `navigator.mediaDevices.enumerateDevices()` to count cameras, hide button if only one |
| No feedback when animation paused in background | User returns to app, thinks it crashed | Show "Paused" overlay when document.hidden, auto-resume on visibility |
| ASCII art unreadable on small mobile screens | User can't see effect, wasted bandwidth | Use 40-60 character width on mobile, 80+ on desktop (responsive sizing) |
| No terminal aesthetic (colored background instead of black) | Doesn't look like ASCII art, feels generic | Use `background: #000; color: #0f0;` for authentic terminal green-on-black |
| Audio too loud or startling on first play | User immediately mutes, bad first impression | Start audio at 50% volume, fade in over 1-2 seconds |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Camera permission**: Often missing error recovery UI - verify user can fix denied permission without reloading page
- [ ] **Audio playback**: Often missing user gesture requirement - verify Tone.start() is called in click handler, not on load
- [ ] **Camera switching**: Often missing iOS-specific logic - verify works on actual iOS Safari, not just desktop Chrome
- [ ] **Animation loop**: Often missing cleanup on visibility change - verify cancelAnimationFrame() called when tab hidden
- [ ] **Video tracks**: Often missing stop() on navigation/close - verify camera light turns off when leaving page
- [ ] **Mobile resolution**: Often missing mobile-specific constraints - verify works on 720p phone, not just 1080p desktop
- [ ] **Production build**: Often missing p5.min.js swap - verify production uses minified library, not development build
- [ ] **HTTPS in production**: Often missing deployment verification - verify published URL starts with https://
- [ ] **Memory leak testing**: Often missing extended runtime test - verify runs smoothly for 10+ minutes continuously
- [ ] **Error messages**: Often missing user-friendly language - verify errors explain what to do, not just what went wrong
- [ ] **Mobile battery usage**: Often missing visibility-based throttling - verify animation stops when tab hidden
- [ ] **Audio interruption recovery**: Often missing iOS-specific handling - verify audio resumes after phone call on iOS

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| HTTPS requirement not met | LOW | GitHub Pages provides HTTPS automatically - just verify URL uses https:// scheme |
| Audio blocked by autoplay policy | LOW | Add "Enable Sound" button, call Tone.start() in click handler |
| Camera tracks not stopped | MEDIUM | Add beforeunload handler: `window.addEventListener('beforeunload', () => stopAllTracks())` |
| Animation loop never stops | MEDIUM | Add visibility change handler: `document.addEventListener('visibilitychange', handleVisibility)` |
| Processing full resolution video | MEDIUM | Add downsampling step before ASCII conversion, or reduce getUserMedia constraints |
| Using p5.js dev build in production | LOW | Replace CDN URL from p5.js to p5.min.js, or add build step to swap |
| iOS camera switching broken | HIGH | Complete rewrite of camera switching logic - must stop tracks completely before new getUserMedia |
| No permission denied recovery UI | MEDIUM | Add comprehensive error handling with user instructions for each error type |
| Exact constraints cause errors | LOW | Change `exact` to `ideal` in constraints object |
| Audio context interrupted state | MEDIUM | Add statechange listener, resume context when state changes back to running |
| Memory leaks from drawImage | HIGH | Requires architecture change - reuse canvases, clear between frames, test with profiler |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| HTTPS requirement | Foundation/Setup | Check `navigator.mediaDevices !== undefined` in production URL |
| Audio autoplay policy | Audio Integration | Test on iOS Safari - audio should only play after button click |
| Camera tracks not stopped | Camera Implementation | DevTools shows 0 active MediaStreamTracks after navigation |
| Animation loop never stops | Animation/Rendering | Background tab shows 0 RAF calls in Performance profiler |
| Full resolution processing | Camera Setup | Verify constraints request max 640x480, test frame rate on mobile |
| p5.js dev build | Build/Deployment | Production bundle uses p5.min.js, no FES overhead in profiler |
| iOS camera switching | Camera Controls | Test actual iOS device - camera switches without permission re-prompt |
| Permission denied recovery | Permission Handling | Block permission, verify user sees helpful recovery instructions |
| Exact constraints | Camera Configuration | Test on 3+ different mobile devices with different camera specs |
| Audio interruption (iOS) | Audio Resilience | Make phone call during playback, verify audio resumes after |
| Canvas memory leaks | Performance Optimization | Run for 10 minutes, verify memory usage stays under 200MB |

## Sources

**Official Documentation (HIGH Confidence):**
- [MediaDevices.getUserMedia() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Tone.js Autoplay - GitHub Wiki](https://github.com/Tonejs/Tone.js/wiki/Autoplay)
- [p5.js Performance Optimization - Official Tutorial](https://p5js.org/tutorials/how-to-optimize-your-sketches/)
- [Web Audio API Best Practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

**Community Issues and Discussions (MEDIUM Confidence):**
- [Tone.js Audio Context Interruption - Issue #767](https://github.com/Tonejs/Tone.js/issues/767)
- [iOS getUserMedia Camera Switching - WebKit Bug #179363](https://bugs.webkit.org/show_bug.cgi?id=179363)
- [Canvas drawImage Memory Leak - Electron Issue #22417](https://github.com/electron/electron/issues/22417)
- [requestAnimationFrame Battery Drain - Cytoscape Issue #2657](https://github.com/cytoscape/cytoscape.js/issues/2657)
- [p5.js Mobile Performance - Issue #4469](https://github.com/processing/p5.js/issues/4469)

**Technical Articles (MEDIUM Confidence):**
- [getUserMedia Getting Started - AddPipe Blog 2025](https://blog.addpipe.com/getusermedia-getting-started/)
- [Web Audio Performance Tips - HdM Stuttgart CS Blog](https://blog.mi.hdm-stuttgart.de/index.php/2021/02/24/web-audio-api-tips-for-performance/)
- [Choose Front/Back Camera - Progressier](https://progressier.com/choose-front-back-camera-stream)
- [When Browsers Throttle requestAnimationFrame - Motion Dev](https://motion.dev/blog/when-browsers-throttle-requestanimationframe)

**Specifications (HIGH Confidence):**
- [Media Capture and Streams - W3C](https://w3c.github.io/mediacapture-main/getusermedia.html)
- [Web Audio API Spec](https://webaudio.github.io/web-audio-api/)

---
*Pitfalls research for: ASCII Cam - Webcam ASCII Art + Web Audio Application*
*Researched: 2026-02-13*
