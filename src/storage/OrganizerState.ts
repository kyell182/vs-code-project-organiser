import { Color } from '../colors/Color';

/** Id of a built-in status (see BuiltInStatus) or of a custom status. */
export type StatusId = string;

export interface ProjectRecord {
  id: string;
  name: string;
  path: string;
  groupId?: string;
  tagIds: string[];
  manualStatus?: StatusId;
  lastOpened?: number;
  isPinned: boolean;
  note?: string;
  /** Book color on the shelf; without one a stable color is derived from the id. */
  color?: Color;
  /** Position within its status column or shelf, set by dragging; lower comes first. */
  order?: number;
}

export interface GroupRecord {
  id: string;
  name: string;
  /** Optional because groups saved by v0.1 have no color yet. */
  color?: Color;
}

export interface TagRecord {
  id: string;
  name: string;
  color: Color;
}

/** A status the user made in addition to the built-in ones. */
export interface CustomStatusRecord {
  id: StatusId;
  name: string;
  color: Color;
}

export interface OrganizerState {
  projects: ProjectRecord[];
  groups: GroupRecord[];
  tags: TagRecord[];
  statuses: CustomStatusRecord[];
}

export function createEmptyState(): OrganizerState {
  return { projects: [], groups: [], tags: [], statuses: [] };
}
