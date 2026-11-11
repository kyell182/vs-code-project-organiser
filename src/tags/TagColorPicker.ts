import * as vscode from 'vscode';
import { colorDotIcon, tagColorLabel } from './TagAppearance';
import { ALL_TAG_COLORS, TagColor } from './TagColor';

interface ColorItem extends vscode.QuickPickItem {
  color: TagColor;
}

export async function pickTagColor(tagName: string): Promise<TagColor | undefined> {
  const items: ColorItem[] = ALL_TAG_COLORS.map((color) => ({ label: tagColorLabel(color), color, iconPath: colorDotIcon(color) }));
  const picked = await vscode.window.showQuickPick(items, { placeHolder: vscode.l10n.t('Color for tag "{0}"', tagName) });
  return picked?.color;
}
