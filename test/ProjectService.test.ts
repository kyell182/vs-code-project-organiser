import * as assert from 'assert';
import { GroupService } from '../src/groups/GroupService';
import { ProjectService } from '../src/projects/ProjectService';
import { ProjectStatus } from '../src/projects/ProjectStatus';
import { DomainError } from '../src/shared/DomainError';
import { TagService } from '../src/tags/TagService';
import { TagColor } from '../src/tags/TagColor';
import { InMemoryStateStore, SequentialIds } from './fakes';

describe('ProjectService', () => {
  let projects: ProjectService;
  let groups: GroupService;
  let tags: TagService;

  beforeEach(() => {
    const store = new InMemoryStateStore();
    const ids = new SequentialIds();
    projects = new ProjectService(store, ids);
    groups = new GroupService(store, ids);
    tags = new TagService(store, ids);
  });

  it('adds a project with a trimmed name', async () => {
    await projects.add('  Motio  ', 'D:\\vives\\Motio');
    assert.strictEqual(projects.list()[0].name, 'Motio');
  });

  it('refuses the same folder twice, regardless of case and slashes', async () => {
    await projects.add('Motio', 'D:\\vives\\Motio');
    await assert.rejects(projects.add('Copy', 'd:/vives/motio/'), DomainError);
  });

  it('refuses an empty name', async () => {
    await assert.rejects(projects.add('   ', 'D:\\a'), DomainError);
  });

  it('assigns and clears a group', async () => {
    const project = await projects.add('A', 'D:\\a');
    const group = await groups.create('School');
    await projects.assignGroup(project.id, group.id);
    assert.strictEqual(projects.list()[0].groupId, group.id);
    await projects.assignGroup(project.id, undefined);
    assert.strictEqual(projects.list()[0].groupId, undefined);
  });

  it('refuses an unknown group', async () => {
    const project = await projects.add('A', 'D:\\a');
    await assert.rejects(projects.assignGroup(project.id, 'nope'), DomainError);
  });

  it('sets tags without duplicates', async () => {
    const project = await projects.add('A', 'D:\\a');
    const tag = await tags.create('web', TagColor.Blue);
    await projects.setTags(project.id, [tag.id, tag.id]);
    assert.deepStrictEqual(projects.list()[0].tagIds, [tag.id]);
  });

  it('toggles pin and sets a manual status', async () => {
    const project = await projects.add('A', 'D:\\a');
    await projects.togglePin(project.id);
    await projects.setStatus(project.id, ProjectStatus.Paused);
    const saved = projects.list()[0];
    assert.strictEqual(saved.isPinned, true);
    assert.strictEqual(saved.manualStatus, ProjectStatus.Paused);
  });

  it('records when a saved project was opened and ignores unknown folders', async () => {
    await projects.add('A', 'D:\\a');
    await projects.markOpened('D:/a', 1000);
    await projects.markOpened('D:\\unknown', 2000);
    assert.strictEqual(projects.list()[0].lastOpened, 1000);
  });

  it('removes a project', async () => {
    const project = await projects.add('A', 'D:\\a');
    await projects.remove(project.id);
    assert.strictEqual(projects.list().length, 0);
  });
});
