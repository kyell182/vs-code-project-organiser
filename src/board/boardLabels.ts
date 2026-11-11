import * as vscode from 'vscode';

/** Every text the board page shows, translated here because the page itself has no access to l10n. */
export function boardLabels(): Record<string, string> {
  return {
    search: vscode.l10n.t('Search by name, group, #tag or note...'),
    projects: vscode.l10n.t('projects'),
    never: vscode.l10n.t('never opened'),
    open: vscode.l10n.t('Open'),
    newWindow: vscode.l10n.t('Open in new window'),
    editNote: vscode.l10n.t('Edit note'),
    current: vscode.l10n.t('open now'),
    missing: vscode.l10n.t('folder not found'),
    pinned: vscode.l10n.t('pinned'),
    dropHere: vscode.l10n.t('Drop a project here'),
  };
}
