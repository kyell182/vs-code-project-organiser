import * as assert from 'assert';
import { PaletteColor } from '../src/colors/PaletteColor';
import { bookColorOf } from '../src/projects/bookColor';
import { ProjectPlacement } from '../src/projects/ProjectPlacement';
import { ProjectService } from '../src/projects/ProjectService';
import { compareForShelf, placeBefore } from '../src/projects/shelfOrder';
import { DomainError } from '../src/shared/DomainError';
import { BuiltInStatus } from '../src/statuses/BuiltInStatus';
import { StatusResolver } from '../src/statuses/StatusResolver';
import { InMemoryStateStore, SequentialIds } from './fakes';
import { project } from './fixtures';

describe('shelfOrder', () => {
  it('puts placed projects first, then pinned, then by name', () => {
    const sorted = [
      project({ name: 'Zeta' }),
      project({ name: 'Alpha' }),
      project({ name: 'Pinned', isPinned: true }),
      project({ name: 'Second', order: 1 }),
      project({ name: 'First', order: 0 }),
    ].sort(compareForShelf);
    assert.deepStrictEqual(sorted.map((item) => item.name), ['First', 'Second', 'Pinned', 'Alpha', 'Zeta']);
  });

  it('places an id in front of another, or at the end', () => {
    assert.deepStrictEqual(placeBefore(['a', 'b', 'c'], 'c', 'a'), ['c', 'a', 'b']);
    assert.deepStrictEqual(placeBefore(['a', 'b', 'c'], 'a'), ['b', 'c', 'a']);
    assert.deepStrictEqual(placeBefore(['a', 'b'], 'x', 'missing'), ['a', 'b', 'x']);
  });
});

describe('bookColorOf', () => {
  it('uses the chosen color, otherwise a stable derived one', () => {
    assert.strictEqual(bookColorOf(project({ color: '#123456' })), '#123456');
    const derived = bookColorOf(project({ id: 'abc' }));
    assert.strictEqual(bookColorOf(project({ id: 'abc' })), derived);
    assert.notStrictEqual(derived, PaletteColor.Gray);
  });
});

describe('ProjectPlacement', () => {
  let store: InMemoryStateStore;
  let projects: ProjectService;
  let placement: ProjectPlacement;
  const NOW = 1000;

  beforeEach(() => {
    store = new InMemoryStateStore();
    projects = new ProjectService(store, new SequentialIds());
    placement = new ProjectPlacement(store, new StatusResolver(() => 30));
  });

  it('moves a project to another shelf in front of a given project', async () => {
    const a = await projects.add('A', 'D:\\a');
    const b = await projects.add('B', 'D:\\b');
    const c = await projects.add('C', 'D:\\c');
    await projects.setStatus(a.id, BuiltInStatus.Paused);
    await projects.setStatus(b.id, BuiltInStatus.Paused);
    await placement.move({ projectId: c.id, statusId: BuiltInStatus.Paused, beforeId: b.id }, NOW);
    const paused = projects.list().filter((item) => item.manualStatus === BuiltInStatus.Paused).sort(compareForShelf);
    assert.deepStrictEqual(paused.map((item) => item.name), ['A', 'C', 'B']);
  });

  it('refuses an unknown status', async () => {
    const a = await projects.add('A', 'D:\\a');
    await assert.rejects(placement.move({ projectId: a.id, statusId: 'nope' }, NOW), DomainError);
  });

  it('stores a book color', async () => {
    const a = await projects.add('A', 'D:\\a');
    await projects.setColor(a.id, '#AbC');
    assert.strictEqual(projects.list()[0].color, '#aabbcc');
  });
});
