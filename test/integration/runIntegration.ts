import * as os from 'os';
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

/**
 * Starts a real VS Code with the extension loaded. Set VSCODE_EXECUTABLE to reuse an installed
 * VS Code instead of downloading one.
 */
async function main(): Promise<void> {
  // The working directory instead of __dirname: VS Code splits launch paths on spaces on Windows,
  // so on such a path this script is run from a junction without spaces.
  const root = process.cwd();
  await runTests({
    extensionDevelopmentPath: root,
    extensionTestsPath: path.join(root, 'out', 'test', 'integration', 'smoke'),
    vscodeExecutablePath: process.env.VSCODE_EXECUTABLE,
    // An own profile folder in the temp dir: the default one lives next to the project and breaks on paths with spaces.
    launchArgs: ['--disable-extensions', `--user-data-dir=${path.join(os.tmpdir(), 'project-organizer-test')}`],
  });
}

main().catch((error) => {
  console.error('Integration tests failed:', error);
  process.exit(1);
});
