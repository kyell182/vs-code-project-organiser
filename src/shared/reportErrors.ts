import * as vscode from 'vscode';
import { DomainError } from './DomainError';

/** Runs a user action and turns failures into a visible message instead of a silent rejection. */
export async function reportErrors(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    if (error instanceof DomainError) {
      vscode.window.showWarningMessage(error.message);
      return;
    }
    const detail = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(vscode.l10n.t('Project Organizer: {0}', detail));
  }
}
