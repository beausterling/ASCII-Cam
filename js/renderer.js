/*
 * Renderer Module
 * Sets up the p5.js sketch that displays the webcam feed on canvas
 * Handles visibility pause/resume for battery savings
 */

import { getCapture, isCameraReady } from './webcam.js';
import { config } from './config.js';

// Module-level state for pause control
let isPaused = false;

/*
 * p5.js setup function - called automatically when p5.js loads
 * In global mode, p5 looks for window.setup() and window.draw() functions
 * Since our module loads after p5.js, we define these at the module level
 */
window.setup = function () {
  // Create a canvas matching our webcam capture resolution (320x240)
  // This is the ideal size we requested in webcam.js constraints
  const canvas = createCanvas(320, 240);

  // Place the canvas inside the #canvas-container div
  // This keeps our layout organized and allows CSS styling
  canvas.parent('canvas-container');

  // Start with a black background
  // This shows before camera loads and when camera is not ready
  background(0);
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

  // Always clear to black background first
  // This prevents artifacts if the camera feed stops or isn't ready
  background(0);

  // Check if the camera has finished initializing
  // Camera might not be ready yet if user hasn't clicked Start Camera
  // or if initialization is still in progress
  if (!isCameraReady()) {
    return; // Just show black screen if camera not ready
  }

  // Get the current webcam capture element
  const capture = getCapture();

  // capture is a raw HTMLVideoElement (not a p5 object)
  // We use drawingContext.drawImage() which is the standard Canvas 2D API
  // This works directly with HTMLVideoElement without needing p5.MediaElement
  if (capture) {
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
