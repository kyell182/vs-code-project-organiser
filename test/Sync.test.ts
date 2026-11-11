import * as assert from 'assert';
import { ProjectService } from '../src/projects/ProjectService';
import { TagService } from '../src/tags/TagService';
import { PaletteColor } from '../src/colors/PaletteColor';
import { createEmptyState, OrganizerState } from '../src/storage/OrganizerState';
import { mergeStates } from '../src/storage/sync/mergeStates';
import { stampChanges } from '../src/storage/sync/stampChanges';
import { TOMBSTONE_LIFETIME_MS } from '../src/storage/sync/syncedRecords';
import { SyncingStateStore } from '../src/storage/sync/SyncingStateStore';
import { DAY, NOW, project } from './fixtures';
import { InMemoryMemento, InMemoryStateStore, SequentialIds } from './fakes';

function stateWith(...projects: OrganizerState['projects']): OrganizerState {
  return { ...createEmptyState(), projects };
}

describe('stampChanges', () => {
  it('stamps new and changed records and leaves the rest alone', () => {
    const previous = stateWith(project({ name: 'A', updatedAt: 1 }), project({ name: 'B', updatedAt: 1 }));
    const next = stateWith(project({ name: 'A', updatedAt: 1 }), project({ name: 'B', isPinned: true, updatedAt: 1 }), project({ name: 'C' }));
    const stamped = stampChanges(previous, next, NOW);
    assert.deepStrictEqual(stamped.projects.map((record) => record.updatedAt), [1, NOW, NOW]);
  });

  it('leaves a tombstone for a removed record and forgets very old ones', () => {
    const previous = { ...stateWith(project({ name: 'A' })), deleted: [{ id: 'old', deletedAt: NOW - TOMBSTONE_LIFETIME_MS }] };
    const stamped = stampChanges(previous, stateWith(), NOW);
    assert.deepStrictEqual(stamped.deleted, [{ id: 'A', deletedAt: NOW }]);
  });
});

describe('mergeStates', () => {
  it('keeps the newest copy of each record and records known on only one side', () => {
    const local = stateWith(project({ name: 'A', isPinned: true, updatedAt: 2 }), project({ name: 'Mine', updatedAt: 2 }));
    const remote = stateWith(project({ name: 'A', updatedAt: 1 }), project({ name: 'Theirs', updatedAt: 3 }));
    const merged = mergeStates(local, remote, NOW);
    assert.deepStrictEqual(merged.projects.map((record) => [record.name, record.isPinned]), [['A', true], ['Theirs', false], ['Mine', false]]);
  });

  it('keeps a record removed on the other computer removed, unless it changed afterwards', () => {
    const local = stateWith(project({ name: 'Gone', updatedAt: NOW - 2 }), project({ name: 'Edited', updatedAt: NOW }));
    const removedAt = NOW - 1;
    const remote = { ...stateWith(), deleted: [{ id: 'Gone', deletedAt: removedAt }, { id: 'Edited', deletedAt: removedAt }] };
    assert.deepStrictEqual(mergeStates(local, remote, NOW).projects.map((record) => record.name), ['Edited']);
  });
});

describe('SyncingStateStore', () => {
  let synced: InMemoryStateStore;
  let store: SyncingStateStore;
  let projects: ProjectService;
  let clock: number;

  beforeEach(() => {
    synced = new InMemoryStateStore();
    clock = NOW;
    store = new SyncingStateStore(synced, new InMemoryMemento(), () => (clock += 1));
    projects = new ProjectService(store, new SequentialIds());
  });

  /** What Settings Sync does: replace the whole synced value with the copy of another computer. */
  async function arriveFromOtherComputer(change: (state: OrganizerState) => void): Promise<void> {
    const theirs = synced.read();
    change(theirs);
    await synced.write(theirs);
  }

  it('merges changes made here with a copy that replaced them', async () => {
    await projects.add('Here', 'D:\here');
    await arriveFromOtherComputer((theirs) => {
      theirs.projects = [project({ id: 'x', name: 'There', updatedAt: clock + DAY })];
    });
    assert.deepStrictEqual(projects.list().map((record) => record.name), ['There', 'Here']);
  });

  it('saves the merge on reconcile so the other computers get it too', async () => {
    await projects.add('Here', 'D:\here');
    await arriveFromOtherComputer((theirs) => (theirs.projects = []));
    await store.reconcile();
    assert.deepStrictEqual(synced.read().projects.map((record) => record.name), ['Here']);
  });

  it('does not bring back a tag that the other computer deleted', async () => {
    const tags = new TagService(store, new SequentialIds());
    await tags.create('web', PaletteColor.Blue);
    await arriveFromOtherComputer((theirs) => {
      theirs.tags = [];
      theirs.deleted = [{ id: 'id-1', deletedAt: clock + DAY }];
    });
    assert.deepStrictEqual(tags.list(), []);
  });
});
