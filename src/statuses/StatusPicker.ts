import * as vscode from 'vscode';
import { StateStore } from '../storage/StateStore';
import { StatusId } from '../storage/OrganizerState';
import { statusLabel, statusPickerIcon } from './StatusAppearance';
import { listStatuses } from './StatusCatalog';

export interface StatusChoice {
  statusId: StatusId | undefined;
}

interface StatusItem extends vscode.QuickPickItem {
  statusId?: StatusId;
}

export class StatusPicker {
  constructor(private readonly store: StateStore) {}

  /** Resolves to undefined when cancelled; a choice with statusId undefined means "automatic". */
  async pick(current: StatusId | undefined): Promise<StatusChoice | undefined> {
    const automatic: StatusItem = {
      label: vscode.l10n.t('Automatic'),
      description: vscode.l10n.t('based on when you last opened it'),
      iconPath: new vscode.ThemeIcon('sync'),
    };
    const manual: StatusItem[] = listStatuses(this.store.read()).map((status) => ({
      label: statusLabel(status),
      statusId: status.id,
      iconPath: statusPickerIcon(status),
      description: status.id === current ? vscode.l10n.t('current') : undefined,
    }));
    const picked = await vscode.window.showQuickPick([automatic, ...manual], { placeHolder: vscode.l10n.t('Set the project status') });
    return picked ? { statusId: picked.statusId } : undefined;
  }
}
