import * as vscode from 'vscode';
import { colorIcon } from '../colors/ColorAppearance';
import { SectionTarget } from '../shared/TreeTargets';
import { Section } from './layouts/Section';

export class SectionItem extends vscode.TreeItem implements SectionTarget {
  constructor(readonly section: Section) {
    super(section.isBuiltInLabel ? vscode.l10n.t(section.label) : section.label, vscode.TreeItemCollapsibleState.Expanded);
    this.id = SectionItem.keyFor(section);
    // Only real groups and tags have a context menu (rename, delete...).
    this.contextValue = section.kind;
    this.description = String(section.projects.length);
    this.iconPath = section.color ? colorIcon(section.icon, section.color) : new vscode.ThemeIcon(section.icon);
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
}
