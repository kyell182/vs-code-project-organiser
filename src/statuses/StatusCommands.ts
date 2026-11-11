import * as vscode from 'vscode';
import { pickerIcon } from '../colors/ColorAppearance';
import { ColorPicker } from '../colors/ColorPicker';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { CustomStatusRecord } from '../storage/OrganizerState';
import { StatusService } from './StatusService';

interface StatusItem extends vscode.QuickPickItem {
  status?: CustomStatusRecord;
}

interface ActionItem extends vscode.QuickPickItem {
  run: (status: CustomStatusRecord) => Promise<void>;
}

/** One entry point for custom statuses: pick one (or "New status...") and then what to do with it. */
export class StatusCommands {
  constructor(
    private readonly statuses: StatusService,
    private readonly colors: ColorPicker,
  ) {}

  register(): vscode.Disposable[] {
    return [registerSafeCommand('projectsHub.manageStatuses', () => this.manage())];
  }

  private async manage(): Promise<void> {
    const items: StatusItem[] = this.statuses.listCustom().map((status) => ({
      label: status.name,
      status,
      iconPath: pickerIcon('circle-filled', status.color),
    }));
    const create: StatusItem = { label: vscode.l10n.t('New status...'), iconPath: new vscode.ThemeIcon('add') };
    const picked = await vscode.window.showQuickPick([create, ...items], { placeHolder: vscode.l10n.t('Your own statuses') });
    if (!picked) {
      return;
    }
    await (picked.status ? this.chooseAction(picked.status) : this.create());
  }

  private async create(): Promise<void> {
    const name = await vscode.window.showInputBox({ prompt: vscode.l10n.t('Status name, for example "Waiting for feedback"') });
    if (name === undefined) {
      return;
    }
    const color = await this.colors.pick(name);
    if (color) {
      await this.statuses.create(name, color);
    }
  }

  private async chooseAction(status: CustomStatusRecord): Promise<void> {
    const actions: ActionItem[] = [
      { label: vscode.l10n.t('Rename'), iconPath: new vscode.ThemeIcon('edit'), run: (chosen) => this.rename(chosen) },
      { label: vscode.l10n.t('Change Color'), iconPath: new vscode.ThemeIcon('symbol-color'), run: (chosen) => this.recolor(chosen) },
      { label: vscode.l10n.t('Delete'), iconPath: new vscode.ThemeIcon('trash'), run: (chosen) => this.delete(chosen) },
    ];
    const action = await vscode.window.showQuickPick(actions, { placeHolder: status.name });
    await action?.run(status);
  }

  private async rename(status: CustomStatusRecord): Promise<void> {
    const name = await vscode.window.showInputBox({ prompt: vscode.l10n.t('Status name'), value: status.name });
    if (name !== undefined) {
      await this.statuses.rename(status.id, name);
    }
  }

  private async recolor(status: CustomStatusRecord): Promise<void> {
    const color = await this.colors.pick(status.name);
    if (color) {
      await this.statuses.recolor(status.id, color);
    }
  }

  private async delete(status: CustomStatusRecord): Promise<void> {
    const remove = vscode.l10n.t('Delete');
    const choice = await vscode.window.showWarningMessage(
      vscode.l10n.t('Delete status "{0}"? Projects with this status go back to automatic.', status.name),
      { modal: true },
      remove,
    );
    if (choice === remove) {
      await this.statuses.delete(status.id);
    }
  }
}
