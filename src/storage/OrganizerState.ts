import { ProjectStatus } from '../projects/ProjectStatus';
import { TagColor } from '../tags/TagColor';

export interface ProjectRecord {
  id: string;
  name: string;
  path: string;
  groupId?: string;
  tagIds: string[];
  manualStatus?: ProjectStatus;
  lastOpened?: number;
  isPinned: boolean;
}

export interface GroupRecord {
  id: string;
  name: string;
}

export interface TagRecord {
  id: string;
  name: string;
  color: TagColor;
}

export interface OrganizerState {
  projects: ProjectRecord[];
  groups: GroupRecord[];
  tags: TagRecord[];
}

export function createEmptyState(): OrganizerState {
  return { projects: [], groups: [], tags: [] };
}
