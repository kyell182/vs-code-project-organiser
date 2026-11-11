import * as vscode from 'vscode';
import { HexColor, normalizeHex } from './Color';
import { buildColorPickerHtml } from './colorPickerHtml';
import { RecentColors } from './RecentColors';

const VIEW_TYPE = 'projectOrganizer.colorPicker';
const DEFAULT_START_COLOR: HexColor = '#3794ff';

type PickerMessage = { type: 'ready' } | { type: 'pick'; color: string } | { type: 'cancel' };

export interface ColorRequest {
  /** Shown in the title and preview, for example the tag name. */
  subject: string;
  initial?: HexColor;
}

/** A small tab with a real color picker; it closes itself as soon as a color is chosen or cancelled. */
export class CustomColorPanel {
  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly recent: RecentColors,
  ) {}

  pick(request: ColorRequest): Promise<HexColor | undefined> {
    const panel = this.createPanel(request.subject);
    return new Promise((resolve) => {
      let settled = false;
      const finish = (color: HexColor | undefined) => {
        if (settled) {
          return;
        }
        settled = true;
        resolve(color);
        panel.dispose();
      };
      panel.onDidDispose(() => finish(undefined));
      panel.webview.onDidReceiveMessage((message: PickerMessage) => this.handle(message, panel, request, finish));
    });
  }

  private async handle(message: PickerMessage, panel: vscode.WebviewPanel, request: ColorRequest, finish: (color?: HexColor) => void) {
    if (message.type === 'ready') {
      await panel.webview.postMessage({
        type: 'init',
        subject: request.subject,
        color: request.initial ?? this.recent.list()[0] ?? DEFAULT_START_COLOR,
        recent: this.recent.list(),
        labels: pickerLabels(),
      });
      return;
    }
    if (message.type === 'cancel') {
      finish(undefined);
      return;
    }
    const color = normalizeHex(message.color);
    await this.recent.remember(color);
    finish(color);
  }

  private createPanel(subject: string): vscode.WebviewPanel {
    const media = vscode.Uri.joinPath(this.extensionUri, 'media');
    const panel = vscode.window.createWebviewPanel(VIEW_TYPE, vscode.l10n.t('Color: {0}', subject), vscode.ViewColumn.Active, {
      enableScripts: true,
      localResourceRoots: [media],
    });
    panel.iconPath = new vscode.ThemeIcon('symbol-color');
    panel.webview.html = buildColorPickerHtml({
      script: panel.webview.asWebviewUri(vscode.Uri.joinPath(media, 'color-picker.js')),
      style: panel.webview.asWebviewUri(vscode.Uri.joinPath(media, 'color-picker.css')),
      cspSource: panel.webview.cspSource,
    });
    return panel;
  }
}

function pickerLabels(): Record<string, string> {
  return {
    title: vscode.l10n.t('Pick a color for "{0}"'),
    hex: vscode.l10n.t('Hex'),
    preview: vscode.l10n.t('Preview'),
    recent: vscode.l10n.t('Recently used'),
    cancel: vscode.l10n.t('Cancel'),
    use: vscode.l10n.t('Use color'),
    invalid: vscode.l10n.t('Use a value like #FF66CC'),
    sampleProject: vscode.l10n.t('My project'),
  };
}
