export enum ProjectStatus {
  Active = 'active',
  Paused = 'paused',
  Inactive = 'inactive',
  Archived = 'archived',
}

export const ALL_STATUSES: readonly ProjectStatus[] = [
  ProjectStatus.Active,
  ProjectStatus.Paused,
  ProjectStatus.Inactive,
  ProjectStatus.Archived,
];
