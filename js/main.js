/*
 * Main application entry point
 * Handles ES module imports and initializes the ASCII Cam app
 */

// Import our ES modules - notice the explicit .js extensions (required for browsers)
import { config } from './config.js';
import { initRenderer } from './renderer.js';
import { analyze } from './analyzer.js';

// Configure figlet to load fonts from CDN instead of local path
// This is important because we're loading figlet from CDN, so fonts need CDN path too
figlet.defaults({
  fontPath: 'https://cdn.jsdelivr.net/npm/figlet@1.8.0/fonts',
});

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

  // Future phases will call initRenderer() here to start the webcam
  // For now, we just have placeholder modules imported
});
