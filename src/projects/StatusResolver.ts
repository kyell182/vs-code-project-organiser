import { ProjectRecord } from '../storage/OrganizerState';
import { ProjectStatus } from './ProjectStatus';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** A manual status always wins; otherwise the status follows from when the project was last opened. */
export class StatusResolver {
  constructor(private readonly inactiveAfterDays: () => number) {}

  resolve(project: ProjectRecord, now: number): ProjectStatus {
    if (project.manualStatus) {
      return project.manualStatus;
    }
    if (project.lastOpened === undefined) {
      return ProjectStatus.Inactive;
    }
    const threshold = this.inactiveAfterDays() * MILLISECONDS_PER_DAY;
    return now - project.lastOpened <= threshold ? ProjectStatus.Active : ProjectStatus.Inactive;
  }
}
