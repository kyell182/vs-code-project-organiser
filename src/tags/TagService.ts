import { IdGenerator } from '../shared/IdGenerator';
import { requireById, requireName, requireUniqueName } from '../shared/NameValidation';
import { OrganizerState, TagRecord } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';
import { mutateState } from '../storage/mutateState';
import { TagColor } from './TagColor';

const KIND = 'Tag';

export class TagService {
  constructor(
    private readonly store: StateStore,
    private readonly ids: IdGenerator,
  ) {}

  list(): TagRecord[] {
    return [...this.store.read().tags].sort((a, b) => a.name.localeCompare(b.name));
  }

  async create(name: string, color: TagColor): Promise<TagRecord> {
    const tag: TagRecord = { id: this.ids.next(), name: requireName(name, KIND), color };
    await this.mutate((state) => {
      requireUniqueName(state.tags, tag.name, KIND);
      state.tags.push(tag);
    });
    return tag;
  }

  rename(id: string, name: string): Promise<void> {
    const trimmed = requireName(name, KIND);
    return this.mutate((state) => {
      requireUniqueName(state.tags, trimmed, KIND, id);
      requireById(state.tags, id, KIND).name = trimmed;
    });
  }

  recolor(id: string, color: TagColor): Promise<void> {
    return this.mutate((state) => (requireById(state.tags, id, KIND).color = color));
  }

  /** Removing a tag also removes it from every project that carried it. */
  delete(id: string): Promise<void> {
    return this.mutate((state) => {
      requireById(state.tags, id, KIND);
      state.tags = state.tags.filter((tag) => tag.id !== id);
      state.projects.forEach((project) => (project.tagIds = project.tagIds.filter((tagId) => tagId !== id)));
    });
  }

  private mutate(change: (state: OrganizerState) => void): Promise<void> {
    return mutateState(this.store, change);
  }
}
