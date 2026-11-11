import * as vscode from 'vscode';
import { ProjectService } from '../projects/ProjectService';
import { ProjectRecord } from '../storage/OrganizerState';

export const NOTE_SCHEME = 'projectshub-note';
const MARKDOWN_EXTENSION = '.md';

/**
 * Lets a project note open as a normal markdown file in an editor tab (highlighting, preview,
 * Ctrl+S), while the text stays stored in Projects Hub and follows Settings Sync.
 */
export class NoteFileSystem implements vscode.FileSystemProvider {
  private readonly changed = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  readonly onDidChangeFile = this.changed.event;

  constructor(private readonly projects: ProjectService) {}

  /** The file name only makes the tab readable; the project id in the path is what counts. */
  static uriFor(project: ProjectRecord): vscode.Uri {
    const fileName = `${project.name.replace(/[\\/:*?"<>|]/g, '_')}${MARKDOWN_EXTENSION}`;
    return vscode.Uri.from({ scheme: NOTE_SCHEME, path: `/${project.id}/${fileName}` });
  }

  stat(uri: vscode.Uri): vscode.FileStat {
    const project = this.projectOf(uri);
    return {
      type: vscode.FileType.File,
      ctime: 0,
      mtime: project.noteUpdatedAt ?? 0,
      size: Buffer.byteLength(project.note ?? ''),
    };
  }

  readFile(uri: vscode.Uri): Uint8Array {
    return Buffer.from(this.projectOf(uri).note ?? '', 'utf8');
  }

  async writeFile(uri: vscode.Uri, content: Uint8Array): Promise<void> {
    const project = this.projectOf(uri);
    await this.projects.setNote(project.id, Buffer.from(content).toString('utf8'));
    this.changed.fire([{ type: vscode.FileChangeType.Changed, uri }]);
  }

  watch(): vscode.Disposable {
    return new vscode.Disposable(() => undefined);
  }

  readDirectory(): never {
    throw vscode.FileSystemError.NoPermissions();
  }

  createDirectory(): never {
    throw vscode.FileSystemError.NoPermissions();
  }

  delete(): never {
    throw vscode.FileSystemError.NoPermissions();
  }

  rename(): never {
    throw vscode.FileSystemError.NoPermissions();
  }

  private projectOf(uri: vscode.Uri): ProjectRecord {
    const projectId = uri.path.split('/')[1];
    const project = this.projects.list().find((candidate) => candidate.id === projectId);
    if (!project) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    return project;
  }
}
