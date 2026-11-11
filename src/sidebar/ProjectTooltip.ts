import * as vscode from 'vscode';
import { Color, readableTextOn, toHex } from '../colors/Color';
import { DEFAULT_GROUP_COLOR } from '../groups/GroupService';
import { noteSummary } from '../notes/noteSummary';
import { formatRelativeTime } from '../shared/relativeTime';
import { statusLabel } from '../statuses/StatusAppearance';
import { todoProgress } from '../todos/todoProgress';
import { ProjectView } from './ProjectView';

/** How many open to-dos the tooltip lists; the full list is one click away. */
const NEXT_TODOS_SHOWN = 3;

/** Commands the action links at the bottom may run; nothing else is trusted. */
const ACTIONS: readonly { command: string; icon: string; label: string }[] = [
  { command: 'projectsHub.openProject', icon: 'folder-opened', label: vscode.l10n.t('Open') },
  { command: 'projectsHub.openProjectInNewWindow', icon: 'empty-window', label: vscode.l10n.t('New window') },
  { command: 'projectsHub.manageTodos', icon: 'checklist', label: vscode.l10n.t('To-dos') },
  { command: 'projectsHub.editTags', icon: 'tag', label: vscode.l10n.t('Tags') },
  { command: 'projectsHub.setStatus', icon: 'circle-filled', label: vscode.l10n.t('Status') },
  { command: 'projectsHub.editNote', icon: 'note', label: vscode.l10n.t('Note') },
];

/** A compact hover: name and status, path, colored group and tag chips, last opened, note and quick actions. */
export function buildProjectTooltip(view: ProjectView, now: number = Date.now()): vscode.MarkdownString {
  const lines = [
    header(view),
    `$(folder) \`${inCode(view.project.path)}\``,
    chipsLine(view),
    lastOpenedLine(view.project.lastOpened, now),
    noteLine(view.project.note),
    todoLines(view),
    view.isMissing ? `$(warning) **${escape(vscode.l10n.t('This folder no longer exists.'))}**` : '',
  ].filter((line) => line.length > 0);
  const markdown = new vscode.MarkdownString(`${lines.join('  \n')}\n\n---\n\n${actionLinks(view)}`, true);
  markdown.supportHtml = true;
  markdown.isTrusted = { enabledCommands: ACTIONS.map((action) => action.command) };
  return markdown;
}

function header(view: ProjectView): string {
  const status = colored(`● ${statusLabel(view.status)}`, view.status.color);
  const automatic = view.project.manualStatus ? '' : ` _(${escape(vscode.l10n.t('automatic'))})_`;
  return `**${escape(view.project.name)}** &nbsp; ${status}${automatic}`;
}

function chipsLine(view: ProjectView): string {
  const group = view.group ? [chip(`$(folder) ${view.group.name}`, view.group.color ?? DEFAULT_GROUP_COLOR)] : [];
  const tags = view.tags.map((tag) => chip(`#${tag.name}`, tag.color));
  return [...group, ...tags].join(' ');
}

function lastOpenedLine(timestamp: number | undefined, now: number): string {
  if (timestamp === undefined) {
    return `$(history) ${escape(vscode.l10n.t('Never opened'))}`;
  }
  const relative = formatRelativeTime(timestamp, now, vscode.env.language);
  const exact = new Date(timestamp).toLocaleString(vscode.env.language);
  return `$(history) ${escape(vscode.l10n.t('Opened {0}', relative))} · <span style="color:#8c8c8c;">${escapeHtml(exact)}</span>`;
}

function noteLine(note: string | undefined): string {
  const summary = noteSummary(note);
  return summary ? `$(note) _${escape(summary)}_` : '';
}

/** Progress plus the next open to-dos, each on its own line. */
function todoLines(view: ProjectView): string {
  const progress = todoProgress(view.project, NEXT_TODOS_SHOWN);
  if (progress.total === 0) {
    return '';
  }
  const header = `$(checklist) ${escape(vscode.l10n.t('{0}/{1} to-dos done', progress.done, progress.total))}`;
  const next = progress.next.map((todo) => `&nbsp;&nbsp;$(circle-large-outline) ${escape(todo.text)}`);
  return [header, ...next].join('  \n');
}

/** Commands get the project the same way as from the sidebar: as `{ project }`. */
function actionLinks(view: ProjectView): string {
  const argument = encodeURIComponent(JSON.stringify([{ project: view.project }]));
  return ACTIONS.map((action) => `[$(${action.icon}) ${escape(action.label)}](command:${action.command}?${argument})`).join(' &nbsp;·&nbsp; ');
}

/** Hovers only allow inline color and background-color styles, which is exactly what chips need. */
function chip(text: string, color: Color): string {
  const style = `color:${readableTextOn(color)};background-color:${toHex(color)};`;
  return `<span style="${style}">&nbsp;${escapeLabel(text)}&nbsp;</span>`;
}

function colored(text: string, color: Color): string {
  return `<span style="color:${toHex(color)};">${escapeLabel(text)}</span>`;
}

/** Keeps a leading $(icon) working while escaping the rest of the user text. */
function escapeLabel(text: string): string {
  const icon = /^(\$\([a-z-]+\) )/.exec(text)?.[1] ?? '';
  return icon + escapeHtml(escape(text.slice(icon.length)));
}

/** Project names come from the user, so keep them from being read as markdown. */
function escape(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+\-.!|<>]/g, '\\$&');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Inside a code span only backticks can break out. */
function inCode(text: string): string {
  return text.replace(/`/g, "'");
}
