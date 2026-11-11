import * as vscode from 'vscode';
import { pickerIcon } from '../colors/ColorAppearance';
import { ColorPicker } from '../colors/ColorPicker';
import { GroupRecord } from '../storage/OrganizerState';
import { DEFAULT_GROUP_COLOR, GroupService } from './GroupService';

export interface GroupChoice {
  groupId: string | undefined;
}

interface GroupItem extends vscode.QuickPickItem {
  groupId?: string;
  isNew?: boolean;
}

export class GroupPicker {
  constructor(
    private readonly groups: GroupService,
    private readonly colors: ColorPicker,
  ) {}

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
      iconPath: pickerIcon('folder', group.color ?? DEFAULT_GROUP_COLOR),
      description: group.id === currentGroupId ? current : undefined,
    }));
    const none: GroupItem = { label: vscode.l10n.t('No group'), iconPath: new vscode.ThemeIcon('circle-slash') };
    const create: GroupItem = { label: vscode.l10n.t('New group...'), iconPath: new vscode.ThemeIcon('new-folder'), isNew: true };
    return [...groups, none, create];
  }

  /** Asks a name and a color; cancelling the color keeps the default color. */
  async createGroup(): Promise<GroupRecord | undefined> {
    const name = await this.askName();
    if (name === undefined) {
      return undefined;
    }
    const color = await this.colors.pick(name);
    return this.groups.create(name, color ?? DEFAULT_GROUP_COLOR);
  }

  private async createAndChoose(): Promise<GroupChoice | undefined> {
    const group = await this.createGroup();
    return group ? { groupId: group.id } : undefined;
  }
}
