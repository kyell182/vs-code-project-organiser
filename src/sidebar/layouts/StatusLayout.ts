import { listStatuses } from '../../statuses/StatusCatalog';
import { StatusResolver } from '../../statuses/StatusResolver';
import { OrganizerState } from '../../storage/OrganizerState';
import { Layout, LayoutId } from './Layout';
import { SectionKind } from './Section';
import { nonEmpty, pinnedSections, sortByName } from './sectionHelpers';

export class StatusLayout implements Layout {
  readonly id = LayoutId.ByStatus;
  readonly label = 'By Status';

  constructor(private readonly resolver: StatusResolver) {}

  build(state: OrganizerState, now: number) {
    const statusSections = listStatuses(state).flatMap((status) =>
      nonEmpty({
        kind: SectionKind.Status,
        id: status.id,
        label: status.name,
        isBuiltInLabel: status.isBuiltIn,
        icon: status.icon,
        color: status.color,
        projects: sortByName(state.projects.filter((project) => this.resolver.resolve(project, state, now).id === status.id)),
      }),
    );
    return [...pinnedSections(state.projects), ...statusSections];
  }
}
