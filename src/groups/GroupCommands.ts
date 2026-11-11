import * as vscode from 'vscode';
import { ColorPicker } from '../colors/ColorPicker';
import { DomainError } from '../shared/DomainError';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { SectionTarget } from '../shared/TreeTargets';
import { GroupPicker } from './GroupPicker';
import { GroupService } from './GroupService';

export class GroupCommands {
  constructor(
    private readonly groups: GroupService,
    private readonly picker: GroupPicker,
    private readonly colors: ColorPicker,
  ) {}

  register(): vscode.Disposable[] {
    return [
      registerSafeCommand('projectOrganizer.createGroup', () => this.create()),
      registerSafeCommand<SectionTarget>('projectOrganizer.renameGroup', (target) => this.rename(target)),
      registerSafeCommand<SectionTarget>('projectOrganizer.recolorGroup', (target) => this.recolor(target)),
      registerSafeCommand<SectionTarget>('projectOrganizer.deleteGroup', (target) => this.delete(target)),
    ];
  }

  private async create(): Promise<void> {
    await this.picker.createGroup();
  }

  private async recolor(target: SectionTarget): Promise<void> {
    const color = await this.colors.pick(target.targetName);
    if (color) {
      await this.groups.recolor(requireId(target), color);
    }
  }

  private async rename(target: SectionTarget): Promise<void> {
    const name = await this.picker.askName(target.targetName);
    if (name !== undefined) {
      await this.groups.rename(requireId(target), name);
    }
  }

  private async delete(target: SectionTarget): Promise<void> {
    const remove = vscode.l10n.t('Delete');
    const choice = await vscode.window.showWarningMessage(
      vscode.l10n.t('Delete group "{0}"? Its projects are kept and become ungrouped.', target.targetName),
      { modal: true },
      remove,
    );
    if (choice === remove) {
      await this.groups.delete(requireId(target));
    }
  }
}

function requireId(target: SectionTarget): string {
  if (!target?.targetId) {
    throw new DomainError(vscode.l10n.t('Run this command from a group in the Project Organizer sidebar.'));
  }
  return target.targetId;
}
