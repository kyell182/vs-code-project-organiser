import * as fs from 'fs';
import * as path from 'path';
import { FolderFacts, FolderInspector } from './FolderFacts';
import { detectProjectType, parseGitHead } from './ProjectTypeRules';

/** Looks only at file names and .git/HEAD, so even large projects are inspected instantly. */
export class FileSystemInspector implements FolderInspector {
  inspect(folder: string): FolderFacts {
    const fileNames = this.readFileNames(folder);
    if (!fileNames) {
      return { isMissing: true };
    }
    return { isMissing: false, projectType: detectProjectType(fileNames), branch: this.readBranch(folder) };
  }

  private readFileNames(folder: string): string[] | undefined {
    try {
      return fs.readdirSync(folder);
    } catch {
      return undefined;
    }
  }

  private readBranch(folder: string): string | undefined {
    try {
      return parseGitHead(fs.readFileSync(path.join(folder, '.git', 'HEAD'), 'utf8'));
    } catch {
      // Not a git repository (or a worktree with a .git file): simply no branch to show.
      return undefined;
    }
  }
}
