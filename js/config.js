/*
 * Configuration module
 * Exports shared settings used across the app
 */

export const config = {
  // Character ramp for ASCII art - ordered from darkest to brightest
  // '@' represents darkest pixels, ' ' (space) represents brightest
  charSet: '@%#*+=-:. ',

  // Grid cell size in pixels - controls ASCII resolution
  // Larger values = lower resolution but better performance
  resolution: 8,

  // Theme colors for future ASCII output rendering
  theme: {
    background: '#000000', // Black background
    text: '#00ff00', // Classic terminal green for ASCII art
  },
};
