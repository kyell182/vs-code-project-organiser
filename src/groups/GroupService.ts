import { IdGenerator } from '../shared/IdGenerator';
import { requireById, requireName, requireUniqueName } from '../shared/NameValidation';
import { GroupRecord, OrganizerState } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';
import { mutateState } from '../storage/mutateState';

const KIND = 'Group';

/** Groups are purely virtual: they never touch folders on disk. */
export class GroupService {
  constructor(
    private readonly store: StateStore,
    private readonly ids: IdGenerator,
  ) {}

  list(): GroupRecord[] {
    return [...this.store.read().groups].sort((a, b) => a.name.localeCompare(b.name));
  }

  async create(name: string): Promise<GroupRecord> {
    const group: GroupRecord = { id: this.ids.next(), name: requireName(name, KIND) };
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
