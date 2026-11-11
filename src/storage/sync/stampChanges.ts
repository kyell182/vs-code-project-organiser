import { OrganizerState, Tombstone } from '../OrganizerState';
import { combineTombstones, recordsOf, SYNCED_COLLECTIONS, SyncedRecord } from './syncedRecords';

/**
 * Marks what changed between two versions of the state: changed or new records get `updatedAt = now`,
 * removed records leave a tombstone. Done here once, so no service has to remember it.
 */
export function stampChanges(previous: OrganizerState, next: OrganizerState, now: number): OrganizerState {
  const stamped = structuredClone(next);
  const removed: Tombstone[] = [];
  for (const collection of SYNCED_COLLECTIONS) {
    const before = new Map(recordsOf(previous, collection).map((record) => [record.id, record]));
    recordsOf(stamped, collection).forEach((record) => stampIfChanged(record, before.get(record.id), now));
    const kept = new Set(recordsOf(stamped, collection).map((record) => record.id));
    removed.push(...[...before.keys()].filter((id) => !kept.has(id)).map((id) => ({ id, deletedAt: now })));
  }
  stamped.deleted = combineTombstones([...(previous.deleted ?? []), ...removed], now);
  return stamped;
}

function stampIfChanged(record: SyncedRecord, before: SyncedRecord | undefined, now: number): void {
  if (!before || content(before) !== content(record)) {
    record.updatedAt = now;
  }
}

function content(record: SyncedRecord): string {
  return JSON.stringify({ ...record, updatedAt: undefined });
}
