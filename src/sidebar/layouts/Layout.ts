import { OrganizerState } from '../../storage/OrganizerState';
import { Section } from './Section';

export enum LayoutId {
  ByGroup = 'byGroup',
  ByTag = 'byTag',
  ByStatus = 'byStatus',
}

/** Strategy for dividing the saved projects into sidebar sections. */
export interface Layout {
  readonly id: LayoutId;
  readonly label: string;
  build(state: OrganizerState, now: number): Section[];
}
