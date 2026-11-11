import { Color, requireColor } from '../colors/Color';
import { IdGenerator } from '../shared/IdGenerator';
import { requireById, requireName, requireUniqueName } from '../shared/NameValidation';
import { CustomStatusRecord, OrganizerState } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';
import { mutateState } from '../storage/mutateState';
import { BUILT_IN_STATUSES } from './BuiltInStatus';

const KIND = 'Status';

/** Manages the user's own statuses; the built-in ones cannot be changed. */
export class StatusService {
  constructor(
    private readonly store: StateStore,
    private readonly ids: IdGenerator,
  ) {}

  listCustom(): CustomStatusRecord[] {
    return this.store.read().statuses;
  }

  async create(name: string, color: Color): Promise<CustomStatusRecord> {
    const status: CustomStatusRecord = { id: this.ids.next(), name: requireName(name, KIND), color: requireColor(color) };
    await this.mutate((state) => {
      requireUniqueName(allNamed(state), status.name, KIND);
      state.statuses.push(status);
    });
    return status;
  }

  rename(id: string, name: string): Promise<void> {
    const trimmed = requireName(name, KIND);
    return this.mutate((state) => {
      requireUniqueName(allNamed(state), trimmed, KIND, id);
      requireById(state.statuses, id, KIND).name = trimmed;
    });
  }

  recolor(id: string, color: Color): Promise<void> {
    return this.mutate((state) => (requireById(state.statuses, id, KIND).color = requireColor(color)));
  }

  /** Projects that had this status go back to the automatic status. */
  delete(id: string): Promise<void> {
    return this.mutate((state) => {
      requireById(state.statuses, id, KIND);
      state.statuses = state.statuses.filter((status) => status.id !== id);
      state.projects
        .filter((project) => project.manualStatus === id)
        .forEach((project) => (project.manualStatus = undefined));
    });
  }

  private mutate(change: (state: OrganizerState) => void): Promise<void> {
    return mutateState(this.store, change);
  }
}

/** Custom names may not clash with the built-in names either. */
function allNamed(state: OrganizerState): { id: string; name: string }[] {
  return [...BUILT_IN_STATUSES, ...state.statuses];
}
