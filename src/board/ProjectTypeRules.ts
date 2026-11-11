interface ProjectTypeRule {
  label: string;
  matches: (fileName: string) => boolean;
}

const exact = (name: string) => (fileName: string) => fileName.toLowerCase() === name;
const extension = (suffix: string) => (fileName: string) => fileName.toLowerCase().endsWith(suffix);

/** Checked in order: more specific markers (tsconfig) come before generic ones (package.json). */
const RULES: readonly ProjectTypeRule[] = [
  { label: 'Flutter', matches: exact('pubspec.yaml') },
  { label: 'TypeScript', matches: exact('tsconfig.json') },
  { label: 'Node.js', matches: exact('package.json') },
  { label: '.NET', matches: (name) => extension('.csproj')(name) || extension('.sln')(name) },
  { label: 'Java', matches: (name) => exact('pom.xml')(name) || exact('build.gradle')(name) || exact('build.gradle.kts')(name) },
  { label: 'Python', matches: (name) => exact('pyproject.toml')(name) || exact('requirements.txt')(name) },
  { label: 'Rust', matches: exact('cargo.toml') },
  { label: 'Go', matches: exact('go.mod') },
  { label: 'PHP', matches: exact('composer.json') },
  { label: 'Ruby', matches: exact('gemfile') },
];

export function detectProjectType(fileNames: string[]): string | undefined {
  return RULES.find((rule) => fileNames.some(rule.matches))?.label;
}

/** Reads the branch from the contents of .git/HEAD; a detached head shows its short commit hash. */
export function parseGitHead(head: string): string | undefined {
  const trimmed = head.trim();
  const reference = /^ref: refs\/heads\/(.+)$/.exec(trimmed);
  if (reference) {
    return reference[1];
  }
  return /^[0-9a-f]{40}$/i.test(trimmed) ? trimmed.slice(0, 7) : undefined;
}
