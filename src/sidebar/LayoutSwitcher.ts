import * as vscode from 'vscode';
import { registerSafeCommand } from '../shared/registerSafeCommand';
import { Layout, LayoutId } from './layouts/Layout';
import { ProjectTreeProvider } from './ProjectTreeProvider';

const LAYOUT_KEY = 'projectOrganizer.layout';

const LAYOUT_ICONS: Record<LayoutId, string> = {
  [LayoutId.ByGroup]: 'folder',
  [LayoutId.ByTag]: 'tag',
  [LayoutId.ByStatus]: 'circle-filled',
};

interface LayoutItem extends vscode.QuickPickItem {
  layout: Layout;
}

/** Lets the user pick a layout and remembers it per machine (not synced: it is a view preference). */
export class LayoutSwitcher {
  constructor(
    private readonly layouts: Layout[],
    private readonly memento: vscode.Memento,
  ) {}

  initialLayout(): Layout {
    const savedId = this.memento.get<LayoutId>(LAYOUT_KEY);
    return this.layouts.find((layout) => layout.id === savedId) ?? this.layouts[0];
  }

  register(tree: ProjectTreeProvider, view: vscode.TreeView<unknown>): vscode.Disposable {
    this.showLayoutIn(view, tree.currentLayout);
    return registerSafeCommand('projectOrganizer.switchLayout', () => this.switch(tree, view));
  }

  private async switch(tree: ProjectTreeProvider, view: vscode.TreeView<unknown>): Promise<void> {
    const items: LayoutItem[] = this.layouts.map((layout) => ({
      label: vscode.l10n.t(layout.label),
      layout,
      iconPath: new vscode.ThemeIcon(LAYOUT_ICONS[layout.id]),
      description: layout.id === tree.currentLayout.id ? vscode.l10n.t('current') : undefined,
    }));
    const picked = await vscode.window.showQuickPick(items, { placeHolder: vscode.l10n.t('Organize the sidebar...') });
    if (!picked) {
      return;
    }
    tree.useLayout(picked.layout);
    this.showLayoutIn(view, picked.layout);
    await this.memento.update(LAYOUT_KEY, picked.layout.id);
  }

  private showLayoutIn(view: vscode.TreeView<unknown>, layout: Layout): void {
    view.description = vscode.l10n.t(layout.label);
  }
}
