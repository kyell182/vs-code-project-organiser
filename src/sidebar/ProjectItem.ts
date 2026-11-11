import * as vscode from 'vscode';
import { ProjectTarget } from '../shared/TreeTargets';
import { ProjectRecord } from '../storage/OrganizerState';
import { ProjectDecorations } from './ProjectDecorations';
import { buildProjectTooltip } from './ProjectTooltip';
import { ProjectView } from './ProjectView';
import { statusIcon } from '../statuses/StatusAppearance';

export const PROJECT_CONTEXT = 'project';
export const OPEN_PROJECT_COMMAND = 'projectsHub.openProject';

export class ProjectItem extends vscode.TreeItem implements ProjectTarget {
  constructor(
    readonly view: ProjectView,
    sectionKey: string,
  ) {
    super(ProjectItem.buildLabel(view), vscode.TreeItemCollapsibleState.None);
    // The same project can appear in several sections (pinned, each tag), so ids include the section.
    this.id = `${sectionKey}/${view.project.id}`;
    this.contextValue = PROJECT_CONTEXT;
    this.description = ProjectItem.buildDescription(view);
    this.tooltip = buildProjectTooltip(view);
    this.iconPath = view.isMissing ? new vscode.ThemeIcon('warning', new vscode.ThemeColor('list.warningForeground')) : statusIcon(view.status);
    this.resourceUri = view.isMissing ? ProjectDecorations.missingUri(view.project.id) : undefined;
    this.command = { command: OPEN_PROJECT_COMMAND, title: vscode.l10n.t('Open Project'), arguments: [this] };
  }

  get project(): ProjectRecord {
    return this.view.project;
  }

  /** Highlighting the full label makes the project of this window stand out. */
  private static buildLabel(view: ProjectView): vscode.TreeItemLabel {
    const label = view.project.name;
    return { label, highlights: view.isCurrent ? [[0, label.length]] : undefined };
  }

  /** Kept short on purpose: tags and the note are in the tooltip. */
  private static buildDescription(view: ProjectView): string {
    return view.isCurrent ? `● ${vscode.l10n.t('open')}` : '';
  }
}
