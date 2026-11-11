import { OrganizerState, Tombstone } from '../OrganizerState';

/** What every synced record has: a stable id and the time of its last change. */
export interface SyncedRecord {
  id: string;
  updatedAt?: number;
}

/** The lists in the state that are merged record by record. */
export const SYNCED_COLLECTIONS = ['projects', 'groups', 'tags', 'statuses'] as const;
export type SyncedCollection = (typeof SYNCED_COLLECTIONS)[number];

/** Long enough for any computer to sync in between, short enough that the list stays small. */
export const TOMBSTONE_LIFETIME_MS = 90 * 24 * 60 * 60 * 1000;

export function recordsOf(state: OrganizerState, collection: SyncedCollection): SyncedRecord[] {
  return state[collection];
}

export function replaceRecords(state: OrganizerState, collection: SyncedCollection, records: SyncedRecord[]): void {
  (state as unknown as Record<SyncedCollection, SyncedRecord[]>)[collection] = records;
}

/** Keeps one tombstone per id (the latest) and drops the ones that are too old to matter. */
export function combineTombstones(tombstones: readonly Tombstone[], now: number): Tombstone[] {
  const latest = new Map<string, number>();
  tombstones.forEach(({ id, deletedAt }) => latest.set(id, Math.max(deletedAt, latest.get(id) ?? 0)));
  return [...latest]
    .filter(([, deletedAt]) => now - deletedAt < TOMBSTONE_LIFETIME_MS)
    .map(([id, deletedAt]) => ({ id, deletedAt }));
}
