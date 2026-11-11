import { randomBytes } from 'crypto';
import * as vscode from 'vscode';

export interface BoardAssets {
  /** Loaded in this order: shared helpers first, the entry script last. */
  scripts: vscode.Uri[];
  styles: vscode.Uri[];
  cspSource: string;
}

/** Static shell; all content is rendered by the scripts from the messages they receive. */
export function buildBoardHtml(assets: BoardAssets): string {
  const nonce = randomBytes(16).toString('base64');
  const csp = ["default-src 'none'", `style-src ${assets.cspSource}`, `script-src 'nonce-${nonce}'`].join('; ');
  const styles = assets.styles.map((style) => `<link rel="stylesheet" href="${style}">`).join('\n  ');
  const scripts = assets.scripts.map((script) => `<script nonce="${nonce}" src="${script}"></script>`).join('\n  ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${styles}
  <title>Project Board</title>
</head>
<body>
  <header class="toolbar">
    <div class="view-switch" role="group" aria-label="View">
      <button data-view="shelf"></button>
      <button data-view="board"></button>
    </div>
    <input id="search" type="search" aria-label="Search projects">
    <span id="summary" class="summary"></span>
  </header>
  <main id="board" class="board"></main>
  <div id="tooltip" class="tooltip" role="tooltip" hidden></div>
  ${scripts}
</body>
</html>`;
}
