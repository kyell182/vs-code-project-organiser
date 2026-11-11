import * as vscode from 'vscode';
import { reportErrors } from '../shared/reportErrors';
import { ProjectRecord, TodoRecord } from '../storage/OrganizerState';
import { TodoService } from './TodoService';

interface TodoItem extends vscode.QuickPickItem {
  todo?: TodoRecord;
  newText?: string;
}

const EDIT_BUTTON: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon('edit'), tooltip: vscode.l10n.t('Edit') };
const DELETE_BUTTON: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon('trash'), tooltip: vscode.l10n.t('Delete') };
const CLEAR_DONE_BUTTON: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon('clear-all'), tooltip: vscode.l10n.t('Remove finished to-dos') };

/**
 * One list for everything: tick to-dos off, type a new one and press Enter to add it
 * (the list stays open for the next one), edit or delete with the buttons on each row.
 */
export class TodoPicker {
  constructor(private readonly todos: TodoService) {}

  show(project: ProjectRecord): void {
    const quickPick = vscode.window.createQuickPick<TodoItem>();
    quickPick.canSelectMany = true;
    quickPick.placeholder = vscode.l10n.t('Tick off what is done, or type a new to-do and press Enter');
    quickPick.buttons = [CLEAR_DONE_BUTTON];
    this.refresh(quickPick, project);
    quickPick.onDidChangeValue((value) => this.showAddItem(quickPick, value));
    quickPick.onDidAccept(() => this.run(() => this.accept(quickPick, project)));
    quickPick.onDidTriggerItemButton((event) => this.run(() => this.itemButton(quickPick, project, event)));
    quickPick.onDidTriggerButton(() => this.run(() => this.clearDone(quickPick, project)));
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  }

  private refresh(quickPick: vscode.QuickPick<TodoItem>, project: ProjectRecord): void {
    const todos = this.todos.list(project.id);
    const done = todos.filter((todo) => todo.isDone).length;
    quickPick.title = vscode.l10n.t('To-dos for "{0}" · {1}/{2} done', project.name, done, todos.length);
    const items: TodoItem[] = todos.map((todo) => ({ label: todo.text, todo, buttons: [EDIT_BUTTON, DELETE_BUTTON] }));
    quickPick.items = items;
    quickPick.selectedItems = items.filter((item) => item.todo?.isDone);
  }

  /** Typing offers to add the text; replacing the items keeps the ticked ones ticked. */
  private showAddItem(quickPick: vscode.QuickPick<TodoItem>, value: string): void {
    const ticked = quickPick.selectedItems.filter((item) => item.todo);
    const todoItems = quickPick.items.filter((item) => item.todo);
    const text = value.trim();
    const add: TodoItem[] = text ? [{ label: vscode.l10n.t('Add to-do: {0}', text), newText: text, iconPath: new vscode.ThemeIcon('add'), alwaysShow: true }] : [];
    quickPick.items = [...add, ...todoItems];
    quickPick.selectedItems = ticked;
  }

  private async accept(quickPick: vscode.QuickPick<TodoItem>, project: ProjectRecord): Promise<void> {
    await this.saveTicks(quickPick, project);
    const text = quickPick.value.trim();
    if (!text) {
      quickPick.hide();
      return;
    }
    await this.todos.add(project.id, text);
    quickPick.value = '';
    this.refresh(quickPick, project);
  }

  private async itemButton(quickPick: vscode.QuickPick<TodoItem>, project: ProjectRecord, event: vscode.QuickPickItemButtonEvent<TodoItem>): Promise<void> {
    const todo = event.item.todo;
    if (!todo) {
      return;
    }
    await this.saveTicks(quickPick, project);
    if (event.button === DELETE_BUTTON) {
      await this.todos.remove(project.id, todo.id);
      this.refresh(quickPick, project);
      return;
    }
    // An input box closes the list, so the list is reopened after editing.
    quickPick.hide();
    const text = await vscode.window.showInputBox({ prompt: vscode.l10n.t('Edit to-do'), value: todo.text });
    if (text !== undefined) {
      await this.todos.edit(project.id, todo.id, text);
    }
    this.show(project);
  }

  private async clearDone(quickPick: vscode.QuickPick<TodoItem>, project: ProjectRecord): Promise<void> {
    await this.saveTicks(quickPick, project);
    await this.todos.clearDone(project.id);
    this.refresh(quickPick, project);
  }

  private saveTicks(quickPick: vscode.QuickPick<TodoItem>, project: ProjectRecord): Promise<void> {
    const doneIds = quickPick.selectedItems.flatMap((item) => (item.todo ? [item.todo.id] : []));
    return this.todos.setDone(project.id, doneIds);
  }

  private run(action: () => Promise<void>): void {
    void reportErrors(action);
  }
}
