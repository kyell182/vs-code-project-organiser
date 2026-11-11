import { DomainError } from '../shared/DomainError';
import { IdGenerator } from '../shared/IdGenerator';
import { requireById, requireName } from '../shared/NameValidation';
import { isSamePath } from '../shared/isSamePath';
import { OrganizerState, ProjectRecord } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';
import { mutateState } from '../storage/mutateState';
import { ProjectStatus } from './ProjectStatus';

const KIND = 'Project';

export class ProjectService {
  constructor(
    private readonly store: StateStore,
    private readonly ids: IdGenerator,
  ) {}

  list(): ProjectRecord[] {
    return this.store.read().projects;
  }

  findByPath(path: string): ProjectRecord | undefined {
    return this.list().find((project) => isSamePath(project.path, path));
  }

  async add(name: string, path: string): Promise<ProjectRecord> {
    if (this.findByPath(path)) {
      throw new DomainError(`This folder is already saved as a project.`);
    }
    const project: ProjectRecord = { id: this.ids.next(), name: requireName(name, KIND), path, tagIds: [], isPinned: false };
    await this.mutate((state) => state.projects.push(project));
    return project;
  }

  rename(id: string, name: string): Promise<void> {
    const trimmed = requireName(name, KIND);
    return this.update(id, (project) => (project.name = trimmed));
  }

  remove(id: string): Promise<void> {
    return this.mutate((state) => {
      requireById(state.projects, id, KIND);
      state.projects = state.projects.filter((project) => project.id !== id);
    });
  }

  togglePin(id: string): Promise<void> {
    return this.update(id, (project) => (project.isPinned = !project.isPinned));
  }

  /** Passing undefined hands the status back to the automatic resolver. */
  setStatus(id: string, status: ProjectStatus | undefined): Promise<void> {
    return this.update(id, (project) => (project.manualStatus = status));
  }

  assignGroup(id: string, groupId: string | undefined): Promise<void> {
    return this.mutate((state) => {
      if (groupId !== undefined) {
        requireById(state.groups, groupId, 'Group');
      }
      requireById(state.projects, id, KIND).groupId = groupId;
    });
  }

  setTags(id: string, tagIds: string[]): Promise<void> {
    return this.mutate((state) => {
      tagIds.forEach((tagId) => requireById(state.tags, tagId, 'Tag'));
      requireById(state.projects, id, KIND).tagIds = [...new Set(tagIds)];
    });
  }

  async markOpened(path: string, now: number): Promise<void> {
    const project = this.findByPath(path);
    if (!project) {
      return;
    }
    await this.update(project.id, (found) => (found.lastOpened = now));
  }

  private update(id: string, change: (project: ProjectRecord) => void): Promise<void> {
    return this.mutate((state) => change(requireById(state.projects, id, KIND)));
  }

  private mutate(change: (state: OrganizerState) => void): Promise<void> {
    return mutateState(this.store, change);
  }
}

