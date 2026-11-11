import { StatusDefinition } from '../statuses/StatusDefinition';
import { GroupRecord, ProjectRecord, TagRecord } from '../storage/OrganizerState';

/** Everything the sidebar needs to draw one project, resolved once per refresh. */
export interface ProjectView {
  project: ProjectRecord;
  status: StatusDefinition;
  tags: TagRecord[];
  group?: GroupRecord;
  isCurrent: boolean;
  isMissing: boolean;
}
