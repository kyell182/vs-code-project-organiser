import * as vscode from 'vscode';
import { ProjectStatus } from './ProjectStatus';

interface Appearance {
  label: string;
  icon: string;
  colorId: string;
}

/** Theme color ids keep the colors readable in both light and dark themes. */
const APPEARANCES: Record<ProjectStatus, Appearance> = {
  [ProjectStatus.Active]: { label: vscode.l10n.t('Active'), icon: 'circle-filled', colorId: 'charts.green' },
  [ProjectStatus.Paused]: { label: vscode.l10n.t('Paused'), icon: 'debug-pause', colorId: 'charts.orange' },
  [ProjectStatus.Inactive]: { label: vscode.l10n.t('Inactive'), icon: 'circle-outline', colorId: 'charts.red' },
  [ProjectStatus.Archived]: { label: vscode.l10n.t('Archived'), icon: 'archive', colorId: 'disabledForeground' },
};

export function statusLabel(status: ProjectStatus): string {
  return APPEARANCES[status].label;
}

export function statusColor(status: ProjectStatus): vscode.ThemeColor {
  return new vscode.ThemeColor(APPEARANCES[status].colorId);
}

export function statusIcon(status: ProjectStatus): vscode.ThemeIcon {
  return new vscode.ThemeIcon(APPEARANCES[status].icon, statusColor(status));
}
