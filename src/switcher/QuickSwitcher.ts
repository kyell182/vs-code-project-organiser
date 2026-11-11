import * as vscode from 'vscode';
import { colorDot } from '../colors/colorEmoji';
import { noteSummary } from '../notes/noteSummary';
import { ProjectOpener } from '../projects/ProjectOpener';
import { statusLabel, statusPickerIcon } from '../statuses/StatusAppearance';
import { StatusResolver } from '../statuses/StatusResolver';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { reportErrors } from '../shared/reportErrors';
import { OrganizerState, ProjectRecord } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';

const NEW_WINDOW_BUTTON: vscode.QuickInputButton = {
  iconPath: new vscode.ThemeIcon('empty-window'),
  tooltip: vscode.l10n.t('Open in New Window'),
};

interface ProjectPickItem extends vscode.QuickPickItem {
  project: ProjectRecord;
}

/** Ctrl+Alt+P: fuzzy search all projects by name, group, status or #tag. Most recently opened first. */
export class QuickSwitcher {
  constructor(
    private readonly store: StateStore,
    private readonly resolver: StatusResolver,
    private readonly opener: ProjectOpener,
  ) {}

  register(): vscode.Disposable {
    return registerSafeCommand('projectsHub.quickSwitch', () => this.show());
  }

  /** Enter opens in this window; the button on each row opens in a new window. */
  private async show(): Promise<void> {
    const state = this.store.read();
    const now = Date.now();
    const quickPick = vscode.window.createQuickPick<ProjectPickItem>();
    quickPick.items = [...state.projects]
      .sort((a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0))
      .map((project) => this.toItem(project, state, now));
    quickPick.placeholder = vscode.l10n.t('Open a project (type #tag to filter by tag)');
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;
    quickPick.onDidAccept(() => this.openAndClose(quickPick, quickPick.selectedItems[0]?.project, false));
    quickPick.onDidTriggerItemButton((event) => this.openAndClose(quickPick, event.item.project, true));
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  }

  private openAndClose(quickPick: vscode.QuickPick<ProjectPickItem>, project: ProjectRecord | undefined, newWindow: boolean): void {
    quickPick.hide();
    if (project) {
      // undefined lets a plain Enter follow the openInNewWindow setting.
      void reportErrors(() => this.opener.open(project, newWindow || undefined));
    }
  }

  private toItem(project: ProjectRecord, state: OrganizerState, now: number): ProjectPickItem {
    const status = this.resolver.resolve(project, state, now);
    const tags = state.tags.filter((tag) => project.tagIds.includes(tag.id)).map((tag) => `${colorDot(tag.color)} #${tag.name}`);
    const group = state.groups.find((candidate) => candidate.id === project.groupId)?.name;
    const summary = noteSummary(project.note);
    return {
      label: project.name,
      project,
      iconPath: statusPickerIcon(status),
      description: [group, statusLabel(status), ...tags].filter(Boolean).join('  ·  '),
      detail: summary ? `✎ ${summary}  —  ${project.path}` : project.path,
      buttons: [NEW_WINDOW_BUTTON],
    };
  }
}
