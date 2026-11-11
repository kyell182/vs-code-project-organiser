/** The part of VS Code's Memento this needs, so it stays testable without VS Code. */
export interface LocalMemento {
  get<T>(key: string): T | undefined;
  update(key: string, value: unknown): Thenable<void>;
}

/** Never registered for Settings Sync: each computer keeps its own folder locations. */
const MACHINE_PATHS_KEY = 'projectsHub.machinePaths';

/** Project id → folder on this computer, for projects that live somewhere else here than where they were saved. */
export class MachinePaths {
  constructor(private readonly memento: LocalMemento) {}

  pathOf(projectId: string): string | undefined {
    return this.all()[projectId];
  }

  async set(projectId: string, path: string): Promise<void> {
    await this.memento.update(MACHINE_PATHS_KEY, { ...this.all(), [projectId]: path });
  }

  /** Forgets the locations of projects that were removed, so the list does not grow forever. */
  async keepOnly(projectIds: readonly string[]): Promise<void> {
    const kept = Object.entries(this.all()).filter(([projectId]) => projectIds.includes(projectId));
    if (kept.length !== Object.keys(this.all()).length) {
      await this.memento.update(MACHINE_PATHS_KEY, Object.fromEntries(kept));
    }
  }

  private all(): Record<string, string> {
    return this.memento.get<Record<string, string>>(MACHINE_PATHS_KEY) ?? {};
  }
}
