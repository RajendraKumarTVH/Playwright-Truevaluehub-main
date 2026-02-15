export enum ProjectStatus {
  Draft = 1,
  Costing = 2,
  Negotiation = 3,
  Completed = 4,
  OnHold = 5,
  DataExtractionInprogress = 6,
  DataExtractionReprocessing = 7,
  NeedsReview = 8,
}

export const ProjectStatusDescription = new Map<ProjectStatus, string>([
  [ProjectStatus.Draft, 'Draft'],
  [ProjectStatus.Costing, 'Costing'],
  [ProjectStatus.Negotiation, 'Negotiation'],
  [ProjectStatus.Completed, 'Completed'],
  [ProjectStatus.OnHold, 'On Hold'],
  [ProjectStatus.DataExtractionInprogress, 'Data Extraction In Progress'],
  [ProjectStatus.DataExtractionReprocessing, 'Data Extraction Reprocessing'],
  [ProjectStatus.NeedsReview, 'Needs Review'],
]);
