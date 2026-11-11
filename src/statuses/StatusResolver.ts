import { OrganizerState, ProjectRecord } from '../storage/OrganizerState';
import { BuiltInStatus } from './BuiltInStatus';
import { findStatus } from './StatusCatalog';
import { StatusDefinition } from './StatusDefinition';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** A manual status always wins; otherwise the status follows from when the project was last opened. */
export class StatusResolver {
  constructor(private readonly inactiveAfterDays: () => number) {}

  resolve(project: ProjectRecord, state: OrganizerState, now: number): StatusDefinition {
    return findStatus(state, project.manualStatus ?? this.automaticStatus(project, now));
  }

  private automaticStatus(project: ProjectRecord, now: number): BuiltInStatus {
    if (project.lastOpened === undefined) {
      return BuiltInStatus.Inactive;
    }
    const threshold = this.inactiveAfterDays() * MILLISECONDS_PER_DAY;
    return now - project.lastOpened <= threshold ? BuiltInStatus.Active : BuiltInStatus.Inactive;
  }
}
