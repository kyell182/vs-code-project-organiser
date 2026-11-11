import { Color } from '../colors/Color';
import { PaletteColor } from '../colors/PaletteColor';
import { DEFAULT_GROUP_COLOR } from '../groups/GroupService';
import { GroupRecord, ProjectRecord } from '../storage/OrganizerState';

/** Gray tells at a glance that a project is not in a group yet. */
const UNGROUPED_BOOK_COLOR = PaletteColor.Gray;

/** A chosen book color stands out on purpose; otherwise the book shows the color of its group. */
export function bookColorOf(project: ProjectRecord, group: GroupRecord | undefined): Color {
  if (project.color) {
    return project.color;
  }
  return group ? (group.color ?? DEFAULT_GROUP_COLOR) : UNGROUPED_BOOK_COLOR;
}
