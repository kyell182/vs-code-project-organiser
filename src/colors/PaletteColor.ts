/** The fixed set of colors users can give to tags, groups and custom statuses. */
export enum PaletteColor {
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Gray = 'gray',
}

export const ALL_PALETTE_COLORS: readonly PaletteColor[] = Object.values(PaletteColor);
