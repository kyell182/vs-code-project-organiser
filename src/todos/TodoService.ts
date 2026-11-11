import { IdGenerator } from '../shared/IdGenerator';
import { requireById, requireName } from '../shared/NameValidation';
import { OrganizerState, ProjectRecord, TodoRecord } from '../storage/OrganizerState';
import { StateStore } from '../storage/StateStore';
import { mutateState } from '../storage/mutateState';

const KIND = 'To-do';

/** The to-do list of a project: next steps that can be ticked off. */
export class TodoService {
  constructor(
    private readonly store: StateStore,
    private readonly ids: IdGenerator,
  ) {}

  list(projectId: string): TodoRecord[] {
    return requireById(this.store.read().projects, projectId, 'Project').todos ?? [];
  }

  async add(projectId: string, text: string): Promise<TodoRecord> {
    const todo: TodoRecord = { id: this.ids.next(), text: requireName(text, KIND), isDone: false };
    await this.update(projectId, (todos) => [...todos, todo]);
    return todo;
  }

  toggle(projectId: string, todoId: string): Promise<void> {
    return this.change(projectId, todoId, (todo) => (todo.isDone = !todo.isDone));
  }

  /** Sets which to-dos are done in one step, as the to-do picker returns them. */
  setDone(projectId: string, doneIds: string[]): Promise<void> {
    return this.update(projectId, (todos) => todos.map((todo) => ({ ...todo, isDone: doneIds.includes(todo.id) })));
  }

  edit(projectId: string, todoId: string, text: string): Promise<void> {
    const trimmed = requireName(text, KIND);
    return this.change(projectId, todoId, (todo) => (todo.text = trimmed));
  }

  remove(projectId: string, todoId: string): Promise<void> {
    return this.update(projectId, (todos) => {
      requireById(todos, todoId, KIND);
      return todos.filter((todo) => todo.id !== todoId);
    });
  }

  clearDone(projectId: string): Promise<void> {
    return this.update(projectId, (todos) => todos.filter((todo) => !todo.isDone));
  }

  private change(projectId: string, todoId: string, change: (todo: TodoRecord) => void): Promise<void> {
    return this.update(projectId, (todos) => {
      change(requireById(todos, todoId, KIND));
      return todos;
    });
  }

  private update(projectId: string, change: (todos: TodoRecord[]) => TodoRecord[]): Promise<void> {
    return mutateState(this.store, (state: OrganizerState) => {
      const project: ProjectRecord = requireById(state.projects, projectId, 'Project');
      project.todos = change(project.todos ?? []);
    });
  }
}
