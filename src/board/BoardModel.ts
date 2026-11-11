import { DEFAULT_GROUP_COLOR } from '../groups/GroupService';
import { isSamePath } from '../shared/isSamePath';
import { Color } from '../colors/Color';
import { noteSummary } from '../notes/noteSummary';
import { bookColorOf } from '../projects/bookColor';
import { compareForShelf } from '../projects/shelfOrder';
import { listStatuses } from '../statuses/StatusCatalog';
import { StatusResolver } from '../statuses/StatusResolver';
import { todoProgress } from '../todos/todoProgress';
import { OrganizerState, ProjectRecord } from '../storage/OrganizerState';
import { FolderFacts, FolderInspector } from './FolderFacts';

export interface BoardChip {
  name: string;
  color: Color;
}

/** Open to-dos shown on a card or in a tooltip; the rest is in the to-do list itself. */
const NEXT_TODOS_SHOWN = 3;

export interface BoardTodos {
  done: number;
  total: number;
  next: { id: string; text: string }[];
}

export interface BoardCard extends FolderFacts {
  id: string;
  name: string;
  path: string;
  /** First line of the note only; the full note opens in an editor. */
  note?: string;
  todos: BoardTodos;
  group?: BoardChip;
  tags: BoardChip[];
  lastOpened?: number;
  isPinned: boolean;
  isCurrent: boolean;
  /** Spine color of the book on the shelf view. */
  bookColor: Color;
}

export interface BoardColumn {
  statusId: string;
  label: string;
  isBuiltInLabel: boolean;
  color: Color;
  cards: BoardCard[];
}

export interface BoardContext {
  resolver: StatusResolver;
  inspector: FolderInspector;
  currentPath?: string;
}

/** One column (or shelf) per status, empty ones too so projects can be dropped there. */
export function buildBoard(state: OrganizerState, now: number, context: BoardContext): BoardColumn[] {
  return listStatuses(state).map((status) => ({
    statusId: status.id,
    label: status.name,
    isBuiltInLabel: status.isBuiltIn,
    color: status.color,
    cards: state.projects
      .filter((project) => context.resolver.resolve(project, state, now).id === status.id)
      .sort(compareForShelf)
      .map((project) => toCard(project, state, context)),
  }));
}

function toCard(project: ProjectRecord, state: OrganizerState, context: BoardContext): BoardCard {
  const group = state.groups.find((candidate) => candidate.id === project.groupId);
  return {
    ...context.inspector.inspect(project.path),
    id: project.id,
    name: project.name,
    path: project.path,
    note: noteSummary(project.note),
    todos: toBoardTodos(project),
    group: group ? { name: group.name, color: group.color ?? DEFAULT_GROUP_COLOR } : undefined,
    tags: state.tags.filter((tag) => project.tagIds.includes(tag.id)).map((tag) => ({ name: tag.name, color: tag.color })),
    lastOpened: project.lastOpened,
    isPinned: project.isPinned,
    isCurrent: context.currentPath !== undefined && isSamePath(context.currentPath, project.path),
    bookColor: bookColorOf(project),
  };
}

function toBoardTodos(project: ProjectRecord): BoardTodos {
  const progress = todoProgress(project, NEXT_TODOS_SHOWN);
  return { done: progress.done, total: progress.total, next: progress.next.map((todo) => ({ id: todo.id, text: todo.text })) };
}
