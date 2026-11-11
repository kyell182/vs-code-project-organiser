import * as vscode from 'vscode';
import { reportErrors } from './reportErrors';

export function registerSafeCommand<T>(id: string, handler: (argument: T) => Promise<void>): vscode.Disposable {
  return vscode.commands.registerCommand(id, (argument: T) => reportErrors(() => handler(argument)));
}
