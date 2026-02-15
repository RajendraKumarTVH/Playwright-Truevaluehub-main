export enum MasterActionTypes {
  getCommodityData = '[getCommodityData] Get',
  getSubCommodityData = '[getSubCommodityData] Get',
  getTechnologyData = '[getTechnologyData] Get',
  getCountryData = '[getCountryData] Get',
  getLaborRates = '[getLaborRates] Get',
  getCountryPlatingData = '[getCountryPlatingData] Get',
  getMaterialGroups = '[getMaterialGroups] Get',
  getMaterialTypes = '[getMaterialTypes] Get',
  getProcessTypeList = '[getProcessTypeList] Get',
  getAccessories = '[getAccessories] Get',
  getAllMachineTypes = '[getAllMachineTypes] Get',
  getStockForms = '[getStockForms] Get',
  getCanUserUpdateCosting = '[getCanUserUpdateCosting] Get',
  getCountryFormMatrix = '[getCountryFormMatrix] Get',
  getUserGroups = '[getUserGroups] Get',
  getMarketMonth = '[getMarketMonth] Get',
  getStockFormCategories = '[getStockFormCategories] Get',
  getAllProcessMasterData = '[getAllProcessMasterData] Get',
  getSamplingRate = '[getSamplingRate] Get',
  getDrillingCuttingSpeed = '[getDrillingCuttingSpeed] Get',
  getPartingCuttingSpeed = '[getPartingCuttingSpeed] Get',
  getHandlingTime = '[getHandlingTime] Get',
  getToolLoadingTime = '[getToolLoadingTime] Get',
  getStrokeRate = '[getStrokeRate] Get',
  getStrokeRateManual = '[getStrokeRateManual] Get',
  getLaserCuttingSpeed = '[getLaserCuttingSpeed] Get',
  getStampingMatrialLookUpList = '[getStampingMatrialLookUpList] Get',
  getConnectorAssemblyManufacturingLookUpList = '[getConnectorAssemblyManufacturingLookUpList] Get',
  getSupplierList = '[getSupplierList] Get',
  getBuLocation = '[getBuLocation] Get',
  getTurningLookup = '[getTurningLookup] Get',
  getFacingLookup = '[getFacingLookup] Get',
  getGroovingLookup = '[getGroovingLookup] Get',
  getFaceMillingLookup = '[getFaceMillingLookup] Get',
  getSlotLookup = '[getSlotLookup] Get',
  getEndMillingLookup = '[getEndMillingLookup] Get',
  getGrindingLookup = '[getGrindingLookup] Get',
  getToolingLookup = '[GetToolingLookup] Get',
  getGearCuttingLookup = '[getGearCuttingLookup] Get',
  getMigLookup = '[getMigLookup] Get',
  getForgingLookup = '[getForgingLookup] Get',
  getBoringLookup = '[getBoringLookup] Get',
  getBoringCuttingSpeed = '[getBoringCuttingSpeed] Get',
  getTappingCuttingSpeed = '[getTappingCuttingSpeed] Get',
  getThermoFormingLookup = '[getThermoFormingLookup] Get',
  getFormingTimeLookup = '[getFormingTimeLookup] Get',
  getWiringHarnessLookup = '[getWiringHarnessLookup] Get',
  getToolingCountryMasterData = '[getToolingCountryMasterData] Get',
  getPlasmaCuttingLookup = '[getPlasmaCuttingLookup] Get',
  getUnspscMasterData = '[getUnspscMasterData] Get',
  getHtsMasterData = '[getHtsMasterData] Get',
  getMaterialMasterByCountryId = '[getMaterialMasterByCountryId] Get',
  getPackageDescriptionMasterData = '[GetPackagingDescriptionMasterData] Get',
  getPackageFormMasterData = '[GetPackagingFormMasterData] Get',
  getPackageSizeDefinitionMasterData = '[GetPackagingSizeDefinitionMasterData] Get',
}

export class GetToolingCountryMasterData {
  static readonly type = MasterActionTypes.getToolingCountryMasterData;
}

export class GetCommodityData {
  static readonly type = MasterActionTypes.getCommodityData;
}

export class GetSubCommodityData {
  static readonly type = MasterActionTypes.getSubCommodityData;
}

export class GetAccessories {
  static readonly type = MasterActionTypes.getAccessories;
}

export class GetAllMachineTypes {
  static readonly type = MasterActionTypes.getAllMachineTypes;
}
export class GetStockForms {
  static readonly type = MasterActionTypes.getStockForms;
}

export class GetCountryFormMatrix {
  static readonly type = MasterActionTypes.getCountryFormMatrix;
}
export class GetUserGroups {
  static readonly type = MasterActionTypes.getUserGroups;
}
export class GetMarketMonth {
  static readonly type = MasterActionTypes.getStockForms;
  constructor(public marketMonth: string) {}
}
export class GetCanUserUpdateCosting {
  static readonly type = MasterActionTypes.getCanUserUpdateCosting;
  constructor(public canUpdate: boolean) {}
}
export class GetStockFormCategories {
  static readonly type = MasterActionTypes.getStockFormCategories;
}

export class GetAllProcessMasterData {
  static readonly type = MasterActionTypes.getAllProcessMasterData;
}

export class GetCountryData {
  static readonly type = MasterActionTypes.getCountryData;
}

export class GetLaborRates {
  static readonly type = MasterActionTypes.getLaborRates;
}

export class GetCountryPlatingData {
  static readonly type = MasterActionTypes.getCountryPlatingData;
}

export class GetMaterialGroups {
  static readonly type = MasterActionTypes.getMaterialGroups;
}

export class GetMaterialTypes {
  static readonly type = MasterActionTypes.getMaterialTypes;
}

export class GetProcessTypeList {
  static readonly type = MasterActionTypes.getProcessTypeList;
}

