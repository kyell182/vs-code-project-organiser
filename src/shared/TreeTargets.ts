import { ProjectRecord } from '../storage/OrganizerState';

/** What a command receives when it is run on a project in the sidebar. */
export interface ProjectTarget {
  readonly project: ProjectRecord;
}

/** What a command receives when it is run on a group or tag heading in the sidebar. */
export interface SectionTarget {
  readonly targetId?: string;
  readonly targetName: string;
}
