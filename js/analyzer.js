/*
 * Analyzer module
 * Handles brightness analysis and ASCII character mapping
 * Placeholder for Phase 2+ when we process actual pixel data
 */

// Import our shared config to access character set
import { config } from './config.js';

export function analyze(pixels) {
  // This function will analyze pixel brightness and return appropriate ASCII char
  // For now, just return the first character (darkest) as a placeholder
  console.log('Analyzer placeholder - will process pixels in Phase 2');
  return config.charSet[0];
}
