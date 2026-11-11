import * as fs from 'fs';
import * as vscode from 'vscode';
import { Settings } from '../shared/Settings';
import { ProjectRecord } from '../storage/OrganizerState';
import { ProjectService } from './ProjectService';

export class ProjectOpener {
  constructor(
    private readonly projects: ProjectService,
    private readonly settings: Settings,
  ) {}

  async open(project: ProjectRecord, forceNewWindow = this.settings.openInNewWindow()): Promise<void> {
    if (!fs.existsSync(project.path)) {
      await this.offerRemoval(project);
      return;
    }
    // Recorded before opening: opening in the same window reloads the extension host.
    await this.projects.markOpened(project.path, Date.now());
    // forceReuseWindow overrides VS Code's own window.openFoldersInNewWindow, so a plain open stays in this window.
    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(project.path), {
      forceNewWindow,
      forceReuseWindow: !forceNewWindow,
    });
  }

  private async offerRemoval(project: ProjectRecord): Promise<void> {
    const remove = vscode.l10n.t('Remove Project');
    const choice = await vscode.window.showWarningMessage(
      vscode.l10n.t('The folder of "{0}" no longer exists: {1}', project.name, project.path),
      remove,
    );
    if (choice === remove) {
      await this.projects.remove(project.id);
    }
  }
}
