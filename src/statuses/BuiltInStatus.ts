import { PaletteColor } from '../colors/PaletteColor';
import { StatusDefinition } from './StatusDefinition';

export enum BuiltInStatus {
  Active = 'active',
  Paused = 'paused',
  Inactive = 'inactive',
  Archived = 'archived',
}

/** Names are English source strings; the UI translates them, custom names are shown as typed. */
export const BUILT_IN_STATUSES: readonly StatusDefinition[] = [
  { id: BuiltInStatus.Active, name: 'Active', color: PaletteColor.Green, icon: 'circle-filled', isBuiltIn: true },
  { id: BuiltInStatus.Paused, name: 'Paused', color: PaletteColor.Orange, icon: 'debug-pause', isBuiltIn: true },
  { id: BuiltInStatus.Inactive, name: 'Inactive', color: PaletteColor.Red, icon: 'circle-outline', isBuiltIn: true },
  { id: BuiltInStatus.Archived, name: 'Archived', color: PaletteColor.Gray, icon: 'archive', isBuiltIn: true },
];
