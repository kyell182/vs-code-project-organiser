import * as vscode from 'vscode';
import { ColorPicker } from '../colors/ColorPicker';
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

/** Giving a project its status, group, tags, note and book color. */
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
      registerSafeCommand<ProjectTarget>('projectsHub.editNote', (item) => this.editNote(item)),
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
    const color = await this.pickers.color.pick(item.project.name);
    if (color) {
      await this.projects.setColor(item.project.id, color);
    }
  }

  private async editNote(item: ProjectTarget): Promise<void> {
    const note = await vscode.window.showInputBox({
      prompt: vscode.l10n.t('Note or next step for "{0}" (leave empty to remove)', item.project.name),
      value: item.project.note ?? '',
    });
    if (note !== undefined) {
      await this.projects.setNote(item.project.id, note);
    }
  }
}
