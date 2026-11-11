import * as vscode from 'vscode';
import { DomainError } from '../shared/DomainError';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { SectionTarget } from '../shared/TreeTargets';
import { pickerIcon } from '../colors/ColorAppearance';
import { ColorPicker } from '../colors/ColorPicker';
import { TagService } from './TagService';

interface TagItem extends vscode.QuickPickItem {
  target?: SectionTarget;
}

interface ActionItem extends vscode.QuickPickItem {
  run: (target: SectionTarget) => Promise<void>;
}

export class TagCommands {
  constructor(
    private readonly tags: TagService,
    private readonly colors: ColorPicker,
  ) {}

  register(): vscode.Disposable[] {
    return [
      registerSafeCommand('projectsHub.createTag', () => this.create()),
      registerSafeCommand('projectsHub.manageTags', () => this.manage()),
      registerSafeCommand<SectionTarget>('projectsHub.renameTag', (target) => this.rename(target)),
      registerSafeCommand<SectionTarget>('projectsHub.recolorTag', (target) => this.recolor(target)),
      registerSafeCommand<SectionTarget>('projectsHub.deleteTag', (target) => this.delete(target)),
    ];
  }

  /** One place to edit every tag, whatever view the sidebar is in. */
  private async manage(): Promise<void> {
    const items: TagItem[] = this.tags.list().map((tag) => ({
      label: tag.name,
      iconPath: pickerIcon('tag', tag.color),
      target: { targetId: tag.id, targetName: tag.name },
    }));
    const create: TagItem = { label: vscode.l10n.t('New tag...'), iconPath: new vscode.ThemeIcon('add') };
    const picked = await vscode.window.showQuickPick([create, ...items], { placeHolder: vscode.l10n.t('Your tags') });
    if (!picked) {
      return;
    }
    await (picked.target ? this.chooseAction(picked.target) : this.create());
  }

  private async chooseAction(target: SectionTarget): Promise<void> {
    const actions: ActionItem[] = [
      { label: vscode.l10n.t('Rename'), iconPath: new vscode.ThemeIcon('edit'), run: (chosen) => this.rename(chosen) },
      { label: vscode.l10n.t('Change Color'), iconPath: new vscode.ThemeIcon('symbol-color'), run: (chosen) => this.recolor(chosen) },
      { label: vscode.l10n.t('Delete'), iconPath: new vscode.ThemeIcon('trash'), run: (chosen) => this.delete(chosen) },
    ];
    const action = await vscode.window.showQuickPick(actions, { placeHolder: target.targetName });
    await action?.run(target);
  }

  private async create(): Promise<void> {
    const name = await askTagName();
    if (name === undefined) {
      return;
    }
    const color = await this.colors.pick(name);
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
    const color = await this.colors.pick(target.targetName);
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
    throw new DomainError(vscode.l10n.t('Run this command from a tag in the Projects Hub sidebar.'));
  }
  return target.targetId;
}
