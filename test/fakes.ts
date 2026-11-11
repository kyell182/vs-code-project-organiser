import { IdGenerator } from '../src/shared/IdGenerator';
import { createEmptyState, OrganizerState } from '../src/storage/OrganizerState';
import { LocalMemento } from '../src/storage/LocalMemento';
import { StateStore } from '../src/storage/StateStore';

export class InMemoryStateStore implements StateStore {
  private state: OrganizerState = createEmptyState();
  private readonly listeners = new Set<() => unknown>();

  read(): OrganizerState {
    return structuredClone(this.state);
  }

  async write(state: OrganizerState): Promise<void> {
    this.state = structuredClone(state);
    this.listeners.forEach((listener) => listener());
  }

  onDidChange(listener: () => unknown): { dispose(): void } {
    this.listeners.add(listener);
    return { dispose: () => this.listeners.delete(listener) };
  }
}

export class InMemoryMemento implements LocalMemento {
  private readonly values = new Map<string, unknown>();

  get<T>(key: string): T | undefined {
    return structuredClone(this.values.get(key)) as T | undefined;
  }

  async update(key: string, value: unknown): Promise<void> {
    this.values.set(key, structuredClone(value));
  }
}

export class SequentialIds implements IdGenerator {
  private counter = 0;

  next(): string {
    this.counter += 1;
    return `id-${this.counter}`;
  }
}
