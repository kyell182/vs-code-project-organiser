import * as path from 'path';
import * as vscode from 'vscode';
import { DomainError } from '../shared/DomainError';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { ProjectTarget } from '../shared/TreeTargets';
import { ProjectOpener } from './ProjectOpener';
import { ProjectService } from './ProjectService';

/** Saving, opening, renaming and removing projects. Organizing them lives in ProjectOrganizeCommands. */
export class ProjectCommands {
  constructor(
    private readonly projects: ProjectService,
    private readonly opener: ProjectOpener,
  ) {}

  register(): vscode.Disposable[] {
    return [
      registerSafeCommand('projectsHub.saveCurrentProject', () => this.saveCurrent()),
      registerSafeCommand('projectsHub.addProjectFolder', () => this.addFolder()),
      registerSafeCommand<ProjectTarget>('projectsHub.openProject', (item) => this.opener.open(item.project)),
      registerSafeCommand<ProjectTarget>('projectsHub.openProjectInNewWindow', (item) => this.opener.open(item.project, true)),
      registerSafeCommand<ProjectTarget>('projectsHub.renameProject', (item) => this.rename(item)),
      registerSafeCommand<ProjectTarget>('projectsHub.removeProject', (item) => this.remove(item)),
      registerSafeCommand<ProjectTarget>('projectsHub.togglePin', (item) => this.projects.togglePin(item.project.id)),
    ];
  }

  private async saveCurrent(): Promise<void> {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      throw new DomainError(vscode.l10n.t('Open a folder first, then save it as a project.'));
    }
    await this.saveFolder(folder.uri.fsPath);
  }

  private async addFolder(): Promise<void> {
    const picked = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: vscode.l10n.t('Add Project') });
    if (picked?.[0]) {
      await this.saveFolder(picked[0].fsPath);
    }
  }

  private async saveFolder(folderPath: string): Promise<void> {
    const name = await vscode.window.showInputBox({ prompt: vscode.l10n.t('Project name'), value: path.basename(folderPath) });
    if (name === undefined) {
      return;
    }
    await this.projects.add(name, folderPath);
    await this.projects.markOpened(folderPath, Date.now());
    vscode.window.setStatusBarMessage(vscode.l10n.t('Project "{0}" saved', name.trim()), 3000);
  }

  private async rename(item: ProjectTarget): Promise<void> {
    const name = await vscode.window.showInputBox({ prompt: vscode.l10n.t('New project name'), value: item.project.name });
    if (name !== undefined) {
      await this.projects.rename(item.project.id, name);
    }
  }

  /** Only the saved entry is removed; the folder on disk is never touched. */
  private async remove(item: ProjectTarget): Promise<void> {
    const remove = vscode.l10n.t('Remove');
    const choice = await vscode.window.showWarningMessage(
      vscode.l10n.t('Remove "{0}" from your projects? The folder on disk stays untouched.', item.project.name),
      { modal: true },
      remove,
    );
    if (choice === remove) {
      await this.projects.remove(item.project.id);
    }
  }
}
