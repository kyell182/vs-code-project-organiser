import * as vscode from 'vscode';
import { TagColor } from './TagColor';

const COLOR_IDS: Record<TagColor, string> = {
  [TagColor.Red]: 'charts.red',
  [TagColor.Orange]: 'charts.orange',
  [TagColor.Yellow]: 'charts.yellow',
  [TagColor.Green]: 'charts.green',
  [TagColor.Blue]: 'charts.blue',
  [TagColor.Purple]: 'charts.purple',
  [TagColor.Gray]: 'descriptionForeground',
};

const LABELS: Record<TagColor, string> = {
  [TagColor.Red]: vscode.l10n.t('Red'),
  [TagColor.Orange]: vscode.l10n.t('Orange'),
  [TagColor.Yellow]: vscode.l10n.t('Yellow'),
  [TagColor.Green]: vscode.l10n.t('Green'),
  [TagColor.Blue]: vscode.l10n.t('Blue'),
  [TagColor.Purple]: vscode.l10n.t('Purple'),
  [TagColor.Gray]: vscode.l10n.t('Gray'),
};

export function tagColorLabel(color: TagColor): string {
  return LABELS[color];
}

export function tagIcon(color: TagColor): vscode.ThemeIcon {
  return new vscode.ThemeIcon('tag', new vscode.ThemeColor(COLOR_IDS[color]));
}

export function colorDotIcon(color: TagColor): vscode.ThemeIcon {
  return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor(COLOR_IDS[color]));
}
