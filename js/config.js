/*
 * Configuration module
 * Exports shared settings used across the app
 */

// Character sets for ASCII art rendering
// Each set is a string ordered from darkest (space) to brightest (dense characters)
// "Drawing with light" - bright pixels = dense characters
export const characterSets = {
  // Standard set: ~12 characters, balanced tonal range
  standard: ' .:-=+*#%@',

  // Dense set: 16+ characters, maximum tonal gradation
  dense:
    ' .\'"`,:;I!i><~+_-?][}{1)(|/\\tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',

  // Minimal set: ~6 characters, bold graphic look
  minimal: ' .+#@',
};

export const config = {
  // ASCII rendering configuration
  ascii: {
    defaultColumns: 80,
    minColumns: 40,
    maxColumns: 160,
    defaultCharSet: 'standard',
    // Monospace chars are ~0.6x wide as tall (with line-height:1)
    // To preserve video aspect ratio: cellHeight = cellWidth * (1/charWidthRatio)
    // This produces fewer rows, compensating for tall character cells
    aspectRatioCorrection: 1.65,
  },

  // Theme colors for ASCII output rendering
  theme: {
    background: '#000000', // Black background
    text: '#00ff00', // Classic terminal green for ASCII art
  },
};
