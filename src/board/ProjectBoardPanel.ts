import * as vscode from 'vscode';
import { ProjectOpener } from '../projects/ProjectOpener';
import { ProjectPlacement } from '../projects/ProjectPlacement';
import { ProjectService } from '../projects/ProjectService';
import { reportErrors } from '../shared/reportErrors';
import { StateStore } from '../storage/StateStore';
import { BoardRequest, BoardRender } from './BoardMessages';
import { BoardContext, buildBoard } from './BoardModel';
import { boardLabels } from './boardLabels';
import { buildBoardHtml } from './boardHtml';

const VIEW_TYPE = 'projectsHub.board';

/** Helpers first, then the two views, then the entry script that uses them. */
const BOARD_SCRIPTS = ['board-common.js', 'board-columns.js', 'board-shelf.js', 'board.js'];
const BOARD_STYLES = ['board.css', 'board-shelf.css'];

/** Requests that are simply the matching sidebar command run on that project. */
const REQUEST_COMMANDS = {
  editNote: 'projectsHub.editNote',
  setBookColor: 'projectsHub.setBookColor',
} as const;

export interface BoardDependencies {
  store: StateStore;
  projects: ProjectService;
  opener: ProjectOpener;
  placement: ProjectPlacement;
  context: () => BoardContext;
}

/** A single board tab; opening it again brings the existing tab to the front. */
export class ProjectBoardPanel {
  private panel: vscode.WebviewPanel | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly dependencies: BoardDependencies,
  ) {}

  show(): void {
    if (this.panel) {
      this.panel.reveal();
      return;
    }
    this.panel = this.createPanel();
  }

  refresh(): void {
    if (this.panel) {
      void this.panel.webview.postMessage(this.renderMessage());
    }
  }

  private createPanel(): vscode.WebviewPanel {
    const media = vscode.Uri.joinPath(this.extensionUri, 'media');
    const panel = vscode.window.createWebviewPanel(VIEW_TYPE, vscode.l10n.t('Project Board'), vscode.ViewColumn.Active, {
      enableScripts: true,
      localResourceRoots: [media],
      retainContextWhenHidden: true,
    });
    panel.iconPath = new vscode.ThemeIcon('layout');
    panel.webview.html = buildBoardHtml({
      scripts: BOARD_SCRIPTS.map((name) => panel.webview.asWebviewUri(vscode.Uri.joinPath(media, name))),
      styles: BOARD_STYLES.map((name) => panel.webview.asWebviewUri(vscode.Uri.joinPath(media, name))),
      cspSource: panel.webview.cspSource,
    });
    panel.webview.onDidReceiveMessage((request: BoardRequest) => reportErrors(() => this.handle(request)));
    panel.onDidDispose(() => (this.panel = undefined));
    return panel;
  }

  private renderMessage(): BoardRender {
    const columns = buildBoard(this.dependencies.store.read(), Date.now(), this.dependencies.context());
    const translated = columns.map((column) => ({ ...column, label: column.isBuiltInLabel ? vscode.l10n.t(column.label) : column.label }));
    return { type: 'render', columns: translated, locale: vscode.env.language, labels: boardLabels() };
  }

  private async handle(request: BoardRequest): Promise<void> {
    if (request.type === 'ready') {
      this.refresh();
      return;
    }
    const project = this.dependencies.projects.list().find((candidate) => candidate.id === request.projectId);
    if (!project) {
      return;
    }
    if (request.type === 'open') {
      await this.dependencies.opener.open(project, request.newWindow || undefined);
    } else if (request.type === 'move') {
      await this.dependencies.placement.move({ projectId: project.id, statusId: request.statusId, beforeId: request.beforeId }, Date.now());
    } else {
      await vscode.commands.executeCommand(REQUEST_COMMANDS[request.type], { project });
    }
  }
}
