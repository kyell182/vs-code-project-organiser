import * as vscode from 'vscode';
import { ProjectView } from './ProjectView';
import { statusLabel } from '../statuses/StatusAppearance';

export function buildProjectTooltip(view: ProjectView): vscode.MarkdownString {
  const lines = [
    `### ${escape(view.project.name)}`,
    `$(folder) \`${inCode(view.project.path)}\``,
    '',
    `**${vscode.l10n.t('Status')}:** ${statusLabel(view.status)}${view.project.manualStatus ? '' : ` _(${vscode.l10n.t('automatic')})_`}`,
    `**${vscode.l10n.t('Group')}:** ${escape(view.groupName ?? vscode.l10n.t('none'))}`,
    `**${vscode.l10n.t('Tags')}:** ${view.tags.length > 0 ? view.tags.map((tag) => `\`#${inCode(tag.name)}\``).join(' ') : vscode.l10n.t('none')}`,
    `**${vscode.l10n.t('Last opened')}:** ${formatLastOpened(view.project.lastOpened)}`,
  ];
  if (view.project.note) {
    lines.push(`$(note) _${escape(view.project.note)}_`);
  }
  if (view.isMissing) {
    lines.push('', `$(warning) **${vscode.l10n.t('This folder no longer exists.')}**`);
  }
  const markdown = new vscode.MarkdownString(lines.join('\n\n'), true);
  return markdown;
}

function formatLastOpened(timestamp: number | undefined): string {
  return timestamp === undefined ? vscode.l10n.t('never') : new Date(timestamp).toLocaleString();
}

/** Project names come from the user, so keep them from being read as markdown. */
function escape(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+\-.!|<>]/g, '\\$&');
}

/** Inside a code span only backticks can break out. */
function inCode(text: string): string {
  return text.replace(/`/g, "'");
}
