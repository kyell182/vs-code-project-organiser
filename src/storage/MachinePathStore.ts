import { MachinePaths } from './MachinePaths';
import { OrganizerState } from './OrganizerState';
import { ObservableStateStore } from './StateStore';

type Listener = () => unknown;

/**
 * Shows each project at its folder on this computer, while the synced state keeps the path it was saved with.
 * The rest of the extension just reads and writes state and never needs to know about other computers.
 */
export class MachinePathStore implements ObservableStateStore {
  private readonly listeners = new Set<Listener>();

  constructor(
    private readonly synced: ObservableStateStore,
    private readonly machinePaths: MachinePaths,
  ) {}

  read(): OrganizerState {
    const state = this.synced.read();
    state.projects.forEach((project) => (project.path = this.machinePaths.pathOf(project.id) ?? project.path));
    return state;
  }

  async write(state: OrganizerState): Promise<void> {
    const syncedPaths = new Map(this.synced.read().projects.map((project) => [project.id, project.path]));
    const toSync = structuredClone(state);
    toSync.projects.forEach((project) => {
      const isLocalPath = project.path === this.machinePaths.pathOf(project.id);
      project.path = isLocalPath ? (syncedPaths.get(project.id) ?? project.path) : project.path;
    });
    await this.machinePaths.keepOnly(toSync.projects.map((project) => project.id));
    await this.synced.write(toSync);
  }

  /** Points a project to another folder on this computer only. */
  async relocate(projectId: string, path: string): Promise<void> {
    await this.machinePaths.set(projectId, path);
    this.listeners.forEach((listener) => listener());
  }

  onDidChange(listener: Listener): { dispose(): void } {
    const fromSynced = this.synced.onDidChange(listener);
    this.listeners.add(listener);
    return {
      dispose: () => {
        fromSynced.dispose();
        this.listeners.delete(listener);
      },
    };
  }
}
