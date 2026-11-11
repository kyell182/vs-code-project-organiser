import { IdGenerator } from '../shared/IdGenerator';
import { Color, requireColor } from '../colors/Color';
import { PaletteColor } from '../colors/PaletteColor';
import { requireById, requireName, requireUniqueName } from '../shared/NameValidation';
import { GroupRecord, OrganizerState } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';
import { mutateState } from '../storage/mutateState';

const KIND = 'Group';
export const DEFAULT_GROUP_COLOR = PaletteColor.Blue;

/** Groups are purely virtual: they never touch folders on disk. */
export class GroupService {
  constructor(
    private readonly store: StateStore,
    private readonly ids: IdGenerator,
  ) {}

  list(): GroupRecord[] {
    return [...this.store.read().groups].sort((a, b) => a.name.localeCompare(b.name));
  }

  async create(name: string, color: Color = DEFAULT_GROUP_COLOR): Promise<GroupRecord> {
    const group: GroupRecord = { id: this.ids.next(), name: requireName(name, KIND), color: requireColor(color) };
    await this.mutate((state) => {
      requireUniqueName(state.groups, group.name, KIND);
      state.groups.push(group);
    });
    return group;
  }

  rename(id: string, name: string): Promise<void> {
    const trimmed = requireName(name, KIND);
    return this.mutate((state) => {
      requireUniqueName(state.groups, trimmed, KIND, id);
      requireById(state.groups, id, KIND).name = trimmed;
    });
  }

  recolor(id: string, color: Color): Promise<void> {
    return this.mutate((state) => (requireById(state.groups, id, KIND).color = requireColor(color)));
  }

  /** Projects of a deleted group are kept and become ungrouped. */
  delete(id: string): Promise<void> {
    return this.mutate((state) => {
      requireById(state.groups, id, KIND);
      state.groups = state.groups.filter((group) => group.id !== id);
      state.projects
        .filter((project) => project.groupId === id)
        .forEach((project) => (project.groupId = undefined));
    });
  }

  private mutate(change: (state: OrganizerState) => void): Promise<void> {
    return mutateState(this.store, change);
  }
}
