export class CopyScenarioDto {
  projectInfoId: number;
  basicScenarioId: number;
  scenarioName: string;
  scenarioDescription: string;
  isDefault: boolean;
  partInfoIds: number[];
  sortOrder?: number;
}

export class NewScenarioDto {
  projectInfoId: number;
  scenarioId: number;
}

export class EditScenarioDto {
  projectInfoId: number;
  scenarioId: number;
  scenarioName: string;
  scenarioDescription: string;
}

export interface PartInputDto {
  intPartNumber: string;
  projectInfoId: number;
  partInfoId: number;
}

export interface PartRecord {
  intPartNumber: string;
  projectInfoId: number;
  partInfoId: number;
  createDate: string;
  createdUserId: number;
  totalPercentage: number;
  createdUserName?: string;
  vendorId?: number;
  supplierName?: string;
  shouldCost?: number;
}

export interface PartGroup {
  intPartNumber: string;
  records: PartRecord[];
}
