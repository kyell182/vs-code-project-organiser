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
  /** Markdown; its first line is shown as a summary. */
  note?: string;
  /** When the note last changed, so the note editor can tell whether it is up to date. */
  noteUpdatedAt?: number;
  /** Optional because projects saved before v0.3 have none. */
  todos?: TodoRecord[];
  /** Book color on the shelf; without one a stable color is derived from the id. */
  color?: Color;
  /** Position within its status column or shelf, set by dragging; lower comes first. */
  order?: number;
  /** Set by the store on every change, so syncing can tell which copy is newer. */
  updatedAt?: number;
}

export interface TodoRecord {
  id: string;
  text: string;
  isDone: boolean;
}

export interface GroupRecord {
  id: string;
  name: string;
  /** Optional because groups saved by v0.1 have no color yet. */
  color?: Color;
  updatedAt?: number;
}

export interface TagRecord {
  id: string;
  name: string;
  color: Color;
  updatedAt?: number;
}

/** A status the user made in addition to the built-in ones. */
export interface CustomStatusRecord {
  id: StatusId;
  name: string;
  color: Color;
  updatedAt?: number;
}

/** Remembers that a project, group, tag or status was removed, so a sync does not bring it back. */
export interface Tombstone {
  id: string;
  deletedAt: number;
}

export interface OrganizerState {
  projects: ProjectRecord[];
  groups: GroupRecord[];
  tags: TagRecord[];
  statuses: CustomStatusRecord[];
  /** Optional because state saved before v0.4 has none. */
  deleted?: Tombstone[];
}

export function createEmptyState(): OrganizerState {
  return { projects: [], groups: [], tags: [], statuses: [] };
}
