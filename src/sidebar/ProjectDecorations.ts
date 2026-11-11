import * as vscode from 'vscode';

const SCHEME = 'project-organizer-missing';

/**
 * Flags projects whose folder is gone. A decoration colors the whole row (label and tags alike),
 * so it is only used for this warning; the status color lives in the icon instead.
 */
export class ProjectDecorations implements vscode.FileDecorationProvider {
  static missingUri(projectId: string): vscode.Uri {
    return vscode.Uri.from({ scheme: SCHEME, path: `/${projectId}` });
  }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    if (uri.scheme !== SCHEME) {
      return undefined;
    }
    return new vscode.FileDecoration('!', vscode.l10n.t('Folder not found'), new vscode.ThemeColor('list.warningForeground'));
  }
}
