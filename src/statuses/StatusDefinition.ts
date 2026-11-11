import { Color } from '../colors/Color';
import { StatusId } from '../storage/OrganizerState';

/** Everything needed to show a status, whether built in or made by the user. */
export interface StatusDefinition {
  id: StatusId;
  name: string;
  color: Color;
  icon: string;
  isBuiltIn: boolean;
}
