/** Windows paths are case-insensitive and may use either slash style. */
export function isSamePath(left: string, right: string): boolean {
  return normalize(left) === normalize(right);
}

function normalize(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
}
