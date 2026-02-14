/*
 * Renderer Module
 * Sets up the p5.js sketch that displays the webcam feed on canvas
 * Handles visibility pause/resume for battery savings
 * Integrates ASCII rendering via analyzer.js
 */

import { getCapture, isCameraReady } from './webcam.js';
import { config } from './config.js';
import { sampleVideoToAscii } from './analyzer.js';

// Module-level state for pause control
let isPaused = false;

// ASCII mode state
let asciiMode = true; // Start in ASCII mode - the whole point of the app
let currentColumns = config.ascii.defaultColumns; // 80
let currentCharSet = config.ascii.defaultCharSet; // 'standard'
let asciiOutputEl = null; // Cached DOM reference
let canvas = null; // p5 canvas reference
let lastFontSize = 0; // Cache font size to avoid recalculating every frame

// FPS tracking for debugging
let frameCount = 0;
let lastFpsTime = performance.now();

/*
 * p5.js setup function - called automatically when p5.js loads
 * In global mode, p5 looks for window.setup() and window.draw() functions
 * Since our module loads after p5.js, we define these at the module level
 */
window.setup = function () {
  // Create a canvas matching our webcam capture resolution (320x240)
  // This is the ideal size we requested in webcam.js constraints
  canvas = createCanvas(320, 240);

  // Place the canvas inside the #canvas-container div
  // This keeps our layout organized and allows CSS styling
  canvas.parent('canvas-container');

  // Start with a black background
  // This shows before camera loads and when camera is not ready
  background(0);

  // Cache ASCII output element reference
  asciiOutputEl = document.getElementById('ascii-output');

  // Start in ASCII mode - hide canvas, show ASCII output
  canvas.style('display', 'none');
  if (asciiOutputEl) {
    asciiOutputEl.style.display = 'block';
  }
};

/*
 * p5.js draw function - called automatically ~60 times per second
 * This is our rendering loop where we draw the webcam feed to the canvas
 */
window.draw = function () {
  // If we're paused (tab is hidden), skip all processing
  // This saves battery and CPU when user switches tabs
  if (isPaused) {
    return;
  }

  // Check if the camera has finished initializing
  // Camera might not be ready yet if user hasn't clicked Start Camera
  // or if initialization is still in progress
  if (!isCameraReady()) {
    return;
  }

  // Get the current webcam capture element
  const capture = getCapture();

  if (!capture) {
    return;
  }

  // ASCII mode: render as ASCII art
  if (asciiMode) {
    // Sample video and convert to ASCII
    const asciiText = sampleVideoToAscii(
      capture,
      currentColumns,
      currentCharSet
    );

    // Update ASCII output element
    if (asciiOutputEl) {
      asciiOutputEl.textContent = asciiText;

      // Calculate font size to fit ASCII art within viewport
      // Monospace char width ≈ 0.6 * fontSize (Courier New advance width ratio)
      const charWidthRatio = 0.6;
      const availableWidth = window.innerWidth * 0.95;
      const availableHeight = window.innerHeight * 0.75;

      const fontSizeFromWidth =
        availableWidth / (currentColumns * charWidthRatio);
      const rowCount = asciiText.split('\n').length - 1;
      const fontSizeFromHeight =
        rowCount > 0 ? availableHeight / rowCount : fontSizeFromWidth;

      const fontSize = Math.max(
        1,
        Math.floor(Math.min(fontSizeFromWidth, fontSizeFromHeight))
      );

      if (fontSize !== lastFontSize) {
        asciiOutputEl.style.fontSize = fontSize + 'px';
        lastFontSize = fontSize;
      }
    }
  } else {
    // Video mode: render raw video to canvas
    // Always clear to black background first
    background(0);

    // Resize canvas to match the actual video aspect ratio
    // Mobile cameras often return 16:9 (e.g. 640x480 or 1280x720)
    // instead of our ideal 320x240 (4:3). If we don't match, the image stretches.
    const vw = capture.videoWidth;
    const vh = capture.videoHeight;
    if (vw && vh && (width !== vw || height !== vh)) {
      resizeCanvas(vw, vh);
    }

    // Draw the webcam video frame to fill the entire canvas
    drawingContext.drawImage(capture, 0, 0, width, height);
  }

  // FPS tracking (debug only - logs to console every ~2 seconds)
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime > 2000) {
    const fps = frameCount / ((now - lastFpsTime) / 1000);
    console.log('FPS:', fps.toFixed(1));
    frameCount = 0;
    lastFpsTime = now;
  }
};

/*
 * Visibility API event listener
 * Pauses rendering and video playback when user switches tabs
 * Resumes when user returns to the tab
 *
 * Why this matters:
 * - Browsers keep running draw() even when tab is hidden
 * - This wastes battery processing invisible frames
 * - Video keeps decoding frames even though user can't see them
 * - Using noLoop() + pausing video saves significant battery life
 */
document.addEventListener('visibilitychange', () => {
  // Update our pause flag based on tab visibility
  // document.hidden is true when tab is hidden, false when visible
  isPaused = document.hidden;

  // Get the video element so we can pause/resume it
  // capture is now a raw HTMLVideoElement (not a p5 wrapper)
  const capture = getCapture();

  if (capture) {
    if (document.hidden) {
      // Tab is hidden - pause everything to save battery
      capture.pause(); // Pause the video element (stops frame decoding)
      noLoop(); // Stop the p5.js draw loop (stops canvas updates)
    } else {
      // Tab is visible again - resume everything
      capture.play(); // Resume video playback
      loop(); // Resume the p5.js draw loop
    }
  }
});

/*
 * Toggle between ASCII mode and raw video mode
 * @param {boolean} enabled - true for ASCII mode, false for raw video
 */
export function setAsciiMode(enabled) {
  asciiMode = enabled;

  if (canvas && asciiOutputEl) {
    if (enabled) {
      // Switch to ASCII mode
      canvas.style('display', 'none');
      asciiOutputEl.style.display = 'block';
    } else {
      // Switch to video mode
      canvas.style('display', 'block');
      asciiOutputEl.style.display = 'none';
    }
  }
}

/*
 * Set the number of character columns for ASCII rendering
 * @param {number} cols - Number of columns (40-160)
 */
export function setColumns(cols) {
  currentColumns = cols;
  lastFontSize = 0; // Force font size recalculation
}

/*
 * Set the character set for ASCII rendering
 * @param {string} name - Character set name ('standard', 'dense', 'minimal')
 */
export function setCharSet(name) {
  currentCharSet = name;
}

/*
 * Initialize the renderer
 * This function is exported for future configuration needs
 * Currently setup() and draw() are auto-invoked by p5.js
 * But we keep this export in case we need manual initialization later
 */
export function initRenderer() {
  // Renderer is initialized automatically via p5.js global mode
  // This function exists as a hook for future configuration
  console.log('Renderer initialized - p5.js canvas active');
}
