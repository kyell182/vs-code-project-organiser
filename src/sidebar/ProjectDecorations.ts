import * as vscode from 'vscode';
import { ProjectStatus } from '../projects/ProjectStatus';
import { ProjectView } from './ProjectView';
import { statusColor } from '../projects/StatusAppearance';

const SCHEME = 'project-organizer';
const MISSING = 'missing';

/**
 * Colors the project label itself in its status color. The status travels in the uri,
 * so this provider stays stateless and never needs its own refresh.
 */
export class ProjectDecorations implements vscode.FileDecorationProvider {
  static uriFor(view: ProjectView): vscode.Uri {
    const state = view.isMissing ? MISSING : view.status;
    return vscode.Uri.from({ scheme: SCHEME, path: `/${view.project.id}`, query: state });
  }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    if (uri.scheme !== SCHEME) {
      return undefined;
    }
    if (uri.query === MISSING) {
      return new vscode.FileDecoration('!', vscode.l10n.t('Folder not found'), new vscode.ThemeColor('list.warningForeground'));
    }
    return this.forStatus(uri.query as ProjectStatus);
  }

  private forStatus(status: ProjectStatus): vscode.FileDecoration | undefined {
    if (!Object.values(ProjectStatus).includes(status)) {
      return undefined;
    }
    return new vscode.FileDecoration(undefined, undefined, statusColor(status));
  }
}
