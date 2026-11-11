import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'your-publisher-id.project-organizer';

/** Entry point called by @vscode/test-electron inside the running VS Code. */
export async function run(): Promise<void> {
  const extension = vscode.extensions.getExtension(EXTENSION_ID);
  assert.ok(extension, 'extension is installed');
  await extension.activate();

  const commands = await vscode.commands.getCommands(true);
  const declared: string[] = extension.packageJSON.contributes.commands.map((command: { command: string }) => command.command);
  const missing = declared.filter((id) => !commands.includes(id));
  assert.deepStrictEqual(missing, [], 'every declared command is registered');

  await vscode.commands.executeCommand('workbench.view.extension.projectOrganizer');
  console.log(`Smoke test passed: ${declared.length} commands registered, sidebar opened.`);
}
