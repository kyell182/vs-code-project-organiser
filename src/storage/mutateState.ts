import { OrganizerState } from './OrganizerState';
import { StateStore } from './StateStore';

/** Read-modify-write in one step, so a failed validation never persists half a change. */
export async function mutateState(store: StateStore, change: (state: OrganizerState) => void): Promise<void> {
  const state = store.read();
  change(state);
  await store.write(state);
}
