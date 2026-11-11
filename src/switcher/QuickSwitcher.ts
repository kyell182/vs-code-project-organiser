import * as vscode from 'vscode';
import { colorDot } from '../colors/colorEmoji';
import { ProjectOpener } from '../projects/ProjectOpener';
import { statusIcon, statusLabel } from '../statuses/StatusAppearance';
import { StatusResolver } from '../statuses/StatusResolver';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { OrganizerState, ProjectRecord } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';

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
    return registerSafeCommand('projectOrganizer.quickSwitch', () => this.show());
  }

  private async show(): Promise<void> {
    const state = this.store.read();
    const now = Date.now();
    const items = [...state.projects]
      .sort((a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0))
      .map((project) => this.toItem(project, state, now));
    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: vscode.l10n.t('Open a project (type #tag to filter by tag)'),
      matchOnDescription: true,
      matchOnDetail: true,
    });
    if (picked) {
      await this.opener.open(picked.project);
    }
  }

  private toItem(project: ProjectRecord, state: OrganizerState, now: number): ProjectPickItem {
    const status = this.resolver.resolve(project, state, now);
    const tags = state.tags.filter((tag) => project.tagIds.includes(tag.id)).map((tag) => `${colorDot(tag.color)} #${tag.name}`);
    const group = state.groups.find((candidate) => candidate.id === project.groupId)?.name;
    return {
      label: project.name,
      project,
      iconPath: statusIcon(status),
      description: [group, statusLabel(status), ...tags].filter(Boolean).join('  ·  '),
      detail: project.note ? `✎ ${project.note}  —  ${project.path}` : project.path,
    };
  }
}
