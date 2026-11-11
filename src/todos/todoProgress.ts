import { ProjectRecord, TodoRecord } from '../storage/OrganizerState';

export interface TodoProgress {
  done: number;
  total: number;
  /** The first open to-dos, in list order; these are the next steps. */
  next: TodoRecord[];
}

export function todoProgress(project: ProjectRecord, nextCount: number): TodoProgress {
  const todos = project.todos ?? [];
  const open = todos.filter((todo) => !todo.isDone);
  return { done: todos.length - open.length, total: todos.length, next: open.slice(0, nextCount) };
}
