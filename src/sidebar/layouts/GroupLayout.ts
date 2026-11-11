import { OrganizerState } from '../../storage/OrganizerState';
import { Layout, LayoutId } from './Layout';
import { Section, SectionKind } from './Section';
import { nonEmpty, pinnedSections, sortByName } from './sectionHelpers';

/** Empty groups stay visible, otherwise a freshly created group could never be found. */
export class GroupLayout implements Layout {
  readonly id = LayoutId.ByGroup;
  readonly label = 'By Group';

  build(state: OrganizerState): Section[] {
    const groups = [...state.groups].sort((a, b) => a.name.localeCompare(b.name));
    const groupSections: Section[] = groups.map((group) => ({
      kind: SectionKind.Group,
      id: group.id,
      label: group.name,
      projects: sortByName(state.projects.filter((project) => project.groupId === group.id)),
    }));
    const ungrouped: Section = {
      kind: SectionKind.Ungrouped,
      label: 'Ungrouped',
      projects: sortByName(state.projects.filter((project) => project.groupId === undefined)),
    };
    return [...pinnedSections(state.projects), ...groupSections, ...nonEmpty(ungrouped)];
  }
}
