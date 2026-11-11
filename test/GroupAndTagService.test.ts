import * as assert from 'assert';
import { GroupService } from '../src/groups/GroupService';
import { ProjectService } from '../src/projects/ProjectService';
import { DomainError } from '../src/shared/DomainError';
import { TagService } from '../src/tags/TagService';
import { TagColor } from '../src/tags/TagColor';
import { InMemoryStateStore, SequentialIds } from './fakes';

describe('GroupService and TagService', () => {
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

  it('refuses duplicate group names case-insensitively', async () => {
    await groups.create('School');
    await assert.rejects(groups.create('school'), DomainError);
  });

  it('allows renaming a group to its own name in another case', async () => {
    const group = await groups.create('school');
    await groups.rename(group.id, 'School');
    assert.strictEqual(groups.list()[0].name, 'School');
  });

  it('keeps projects when their group is deleted', async () => {
    const project = await projects.add('A', 'D:\\a');
    const group = await groups.create('School');
    await projects.assignGroup(project.id, group.id);
    await groups.delete(group.id);
    assert.strictEqual(projects.list().length, 1);
    assert.strictEqual(projects.list()[0].groupId, undefined);
  });

  it('recolors and renames a tag', async () => {
    const tag = await tags.create('web', TagColor.Blue);
    await tags.recolor(tag.id, TagColor.Red);
    await tags.rename(tag.id, 'frontend');
    assert.deepStrictEqual(tags.list()[0], { id: tag.id, name: 'frontend', color: TagColor.Red });
  });

  it('removes a deleted tag from every project', async () => {
    const project = await projects.add('A', 'D:\\a');
    const web = await tags.create('web', TagColor.Blue);
    const school = await tags.create('school', TagColor.Green);
    await projects.setTags(project.id, [web.id, school.id]);
    await tags.delete(web.id);
    assert.deepStrictEqual(projects.list()[0].tagIds, [school.id]);
  });
});
