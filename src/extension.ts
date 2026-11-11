import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { FileSystemInspector } from './board/FileSystemInspector';
import { configureColorIconFolder } from './colors/ColorIconFiles';
import { ColorPicker } from './colors/ColorPicker';
import { CustomColorPanel } from './colors/CustomColorPanel';
import { RecentColors } from './colors/RecentColors';
import { ProjectBoardPanel } from './board/ProjectBoardPanel';
import { GroupCommands } from './groups/GroupCommands';
import { NoteCommands } from './notes/NoteCommands';
import { NOTE_SCHEME, NoteFileSystem } from './notes/NoteFileSystem';
import { GroupPicker } from './groups/GroupPicker';
import { GroupService } from './groups/GroupService';
import { ProjectCommands } from './projects/ProjectCommands';
import { FolderLocator } from './projects/FolderLocator';
import { LocateFolderCommand } from './projects/LocateFolderCommand';
import { ProjectOpener } from './projects/ProjectOpener';
import { ProjectOrganizeCommands } from './projects/ProjectOrganizeCommands';
import { ProjectPlacement } from './projects/ProjectPlacement';
import { ProjectService } from './projects/ProjectService';
import { registerSafeCommand } from './shared/registerSafeCommand';
import { Settings } from './shared/Settings';
import { GroupDragAndDrop } from './sidebar/GroupDragAndDrop';
import { GroupLayout } from './sidebar/layouts/GroupLayout';
import { StatusLayout } from './sidebar/layouts/StatusLayout';
import { TagLayout } from './sidebar/layouts/TagLayout';
import { LayoutSwitcher } from './sidebar/LayoutSwitcher';
import { ProjectDecorations } from './sidebar/ProjectDecorations';
import { ProjectTreeProvider, TreeNode } from './sidebar/ProjectTreeProvider';
import { ProjectViewFactory } from './sidebar/ProjectViewFactory';
import { StatusCommands } from './statuses/StatusCommands';
import { StatusPicker } from './statuses/StatusPicker';
import { StatusResolver } from './statuses/StatusResolver';
import { StatusService } from './statuses/StatusService';
import { GlobalStateStore } from './storage/GlobalStateStore';
import { MachinePaths } from './storage/MachinePaths';
import { MachinePathStore } from './storage/MachinePathStore';
import { SyncingStateStore } from './storage/sync/SyncingStateStore';
import { CurrentProjectStatusBar } from './switcher/CurrentProjectStatusBar';
import { QuickSwitcher } from './switcher/QuickSwitcher';
import { TagCommands } from './tags/TagCommands';
import { TagPicker } from './tags/TagPicker';
import { TagService } from './tags/TagService';
import { TodoCommands } from './todos/TodoCommands';
import { TodoPicker } from './todos/TodoPicker';
import { TodoService } from './todos/TodoService';

const VIEW_ID = 'projectsHub.projects';

interface Core {
  settings: Settings;
  store: MachinePathStore;
  sync: SyncingStateStore;
  locator: FolderLocator;
  projects: ProjectService;
  groups: GroupService;
  tags: TagService;
  statuses: StatusService;
  todos: TodoService;
  resolver: StatusResolver;
  opener: ProjectOpener;
  colors: ColorPicker;
  currentPath: () => string | undefined;
}

/** Composition root: builds every part once and wires them together. */
export function activate(context: vscode.ExtensionContext): void {
  const core = createCore(context);
  const tree = createSidebar(context, core);
  const board = createBoard(context, core);
  const statusBar = new CurrentProjectStatusBar(core.projects, core.store, core.resolver, core.currentPath);
  const refreshAll = () => {
    tree.refresh();
    board.refresh();
    statusBar.update();
  };
  context.subscriptions.push(
    statusBar,
    ...registerCommands(core),
    core.store.onDidChange(refreshAll),
    // Global state is not pushed between windows and Settings Sync gives no event, so check on focus.
    vscode.window.onDidChangeWindowState((state) => state.focused && reconcileAndRefresh(core.sync, refreshAll)),
    vscode.workspace.onDidChangeConfiguration((event) => core.settings.affectsStatus(event) && refreshAll()),
  );
  reconcileAndRefresh(core.sync, refreshAll);
  recordCurrentProjectOpened(core.projects, core.currentPath());
}

