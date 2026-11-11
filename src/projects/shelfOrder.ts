import { ProjectRecord } from '../storage/OrganizerState';

/**
 * Order inside a status column or shelf: projects the user placed by dragging come first in their
 * chosen order, the rest follow with pinned projects first and then by name.
 */
export function compareForShelf(left: ProjectRecord, right: ProjectRecord): number {
  const placed = compareOptional(left.order, right.order);
  if (placed !== 0) {
    return placed;
  }
  if (left.isPinned !== right.isPinned) {
    return left.isPinned ? -1 : 1;
  }
  return left.name.localeCompare(right.name);
}

/** Moves `movedId` in front of `beforeId`, or to the end when there is no `beforeId`. */
export function placeBefore(orderedIds: string[], movedId: string, beforeId?: string): string[] {
  const others = orderedIds.filter((id) => id !== movedId);
  const index = beforeId ? others.indexOf(beforeId) : -1;
  const insertAt = index === -1 ? others.length : index;
  return [...others.slice(0, insertAt), movedId, ...others.slice(insertAt)];
}

function compareOptional(left: number | undefined, right: number | undefined): number {
  if (left === undefined && right === undefined) {
    return 0;
  }
  if (left === undefined) {
    return 1;
  }
  return right === undefined ? -1 : left - right;
}
