import * as vscode from 'vscode';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { ProjectTarget } from '../shared/TreeTargets';
import { NoteFileSystem } from './NoteFileSystem';

export class NoteCommands {
  register(): vscode.Disposable[] {
    return [registerSafeCommand<ProjectTarget>('projectsHub.editNote', (item) => this.open(item))];
  }

  private async open(item: ProjectTarget): Promise<void> {
    const document = await vscode.workspace.openTextDocument(NoteFileSystem.uriFor(item.project));
    await vscode.window.showTextDocument(document, { preview: false });
  }
}
