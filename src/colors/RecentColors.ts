import * as vscode from 'vscode';
import { HexColor, isHexColor, normalizeHex } from './Color';

const RECENT_KEY = 'projectOrganizer.recentColors';
const MAX_RECENT = 8;

/** The last custom colors used, newest first, so a color can be reused across tags, groups and statuses. */
export class RecentColors {
  constructor(private readonly memento: vscode.Memento) {}

  list(): HexColor[] {
    const stored = this.memento.get<string[]>(RECENT_KEY, []);
    return stored.filter(isHexColor).map(normalizeHex);
  }

  async remember(color: HexColor): Promise<void> {
    const updated = [color, ...this.list().filter((existing) => existing !== color)].slice(0, MAX_RECENT);
    await this.memento.update(RECENT_KEY, updated);
  }
}
