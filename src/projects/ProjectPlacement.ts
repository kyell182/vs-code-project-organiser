import { requireById } from '../shared/NameValidation';
import { listStatuses } from '../statuses/StatusCatalog';
import { StatusResolver } from '../statuses/StatusResolver';
import { StatusId } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';
import { mutateState } from '../storage/mutateState';
import { compareForShelf, placeBefore } from './shelfOrder';

export interface Placement {
  projectId: string;
  statusId: StatusId;
  /** The project it is dropped in front of; undefined means at the end. */
  beforeId?: string;
}

/** Dragging on the board or shelf: sets the status and the position inside that column in one step. */
export class ProjectPlacement {
  constructor(
    private readonly store: StateStore,
    private readonly resolver: StatusResolver,
  ) {}

  move(placement: Placement, now: number): Promise<void> {
    return mutateState(this.store, (state) => {
      requireById(listStatuses(state), placement.statusId, 'Status');
      const moved = requireById(state.projects, placement.projectId, 'Project');
      const column = state.projects
        .filter((project) => project.id === moved.id || this.resolver.resolve(project, state, now).id === placement.statusId)
        .sort(compareForShelf);
      const orderedIds = placeBefore(column.map((project) => project.id), moved.id, placement.beforeId);
      moved.manualStatus = placement.statusId;
      orderedIds.forEach((id, index) => (requireById(state.projects, id, 'Project').order = index));
    });
  }
}
