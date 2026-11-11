import { StatusResolver } from '../projects/StatusResolver';
import { isSamePath } from '../shared/isSamePath';
import { OrganizerState, ProjectRecord } from '../storage/OrganizerState';
import { ProjectView } from './ProjectView';

export interface ViewEnvironment {
  currentPath(): string | undefined;
  folderExists(path: string): boolean;
}

export class ProjectViewFactory {
  constructor(
    private readonly resolver: StatusResolver,
    private readonly environment: ViewEnvironment,
  ) {}

  create(project: ProjectRecord, state: OrganizerState, now: number): ProjectView {
    const currentPath = this.environment.currentPath();
    return {
      project,
      status: this.resolver.resolve(project, now),
      tags: state.tags.filter((tag) => project.tagIds.includes(tag.id)),
      groupName: state.groups.find((group) => group.id === project.groupId)?.name,
      isCurrent: currentPath !== undefined && isSamePath(currentPath, project.path),
      isMissing: !this.environment.folderExists(project.path),
    };
  }
}
