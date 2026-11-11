/** What can be learned about a project by looking at its folder. */
export interface FolderFacts {
  isMissing: boolean;
  projectType?: string;
  branch?: string;
}

export interface FolderInspector {
  inspect(path: string): FolderFacts;
}
