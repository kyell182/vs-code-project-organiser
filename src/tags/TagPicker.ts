import * as vscode from 'vscode';
import { TagRecord } from '../storage/OrganizerState';
import { tagIcon } from './TagAppearance';
import { pickTagColor } from './TagColorPicker';
import { TagService } from './TagService';

interface TagItem extends vscode.QuickPickItem {
  tagId?: string;
  newName?: string;
}

/**
 * Multi-select of existing tags. Typing a name that does not exist yet offers to create it,
 * so tags can be made without leaving the picker.
 */
export class TagPicker {
  constructor(private readonly tags: TagService) {}

  async pick(selectedIds: string[]): Promise<string[] | undefined> {
    const picked = await this.show(this.tags.list(), selectedIds);
    if (!picked) {
      return undefined;
    }
    const existing = picked.flatMap((item) => (item.tagId ? [item.tagId] : []));
    const created = await this.createNew(picked.flatMap((item) => (item.newName ? [item.newName] : [])));
    return [...existing, ...created];
  }

  private async show(tags: TagRecord[], selectedIds: string[]): Promise<TagItem[] | undefined> {
    const quickPick = vscode.window.createQuickPick<TagItem>();
    const tagItems: TagItem[] = tags.map((tag) => ({ label: tag.name, tagId: tag.id, iconPath: tagIcon(tag.color) }));
    quickPick.canSelectMany = true;
    quickPick.placeholder = vscode.l10n.t('Select tags, or type a name to create a new tag');
    quickPick.items = tagItems;
    quickPick.selectedItems = tagItems.filter((item) => selectedIds.includes(item.tagId ?? ''));
    quickPick.onDidChangeValue((value) => this.updateItems(quickPick, tagItems, value));
    try {
      return await this.waitForAnswer(quickPick);
    } finally {
      quickPick.dispose();
    }
  }

  /** Replacing the items clears the selection, so the checked tags are restored afterwards. */
  private updateItems(quickPick: vscode.QuickPick<TagItem>, tagItems: TagItem[], value: string): void {
    const selected = quickPick.selectedItems.filter((item) => item.tagId);
    quickPick.items = this.withCreateItem(tagItems, value);
    quickPick.selectedItems = selected;
  }

  /** A typed new name counts as chosen on Enter, even when its row was not ticked. */
  private waitForAnswer(quickPick: vscode.QuickPick<TagItem>): Promise<TagItem[] | undefined> {
    return new Promise((resolve) => {
      quickPick.onDidAccept(() => {
        const pending = quickPick.items.filter((item) => item.newName && !quickPick.selectedItems.includes(item));
        resolve([...quickPick.selectedItems, ...pending]);
      });
      quickPick.onDidHide(() => resolve(undefined));
      quickPick.show();
    });
  }

  private withCreateItem(tagItems: TagItem[], value: string): TagItem[] {
    const name = value.trim();
    const exists = tagItems.some((item) => item.label.toLowerCase() === name.toLowerCase());
    if (name.length === 0 || exists) {
      return tagItems;
    }
    const create: TagItem = { label: vscode.l10n.t('Create tag "{0}"', name), newName: name, iconPath: new vscode.ThemeIcon('add'), alwaysShow: true };
    return [create, ...tagItems];
  }

  private async createNew(names: string[]): Promise<string[]> {
    const ids: string[] = [];
    for (const name of names) {
      const color = await pickTagColor(name);
      if (color) {
        ids.push((await this.tags.create(name, color)).id);
      }
    }
    return ids;
  }
}
