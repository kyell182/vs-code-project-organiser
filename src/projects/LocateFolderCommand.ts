import * as vscode from 'vscode';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { ProjectTarget } from '../shared/TreeTargets';
import { FolderLocator } from './FolderLocator';

export const LOCATE_FOLDER_COMMAND = 'projectsHub.locateFolder';
const STATUS_MESSAGE_MS = 3000;

export class LocateFolderCommand {
  constructor(private readonly locator: FolderLocator) {}

  register(): vscode.Disposable {
    return registerSafeCommand<ProjectTarget>(LOCATE_FOLDER_COMMAND, async (item) => {
      if (await this.locator.locate(item.project)) {
        vscode.window.setStatusBarMessage(vscode.l10n.t('Folder of "{0}" updated on this computer', item.project.name), STATUS_MESSAGE_MS);
      }
    });
  }
}
