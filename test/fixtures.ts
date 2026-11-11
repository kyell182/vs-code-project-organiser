import { PaletteColor } from '../src/colors/PaletteColor';
import { BuiltInStatus } from '../src/statuses/BuiltInStatus';
import { OrganizerState, ProjectRecord } from '../src/storage/OrganizerState';

export const DAY = 24 * 60 * 60 * 1000;
export const NOW = 100 * DAY;

export function project(overrides: Partial<ProjectRecord>): ProjectRecord {
  return { id: overrides.name ?? 'p', name: 'p', path: 'D:\\p', tagIds: [], isPinned: false, ...overrides };
}

export function sampleState(): OrganizerState {
  return {
    groups: [{ id: 'g1', name: 'School', color: PaletteColor.Purple }, { id: 'g2', name: 'Empty' }],
    tags: [{ id: 't1', name: 'web', color: PaletteColor.Blue }],
    statuses: [{ id: 's1', name: 'Waiting', color: PaletteColor.Yellow }],
    projects: [
      project({ name: 'Motio', groupId: 'g1', tagIds: ['t1'], lastOpened: NOW - DAY }),
      project({ name: 'Toolkit', isPinned: true, lastOpened: NOW - 60 * DAY }),
      project({ name: 'Old', manualStatus: BuiltInStatus.Archived }),
      project({ name: 'Review', manualStatus: 's1' }),
    ],
  };
}
