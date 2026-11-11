import * as vscode from 'vscode';
import { createEmptyState, OrganizerState } from './OrganizerState';
import { StateStore } from './StateStore';

const STATE_KEY = 'projectsHub.state';

/**
 * Stores everything in VS Code's global state, so projects are shared by all windows,
 * and registers the key for Settings Sync so they follow the user to other machines.
 */
export class GlobalStateStore implements StateStore, vscode.Disposable {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChange = this.changed.event;

  constructor(private readonly memento: vscode.Memento & { setKeysForSync(keys: readonly string[]): void }) {
    memento.setKeysForSync([STATE_KEY]);
  }

  read(): OrganizerState {
    const stored = this.memento.get<Partial<OrganizerState>>(STATE_KEY);
    return structuredClone({ ...createEmptyState(), ...stored });
  }

  async write(state: OrganizerState): Promise<void> {
    await this.memento.update(STATE_KEY, state);
    this.changed.fire();
  }

  dispose(): void {
    this.changed.dispose();
  }
}
