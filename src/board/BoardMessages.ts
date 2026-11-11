import { BoardColumn } from './BoardModel';

/** Messages the board page sends to the extension. */
export type BoardRequest =
  | { type: 'ready' }
  | { type: 'open'; projectId: string; newWindow: boolean }
  | { type: 'move'; projectId: string; statusId: string; beforeId?: string }
  | { type: 'editNote'; projectId: string }
  | { type: 'setBookColor'; projectId: string };

/** The extension sends the full board each time something changes; the page simply re-renders. */
export interface BoardRender {
  type: 'render';
  columns: BoardColumn[];
  locale: string;
  labels: Record<string, string>;
}
