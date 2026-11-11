import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { GroupCommands } from './groups/GroupCommands';
import { GroupPicker } from './groups/GroupPicker';
import { GroupService } from './groups/GroupService';
import { ProjectCommands } from './projects/ProjectCommands';
import { ProjectOpener } from './projects/ProjectOpener';
import { ProjectOrganizeCommands } from './projects/ProjectOrganizeCommands';
import { ProjectService } from './projects/ProjectService';
import { StatusResolver } from './projects/StatusResolver';
import { Settings } from './shared/Settings';
import { GroupDragAndDrop } from './sidebar/GroupDragAndDrop';
import { GroupLayout } from './sidebar/layouts/GroupLayout';
import { StatusLayout } from './sidebar/layouts/StatusLayout';
import { TagLayout } from './sidebar/layouts/TagLayout';
import { LayoutSwitcher } from './sidebar/LayoutSwitcher';
import { ProjectDecorations } from './sidebar/ProjectDecorations';
import { ProjectTreeProvider, TreeNode } from './sidebar/ProjectTreeProvider';
import { ProjectViewFactory } from './sidebar/ProjectViewFactory';
import { GlobalStateStore } from './storage/GlobalStateStore';
import { CurrentProjectStatusBar } from './switcher/CurrentProjectStatusBar';
import { QuickSwitcher } from './switcher/QuickSwitcher';
import { TagPicker } from './tags/TagPicker';
import { TagService } from './tags/TagService';
import { TagCommands } from './tags/TagCommands';

const VIEW_ID = 'projectOrganizer.projects';

/** Composition root: builds every part once and wires them together. */
export function activate(context: vscode.ExtensionContext): void {
  const settings = new Settings();
  const store = new GlobalStateStore(context.globalState);
  const ids = { next: () => randomUUID() };
  const projects = new ProjectService(store, ids);
  const groups = new GroupService(store, ids);
  const tags = new TagService(store, ids);
  const resolver = new StatusResolver(() => settings.inactiveAfterDays());
  const opener = new ProjectOpener(projects, settings);
  const currentPath = () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  const layoutSwitcher = new LayoutSwitcher([new GroupLayout(), new TagLayout(), new StatusLayout(resolver)], context.globalState);
  const views = new ProjectViewFactory(resolver, { currentPath, folderExists: (path) => fs.existsSync(path) });
  const tree = new ProjectTreeProvider(store, views, layoutSwitcher.initialLayout());
  const treeView = vscode.window.createTreeView<TreeNode>(VIEW_ID, {
    treeDataProvider: tree,
    dragAndDropController: new GroupDragAndDrop(projects),
    canSelectMany: true,
    showCollapseAll: true,
  });
  const statusBar = new CurrentProjectStatusBar(projects, resolver, currentPath);
  const refreshAll = () => {
    tree.refresh();
    statusBar.update();
  };

  context.subscriptions.push(
    store,
    treeView,
    statusBar,
    vscode.window.registerFileDecorationProvider(new ProjectDecorations()),
    layoutSwitcher.register(tree, treeView),
    new QuickSwitcher(store, resolver, opener).register(),
    ...new ProjectCommands(projects, opener).register(),
    ...new ProjectOrganizeCommands(projects, new GroupPicker(groups), new TagPicker(tags)).register(),
    ...new GroupCommands(groups, new GroupPicker(groups)).register(),
    ...new TagCommands(tags).register(),
    store.onDidChange(refreshAll),
    // Global state is not pushed between windows, so re-read it whenever this window gets focus.
    vscode.window.onDidChangeWindowState((state) => state.focused && refreshAll()),
    vscode.workspace.onDidChangeConfiguration((event) => settings.affectsStatus(event) && refreshAll()),
  );

  recordCurrentProjectOpened(projects, currentPath());
}

function recordCurrentProjectOpened(projects: ProjectService, path: string | undefined): void {
  if (path) {
    projects.markOpened(path, Date.now()).catch((error) => console.error('Project Organizer: could not record opening', error));
  }
}

export function deactivate(): void {}
