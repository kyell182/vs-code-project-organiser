import * as vscode from 'vscode';
import { GroupService } from './GroupService';

export interface GroupChoice {
  groupId: string | undefined;
}

interface GroupItem extends vscode.QuickPickItem {
  groupId?: string;
  isNew?: boolean;
}

export class GroupPicker {
  constructor(private readonly groups: GroupService) {}

  /** Resolves to undefined when cancelled; a choice with groupId undefined means "no group". */
  async pick(currentGroupId: string | undefined): Promise<GroupChoice | undefined> {
    const picked = await vscode.window.showQuickPick(this.items(currentGroupId), { placeHolder: vscode.l10n.t('Move to group') });
    if (!picked) {
      return undefined;
    }
    if (picked.isNew) {
      return this.createAndChoose();
    }
    return { groupId: picked.groupId };
  }

  async askName(value?: string): Promise<string | undefined> {
    return vscode.window.showInputBox({ prompt: vscode.l10n.t('Group name'), value });
  }

  private items(currentGroupId: string | undefined): GroupItem[] {
    const current = vscode.l10n.t('current');
    const groups: GroupItem[] = this.groups.list().map((group) => ({
      label: group.name,
      groupId: group.id,
      iconPath: new vscode.ThemeIcon('folder', new vscode.ThemeColor('charts.blue')),
      description: group.id === currentGroupId ? current : undefined,
    }));
    const none: GroupItem = { label: vscode.l10n.t('No group'), iconPath: new vscode.ThemeIcon('circle-slash') };
    const create: GroupItem = { label: vscode.l10n.t('New group...'), iconPath: new vscode.ThemeIcon('new-folder'), isNew: true };
    return [...groups, none, create];
  }

  private async createAndChoose(): Promise<GroupChoice | undefined> {
    const name = await this.askName();
    if (name === undefined) {
      return undefined;
    }
    const group = await this.groups.create(name);
    return { groupId: group.id };
  }
}
