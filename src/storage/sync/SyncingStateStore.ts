import { LocalMemento } from '../LocalMemento';
import { createEmptyState, OrganizerState } from '../OrganizerState';
import { ObservableStateStore } from '../StateStore';
import { mergeStates } from './mergeStates';
import { stampChanges } from './stampChanges';

/** Never registered for Settings Sync: what this computer wrote last, to merge with what comes in. */
const LAST_WRITTEN_KEY = 'projectsHub.lastWritten';

/**
 * Settings Sync replaces the whole synced state with the copy of another computer. This store keeps
 * its own last copy aside, so changes made here are merged back in instead of being lost.
 */
export class SyncingStateStore implements ObservableStateStore {
  constructor(
    private readonly synced: ObservableStateStore,
    private readonly memento: LocalMemento,
    private readonly now: () => number = Date.now,
  ) {}

  read(): OrganizerState {
    const synced = this.synced.read();
    const lastWritten = this.lastWritten();
    return lastWritten && hasDiverged(lastWritten, synced) ? mergeStates(lastWritten, synced, this.now()) : synced;
  }

  async write(state: OrganizerState): Promise<void> {
    const stamped = stampChanges(this.read(), state, this.now());
    await this.memento.update(LAST_WRITTEN_KEY, stamped);
    await this.synced.write(stamped);
  }

  /** Saves the merge when Settings Sync brought in another copy, so this computer's changes go back out. */
  async reconcile(): Promise<void> {
    const lastWritten = this.lastWritten();
    if (lastWritten && hasDiverged(lastWritten, this.synced.read())) {
      await this.write(this.read());
    }
  }

  onDidChange(listener: () => unknown): { dispose(): unknown } {
    return this.synced.onDidChange(listener);
  }

  private lastWritten(): OrganizerState | undefined {
    const stored = this.memento.get<Partial<OrganizerState>>(LAST_WRITTEN_KEY);
    return stored && { ...createEmptyState(), ...stored };
  }
}

function hasDiverged(lastWritten: OrganizerState, synced: OrganizerState): boolean {
  return JSON.stringify(lastWritten) !== JSON.stringify(synced);
}
