import * as vscode from 'vscode';
import { Color, isPaletteColor, nearestPaletteColor } from './Color';
import { colorIconUri } from './ColorIconFiles';
import { PaletteColor } from './PaletteColor';

/** Theme color ids keep the palette readable in both light and dark themes. */
const THEME_COLOR_IDS: Record<PaletteColor, string> = {
  [PaletteColor.Red]: 'charts.red',
  [PaletteColor.Orange]: 'charts.orange',
  [PaletteColor.Yellow]: 'charts.yellow',
  [PaletteColor.Green]: 'charts.green',
  [PaletteColor.Blue]: 'charts.blue',
  [PaletteColor.Purple]: 'charts.purple',
  [PaletteColor.Gray]: 'descriptionForeground',
};

const LABELS: Record<PaletteColor, string> = {
  [PaletteColor.Red]: vscode.l10n.t('Red'),
  [PaletteColor.Orange]: vscode.l10n.t('Orange'),
  [PaletteColor.Yellow]: vscode.l10n.t('Yellow'),
  [PaletteColor.Green]: vscode.l10n.t('Green'),
  [PaletteColor.Blue]: vscode.l10n.t('Blue'),
  [PaletteColor.Purple]: vscode.l10n.t('Purple'),
  [PaletteColor.Gray]: vscode.l10n.t('Gray'),
};

export type ColorIcon = vscode.ThemeIcon | vscode.Uri;

export function colorLabel(color: Color): string {
  return isPaletteColor(color) ? LABELS[color] : color.toUpperCase();
}

/**
 * VS Code only accepts theme colors for label decorations and the status bar,
 * so a custom color falls back to the closest palette color there.
 */
export function themeColorFor(color: Color): vscode.ThemeColor {
  return new vscode.ThemeColor(THEME_COLOR_IDS[nearestPaletteColor(color)]);
}

/** Palette colors use a themed codicon; custom colors use a generated SVG in that exact color. */
export function colorIcon(icon: string, color: Color): ColorIcon {
  if (isPaletteColor(color)) {
    return new vscode.ThemeIcon(icon, new vscode.ThemeColor(THEME_COLOR_IDS[color]));
  }
  return colorIconUri(icon, color);
}
