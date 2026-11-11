import { OrganizerState, StatusId } from '../storage/OrganizerState';
import { BUILT_IN_STATUSES, BuiltInStatus } from './BuiltInStatus';
import { StatusDefinition } from './StatusDefinition';

/** Same size as the dot of the built-in Active status, so all statuses line up. */
const CUSTOM_STATUS_ICON = 'circle-filled';

/** Built-in statuses first, then the user's own ones in the order they were made. */
export function listStatuses(state: OrganizerState): StatusDefinition[] {
  const custom = state.statuses.map((status) => ({ ...status, icon: CUSTOM_STATUS_ICON, isBuiltIn: false }));
  return [...BUILT_IN_STATUSES, ...custom];
}

/** An unknown id (for example a custom status deleted on another machine) falls back to Inactive. */
export function findStatus(state: OrganizerState, id: StatusId): StatusDefinition {
  const all = listStatuses(state);
  return all.find((status) => status.id === id) ?? all.find((status) => status.id === BuiltInStatus.Inactive)!;
}
