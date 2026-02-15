export class ProjectsInfoData {
  ProjectInfoId!: number;
  ProjectDesc!: string;
  ProjectStatusId!: number;
  CurrentSpend!: number;
  ShouldCostSpend!: number;
  OpportunityIdentified!: number;
  OpportunityImplemented!: number;
  IsArchived!: boolean;
  StatusText!: string;
  canShowLock: boolean = false;
}

export class BomuploadDataModel {
  Level!: number;
  PartNumber!: string;
  PartDescription!: string;
  PartQty!: string;
  UnitofMeasure!: string;
  ProjectId!: string;
}
