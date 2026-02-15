export interface Assumption {
  assumptionId: number;
  name: string;
  assumptionEnum: number;
  value: number;
}

export enum AssumptionEnum {
  IQCInspection = 0,
  MaterialKitting = 1,
  OperationStopthemachine = 2,
  OperationUnloadthefeeders = 3,
  OperationUnloadthereels = 4,
  OperationUnloadthestencilandcleanit = 5,
  OperationSqueegeeCleaning = 6,
  OperationSqueegeeHeightCalibration = 7,
  OperationStencilLoadingandParameterSetting = 8,
  OperationPCBLoading = 9,
  OperationReelloadingontofeeder = 10,
  OpeartionFeederLoading = 11,
  OpeartionCrosscheckthefeederpositions = 12,
  OperationConveyorAdjustment = 13,
  OperationStartmachineandtakeproduction = 14,
  MechanicalHoleMaskingTime = 15,
  PercentageofthroughHoleComponentFormed = 16,
  FormingTimeManualPerComponent = 17,
  StuffingTimePerComponent = 18,
  DeRating = 19,
  ConveyorLength = 20,
  ConveyorSpeed = 21,
  LotQty = 22,
  HandSolderingTimeforROHSJoints = 23,
  HandSolderingTimeforNONROHSJoints = 24,
  PemFixingTime = 25,
  PressFitConnectorFixingTime = 26,
  ChangeOverTime = 27,
  PCBAssemblyLoadingandUnloadingTime = 28,
  TestingtimedividedbyNode = 29,
}
