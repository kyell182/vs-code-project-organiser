import * as vscode from 'vscode';
import { ColorPicker, RESET_COLOR, ResetChoice } from '../colors/ColorPicker';
import { GroupPicker } from '../groups/GroupPicker';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { ProjectTarget } from '../shared/TreeTargets';
import { StatusPicker } from '../statuses/StatusPicker';
import { TagPicker } from '../tags/TagPicker';
import { ProjectService } from './ProjectService';

export interface OrganizePickers {
  status: StatusPicker;
  group: GroupPicker;
  tag: TagPicker;
  color: ColorPicker;
}

/** Giving a project its status, group, tags and book color. Notes and to-dos have their own features. */
export class ProjectOrganizeCommands {
  constructor(
    private readonly projects: ProjectService,
    private readonly pickers: OrganizePickers,
  ) {}

  register(): vscode.Disposable[] {
    return [
      registerSafeCommand<ProjectTarget>('projectsHub.setStatus', (item) => this.setStatus(item)),
      registerSafeCommand<ProjectTarget>('projectsHub.assignGroup', (item) => this.assignGroup(item)),
      registerSafeCommand<ProjectTarget>('projectsHub.editTags', (item) => this.editTags(item)),
      registerSafeCommand<ProjectTarget>('projectsHub.setBookColor', (item) => this.setBookColor(item)),
    ];
  }

  private async setStatus(item: ProjectTarget): Promise<void> {
    const choice = await this.pickers.status.pick(item.project.manualStatus);
    if (choice) {
      await this.projects.setStatus(item.project.id, choice.statusId);
    }
  }

  private async assignGroup(item: ProjectTarget): Promise<void> {
    const choice = await this.pickers.group.pick(item.project.groupId);
    if (choice) {
      await this.projects.assignGroup(item.project.id, choice.groupId);
    }
  }

  private async editTags(item: ProjectTarget): Promise<void> {
    const tagIds = await this.pickers.tag.pick(item.project.tagIds);
    if (tagIds) {
      await this.projects.setTags(item.project.id, tagIds);
    }
  }

  private async setBookColor(item: ProjectTarget): Promise<void> {
    const reset = this.groupColorChoice(item);
    const color = reset ? await this.pickers.color.pickOrReset(item.project.name, reset) : await this.pickers.color.pick(item.project.name);
    if (color === RESET_COLOR) {
      await this.projects.clearColor(item.project.id);
    } else if (color) {
      await this.projects.setColor(item.project.id, color);
    }
  }

  /** Only offered when the book has its own color, since otherwise it already follows its group. */
  private groupColorChoice(item: ProjectTarget): ResetChoice | undefined {
    if (!item.project.color) {
      return undefined;
    }
    const description = item.project.groupId ? undefined : vscode.l10n.t('gray, not in a group');
    return { label: vscode.l10n.t('Use group color'), description };
  }
}
