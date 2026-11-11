import * as vscode from 'vscode';
import { SectionTarget } from '../shared/TreeTargets';
import { Section, SectionKind } from './layouts/Section';
import { statusIcon, statusLabel } from '../projects/StatusAppearance';
import { tagIcon } from '../tags/TagAppearance';

const KIND_ICONS: Partial<Record<SectionKind, vscode.ThemeIcon>> = {
  [SectionKind.Pinned]: new vscode.ThemeIcon('pinned', new vscode.ThemeColor('charts.yellow')),
  [SectionKind.Group]: new vscode.ThemeIcon('folder', new vscode.ThemeColor('charts.blue')),
  [SectionKind.Ungrouped]: new vscode.ThemeIcon('folder-opened'),
  [SectionKind.Untagged]: new vscode.ThemeIcon('circle-slash'),
};

const KIND_LABELS: Partial<Record<SectionKind, string>> = {
  [SectionKind.Pinned]: vscode.l10n.t('Pinned'),
  [SectionKind.Ungrouped]: vscode.l10n.t('Ungrouped'),
  [SectionKind.Untagged]: vscode.l10n.t('Untagged'),
};

export class SectionItem extends vscode.TreeItem implements SectionTarget {
  constructor(readonly section: Section) {
    super(SectionItem.labelFor(section), vscode.TreeItemCollapsibleState.Expanded);
    this.id = SectionItem.keyFor(section);
    // Only real groups and tags have a context menu (rename, delete...).
    this.contextValue = section.kind;
    this.description = String(section.projects.length);
    this.iconPath = SectionItem.iconFor(section);
  }

  get targetId(): string | undefined {
    return this.section.id;
  }

  get targetName(): string {
    return this.section.label;
  }

  get key(): string {
    return SectionItem.keyFor(this.section);
  }

  static keyFor(section: Section): string {
    return `${section.kind}:${section.id ?? ''}`;
  }

  private static labelFor(section: Section): string {
    if (section.status) {
      return statusLabel(section.status);
    }
    return KIND_LABELS[section.kind] ?? section.label;
  }

  private static iconFor(section: Section): vscode.ThemeIcon | undefined {
    if (section.status) {
      return statusIcon(section.status);
    }
    if (section.tagColor) {
      return tagIcon(section.tagColor);
    }
    return KIND_ICONS[section.kind];
  }
}
