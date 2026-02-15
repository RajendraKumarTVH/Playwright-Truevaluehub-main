
import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { CostingConfig } from '../costing.config';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { ManufacturingForgingSubProcessConfigService } from 'src/app/shared/config/costing-manufacturing-forging-sub-process-config';
import { PartComplexity } from 'src/app/shared/enums';


export class ManufacturingBilletHeatingForgingCalculatorService {
  constructor(
    private shareService: SharedService,
    private _costingConfig: CostingConfig,
    private materialForgingConfigService: MaterialForgingConfigService,
    private forgingSubProcessConfig: ManufacturingForgingSubProcessConfigService
  ) { }

  public calculateBilletHeatingForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const perimeter = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.perimeter);
    const stockLength = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.blockLength);
    const materialNetWeight = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.netWeight);
    // const materialProjectedAreaOfPart = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.projectedArea);
    const grossWeight = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.grossWeight);
    // const materialPartHeight = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.dimZ); //partHeight);
    // const partProjectedArea = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.projectedArea);
    const inputBilletLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockLength;

    manufactureInfo.subProcessTypeID = 1;
    // Material Type
    manufactureInfo.recBedSize = manufactureInfo.materialInfoList[0]?.materialMasterData?.materialTypeName || '';
    //Efficiency
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = 0.85;
      if (manufactureInfo.efficiency != null) manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
    }

    // Specific Heat
    if (manufactureInfo.ismoldTempDirty && manufactureInfo.moldTemp != null) {
      manufactureInfo.moldTemp = this.shareService.isValidNumber(Number(manufactureInfo.moldTemp));
    } else {
      let materialType = '';
      if (manufactureInfo.materialTypeName) {
        materialType = manufactureInfo?.materialTypeName?.toLowerCase();
      }
      const billetHeatingSpecificHeatLookup = this.forgingSubProcessConfig.billetHeatingSpecificHeatLookup;
      const found = billetHeatingSpecificHeatLookup.find((item) => materialType.includes(item.key));
      let moldTemp = found ? found.value : 0;
      if (manufactureInfo.moldTemp != null) moldTemp = this.shareService.checkDirtyProperty('moldTemp', fieldColorsList) ? manufacturingObj?.moldTemp : moldTemp;
      manufactureInfo.moldTemp = moldTemp;
    }

    // Part Weight
    manufactureInfo.requiredCurrent = this.shareService.isValidNumber(grossWeight / 1000);

    //Initial Temp
    if (manufactureInfo.isInitialTempDirty && manufactureInfo.initialTemp != null) {
      manufactureInfo.initialTemp = this.shareService.isValidNumber(Number(manufactureInfo.initialTemp));
    } else {
      let initialTemp = 20;

      if (manufactureInfo.initialTemp != null) initialTemp = this.shareService.checkDirtyProperty('initialTemp', fieldColorsList) ? manufacturingObj?.initialTemp : initialTemp;
      manufactureInfo.initialTemp = initialTemp;
    }

    // Forging Temp
    if (manufactureInfo.isfinalTempDirty && manufactureInfo.finalTemp != null) {
      manufactureInfo.finalTemp = this.shareService.isValidNumber(Number(manufactureInfo.finalTemp));
    } else {
      let finalTemp = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas?.forgingTemp);

      if (manufactureInfo.finalTemp != null) finalTemp = this.shareService.checkDirtyProperty('finalTemp', fieldColorsList) ? manufacturingObj?.finalTemp : finalTemp;
      manufactureInfo.finalTemp = finalTemp;
    }

    //Temp Raise
    if (manufactureInfo.ispartAreaDirty && manufactureInfo.partArea != null) {
      manufactureInfo.partArea = this.shareService.isValidNumber(Number(manufactureInfo.partArea));
    } else {
      let partArea = this.shareService.isValidNumber(Number(manufactureInfo?.finalTemp ?? 0) - Number(manufactureInfo?.initialTemp ?? 0));

      if (manufactureInfo.partArea != null) partArea = this.shareService.checkDirtyProperty('partArea', fieldColorsList) ? manufacturingObj?.partArea : partArea;
      manufactureInfo.partArea = partArea;
    }

    //Machine Rated Power
    if (manufactureInfo.isPowerSupplyDirty && manufactureInfo.powerSupply != null) {
      manufactureInfo.powerSupply = this.shareService.isValidNumber(Number(manufactureInfo.powerSupply));
    } else {
      let powerSupply = this.shareService.isValidNumber(Number(manufactureInfo?.machineMaster?.totalPowerKW ?? 0));

      if (manufactureInfo.powerSupply != null) powerSupply = this.shareService.checkDirtyProperty('powerSupply', fieldColorsList) ? manufacturingObj?.powerSupply : powerSupply;
      manufactureInfo.powerSupply = powerSupply;
    }

    //Energy Required
    if (manufactureInfo.isplatenSizeWidthDirty && manufactureInfo.platenSizeWidth != null) {
      manufactureInfo.platenSizeWidth = this.shareService.isValidNumber(Number(manufactureInfo.platenSizeWidth));
    } else {
      let platenSizeWidth = this.shareService.isValidNumber(
        ((Number(grossWeight ?? 0) / 1000) * Number(manufactureInfo?.moldTemp ?? 0) * Number(manufactureInfo?.partArea ?? 0)) / (3600 * Number(manufactureInfo?.efficiency ?? 0))
      );

      if (manufactureInfo.platenSizeWidth != null) platenSizeWidth = this.shareService.checkDirtyProperty('platenSizeWidth', fieldColorsList) ? manufacturingObj?.platenSizeWidth : platenSizeWidth;
      manufactureInfo.platenSizeWidth = platenSizeWidth;
    }

    //Energy Cost
    if (manufactureInfo.ismoldedPartCostDirty && manufactureInfo.moldedPartCost != null) {
      manufactureInfo.moldedPartCost = this.shareService.isValidNumber(Number(manufactureInfo.moldedPartCost));
    } else {
      let moldedPartCost = this.shareService.isValidNumber(Number(manufactureInfo?.platenSizeWidth * 0.2));

      if (manufactureInfo.moldedPartCost != null) moldedPartCost = this.shareService.checkDirtyProperty('moldedPartCost', fieldColorsList) ? manufacturingObj?.moldedPartCost : moldedPartCost;
      manufactureInfo.moldedPartCost = moldedPartCost;
    }

    // Machine Automation Level
    if (manufactureInfo.isSemiAutoOrAutoDirty && manufactureInfo.semiAutoOrAuto !== null) {
      manufactureInfo.semiAutoOrAuto = this.shareService.isValidNumber(Number(manufactureInfo.semiAutoOrAuto));
    } else {
      let automationLevel = 2;

      if (manufactureInfo.partArea !== null) automationLevel = this.shareService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList) ? manufacturingObj?.semiAutoOrAuto : automationLevel;
      manufactureInfo.semiAutoOrAuto = automationLevel;
    }

    //Theoretical Heating Time
    if (manufactureInfo.istimeRequiredCableTieDirty && manufactureInfo.timeRequiredCableTie != null) {
      manufactureInfo.timeRequiredCableTie = this.shareService.isValidNumber(Number(manufactureInfo.timeRequiredCableTie));
    } else {
      let timeRequiredCableTie = this.shareService.isValidNumber((manufactureInfo?.platenSizeWidth / manufactureInfo?.powerSupply) * 3600);

      if (manufactureInfo.timeRequiredCableTie != null)
        timeRequiredCableTie = this.shareService.checkDirtyProperty('timeRequiredCableTie', fieldColorsList) ? manufacturingObj?.timeRequiredCableTie : timeRequiredCableTie;
      manufactureInfo.timeRequiredCableTie = timeRequiredCableTie;
    }

    //Shape Factor
    let forgingShapeFactor = 1.2;
    if (manufactureInfo.typeOfOperationId != null) {
      forgingShapeFactor = this.materialForgingConfigService.getForgingShapeFactor()?.find((x) => x.id == manufactureInfo?.typeOfOperationId)?.shapeFactor || 1.2;
    }

    // Deformation type:
    if (!(manufactureInfo.noOfbends != null && manufactureInfo.noOfbends !== 0 && manufactureInfo.noOfbends !== undefined)) {
      //   manufactureInfo.noOfbends = manufactureInfo.noOfbends;
      // } else {
      manufactureInfo.noOfbends = 2;
    }

    // //Part area
    // if (manufactureInfo.ispartAreaDirty && manufactureInfo.partArea != null) {
    //   manufactureInfo.partArea = this.shareService.isValidNumber(Number(manufactureInfo.partArea));
    // } else {
    //   let partArea = partProjectedArea;

    //   if (manufactureInfo.partArea != null) partArea = this.shareService.checkDirtyProperty('partArea', fieldColorsList) ? manufacturingObj?.partArea : partArea;
    //   manufactureInfo.partArea = partArea;
    // }
    //Flash area
    let widthLand = 0;
    if (manufactureInfo.partComplexity === PartComplexity.High) {
      const forgWeight = this.shareService.isValidNumber(Number(materialNetWeight / 1000));
      const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
      widthLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].complexb1 : 0;
    }

    if (manufactureInfo.partComplexity === PartComplexity.Medium) {
      const forgWeight = this.shareService.isValidNumber(Number(materialNetWeight / 1000));
      const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
      widthLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].simpleb1 : 0;
    }
    if (manufactureInfo.isflashAreaDirty && manufactureInfo.flashArea != null) {
      manufactureInfo.flashArea = this.shareService.isValidNumber(Number(manufactureInfo.flashArea));
    } else {
      let flashArea = this.shareService.isValidNumber(Number(perimeter * widthLand));

      if (manufactureInfo.flashArea != null) {
        flashArea = this.shareService.checkDirtyProperty('flashArea', fieldColorsList) ? manufacturingObj?.flashArea : manufacturingObj?.flashArea || flashArea;
      }
      manufactureInfo.flashArea = flashArea;
    }

    //Initial height Of Blank/Billet
    if (manufactureInfo.isinitialStockHeightDirty && manufactureInfo.initialStockHeight != null) {
      manufactureInfo.initialStockHeight = this.shareService.isValidNumber(Number(manufactureInfo.initialStockHeight));
    } else {
      let initialStockHeight = stockLength;
      if (manufactureInfo.initialStockHeight != null)
        initialStockHeight = this.shareService.checkDirtyProperty('initialStockHeight', fieldColorsList) ? manufacturingObj?.initialStockHeight : initialStockHeight;
      manufactureInfo.initialStockHeight = initialStockHeight;
    }

    // Initial height Of Stock (mm):
    let initialHeightOfStock = 0;
    if (manufactureInfo.isMuffleWidthDirty && manufactureInfo.muffleWidth != null) {
      manufactureInfo.muffleWidth = this.shareService.isValidNumber(Number(manufactureInfo.muffleWidth));
    } else {
      initialHeightOfStock = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList[0]?.dimY));

      if (manufactureInfo.muffleWidth != null) {
        initialHeightOfStock = this.shareService.checkDirtyProperty('muffleWidth', fieldColorsList) ? manufacturingObj?.muffleWidth : initialHeightOfStock;
      }
      manufactureInfo.muffleWidth = initialHeightOfStock;
    }

    // Final height Of Stock (mm):
    let finalHeightOfStock = 0;
    if (manufactureInfo.isMuffleLengthDirty && manufactureInfo.muffleLength != null) {
      manufactureInfo.muffleLength = this.shareService.isValidNumber(Number(manufactureInfo.muffleLength));
    } else {
      finalHeightOfStock = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList[0]?.dimZ));

      if (manufactureInfo.muffleLength != null) {
        finalHeightOfStock = this.shareService.checkDirtyProperty('muffleLength', fieldColorsList) ? manufacturingObj?.muffleLength : finalHeightOfStock;
      }
      manufactureInfo.muffleLength = finalHeightOfStock;
    }

    //strain
    const strain = Math.log(manufactureInfo.muffleWidth / manufactureInfo.muffleLength); // this.shareService.isValidNumber(Math.abs(stockLength - materialPartHeight) / stockLength);

    //strength CoEfficient
    if (manufactureInfo.isShearStrengthMaterialDirty && manufactureInfo.shearStrengthMaterial != null) {
      manufactureInfo.shearStrengthMaterial = this.shareService.isValidNumber(Number(manufactureInfo.shearStrengthMaterial));
    } else {
      const strengthCoEfficient = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strengthCoEfficient));
      let shearStrengthMaterial = this.shareService.isValidNumber(strengthCoEfficient);
      if (manufactureInfo.shearStrengthMaterial != null)
        shearStrengthMaterial = this.shareService.checkDirtyProperty('shearStrengthMaterial', fieldColorsList) ? manufacturingObj?.shearStrengthMaterial : shearStrengthMaterial;
      manufactureInfo.shearStrengthMaterial = shearStrengthMaterial;
    }

    //Strain hardening exponent ((n)):
    if (manufactureInfo.isclampingPressureDirty && manufactureInfo.clampingPressure != null) {
      manufactureInfo.clampingPressure = this.shareService.isValidNumber(Number(manufactureInfo.clampingPressure));
    } else {
      const strainHardeningExponent = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strainHardeningExponent));
      let clampingPressure = this.shareService.isValidNumber(strainHardeningExponent);
      if (manufactureInfo.clampingPressure != null)
        clampingPressure = this.shareService.checkDirtyProperty('clampingPressure', fieldColorsList) ? manufacturingObj?.clampingPressure : clampingPressure;
      manufactureInfo.clampingPressure = clampingPressure;
    }

    // Strain: mapped with recommendedForce
    if (manufactureInfo.isrecommendedForceDirty && manufactureInfo.recommendedForce && manufactureInfo.recommendedForce != null) {
      manufactureInfo.recommendedForce = this.shareService.isValidNumber(Number(manufactureInfo.recommendedForce));
    } else {
      let recommendedForce = this.shareService.isValidNumber(strain);
      if (manufactureInfo.recommendedForce != null)
        recommendedForce = this.shareService.checkDirtyProperty('recommendedForce', fieldColorsList) ? manufacturingObj?.recommendedForce : recommendedForce;
      manufactureInfo.recommendedForce = recommendedForce;
    }

    // Flow Stress: mapped with bendingCoeffecient
    if (manufactureInfo.isBendingCoeffecientDirty && manufactureInfo.bendingCoeffecient !== null) {
      manufactureInfo.bendingCoeffecient = this.shareService.isValidNumber(Number(manufactureInfo.bendingCoeffecient));
    } else {
      const flowStress = this.shareService.isValidNumber(manufactureInfo.shearStrengthMaterial * Math.log(1 + strain) ** manufactureInfo.clampingPressure);
      let bendingCoeffecient = this.shareService.isValidNumber(flowStress);
      if (manufactureInfo.bendingCoeffecient != null)
        bendingCoeffecient = this.shareService.checkDirtyProperty('bendingCoeffecient', fieldColorsList) ? manufacturingObj?.bendingCoeffecient : bendingCoeffecient;
      manufactureInfo.bendingCoeffecient = bendingCoeffecient;
    }

    //Kstr, Yield strength for strain rate and forging temp (N/mm^2) Pending
    // const yieldStrengthRate = this.calCulateYieldStrengthForStrainRate('C 15', forgingShapeFactor);
    //Kre, Yield strength at end of forge (N/mm^2) Pending
    // const yieldStrengthAtEnd = this.shareService.isValidNumber(Number(forgingShapeFactor) * Number(yieldStrengthRate));

    //Factor of safety
    if (manufactureInfo.ishlFactorDirty && manufactureInfo.hlFactor != null) {
      manufactureInfo.hlFactor = this.shareService.isValidNumber(Number(manufactureInfo.hlFactor));
    } else {
      let hlFactor = this.shareService.isValidNumber(manufactureInfo.hlFactor) || 1.2;
      if (manufactureInfo.hlFactor != null) hlFactor = this.shareService.checkDirtyProperty('hlFactor', fieldColorsList) ? manufacturingObj?.hlFactor : hlFactor;
      manufactureInfo.hlFactor = hlFactor;
    }

    //Theoritical Force (Tonne)
    const theoriticalForcce = this.shareService.isValidNumber(
      (manufactureInfo.bendingCoeffecient * (manufactureInfo.partArea + manufactureInfo.flashArea) * forgingShapeFactor * manufactureInfo.hlFactor) / 9810
    );
    manufactureInfo.recommendTonnage = this.shareService.isValidNumber(Number(theoriticalForcce));

    //Selected Tonnage (T) :
    if (manufactureInfo.isselectedTonnageDirty && manufactureInfo.selectedTonnage != null) {
      manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
    } else {
      let selectedTonnage = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.machineTonnageTons);
      if (manufactureInfo.selectedTonnage != null) selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : selectedTonnage;
      manufactureInfo.selectedTonnage = selectedTonnage;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime || 120;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = 30;

      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    //Set up Time (S/Piece)
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime));
    } else {
      let dryCycleTime = this.shareService.isValidNumber(manufactureInfo.setUpTime / manufactureInfo.lotSize);

      if (manufactureInfo.dryCycleTime != null) dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = Math.ceil(this.shareService.isValidNumber(Number(inputBilletLength) * 0.025));
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = Math.ceil(this.shareService.isValidNumber(Number(inputBilletLength) * 0.01));
      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    // //Total machine hour rate
    // if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
    //   manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    // } else {
    //   let totalTime = (this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) *
    //     Number(manufactureInfo.lotSize)) /
    //     3600));
    //   if (manufactureInfo.totalTime != null) {
    //     totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
    //   }
    //   manufactureInfo.totalTime = totalTime;
    // }
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  calculateCostDriver(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    ////Direct labors rate
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour != null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    //Skilled Labors
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.noOfSkilledLabours != null) {
      manufactureInfo.noOfSkilledLabours = Number(manufactureInfo.noOfSkilledLabours);
    } else {
      if (manufactureInfo.noOfSkilledLabours != null) {
        manufactureInfo.noOfSkilledLabours = this.shareService.checkDirtyProperty('noOfSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfSkilledLabours : manufactureInfo.noOfSkilledLabours;
      }
    }

    //  //Skilled Labors rate
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.skilledLaborRatePerHour != null) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }

    //Qa Inspector
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    //sampling rate
    if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate != null) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      const samplingrate = 100;
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
        ? manufacturingObj?.samplingRate
        : manufacturingObj?.samplingRate || this.shareService.isValidNumber(samplingrate);
    }

    //Inspection time
    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }

    //Machine hour rate
    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      if (manufactureInfo.machineHourRate != null) {
        manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : manufactureInfo.machineHourRate;
      }
    }

    //Machine cost
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.machineHourRate)) / 3600) * manufactureInfo.efficiency);
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    //Set up technician
    //Skilled Labor in set up

    //set up cost
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      //(E52*E55*E43/60/E51/E20)+(E53*E56*E43/60/E51/E20)
      let directSetUpCost = this.shareService.isValidNumber(
        (this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
        60 /
        //this.shareService.isValidNumber(manufactureInfo.efficiency) /
        this.shareService.isValidNumber(manufactureInfo.lotSize) +
        (this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
        60 /
        // this.shareService.isValidNumber(manufactureInfo.efficiency) /
        this.shareService.isValidNumber(manufactureInfo.lotSize) +
        ((this.shareService.isValidNumber(manufactureInfo.machineHourRate) * this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
          60 /
          // this.shareService.isValidNumber(manufactureInfo.efficiency) /
          this.shareService.isValidNumber(manufactureInfo.lotSize)) *
        this.shareService.isValidNumber(manufactureInfo.efficiency)
      ); //divided lot of size

      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    //Labor cost
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      //=(E55*E52*E47/3600/E51)+(E56*E53*E47/3600/E51)
      let directLaborCost =
        (this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
        3600 +
        (this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
        3600;

      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    //inspection cost
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      const inspectionCost = ((manufactureInfo.qaOfInspectorRate * manufactureInfo.inspectionTime) / 60 / manufactureInfo.lotSize) * manufactureInfo.efficiency;
      if (manufactureInfo.inspectionCost != null) {
        manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : manufactureInfo.inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    // Yeild Cost
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber(
        (1 - this.shareService.isValidNumber(manufactureInfo.yieldPer / 100)) *
        (this.shareService.isValidNumber(manufactureInfo.directMachineCost) +
          this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
          this.shareService.isValidNumber(manufactureInfo.directLaborCost) +
          this.shareService.isValidNumber(manufactureInfo.inspectionCost) +
          this.shareService.isValidNumber(manufactureInfo.netMaterialCost))
      );

      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      this.shareService.isValidNumber(manufactureInfo.directMachineCost) +
      this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
      this.shareService.isValidNumber(manufactureInfo.directLaborCost) +
      this.shareService.isValidNumber(manufactureInfo.yieldCost) +
      this.shareService.isValidNumber(manufactureInfo.inspectionCost) +
      this.shareService.isValidNumber(manufactureInfo.moldedPartCost)
    );
  }
}
