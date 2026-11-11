import { Color, nearestPaletteColor } from './Color';
import { PaletteColor } from './PaletteColor';

/**
 * Quick pick texts cannot be colored per word, but color emoji do render in color there,
 * so tags get a colored dot. Custom colors use the dot closest to them.
 */
const EMOJI: Record<PaletteColor, string> = {
  [PaletteColor.Red]: '🔴',
  [PaletteColor.Orange]: '🟠',
  [PaletteColor.Yellow]: '🟡',
  [PaletteColor.Green]: '🟢',
  [PaletteColor.Blue]: '🔵',
  [PaletteColor.Purple]: '🟣',
  [PaletteColor.Gray]: '⚪',
};

export function colorDot(color: Color): string {
  return EMOJI[nearestPaletteColor(color)];
}
