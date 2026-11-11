import * as vscode from 'vscode';
import { StateStore } from '../storage/StateStore';
import { Layout } from './layouts/Layout';
import { ProjectItem } from './ProjectItem';
import { ProjectViewFactory } from './ProjectViewFactory';
import { SectionItem } from './SectionItem';

export type TreeNode = SectionItem | ProjectItem;

export class ProjectTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;

  constructor(
    private readonly store: StateStore,
    private readonly views: ProjectViewFactory,
    private layout: Layout,
  ) {}

  get currentLayout(): Layout {
    return this.layout;
  }

  useLayout(layout: Layout): void {
    this.layout = layout;
    this.refresh();
  }

  refresh(): void {
    this.changed.fire();
  }

  getTreeItem(node: TreeNode): vscode.TreeItem {
    return node;
  }

  getChildren(node?: TreeNode): TreeNode[] {
    if (node instanceof ProjectItem) {
      return [];
    }
    const now = Date.now();
    const state = this.store.read();
    if (!node) {
      return this.layout.build(state, now).map((section) => new SectionItem(section));
    }
    return node.section.projects.map((project) => new ProjectItem(this.views.create(project, state, now), node.key));
  }
}
