import { IdGenerator } from '../src/shared/IdGenerator';
import { createEmptyState, OrganizerState } from '../src/storage/OrganizerState';
import { StateStore } from '../src/storage/StateStore';

export class InMemoryStateStore implements StateStore {
  private state: OrganizerState = createEmptyState();

  read(): OrganizerState {
    return structuredClone(this.state);
  }

  async write(state: OrganizerState): Promise<void> {
    this.state = structuredClone(state);
  }
}

export class SequentialIds implements IdGenerator {
  private counter = 0;

  next(): string {
    this.counter += 1;
    return `id-${this.counter}`;
  }
}
