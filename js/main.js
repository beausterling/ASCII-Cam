/*
 * Main application entry point
 * Handles ES module imports and initializes the ASCII Cam app
 */

// Import our ES modules - notice the explicit .js extensions (required for browsers)
import { config } from './config.js';
import {
  initRenderer,
  setAsciiMode,
  setColumns,
  setCharSet,
} from './renderer.js';
import { analyze } from './analyzer.js';
import { initCamera, switchCamera, stopCamera } from './webcam.js';

// Configure figlet to load fonts from CDN instead of local path
// This is important because we're loading figlet from CDN, so fonts need CDN path too
figlet.defaults({
  fontPath: 'https://cdn.jsdelivr.net/npm/figlet@1.8.0/fonts',
});

/*
 * Throttle utility function
 * Limits the rate at which a function can be called
 * Used for slider input to prevent overwhelming mobile devices
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum milliseconds between calls
 */
function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// Wait for DOM to be fully loaded before manipulating elements
document.addEventListener('DOMContentLoaded', () => {
  // Generate the ASCII art logo using figlet.js
  // The callback pattern is used because figlet loads fonts asynchronously
  figlet('ASCII CAM', { font: 'Standard' }, (err, text) => {
    // Handle any errors that occur during font loading or rendering
    if (err) {
      console.error('Figlet failed to generate logo:', err);
      // Fallback to plain text if figlet fails
      document.getElementById('logo').textContent = 'ASCII CAM';
      return;
    }

    // Successfully generated ASCII art - display it in the logo element
    document.getElementById('logo').textContent = text;
  });

  // Log initialization message to console
  console.log('ASCII Cam initialized with config:', config);
  console.log('ES modules loaded successfully!');

  // Get references to UI elements for camera controls
  const startBtn = document.getElementById('btn-start-camera');
  const switchBtn = document.getElementById('btn-switch-camera');
  const statusEl = document.getElementById('camera-status');
  const errorEl = document.getElementById('camera-error');

  // Get references to ASCII controls
  const asciiControlsEl = document.getElementById('ascii-controls');
  const columnsSlider = document.getElementById('ascii-columns-slider');
  const columnsLabel = document.getElementById('ascii-columns-label');
  const charsetSelect = document.getElementById('charset-select');
  const asciiToggle = document.getElementById('ascii-toggle');

  /*
   * Helper function to show status messages
   * Used for "Initializing camera..." type messages that aren't errors
   */
  function showStatus(msg) {
    statusEl.textContent = msg;
    statusEl.style.display = 'block';
  }

  /*
   * Helper function to show error messages
   * Displays in red error area and hides status messages
   */
  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    statusEl.style.display = 'none'; // Hide status when showing error
  }

  /*
   * Helper function to clear error messages
   * Called at the start of each camera operation
   */
  function clearError() {
    errorEl.style.display = 'none';
  }

  // Track whether camera is currently running for the start/stop toggle
  let cameraRunning = false;

  /*
   * Start/Stop Camera button click handler
   * Toggles between starting and stopping the webcam
   */
  startBtn.addEventListener('click', async () => {
    // If camera is running, stop it and reset the UI
    if (cameraRunning) {
      stopCamera();
      cameraRunning = false;

      // Reset button back to "Start Camera" state
      startBtn.textContent = 'Start Camera';
      startBtn.classList.replace('btn-danger', 'btn-success');
      switchBtn.style.display = 'none';
      asciiControlsEl.style.display = 'none'; // Hide ASCII controls
      showStatus('');
      clearError();
      return;
    }

    // Clear any previous errors
    clearError();

    // Show status message during initialization
    showStatus('Initializing camera...');

    // Disable button to prevent double-clicks during async operation
    // This is important because getUserMedia can take several seconds
    startBtn.disabled = true;

    // Call the webcam module to initialize the camera
    // This is an async operation that requests camera permission
    const result = await initCamera();

    if (result.success) {
      cameraRunning = true;

      // Camera initialized successfully
      showStatus('Camera active');

      // Update button to "Stop Camera" so user can turn it off
      startBtn.textContent = 'Stop Camera';
      startBtn.classList.replace('btn-success', 'btn-danger');
      startBtn.disabled = false;

      // Show ASCII controls when camera is active
      asciiControlsEl.style.display = 'block';

      // Show switch camera button on mobile devices
      // We detect mobile by checking for touch support
      // This is a heuristic - not perfect but works for most cases
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        switchBtn.style.display = 'inline-block';
      }
    } else {
      // Camera initialization failed - show error message
      showError(result.error);
      statusEl.textContent = ''; // Clear status message

      // Re-enable button so user can try again
      startBtn.disabled = false;
    }
  });

  /*
   * Switch Camera button click handler
   * Toggles between front and rear cameras on mobile devices
   */
  switchBtn.addEventListener('click', async () => {
    // Clear any previous errors
    clearError();

    // Show status message during camera switch
    showStatus('Switching camera...');

    // Disable button to prevent double-clicks
    // Camera switching involves stopping old stream and starting new one
    switchBtn.disabled = true;

    // Call the webcam module to switch cameras
    const result = await switchCamera();

    if (result.success) {
      // Camera switched successfully
      showStatus('Camera active');
    } else {
      // Camera switch failed - show error message
      showError(result.error);
    }

    // Re-enable button (whether success or failure)
    switchBtn.disabled = false;
  });

  /*
   * ASCII Controls Event Listeners
   * Wire the controls to renderer setters
   */

  // Resolution slider - throttled for mobile performance
  const handleSliderInput = throttle((value) => {
    setColumns(parseInt(value));
    columnsLabel.textContent = `${value} cols`;
  }, 50); // 50ms throttle interval

  columnsSlider.addEventListener('input', (e) => {
    handleSliderInput(e.target.value);
  });

  // Character set dropdown - change event
  charsetSelect.addEventListener('change', (e) => {
    setCharSet(e.target.value);
  });

  // Video/ASCII toggle - change event
  asciiToggle.addEventListener('change', (e) => {
    setAsciiMode(e.target.checked);
  });

  // The renderer is initialized automatically via p5.js global mode
  // window.setup() and window.draw() are defined in renderer.js
  // and are called automatically when p5.js loads
});
