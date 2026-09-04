/**
 * Raw color values mirroring the CSS custom properties in index.css.
 * Canvas 2D drawing (the shareable result image) can't resolve `var(--color-*)`,
 * so it needs these literal values instead.
 */
export const PALETTE = {
  violet: '#300944',
  gray: '#36383f',
  red: '#ea0c05',
  green: '#43c606',
} as const