/** Merges changes Settings Sync brought in with the ones made here, then redraws. */
function reconcileAndRefresh(sync: SyncingStateStore, refreshAll: () => void): void {
  sync
    .reconcile()
    .catch((error) => console.error('Projects Hub: could not merge synced projects', error))
    .finally(refreshAll);
}

function createCore(context: vscode.ExtensionContext): Core {
  const settings = new Settings();
  const syncedStore = new GlobalStateStore(context.globalState);
  const sync = new SyncingStateStore(syncedStore, context.globalState);
  const store = new MachinePathStore(sync, new MachinePaths(context.globalState));
  const ids = { next: () => randomUUID() };
  const projects = new ProjectService(store, ids);
  const locator = new FolderLocator(projects, store);
  const recentColors = new RecentColors(context.globalState);
  configureColorIconFolder(vscode.Uri.joinPath(context.extensionUri, 'media', 'color-icons'));
  context.subscriptions.push(syncedStore);
  return {
    settings,
    store,
    sync,
    locator,
    projects,
    groups: new GroupService(store, ids),
    tags: new TagService(store, ids),
    statuses: new StatusService(store, ids),
    todos: new TodoService(store, ids),
    resolver: new StatusResolver(() => settings.inactiveAfterDays()),
    opener: new ProjectOpener(projects, settings, locator),
    colors: new ColorPicker(new CustomColorPanel(context.extensionUri, recentColors), recentColors),
    currentPath: () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
  };
}

function createSidebar(context: vscode.ExtensionContext, core: Core): ProjectTreeProvider {
  const layoutSwitcher = new LayoutSwitcher([new GroupLayout(), new TagLayout(), new StatusLayout(core.resolver)], context.globalState);
  const views = new ProjectViewFactory(core.resolver, { currentPath: core.currentPath, folderExists: (path) => fs.existsSync(path) });
  const tree = new ProjectTreeProvider(core.store, views, layoutSwitcher.initialLayout());
  const treeView = vscode.window.createTreeView<TreeNode>(VIEW_ID, {
    treeDataProvider: tree,
    dragAndDropController: new GroupDragAndDrop(core.projects),
    canSelectMany: true,
    showCollapseAll: true,
  });
  context.subscriptions.push(
    treeView,
    vscode.window.registerFileDecorationProvider(new ProjectDecorations()),
    layoutSwitcher.register(tree, treeView),
  );
  return tree;
}

function createBoard(context: vscode.ExtensionContext, core: Core): ProjectBoardPanel {
  const inspector = new FileSystemInspector();
  const board = new ProjectBoardPanel(context.extensionUri, {
    store: core.store,
    projects: core.projects,
    opener: core.opener,
    placement: new ProjectPlacement(core.store, core.resolver),
    context: () => ({ resolver: core.resolver, inspector, currentPath: core.currentPath() }),
  });
  context.subscriptions.push(registerSafeCommand('projectsHub.openBoard', async () => board.show()));
  return board;
}

function registerCommands(core: Core): vscode.Disposable[] {
  const groupPicker = new GroupPicker(core.groups, core.colors);
  const pickers = { status: new StatusPicker(core.store), group: groupPicker, tag: new TagPicker(core.tags, core.colors), color: core.colors };
  return [
    new QuickSwitcher(core.store, core.resolver, core.opener).register(),
    ...new ProjectCommands(core.projects, core.opener).register(),
    new LocateFolderCommand(core.locator).register(),
    ...new ProjectOrganizeCommands(core.projects, pickers).register(),
    ...new GroupCommands(core.groups, groupPicker, core.colors).register(),
    ...new TagCommands(core.tags, core.colors).register(),
    ...new StatusCommands(core.statuses, core.colors).register(),
    ...new TodoCommands(core.todos, new TodoPicker(core.todos)).register(),
    ...new NoteCommands().register(),
    vscode.workspace.registerFileSystemProvider(NOTE_SCHEME, new NoteFileSystem(core.projects), { isCaseSensitive: true }),
  ];
}

function recordCurrentProjectOpened(projects: ProjectService, path: string | undefined): void {
  if (path) {
    projects.markOpened(path, Date.now()).catch((error) => console.error('Projects Hub: could not record opening', error));
  }
}

export function deactivate(): void {}
