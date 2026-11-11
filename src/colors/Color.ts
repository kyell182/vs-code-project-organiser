import { DomainError } from '../shared/DomainError';
import { ALL_PALETTE_COLORS, PaletteColor } from './PaletteColor';

/** A hex color such as "#ff66cc", always stored in lowercase six-digit form. */
export type HexColor = `#${string}`;

/** Either one of the theme-aware palette colors or a fixed custom color. */
export type Color = PaletteColor | HexColor;

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** Perceived brightness above which dark text is easier to read than white text. */
const LIGHT_BACKGROUND_THRESHOLD = 0.6;

/**
 * Typical dark-theme values of the palette, used to find the palette color closest to a custom
 * color where VS Code only accepts theme colors (label decorations, status bar).
 */
const PALETTE_REFERENCE: Record<PaletteColor, string> = {
  [PaletteColor.Red]: '#f14c4c',
  [PaletteColor.Orange]: '#d18616',
  [PaletteColor.Yellow]: '#cca700',
  [PaletteColor.Green]: '#89d185',
  [PaletteColor.Blue]: '#3794ff',
  [PaletteColor.Purple]: '#b180d7',
  [PaletteColor.Gray]: '#9d9d9d',
};

export function isPaletteColor(value: string): value is PaletteColor {
  return ALL_PALETTE_COLORS.includes(value as PaletteColor);
}

export function isHexColor(value: string): boolean {
  return HEX_PATTERN.test(value.trim());
}

/** Accepts "#F6C", "f6c" or "#ff66cc" and returns "#ff66cc". */
export function normalizeHex(value: string): HexColor {
  const match = HEX_PATTERN.exec(value.trim());
  if (!match) {
    throw new DomainError(`"${value}" is not a valid hex color. Use a value like #FF66CC.`);
  }
  const digits = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1];
  return `#${digits.toLowerCase()}`;
}

/** Validates a color coming from the UI or from older saved data. */
export function requireColor(value: string): Color {
  return isPaletteColor(value) ? value : normalizeHex(value);
}

/** A fixed hex value for any color, for places that cannot follow the theme. */
export function toHex(color: Color): HexColor {
  return isPaletteColor(color) ? (PALETTE_REFERENCE[color] as HexColor) : color;
}

/** Black or white, whichever reads better on the given background color. */
export function readableTextOn(color: Color): HexColor {
  const [red, green, blue] = toRgb(toHex(color));
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > LIGHT_BACKGROUND_THRESHOLD ? '#000000' : '#ffffff';
}

export function nearestPaletteColor(color: Color): PaletteColor {
  if (isPaletteColor(color)) {
    return color;
  }
  const target = toRgb(color);
  const byDistance = ALL_PALETTE_COLORS.map((palette) => ({ palette, distance: distance(target, toRgb(PALETTE_REFERENCE[palette])) }));
  return byDistance.reduce((best, candidate) => (candidate.distance < best.distance ? candidate : best)).palette;
}

function toRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function distance(left: [number, number, number], right: [number, number, number]): number {
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}
