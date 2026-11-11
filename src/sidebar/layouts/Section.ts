import { Color } from '../../colors/Color';
import { ProjectRecord } from '../../storage/OrganizerState';

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
  /** True for labels the extension itself wrote (translated in the UI), false for names typed by the user. */
  isBuiltInLabel: boolean;
  icon: string;
  color?: Color;
  projects: ProjectRecord[];
  id?: string;
}
