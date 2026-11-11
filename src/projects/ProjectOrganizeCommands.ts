import * as vscode from 'vscode';
import { GroupPicker } from '../groups/GroupPicker';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { ProjectTarget } from '../shared/TreeTargets';
import { TagPicker } from '../tags/TagPicker';
import { ProjectService } from './ProjectService';
import { pickStatus } from './StatusPicker';

/** Giving a project its status, group and tags. */
export class ProjectOrganizeCommands {
  constructor(
    private readonly projects: ProjectService,
    private readonly groupPicker: GroupPicker,
    private readonly tagPicker: TagPicker,
  ) {}

  register(): vscode.Disposable[] {
    return [
      registerSafeCommand<ProjectTarget>('projectOrganizer.setStatus', (item) => this.setStatus(item)),
      registerSafeCommand<ProjectTarget>('projectOrganizer.assignGroup', (item) => this.assignGroup(item)),
      registerSafeCommand<ProjectTarget>('projectOrganizer.editTags', (item) => this.editTags(item)),
    ];
  }

  private async setStatus(item: ProjectTarget): Promise<void> {
    const choice = await pickStatus(item.project.manualStatus);
    if (choice) {
      await this.projects.setStatus(item.project.id, choice.status);
    }
  }

  private async assignGroup(item: ProjectTarget): Promise<void> {
    const choice = await this.groupPicker.pick(item.project.groupId);
    if (choice) {
      await this.projects.assignGroup(item.project.id, choice.groupId);
    }
  }

  private async editTags(item: ProjectTarget): Promise<void> {
    const tagIds = await this.tagPicker.pick(item.project.tagIds);
    if (tagIds) {
      await this.projects.setTags(item.project.id, tagIds);
    }
  }
}
