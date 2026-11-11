import { randomBytes } from 'crypto';
import * as vscode from 'vscode';

export interface BoardAssets {
  script: vscode.Uri;
  style: vscode.Uri;
  cspSource: string;
}

/** Static shell; all content is rendered by board.js from the messages it receives. */
export function buildBoardHtml(assets: BoardAssets): string {
  const nonce = randomBytes(16).toString('base64');
  const csp = [
    "default-src 'none'",
    `style-src ${assets.cspSource}`,
    `script-src 'nonce-${nonce}'`,
  ].join('; ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${assets.style}">
  <title>Project Board</title>
</head>
<body>
  <header class="toolbar">
    <input id="search" type="search" aria-label="Search projects">
    <span id="summary" class="summary"></span>
  </header>
  <main id="board" class="board"></main>
  <script nonce="${nonce}" src="${assets.script}"></script>
</body>
</html>`;
}
