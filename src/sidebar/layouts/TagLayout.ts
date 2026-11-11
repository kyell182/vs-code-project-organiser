import { OrganizerState } from '../../storage/OrganizerState';
import { Layout, LayoutId } from './Layout';
import { Section, SectionKind } from './Section';
import { nonEmpty, pinnedSections, sortByName } from './sectionHelpers';

/** A project with several tags appears under each of them; empty tags stay visible so they can be managed. */
export class TagLayout implements Layout {
  readonly id = LayoutId.ByTag;
  readonly label = 'By Tag';

  build(state: OrganizerState): Section[] {
    const tags = [...state.tags].sort((a, b) => a.name.localeCompare(b.name));
    const tagSections: Section[] = tags.map((tag) => ({
      kind: SectionKind.Tag,
      id: tag.id,
      label: tag.name,
      tagColor: tag.color,
      projects: sortByName(state.projects.filter((project) => project.tagIds.includes(tag.id))),
    }));
    const untagged: Section = {
      kind: SectionKind.Untagged,
      label: 'Untagged',
      projects: sortByName(state.projects.filter((project) => project.tagIds.length === 0)),
    };
    return [...pinnedSections(state.projects), ...tagSections, ...nonEmpty(untagged)];
  }
}
