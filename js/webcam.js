/*
 * Webcam Module
 * Manages camera initialization, switching, and error handling
 * Uses p5.js createCapture() which wraps the browser's getUserMedia API
 */

// Module-level state - we keep track of the camera stream and its status
let capture = null; // The p5.MediaElement object representing the webcam
let cameraReady = false; // Flag indicating if the camera has successfully initialized
let currentFacing = 'user'; // "user" = front camera, "environment" = rear camera

/*
 * Map of error names to user-friendly messages
 * getUserMedia can throw various errors - we want to show helpful messages instead of scary error codes
 * Different browsers may use different error names for the same issue (e.g., NotAllowedError vs PermissionDeniedError)
 */
const ERROR_MESSAGES = {
  NotAllowedError:
    'Please grant camera permissions in your browser settings to continue.',
  PermissionDeniedError:
    'Please grant camera permissions in your browser settings to continue.',
  NotFoundError: 'No camera found. Please connect a camera and try again.',
  DevicesNotFoundError:
    'No camera found. Please connect a camera and try again.',
  NotReadableError:
    'Your camera is already in use by another application. Please close other programs and try again.',
  TrackStartError:
    'Your camera is already in use by another application. Please close other programs and try again.',
  OverconstrainedError:
    "Your device doesn't support the requested video settings. Please try with a different camera.",
  ConstraintNotSatisfiedError:
    "Your device doesn't support the requested video settings. Please try with a different camera.",
  TypeError: 'Configuration error. Please refresh the page and try again.',
  PermissionDismissedError:
    'Permission dialog was closed. Please try again and allow access when prompted.',
};

/**
 * Handle camera errors by logging to console and returning a user-friendly message
 * @param {Error} err - The error object from getUserMedia or createCapture
 * @returns {string} User-friendly error message
 */
function handleCameraError(err) {
  // Log the actual error for debugging purposes
  console.error('Camera error:', err);

  // Look up the user-friendly message based on error name
  // If we don't recognize the error, show a generic message with the error name
  const userMessage =
    ERROR_MESSAGES[err.name] || `Camera error: ${err.name}. Please try again.`;

  return userMessage;
}

/**
 * Initialize the camera with specified facing mode
 * @param {string} facingMode - "user" for front camera, "environment" for rear camera
 * @param {boolean} forceExact - If true, use { exact: facingMode } to force a specific camera
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function initCamera(facingMode = 'user', forceExact = false) {
  // First, check if we're in a secure context (HTTPS or localhost)
  // getUserMedia ONLY works in secure contexts - this is a browser security requirement
  if (!navigator.mediaDevices) {
    return {
      success: false,
      error:
        'Camera access requires a secure connection (HTTPS). Please use HTTPS or localhost.',
    };
  }

  try {
    // Define our video constraints
    // We use "ideal" instead of "exact" for width/height so the browser can pick the closest available resolution
    // This prevents OverconstrainedError on devices that don't support exactly 320x240
    // For facingMode: on first init we use "ideal" (flexible), but when switching cameras
    // we use { exact: mode } to force the browser to pick the other camera
    const constraints = {
      video: {
        width: { ideal: 320 }, // Low resolution for fast ASCII conversion
        height: { ideal: 240 },
        facingMode: forceExact ? { exact: facingMode } : facingMode,
      },
      audio: false, // We don't need audio for ASCII art!
    };

    // Request the media stream using the raw getUserMedia API
    // This gives us proper error handling and respects our exact constraints
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Create a plain HTML video element and attach our stream directly
    // We don't use p5's createCapture() because it fires its own getUserMedia call
    // which ignores our facingMode constraints (breaking camera switching)
    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', ''); // Required for iOS inline playback
    video.muted = true;

    // Store the raw video element — renderer.js draws it via drawingContext.drawImage()
    // We don't use p5's image() because it requires a p5.MediaElement, not a plain video
    capture = video;

    // Wait for the video dimensions to be known, then start playback
    video.onloadedmetadata = () => {
      video.play();
      cameraReady = true;
    };

    // Update our facing mode tracker
    currentFacing = facingMode;

    return { success: true, error: null };
  } catch (err) {
    // Something went wrong - handle the error and return a friendly message
    const errorMessage = handleCameraError(err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Switch between front and rear cameras
 * This is essential for mobile devices with multiple cameras
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function switchCamera() {
  // CRITICAL: We must stop the old camera stream BEFORE creating a new one
  // On Android Chrome, if we don't stop the tracks first, the new getUserMedia call
  // will fail with OverconstrainedError because it thinks both cameras are requested simultaneously
  stopCamera();

  // Toggle between front ("user") and rear ("environment") cameras
  const newFacing = currentFacing === 'user' ? 'environment' : 'user';

  // Reinitialize with the new facing mode using exact constraint
  // forceExact=true tells initCamera to use { exact: facingMode } so the browser
  // is forced to pick the requested camera instead of treating it as a preference
  const result = await initCamera(newFacing, true);

  return result;
}

/**
 * Stop the camera and clean up resources
 * Safe to call even if no camera is active
 */
export function stopCamera() {
  // Guard against calling this when no camera exists
  if (!capture) {
    return;
  }

  // Stop all media tracks to release the camera hardware
  if (capture.srcObject) {
    capture.srcObject.getTracks().forEach((track) => track.stop());
    capture.srcObject = null;
  }

  // Reset our state
  capture = null;
  cameraReady = false;
}

/**
 * Get the current capture element
 * Used by other modules (like sketch.js) to access the video stream
 * @returns {p5.MediaElement|null}
 */
export function getCapture() {
  return capture;
}

/**
 * Check if the camera is ready for use
 * @returns {boolean}
 */
export function isCameraReady() {
  return cameraReady;
}
