/** A rule violation the user can fix; shown as-is in the UI. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
