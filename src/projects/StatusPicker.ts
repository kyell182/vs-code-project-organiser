import * as vscode from 'vscode';
import { ALL_STATUSES, ProjectStatus } from './ProjectStatus';
import { statusIcon, statusLabel } from './StatusAppearance';

export interface StatusChoice {
  status: ProjectStatus | undefined;
}

interface StatusItem extends vscode.QuickPickItem {
  status?: ProjectStatus;
}

/** Resolves to undefined when cancelled; a choice with status undefined means "automatic". */
export async function pickStatus(current: ProjectStatus | undefined): Promise<StatusChoice | undefined> {
  const automatic: StatusItem = {
    label: vscode.l10n.t('Automatic'),
    description: vscode.l10n.t('based on when you last opened it'),
    iconPath: new vscode.ThemeIcon('sync'),
  };
  const manual: StatusItem[] = ALL_STATUSES.map((status) => ({
    label: statusLabel(status),
    status,
    iconPath: statusIcon(status),
    description: status === current ? vscode.l10n.t('current') : undefined,
  }));
  const picked = await vscode.window.showQuickPick([automatic, ...manual], { placeHolder: vscode.l10n.t('Set the project status') });
  return picked ? { status: picked.status } : undefined;
}
