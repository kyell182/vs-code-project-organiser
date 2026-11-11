import { ALL_STATUSES } from '../../projects/ProjectStatus';
import { StatusResolver } from '../../projects/StatusResolver';
import { OrganizerState } from '../../storage/OrganizerState';
import { Layout, LayoutId } from './Layout';
import { Section, SectionKind } from './Section';
import { nonEmpty, pinnedSections, sortByName } from './sectionHelpers';

export class StatusLayout implements Layout {
  readonly id = LayoutId.ByStatus;
  readonly label = 'By Status';

  constructor(private readonly resolver: StatusResolver) {}

  build(state: OrganizerState, now: number): Section[] {
    const statusSections = ALL_STATUSES.flatMap((status) =>
      nonEmpty({
        kind: SectionKind.Status,
        id: status,
        status,
        label: status,
        projects: sortByName(state.projects.filter((project) => this.resolver.resolve(project, now) === status)),
      }),
    );
    return [...pinnedSections(state.projects), ...statusSections];
  }
}
