import * as assert from 'assert';
import { ProjectService } from '../src/projects/ProjectService';
import { MachinePaths } from '../src/storage/MachinePaths';
import { MachinePathStore } from '../src/storage/MachinePathStore';
import { InMemoryMemento, InMemoryStateStore, SequentialIds } from './fakes';

const SAVED_PATH = 'C:\Users\other\code\app';
const LOCAL_PATH = 'D:\code\app';

describe('MachinePathStore', () => {
  let synced: InMemoryStateStore;
  let machinePaths: MachinePaths;
  let store: MachinePathStore;
  let projects: ProjectService;

  beforeEach(async () => {
    synced = new InMemoryStateStore();
    machinePaths = new MachinePaths(new InMemoryMemento());
    store = new MachinePathStore(synced, machinePaths);
    projects = new ProjectService(store, new SequentialIds());
    await projects.add('App', SAVED_PATH);
  });

  it('shows a project at its folder on this computer', async () => {
    await store.relocate('id-1', LOCAL_PATH);
    assert.strictEqual(projects.list()[0].path, LOCAL_PATH);
    assert.strictEqual(projects.findByPath(LOCAL_PATH)?.name, 'App');
  });

  it('keeps the saved path in the synced state when other changes are written', async () => {
    await store.relocate('id-1', LOCAL_PATH);
    await projects.rename('id-1', 'Renamed');
    assert.deepStrictEqual(synced.read().projects.map((project) => [project.name, project.path]), [['Renamed', SAVED_PATH]]);
  });

  it('forgets the local folder of a removed project', async () => {
    await store.relocate('id-1', LOCAL_PATH);
    await projects.remove('id-1');
    assert.strictEqual(machinePaths.pathOf('id-1'), undefined);
  });

  it('tells listeners when a project is relocated', async () => {
    let changes = 0;
    store.onDidChange(() => (changes += 1));
    await store.relocate('id-1', LOCAL_PATH);
    assert.strictEqual(changes, 1);
  });
});
