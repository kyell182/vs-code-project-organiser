import { OrganizerState } from './OrganizerState';

/** Persistence boundary: the domain services only know this abstraction. */
export interface StateStore {
  read(): OrganizerState;
  write(state: OrganizerState): Promise<void>;
}
