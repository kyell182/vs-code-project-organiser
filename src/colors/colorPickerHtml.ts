import { randomBytes } from 'crypto';
import * as vscode from 'vscode';

export interface PickerAssets {
  script: vscode.Uri;
  style: vscode.Uri;
  cspSource: string;
}

export function buildColorPickerHtml(assets: PickerAssets): string {
  const nonce = randomBytes(16).toString('base64');
  const csp = ["default-src 'none'", `style-src ${assets.cspSource}`, `script-src 'nonce-${nonce}'`].join('; ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${assets.style}">
  <title>Pick a color</title>
</head>
<body>
  <main class="picker">
    <h1 id="title"></h1>
    <div class="choose">
      <input id="wheel" type="color" aria-label="Color">
      <div class="fields">
        <label for="hex" id="hex-label"></label>
        <input id="hex" type="text" maxlength="7" spellcheck="false">
        <span id="error" class="error" role="alert"></span>
        <div id="recent-block" class="recent">
          <span id="recent-label" class="muted"></span>
          <div id="recent" class="swatches"></div>
        </div>
      </div>
    </div>
    <section class="preview">
      <span id="preview-label" class="muted"></span>
      <div class="sample-row"><span class="sample-dot"></span><span id="sample-name"></span><span id="sample-chip" class="sample-chip"></span></div>
      <div class="sample-card"><strong id="sample-card-name"></strong><span id="sample-card-chip" class="sample-chip"></span></div>
    </section>
    <footer class="buttons">
      <button id="cancel" class="secondary"></button>
      <button id="use" class="primary"></button>
    </footer>
  </main>
  <script nonce="${nonce}" src="${assets.script}"></script>
</body>
</html>`;
}
