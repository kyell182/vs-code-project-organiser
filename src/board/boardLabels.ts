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
    board: vscode.l10n.t('Board'),
    shelf: vscode.l10n.t('Shelf'),
    bookColor: vscode.l10n.t('Change book color'),
    bookHint: vscode.l10n.t('Click to open · Alt+click for a new window · right-click to change the color · drag to another shelf'),
    group: vscode.l10n.t('Group'),
    tags: vscode.l10n.t('Tags'),
    type: vscode.l10n.t('Type'),
    branch: vscode.l10n.t('Branch'),
    lastOpened: vscode.l10n.t('Last opened'),
    allTags: vscode.l10n.t('{0} tags'),
    todos: vscode.l10n.t('To-dos'),
    noTodos: vscode.l10n.t('Add to-dos'),
  };
}
