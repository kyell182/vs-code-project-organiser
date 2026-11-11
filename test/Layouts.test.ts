import * as assert from 'assert';
import { ProjectStatus } from '../src/projects/ProjectStatus';
import { StatusResolver } from '../src/projects/StatusResolver';
import { GroupLayout } from '../src/sidebar/layouts/GroupLayout';
import { SectionKind } from '../src/sidebar/layouts/Section';
import { StatusLayout } from '../src/sidebar/layouts/StatusLayout';
import { TagLayout } from '../src/sidebar/layouts/TagLayout';
import { OrganizerState, ProjectRecord } from '../src/storage/OrganizerState';
import { TagColor } from '../src/tags/TagColor';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 100 * DAY;

function project(overrides: Partial<ProjectRecord>): ProjectRecord {
  return { id: overrides.name ?? 'p', name: 'p', path: 'D:\\p', tagIds: [], isPinned: false, ...overrides };
}

function sampleState(): OrganizerState {
  return {
    groups: [{ id: 'g1', name: 'School' }, { id: 'g2', name: 'Empty' }],
    tags: [{ id: 't1', name: 'web', color: TagColor.Blue }],
    projects: [
      project({ name: 'Motio', groupId: 'g1', tagIds: ['t1'], lastOpened: NOW - DAY }),
      project({ name: 'Toolkit', isPinned: true, lastOpened: NOW - 60 * DAY }),
      project({ name: 'Old', manualStatus: ProjectStatus.Archived }),
    ],
  };
}

const labels = (sections: { label: string }[]) => sections.map((section) => section.label);

describe('StatusResolver', () => {
  const resolver = new StatusResolver(() => 30);

  it('is active when opened within the threshold', () => {
    assert.strictEqual(resolver.resolve(project({ lastOpened: NOW - 30 * DAY }), NOW), ProjectStatus.Active);
  });

  it('is inactive when opened too long ago or never', () => {
    assert.strictEqual(resolver.resolve(project({ lastOpened: NOW - 31 * DAY }), NOW), ProjectStatus.Inactive);
    assert.strictEqual(resolver.resolve(project({}), NOW), ProjectStatus.Inactive);
  });

  it('lets a manual status win', () => {
    const paused = project({ manualStatus: ProjectStatus.Paused, lastOpened: NOW });
    assert.strictEqual(resolver.resolve(paused, NOW), ProjectStatus.Paused);
  });
});

describe('Layouts', () => {
  it('groups by group with pinned on top, keeps empty groups and lists ungrouped last', () => {
    const sections = new GroupLayout().build(sampleState());
    assert.deepStrictEqual(labels(sections), ['Pinned', 'Empty', 'School', 'Ungrouped']);
    assert.deepStrictEqual(sections[3].projects.map((item) => item.name), ['Old', 'Toolkit']);
  });

  it('groups by tag and collects untagged projects', () => {
    const sections = new TagLayout().build(sampleState());
    assert.deepStrictEqual(labels(sections), ['Pinned', 'web', 'Untagged']);
    assert.strictEqual(sections[1].tagColor, TagColor.Blue);
  });

  it('groups by status and hides empty statuses', () => {
    const sections = new StatusLayout(new StatusResolver(() => 30)).build(sampleState(), NOW);
    assert.deepStrictEqual(
      sections.map((section) => section.kind === SectionKind.Status ? section.status : section.kind),
      [SectionKind.Pinned, ProjectStatus.Active, ProjectStatus.Inactive, ProjectStatus.Archived],
    );
  });
});
