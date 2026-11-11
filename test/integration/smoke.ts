import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'kyell182.projects-hub';
const TAB_UPDATE_DELAY_MS = 500;

/** Entry point called by @vscode/test-electron inside the running VS Code. */
export async function run(): Promise<void> {
  const extension = vscode.extensions.getExtension(EXTENSION_ID);
  assert.ok(extension, 'extension is installed');
  await extension.activate();

  const commands = await vscode.commands.getCommands(true);
  const declared: string[] = extension.packageJSON.contributes.commands.map((command: { command: string }) => command.command);
  const missing = declared.filter((id) => !commands.includes(id));
  assert.deepStrictEqual(missing, [], 'every declared command is registered');

  await vscode.commands.executeCommand('workbench.view.extension.projectsHub');
  await vscode.commands.executeCommand('projectsHub.openBoard');
  // The tab model updates shortly after the panel is created.
  await new Promise((resolve) => setTimeout(resolve, TAB_UPDATE_DELAY_MS));
  const boardTab = vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .find((tab) => tab.input instanceof vscode.TabInputWebview && tab.input.viewType.endsWith('projectsHub.board'));
  assert.ok(boardTab, 'project board opened as a webview tab');
  // The note file system answers for its scheme: an unknown project gives "file not found", not "no provider".
  await assert.rejects(
    Promise.resolve(vscode.workspace.fs.stat(vscode.Uri.parse('projectshub-note:/unknown-project/note.md'))),
    (error: unknown) => error instanceof vscode.FileSystemError && error.code === 'FileNotFound',
  );
  console.log(`Smoke test passed: ${declared.length} commands registered, sidebar, board and note file system work.`);
}
