import * as vscode from 'vscode';
import { ColorIcon, colorIcon, themeColorFor } from '../colors/ColorAppearance';
import { StatusDefinition } from './StatusDefinition';

export function statusLabel(status: StatusDefinition): string {
  return status.isBuiltIn ? vscode.l10n.t(status.name) : status.name;
}

export function statusColor(status: StatusDefinition): vscode.ThemeColor {
  return themeColorFor(status.color);
}

export function statusIcon(status: StatusDefinition): ColorIcon {
  return colorIcon(status.icon, status.color);
}
