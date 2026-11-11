import { OrganizerState, Tombstone } from '../OrganizerState';
import { combineTombstones, recordsOf, replaceRecords, SYNCED_COLLECTIONS, SyncedRecord } from './syncedRecords';

/**
 * Combines what this computer last saved with what Settings Sync brought in, record by record:
 * the newest copy of each record wins, and a record removed on either side stays removed
 * unless it was changed after the removal.
 */
export function mergeStates(local: OrganizerState, remote: OrganizerState, now: number): OrganizerState {
  const tombstones = combineTombstones([...(local.deleted ?? []), ...(remote.deleted ?? [])], now);
  const merged = structuredClone(remote);
  for (const collection of SYNCED_COLLECTIONS) {
    replaceRecords(merged, collection, mergeRecords(recordsOf(local, collection), recordsOf(remote, collection), tombstones));
  }
  merged.deleted = tombstones;
  return merged;
}

/** Keeps the remote order and adds records only this computer knows at the end. */
function mergeRecords(local: SyncedRecord[], remote: SyncedRecord[], tombstones: Tombstone[]): SyncedRecord[] {
  const localById = new Map(local.map((record) => [record.id, record]));
  const remoteIds = new Set(remote.map((record) => record.id));
  const fromRemote = remote.map((record) => newest(localById.get(record.id), record));
  const onlyLocal = local.filter((record) => !remoteIds.has(record.id));
  const deletedAt = new Map(tombstones.map((tombstone) => [tombstone.id, tombstone.deletedAt]));
  return structuredClone([...fromRemote, ...onlyLocal].filter((record) => (record.updatedAt ?? 0) > (deletedAt.get(record.id) ?? -1)));
}

/** On a tie the synced copy wins: it is what the other computers already have. */
function newest(local: SyncedRecord | undefined, remote: SyncedRecord): SyncedRecord {
  return local && (local.updatedAt ?? 0) > (remote.updatedAt ?? 0) ? local : remote;
}
