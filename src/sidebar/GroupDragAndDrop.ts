import * as vscode from 'vscode';
import { ProjectService } from '../projects/ProjectService';
import { reportErrors } from '../shared/reportErrors';
import { SectionKind } from './layouts/Section';
import { ProjectItem } from './ProjectItem';
import { TreeNode } from './ProjectTreeProvider';
import { SectionItem } from './SectionItem';

const MIME_TYPE = 'application/vnd.code.tree.projectshub.projects';

/** Dropping projects on a group assigns them; dropping on "Ungrouped" clears their group. */
export class GroupDragAndDrop implements vscode.TreeDragAndDropController<TreeNode> {
  readonly dragMimeTypes = [MIME_TYPE];
  readonly dropMimeTypes = [MIME_TYPE];

  constructor(private readonly projects: ProjectService) {}

  handleDrag(source: readonly TreeNode[], transfer: vscode.DataTransfer): void {
    const ids = source.filter((node) => node instanceof ProjectItem).map((node) => (node as ProjectItem).project.id);
    transfer.set(MIME_TYPE, new vscode.DataTransferItem(ids));
  }

  async handleDrop(target: TreeNode | undefined, transfer: vscode.DataTransfer): Promise<void> {
    const groupId = this.targetGroup(target);
    const ids: string[] | undefined = transfer.get(MIME_TYPE)?.value;
    if (groupId === null || !ids) {
      return;
    }
    await reportErrors(async () => {
      for (const id of ids) {
        await this.projects.assignGroup(id, groupId);
      }
    });
  }

  /** Returns the group id, undefined for "no group", or null when the target is not a group at all. */
  private targetGroup(target: TreeNode | undefined): string | undefined | null {
    if (!(target instanceof SectionItem)) {
      return null;
    }
    if (target.section.kind === SectionKind.Group) {
      return target.section.id;
    }
    return target.section.kind === SectionKind.Ungrouped ? undefined : null;
  }
}
