/**
 * Utility functions for color manipulation in calendar components
 */

/**
 * Convert hex color to RGBA with specified opacity
 * @param color - Hex color string (e.g., '#3B82F6')
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
export function hexToRgba(color: string, opacity = 1): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get light background color for personal events
 * @param color - Hex color string
 * @param opacity - Opacity for background (default: 0.1)
 * @returns RGBA color string
 */
export function getEventBackgroundColor(color: string, opacity = 0.1): string {
  return hexToRgba(color, opacity);
}

/**
 * Get border color for personal events
 * @param color - Hex color string  
 * @param opacity - Opacity for border (default: 0.3)
 * @returns RGBA color string
 */
export function getEventBorderColor(color: string, opacity = 0.3): string {
  return hexToRgba(color, opacity);
}