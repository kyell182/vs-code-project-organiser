import * as vscode from 'vscode';
import { Color } from './Color';
import { colorLabel, pickerIcon } from './ColorAppearance';
import { CustomColorPanel } from './CustomColorPanel';
import { ALL_PALETTE_COLORS } from './PaletteColor';
import { RecentColors } from './RecentColors';

interface ColorItem extends vscode.QuickPickItem {
  color?: Color;
}

/** Quick pick with the theme-aware palette first, then recent custom colors and "Custom color...". */
export class ColorPicker {
  constructor(
    private readonly customPanel: CustomColorPanel,
    private readonly recent: RecentColors,
  ) {}

  /** `subject` is the name of the tag, group or status being colored. */
  async pick(subject: string): Promise<Color | undefined> {
    const picked = await vscode.window.showQuickPick(this.items(), {
      placeHolder: vscode.l10n.t('Color for "{0}"', subject),
    });
    if (!picked) {
      return undefined;
    }
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
