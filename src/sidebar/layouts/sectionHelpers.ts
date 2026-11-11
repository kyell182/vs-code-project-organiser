import { PaletteColor } from '../../colors/PaletteColor';
import { ProjectRecord } from '../../storage/OrganizerState';
import { Section, SectionKind } from './Section';

export function sortByName(projects: ProjectRecord[]): ProjectRecord[] {
  return [...projects].sort((a, b) => a.name.localeCompare(b.name));
}

/** Every layout starts with the pinned projects, if there are any. */
export function pinnedSections(projects: ProjectRecord[]): Section[] {
  const pinned = projects.filter((project) => project.isPinned);
  return nonEmpty({
    kind: SectionKind.Pinned,
    label: 'Pinned',
    isBuiltInLabel: true,
    icon: 'pinned',
    color: PaletteColor.Yellow,
    projects: sortByName(pinned),
  });
}

export function nonEmpty(section: Section): Section[] {
  return section.projects.length > 0 ? [section] : [];
}
