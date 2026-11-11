import * as fs from 'fs';
import * as vscode from 'vscode';
import { Settings } from '../shared/Settings';
import { ProjectRecord } from '../storage/OrganizerState';
import { FolderLocator } from './FolderLocator';
import { ProjectService } from './ProjectService';

export class ProjectOpener {
  constructor(
    private readonly projects: ProjectService,
    private readonly settings: Settings,
    private readonly locator: FolderLocator,
  ) {}

  async open(project: ProjectRecord, forceNewWindow = this.settings.openInNewWindow()): Promise<void> {
    if (!fs.existsSync(project.path)) {
      await this.offerFix(project, forceNewWindow);
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

  /** A missing folder often just lives elsewhere on this computer, so locating comes first. */
  private async offerFix(project: ProjectRecord, forceNewWindow: boolean): Promise<void> {
    const locate = vscode.l10n.t('Locate Folder...');
    const remove = vscode.l10n.t('Remove Project');
    const choice = await vscode.window.showWarningMessage(
      vscode.l10n.t('The folder of "{0}" was not found on this computer: {1}', project.name, project.path),
      locate,
      remove,
    );
    if (choice === remove) {
      await this.projects.remove(project.id);
    }
    if (choice === locate && (await this.locator.locate(project))) {
      await this.openRelocated(project.id, forceNewWindow);
    }
  }

  private async openRelocated(projectId: string, forceNewWindow: boolean): Promise<void> {
    const relocated = this.projects.list().find((candidate) => candidate.id === projectId);
    if (relocated) {
      await this.open(relocated, forceNewWindow);
    }
  }
}
