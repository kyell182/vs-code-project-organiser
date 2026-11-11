/** The part of VS Code's Memento the stores need, so they stay testable without VS Code. */
export interface LocalMemento {
  get<T>(key: string): T | undefined;
  update(key: string, value: unknown): Thenable<void>;
}
