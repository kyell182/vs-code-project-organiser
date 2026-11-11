import * as assert from 'assert';
import { GroupService } from '../src/groups/GroupService';
import { ProjectService } from '../src/projects/ProjectService';
import { DomainError } from '../src/shared/DomainError';
import { PaletteColor } from '../src/colors/PaletteColor';
import { StatusService } from '../src/statuses/StatusService';
import { InMemoryStateStore, SequentialIds } from './fakes';

describe('StatusService', () => {
  let projects: ProjectService;
  let statuses: StatusService;
  let groups: GroupService;

  beforeEach(() => {
    const store = new InMemoryStateStore();
    const ids = new SequentialIds();
    projects = new ProjectService(store, ids);
    statuses = new StatusService(store, ids);
    groups = new GroupService(store, ids);
  });

  it('creates a custom status that projects can use', async () => {
    const project = await projects.add('A', 'D:\\a');
    const waiting = await statuses.create('Waiting for feedback', PaletteColor.Yellow);
    await projects.setStatus(project.id, waiting.id);
    assert.strictEqual(projects.list()[0].manualStatus, waiting.id);
  });

  it('refuses names that clash with built-in or existing statuses', async () => {
    await assert.rejects(statuses.create('active', PaletteColor.Red), DomainError);
    await statuses.create('Waiting', PaletteColor.Yellow);
    await assert.rejects(statuses.create('waiting', PaletteColor.Blue), DomainError);
  });

  it('renames and recolors a custom status', async () => {
    const status = await statuses.create('Waiting', PaletteColor.Yellow);
    await statuses.rename(status.id, 'Blocked');
    await statuses.recolor(status.id, PaletteColor.Red);
    assert.deepStrictEqual(statuses.listCustom()[0], { id: status.id, name: 'Blocked', color: PaletteColor.Red });
  });

  it('puts projects back on automatic when their status is deleted', async () => {
    const project = await projects.add('A', 'D:\\a');
    const status = await statuses.create('Waiting', PaletteColor.Yellow);
    await projects.setStatus(project.id, status.id);
    await statuses.delete(status.id);
    assert.strictEqual(projects.list()[0].manualStatus, undefined);
  });

  it('gives new groups a color and lets it change', async () => {
    const group = await groups.create('School');
    assert.strictEqual(group.color, PaletteColor.Blue);
    await groups.recolor(group.id, PaletteColor.Green);
    assert.strictEqual(groups.list()[0].color, PaletteColor.Green);
  });
});
