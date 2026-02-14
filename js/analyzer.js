/*
 * Analyzer module
 * Handles pixel sampling and brightness-to-ASCII character conversion
 * Core of the ASCII rendering pipeline
 */

import { characterSets, config } from './config.js';

// Offscreen canvas for pixel sampling
// Created once and reused every frame for performance
let offscreenCanvas = null;
let offscreenCtx = null;

/*
 * Initialize or resize the offscreen canvas
 * Only resizes when video dimensions change to avoid unnecessary allocations
 */
function ensureOffscreenCanvas(videoWidth, videoHeight) {
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
    // willReadFrequently: true hints browser to keep pixel data in CPU memory
    // This is critical for getImageData() performance
    offscreenCtx = offscreenCanvas.getContext('2d', {
      willReadFrequently: true,
    });
  }

  // Resize only if dimensions changed
  if (
    offscreenCanvas.width !== videoWidth ||
    offscreenCanvas.height !== videoHeight
  ) {
    offscreenCanvas.width = videoWidth;
    offscreenCanvas.height = videoHeight;
  }
}

/*
 * Sample video frame and convert to ASCII art
 * @param {HTMLVideoElement} videoElement - The webcam video element
 * @param {number} cols - Number of character columns
 * @param {string} charSetName - Name of character set to use ('standard', 'dense', 'minimal')
 * @returns {string} ASCII art string with newlines
 */
export function sampleVideoToAscii(videoElement, cols, charSetName) {
  // Get actual video dimensions
  const vw = videoElement.videoWidth;
  const vh = videoElement.videoHeight;

  if (!vw || !vh) {
    return ''; // Video not ready yet
  }

  // Ensure offscreen canvas matches video size
  ensureOffscreenCanvas(vw, vh);

  // Draw current video frame to offscreen canvas
  offscreenCtx.drawImage(videoElement, 0, 0, vw, vh);

  // Calculate grid dimensions
  const cellWidth = vw / cols;
  const cellHeight = cellWidth * config.ascii.aspectRatioCorrection;
  const rows = Math.floor(vh / cellHeight);

  // Get ALL pixel data in one call (critical for performance)
  const imageData = offscreenCtx.getImageData(0, 0, vw, vh);
  const pixels = imageData.data; // RGBA array

  // Look up character set, fall back to standard if not found
  const charSet = characterSets[charSetName] || characterSets.standard;
  const charCount = charSet.length;

  // Build ASCII art row by row
  let asciiArt = '';

  for (let row = 0; row < rows; row++) {
    let rowString = '';

    for (let col = 0; col < cols; col++) {
      // Sample center of grid cell
      const x = Math.floor(col * cellWidth + cellWidth / 2);
      const y = Math.floor(row * cellHeight + cellHeight / 2);

      // Calculate index into flat RGBA array
      const index = (y * vw + x) * 4;

      // Extract RGB values
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];

      // Compute perceptual luminance (ITU-R BT.601 coefficients)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      // Map brightness 0-255 to character index
      const charIndex = Math.floor((brightness / 255) * (charCount - 1));

      // Append character to row
      rowString += charSet[charIndex];
    }

    asciiArt += rowString + '\n';
  }

  return asciiArt;
}
