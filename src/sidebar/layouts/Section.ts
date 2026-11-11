import { ProjectStatus } from '../../projects/ProjectStatus';
import { ProjectRecord } from '../../storage/OrganizerState';
import { TagColor } from '../../tags/TagColor';

export enum SectionKind {
  Pinned = 'pinned',
  Group = 'group',
  Ungrouped = 'ungrouped',
  Tag = 'tag',
  Untagged = 'untagged',
  Status = 'status',
}

/** One collapsible heading in the sidebar with the projects underneath it. */
export interface Section {
  kind: SectionKind;
  label: string;
  projects: ProjectRecord[];
  id?: string;
  tagColor?: TagColor;
  status?: ProjectStatus;
}
