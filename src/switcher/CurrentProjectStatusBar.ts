import * as vscode from 'vscode';
import { ProjectService } from '../projects/ProjectService';
import { statusColor, statusLabel } from '../projects/StatusAppearance';
import { StatusResolver } from '../projects/StatusResolver';

/** Shows the saved name of the project in this window, in its status color; a click opens the quick switcher. */
export class CurrentProjectStatusBar implements vscode.Disposable {
  private readonly item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

  constructor(
    private readonly projects: ProjectService,
    private readonly resolver: StatusResolver,
    private readonly currentPath: () => string | undefined,
  ) {
    this.item.command = 'projectOrganizer.quickSwitch';
    this.update();
  }

  update(): void {
    const path = this.currentPath();
    const project = path ? this.projects.findByPath(path) : undefined;
    if (!project) {
      this.showUnsaved();
      return;
    }
    const status = this.resolver.resolve(project, Date.now());
    this.item.text = `$(folder-library) ${project.name}`;
    this.item.color = statusColor(status);
    this.item.tooltip = vscode.l10n.t('{0} · {1} — click to switch project', project.name, statusLabel(status));
    this.item.show();
  }

  dispose(): void {
    this.item.dispose();
  }

  private showUnsaved(): void {
    this.item.text = '$(folder-library)';
    this.item.color = undefined;
    this.item.tooltip = vscode.l10n.t('Switch project');
    this.item.show();
  }
}
