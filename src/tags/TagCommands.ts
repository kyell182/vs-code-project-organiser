import * as vscode from 'vscode';
import { DomainError } from '../shared/DomainError';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { SectionTarget } from '../shared/TreeTargets';
import { pickTagColor } from './TagColorPicker';
import { TagService } from './TagService';

export class TagCommands {
  constructor(private readonly tags: TagService) {}

  register(): vscode.Disposable[] {
    return [
      registerSafeCommand('projectOrganizer.createTag', () => this.create()),
      registerSafeCommand<SectionTarget>('projectOrganizer.renameTag', (target) => this.rename(target)),
      registerSafeCommand<SectionTarget>('projectOrganizer.recolorTag', (target) => this.recolor(target)),
      registerSafeCommand<SectionTarget>('projectOrganizer.deleteTag', (target) => this.delete(target)),
    ];
  }

  private async create(): Promise<void> {
    const name = await askTagName();
    if (name === undefined) {
      return;
    }
    const color = await pickTagColor(name);
    if (color) {
      await this.tags.create(name, color);
    }
  }

  private async rename(target: SectionTarget): Promise<void> {
    const name = await askTagName(target.targetName);
    if (name !== undefined) {
      await this.tags.rename(requireId(target), name);
    }
  }

  private async recolor(target: SectionTarget): Promise<void> {
    const color = await pickTagColor(target.targetName);
    if (color) {
      await this.tags.recolor(requireId(target), color);
    }
  }

  private async delete(target: SectionTarget): Promise<void> {
    const remove = vscode.l10n.t('Delete');
    const choice = await vscode.window.showWarningMessage(
      vscode.l10n.t('Delete tag "{0}"? It is removed from all projects.', target.targetName),
      { modal: true },
      remove,
    );
    if (choice === remove) {
      await this.tags.delete(requireId(target));
    }
  }
}

function askTagName(value?: string): Thenable<string | undefined> {
  return vscode.window.showInputBox({ prompt: vscode.l10n.t('Tag name'), value });
}

function requireId(target: SectionTarget): string {
  if (!target?.targetId) {
    throw new DomainError(vscode.l10n.t('Run this command from a tag in the Project Organizer sidebar.'));
  }
  return target.targetId;
}
