import * as vscode from 'vscode';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { ProjectTarget } from '../shared/TreeTargets';
import { TodoPicker } from './TodoPicker';
import { TodoService } from './TodoService';

export class TodoCommands {
  constructor(
    private readonly todos: TodoService,
    private readonly picker: TodoPicker,
  ) {}

  register(): vscode.Disposable[] {
    return [
      registerSafeCommand<ProjectTarget>('projectsHub.manageTodos', async (item) => this.picker.show(item.project)),
      registerSafeCommand<{ projectId: string; todoId: string }>('projectsHub.toggleTodo', (target) =>
        this.todos.toggle(target.projectId, target.todoId),
      ),
    ];
  }
}
