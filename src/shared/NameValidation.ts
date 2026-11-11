import { DomainError } from './DomainError';

interface Named {
  id: string;
  name: string;
}

export function requireName(name: string, kind: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new DomainError(`${kind} name cannot be empty.`);
  }
  return trimmed;
}

/** Names are compared case-insensitively so "Web" and "web" cannot coexist. */
export function requireUniqueName(items: Named[], name: string, kind: string, ownId?: string): void {
  const lower = name.toLowerCase();
  const duplicate = items.some((item) => item.id !== ownId && item.name.toLowerCase() === lower);
  if (duplicate) {
    throw new DomainError(`A ${kind.toLowerCase()} named "${name}" already exists.`);
  }
}

export function requireById<T extends { id: string }>(items: T[], id: string, kind: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) {
    throw new DomainError(`${kind} not found.`);
  }
  return found;
}
