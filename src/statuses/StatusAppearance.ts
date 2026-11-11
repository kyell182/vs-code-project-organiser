import * as vscode from 'vscode';
import { ColorIcon, colorIcon, pickerIcon, themeColorFor } from '../colors/ColorAppearance';
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

/** For quick picks, which do not show the color of theme icons. */
export function statusPickerIcon(status: StatusDefinition): vscode.Uri {
  return pickerIcon(status.icon, status.color);
}
