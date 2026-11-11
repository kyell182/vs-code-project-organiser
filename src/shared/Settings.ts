import * as vscode from 'vscode';

const SECTION = 'projectOrganizer';
const DEFAULT_INACTIVE_AFTER_DAYS = 30;

export class Settings {
  openInNewWindow(): boolean {
    return this.configuration().get<boolean>('openInNewWindow', false);
  }

  inactiveAfterDays(): number {
    return this.configuration().get<number>('inactiveAfterDays', DEFAULT_INACTIVE_AFTER_DAYS);
  }

  affectsStatus(event: vscode.ConfigurationChangeEvent): boolean {
    return event.affectsConfiguration(`${SECTION}.inactiveAfterDays`);
  }

  private configuration(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(SECTION);
  }
}
