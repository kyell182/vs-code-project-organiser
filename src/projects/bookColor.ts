import { Color } from '../colors/Color';
import { PaletteColor } from '../colors/PaletteColor';
import { ProjectRecord } from '../storage/OrganizerState';

/** Gray is left out so a default bookcase looks colorful instead of dull. */
const DEFAULT_BOOK_COLORS: readonly PaletteColor[] = [
  PaletteColor.Blue,
  PaletteColor.Purple,
  PaletteColor.Green,
  PaletteColor.Orange,
  PaletteColor.Red,
  PaletteColor.Yellow,
];

/** The chosen book color, or a color derived from the id so it never changes between sessions. */
export function bookColorOf(project: ProjectRecord): Color {
  return project.color ?? DEFAULT_BOOK_COLORS[hash(project.id) % DEFAULT_BOOK_COLORS.length];
}

function hash(text: string): number {
  let value = 0;
  for (const character of text) {
    value = (value * 31 + character.charCodeAt(0)) >>> 0;
  }
  return value;
}
