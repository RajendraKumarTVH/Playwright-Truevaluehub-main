import { SecondaryProcessDto } from 'src/app/shared/models/secondary-process.model';

export enum SecondaryProcessInfoActionTypes {
  getSecProcMachineDescription = '[getSecProcMachineDescription] Get',
  getSecProcShotBlastingMachineDescription = '[getSecProcShotBlastingMachineDescription] Get',
  getSecProcDeburringMachineDescription = '[getSecProcDeburringMachineDescription] Get',
  getPowderCoatingStockForm = '[getPowderCoatingStockForm] Get',
  getPowderCoatingMaterialDescription = '[getPowderCoatingMaterialDescription] Get',
  getPowderCoatingMachineManufacture = '[getPowderCoatingMachineManufacture] Get',
  getSecondaryProcessInfosByPartInfoId = '[GetSecondaryProcessInfoByPartInfoId] Get',
  createSecondaryProcessInfo = '[CreateSecondaryProcessInfo] Post',
  updateSecondaryProcessInfo = '[UpdateSecondaryProcessInfo] Put',
  deleteSecondaryProcessInfo = '[DeleteSecondaryProcessInfo] Delete',
  bulkUpdateOrCreateSecondaryProcessInfo = '[BulkUpdateOrCreateSecondaryProcessInfo] Put',
}

export class GetSecProcMachineDescription {
  static readonly type = SecondaryProcessInfoActionTypes.getSecProcMachineDescription;
}

export class GetSecProcShotBlastingMachineDescription {
  static readonly type = SecondaryProcessInfoActionTypes.getSecProcShotBlastingMachineDescription;
}

export class GetSecProcDeburringMachineDescription {
  static readonly type = SecondaryProcessInfoActionTypes.getSecProcDeburringMachineDescription;
}

export class GetPowderCoatingStockForm {
  static readonly type = SecondaryProcessInfoActionTypes.getPowderCoatingStockForm;
}

export class GetPowderCoatingMaterialDescription {
  static readonly type = SecondaryProcessInfoActionTypes.getPowderCoatingMaterialDescription;
}

export class GetPowderCoatingMachineManufacture {
  static readonly type = SecondaryProcessInfoActionTypes.getPowderCoatingMachineManufacture;
}

export class GetSecondaryProcessInfosByPartInfoId {
  static readonly type = SecondaryProcessInfoActionTypes.getSecondaryProcessInfosByPartInfoId;
  constructor(public partInfoId: number) {}
}

export class CreateSecondaryProcessInfo {
  static readonly type = SecondaryProcessInfoActionTypes.createSecondaryProcessInfo;
  constructor(public secondaryProcessInfo: SecondaryProcessDto) {}
}

export class UpdateSecondaryProcessInfo {
  static readonly type = SecondaryProcessInfoActionTypes.updateSecondaryProcessInfo;
  constructor(public secondaryProcessInfo: SecondaryProcessDto) {}
}

export class BulkUpdateOrCreateSecondaryProcessInfo {
  static readonly type = SecondaryProcessInfoActionTypes.bulkUpdateOrCreateSecondaryProcessInfo;
  constructor(public secondaryProcessInfo: SecondaryProcessDto[]) {}
}

export class DeleteSecondaryProcessInfo {
  static readonly type = SecondaryProcessInfoActionTypes.deleteSecondaryProcessInfo;
  constructor(
    public secondaryProcessInfoId: number,
    public partInfoId: number
  ) {}
}

export type SecondaryProcessInfoActions =
  | GetPowderCoatingMachineManufacture
  | GetPowderCoatingMaterialDescription
  | GetPowderCoatingStockForm
  | GetSecProcShotBlastingMachineDescription
  | GetSecProcDeburringMachineDescription
  | GetSecProcMachineDescription
  | GetSecondaryProcessInfosByPartInfoId
  | CreateSecondaryProcessInfo
  | UpdateSecondaryProcessInfo
  | DeleteSecondaryProcessInfo
  | BulkUpdateOrCreateSecondaryProcessInfo;