export class GetTechnologyData {
  static readonly type = MasterActionTypes.getTechnologyData;
}

export class GetSamplingRate {
  static readonly type = MasterActionTypes.getSamplingRate;
}
export class GetDrillingCuttingSpeed {
  static readonly type = MasterActionTypes.getDrillingCuttingSpeed;
}

export class GetPartingCuttingSpeed {
  static readonly type = MasterActionTypes.getPartingCuttingSpeed;
}
export class GetHandlingTime {
  static readonly type = MasterActionTypes.getHandlingTime;
}

export class GetToolLoadingTime {
  static readonly type = MasterActionTypes.getToolLoadingTime;
}
export class GetStrokeRate {
  static readonly type = MasterActionTypes.getStrokeRate;
}
export class GetStrokeRateManual {
  static readonly type = MasterActionTypes.getStrokeRateManual;
}

export class GetLaserCuttingSpeed {
  static readonly type = MasterActionTypes.getLaserCuttingSpeed;
}

export class GetStampingMatrialLookUpList {
  static readonly type = MasterActionTypes.getStampingMatrialLookUpList;
}

export class GetConnectorAssemblyManufacturingLookUpList {
  static readonly type = MasterActionTypes.getConnectorAssemblyManufacturingLookUpList;
}

export class GetTurningLookup {
  static readonly type = MasterActionTypes.getTurningLookup;
}

export class GetFacingLookup {
  static readonly type = MasterActionTypes.getFacingLookup;
}

export class GetGroovingLookup {
  static readonly type = MasterActionTypes.getGroovingLookup;
}

export class GetMigLookup {
  static readonly type = MasterActionTypes.getMigLookup;
}

export class GetForgingLookup {
  static readonly type = MasterActionTypes.getForgingLookup;
}

export class GetFaceMillingLookup {
  static readonly type = MasterActionTypes.getFaceMillingLookup;
}

export class GetSupplierList {
  static readonly type = MasterActionTypes.getSupplierList;
}

export class GetBuLocation {
  static readonly type = MasterActionTypes.getBuLocation;
}

export class GetSlotLookup {
  static readonly type = MasterActionTypes.getSlotLookup;
}

export class GetEndMillingLookup {
  static readonly type = MasterActionTypes.getEndMillingLookup;
}

export class GetGrindingLookup {
  static readonly type = MasterActionTypes.getGrindingLookup;
}

export class GetToolingLookup {
  static readonly type = MasterActionTypes.getToolingLookup;
}

export class GetGearCuttingLookup {
  static readonly type = MasterActionTypes.getGearCuttingLookup;
}

export class GetBoringLookup {
  static readonly type = MasterActionTypes.getBoringLookup;
}

export class GetBoringCuttingSpeed {
  static readonly type = MasterActionTypes.getBoringCuttingSpeed;
}

export class GetTappingCuttingSpeed {
  static readonly type = MasterActionTypes.getTappingCuttingSpeed;
}

export class GetThermoFormingLookup {
  static readonly type = MasterActionTypes.getThermoFormingLookup;
}

export class GetFormingTimeLookup {
  static readonly type = MasterActionTypes.getFormingTimeLookup;
}

export class GetWiringHarnessLookup {
  static readonly type = MasterActionTypes.getWiringHarnessLookup;
}

export class GetPlasmaCuttingLookup {
  static readonly type = MasterActionTypes.getPlasmaCuttingLookup;
}
export class GetMaterialMasterByCountryId {
  static readonly type = MasterActionTypes.getMaterialMasterByCountryId;
  constructor(public partInfoId: number) {}
}

export class GetAllUnspscMasterData {
  static readonly type = MasterActionTypes.getUnspscMasterData;
}

export class GetAllHtsMasterData {
  static readonly type = MasterActionTypes.getHtsMasterData;
}
export class GetPackageDescriptionMasterData {
  static readonly type = MasterActionTypes.getPackageDescriptionMasterData;
}
export class GetPackageFormMasterData {
  static readonly type = MasterActionTypes.getPackageFormMasterData;
}
export class GetPackageSizeDefinitionMasterData {
  static readonly type = MasterActionTypes.getPackageSizeDefinitionMasterData;
}

export type MasterDataActions =
  | GetAccessories
  | GetAllMachineTypes
  | GetAllProcessMasterData
  | GetCommodityData
  | GetCountryData
  | GetLaborRates
  | GetCountryPlatingData
  | GetMaterialGroups
  | GetMaterialTypes
  | GetProcessTypeList
  | GetSubCommodityData
  | GetTechnologyData
  | GetSamplingRate
  | GetDrillingCuttingSpeed
  | GetPartingCuttingSpeed
  | GetHandlingTime
  | GetToolLoadingTime
  | GetStrokeRate
  | GetStrokeRateManual
  | GetLaserCuttingSpeed
  | GetTurningLookup
  | GetFacingLookup
  | GetGroovingLookup
  | GetFaceMillingLookup
  | GetSupplierList
  | GetBuLocation
  | GetSlotLookup
  | GetEndMillingLookup
  | GetGrindingLookup
  | GetToolingLookup
  | GetGearCuttingLookup
  | GetMigLookup
  | GetForgingLookup
  | GetBoringLookup
  | GetBoringCuttingSpeed
  | GetTappingCuttingSpeed
  | GetThermoFormingLookup
  | GetFormingTimeLookup
  | GetWiringHarnessLookup
  | GetToolingCountryMasterData
  | GetPlasmaCuttingLookup
  | GetAllUnspscMasterData
  | GetAllHtsMasterData
  | GetMaterialMasterByCountryId
  | GetPackageDescriptionMasterData
  | GetPackageFormMasterData
  | GetPackageSizeDefinitionMasterData;
