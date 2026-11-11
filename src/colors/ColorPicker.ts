import * as vscode from 'vscode';
import { Color } from './Color';
import { colorLabel, pickerIcon } from './ColorAppearance';
import { CustomColorPanel } from './CustomColorPanel';
import { ALL_PALETTE_COLORS } from './PaletteColor';
import { RecentColors } from './RecentColors';

interface ColorItem extends vscode.QuickPickItem {
  color?: Color;
  isReset?: boolean;
}

/** An extra first choice that removes the color instead of picking one, such as "Use group color". */
export interface ResetChoice {
  label: string;
  description?: string;
}

export const RESET_COLOR = Symbol('reset color');

/** Quick pick with the theme-aware palette first, then recent custom colors and "Custom color...". */
export class ColorPicker {
  constructor(
    private readonly customPanel: CustomColorPanel,
    private readonly recent: RecentColors,
  ) {}

  /** `subject` is the name of the tag, group or status being colored. */
  async pick(subject: string): Promise<Color | undefined> {
    const picked = await this.show(subject, this.items());
    return picked && this.colorOf(picked, subject);
  }

  /** Like pick, with `reset` as the first choice; choosing it resolves to RESET_COLOR. */
  async pickOrReset(subject: string, reset: ResetChoice): Promise<Color | typeof RESET_COLOR | undefined> {
    const resetItem: ColorItem = { ...reset, isReset: true, iconPath: new vscode.ThemeIcon('discard') };
    const picked = await this.show(subject, [resetItem, ...this.items()]);
    return picked?.isReset ? RESET_COLOR : picked && this.colorOf(picked, subject);
  }

  private show(subject: string, items: ColorItem[]): Thenable<ColorItem | undefined> {
    return vscode.window.showQuickPick(items, { placeHolder: vscode.l10n.t('Color for "{0}"', subject) });
  }

  private colorOf(picked: ColorItem, subject: string): Promise<Color | undefined> | Color {
    return picked.color ?? this.customPanel.pick({ subject });
  }

  private items(): ColorItem[] {
    const palette: ColorItem[] = ALL_PALETTE_COLORS.map((color) => ({
      label: colorLabel(color),
      description: vscode.l10n.t('adapts to your theme'),
      color,
      iconPath: pickerIcon('circle', color),
    }));
    const recent: ColorItem[] = this.recent.list().map((color) => ({
      label: colorLabel(color),
      description: vscode.l10n.t('recently used'),
      color,
      iconPath: pickerIcon('circle', color),
    }));
    const separator: ColorItem = { label: vscode.l10n.t('Custom'), kind: vscode.QuickPickItemKind.Separator };
    const custom: ColorItem = { label: vscode.l10n.t('Custom color...'), iconPath: new vscode.ThemeIcon('symbol-color') };
    return [...palette, separator, ...recent, custom];
  }
}
