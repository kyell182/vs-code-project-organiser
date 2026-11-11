import { ProjectStatus } from '../projects/ProjectStatus';
import { ProjectRecord, TagRecord } from '../storage/OrganizerState';

/** Everything the sidebar needs to draw one project, resolved once per refresh. */
export interface ProjectView {
  project: ProjectRecord;
  status: ProjectStatus;
  tags: TagRecord[];
  groupName?: string;
  isCurrent: boolean;
  isMissing: boolean;
}
