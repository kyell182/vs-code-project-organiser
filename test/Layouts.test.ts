import * as assert from 'assert';
import { PaletteColor } from '../src/colors/PaletteColor';
import { GroupLayout } from '../src/sidebar/layouts/GroupLayout';
import { StatusLayout } from '../src/sidebar/layouts/StatusLayout';
import { TagLayout } from '../src/sidebar/layouts/TagLayout';
import { BuiltInStatus } from '../src/statuses/BuiltInStatus';
import { StatusResolver } from '../src/statuses/StatusResolver';
import { createEmptyState } from '../src/storage/OrganizerState';
import { DAY, NOW, project, sampleState } from './fixtures';

const labels = (sections: { label: string }[]) => sections.map((section) => section.label);
const resolver = new StatusResolver(() => 30);

describe('StatusResolver', () => {
  const state = createEmptyState();

  it('is active when opened within the threshold', () => {
    assert.strictEqual(resolver.resolve(project({ lastOpened: NOW - 30 * DAY }), state, NOW).id, BuiltInStatus.Active);
  });

  it('is inactive when opened too long ago or never', () => {
    assert.strictEqual(resolver.resolve(project({ lastOpened: NOW - 31 * DAY }), state, NOW).id, BuiltInStatus.Inactive);
    assert.strictEqual(resolver.resolve(project({}), state, NOW).id, BuiltInStatus.Inactive);
  });

  it('lets a manual status win, including custom ones', () => {
    const custom = sampleState();
    assert.strictEqual(resolver.resolve(project({ manualStatus: BuiltInStatus.Paused, lastOpened: NOW }), custom, NOW).id, BuiltInStatus.Paused);
    assert.strictEqual(resolver.resolve(project({ manualStatus: 's1' }), custom, NOW).name, 'Waiting');
  });

  it('falls back to inactive for a status that no longer exists', () => {
    assert.strictEqual(resolver.resolve(project({ manualStatus: 'gone' }), state, NOW).id, BuiltInStatus.Inactive);
  });
});

describe('Layouts', () => {
  it('groups by group with pinned on top, keeps empty groups and lists ungrouped last', () => {
    const sections = new GroupLayout().build(sampleState());
    assert.deepStrictEqual(labels(sections), ['Pinned', 'Empty', 'School', 'Ungrouped']);
    assert.deepStrictEqual(sections[3].projects.map((item) => item.name), ['Old', 'Review', 'Toolkit']);
  });

  it('uses the group color, with blue for groups saved without one', () => {
    const sections = new GroupLayout().build(sampleState());
    assert.strictEqual(sections[1].color, PaletteColor.Blue);
    assert.strictEqual(sections[2].color, PaletteColor.Purple);
  });

  it('groups by tag and collects untagged projects', () => {
    const sections = new TagLayout().build(sampleState());
    assert.deepStrictEqual(labels(sections), ['Pinned', 'web', 'Untagged']);
    assert.strictEqual(sections[1].color, PaletteColor.Blue);
    assert.strictEqual(sections[1].isBuiltInLabel, false);
  });

  it('groups by status, custom statuses after built-in ones, and hides empty statuses', () => {
    const sections = new StatusLayout(resolver).build(sampleState(), NOW);
    assert.deepStrictEqual(labels(sections), ['Pinned', 'Active', 'Inactive', 'Archived', 'Waiting']);
    assert.strictEqual(sections[4].color, PaletteColor.Yellow);
  });
});
