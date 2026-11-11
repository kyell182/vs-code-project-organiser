import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { DomainError } from '../shared/DomainError';
import { ProjectRecord } from '../storage/OrganizerState';
import { ProjectService } from './ProjectService';

/** Where a project's folder is on this computer; other computers keep their own location. */
export interface FolderRelocation {
  relocate(projectId: string, folderPath: string): Promise<void>;
}

/** Lets the user point a project whose folder is missing to where it is on this computer. */
export class FolderLocator {
  constructor(
    private readonly projects: ProjectService,
    private readonly relocation: FolderRelocation,
  ) {}

  /** Resolves to false when the user cancels. */
  async locate(project: ProjectRecord): Promise<boolean> {
    const picked = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      defaultUri: vscode.Uri.file(nearestExistingFolder(project.path)),
      openLabel: vscode.l10n.t('Use This Folder'),
      title: vscode.l10n.t('Where is "{0}" on this computer?', project.name),
    });
    if (!picked?.[0]) {
      return false;
    }
    this.requireNotSavedElsewhere(project, picked[0].fsPath);
    await this.relocation.relocate(project.id, picked[0].fsPath);
    return true;
  }

  private requireNotSavedElsewhere(project: ProjectRecord, folderPath: string): void {
    const owner = this.projects.findByPath(folderPath);
    if (owner && owner.id !== project.id) {
      throw new DomainError(vscode.l10n.t('This folder is already saved as the project "{0}".', owner.name));
    }
  }
}

/** Starts the folder dialog as close to the old location as this computer allows. */
function nearestExistingFolder(folderPath: string): string {
  let candidate = path.dirname(folderPath);
  while (!fs.existsSync(candidate) && path.dirname(candidate) !== candidate) {
    candidate = path.dirname(candidate);
  }
  return fs.existsSync(candidate) ? candidate : os.homedir();
}
