import { PartInfoDto, ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { CostingConfig, ForgingCutting, PrimaryProcessType, ProcessType } from '../costing.config';
import { PartComplexity } from 'src/app/shared/enums';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { ColdDieForgingSubProcess, ManufacturingForgingSubProcessConfigService } from 'src/app/shared/config/costing-manufacturing-forging-sub-process-config';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CommodityType } from '../costing.config';

export class ManufacturingForgingCalculatorService implements OnDestroy {
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  private pi = Math.PI;

  constructor(
    private formbuilder: FormBuilder,
    private shareService: SharedService,
    private _costingConfig: CostingConfig,
    private materialForgingConfigService: MaterialForgingConfigService,
    private forgingSubProcessConfig: ManufacturingForgingSubProcessConfigService
  ) { }

  private forgingColdClosedCapacityToStrokeTime: { [key: number]: number } = this.forgingSubProcessConfig.forgingColdClosedCapacityToStrokeTime;
  /**
   * Get stroke time (seconds) for a hydraulic forging press by tonnage capacity.
   * Finds the closest matching capacity in the lookup table.
   * @param tonnage Machine tonnage in tons
   * @returns Stroke time in seconds, or null if not found
   */
  private getStrokeTimeForForgingPressTonnage(tonnage: number): number | null {
    if (!tonnage || tonnage <= 0) return null;

    const capacities = Object.keys(this.forgingColdClosedCapacityToStrokeTime)
      .map(Number)
      .sort((a, b) => a - b);

    // Find exact match or closest match
    let closest = capacities[0];
    for (const capacity of capacities) {
      if (capacity === tonnage) {
        return this.forgingColdClosedCapacityToStrokeTime[tonnage];
      }
      if (capacity <= tonnage) {
        closest = capacity;
      } else {
        break;
      }
    }

    return this.forgingColdClosedCapacityToStrokeTime[closest] || null;
  }

  // public calculateHotForgingClosedDieStockShearing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateHotForgingClosedDieStockShearing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const stockOuterDiameter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.stockOuterDiameter;
    const stockLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockLength;
    const widthFromMaterial = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockWidth;
    const thicknessFromMaterial = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockHeight;

    let cuttingArea = 0;
    if (manufactureInfo.iscuttingAreaDirty && manufactureInfo.cuttingArea != null) {
      manufactureInfo.cuttingArea = Number(manufactureInfo.cuttingArea);
    } else {
      if (manufactureInfo.noOfbends === 1) {
        //rectangle
        cuttingArea = Number(this.pi * Number(Math.pow(Number(widthFromMaterial / 2), 2)));
      } else {
        cuttingArea = Number(this.pi * Number(Math.pow(Number(stockOuterDiameter / 2), 2)));
      }
      if (manufactureInfo.cuttingArea != null) {
        cuttingArea = this.shareService.checkDirtyProperty('cuttingArea', fieldColorsList) ? manufacturingObj?.cuttingArea : cuttingArea;
      }
      manufactureInfo.cuttingArea = cuttingArea;
    }
    // Required tonnage
    let recommendTonnage = this.calculateRecommandedTonnage(manufactureInfo);
    if (manufactureInfo.recommendTonnage && manufactureInfo.recommendTonnage != null) {
      manufactureInfo.recommendTonnage = Number(manufactureInfo.recommendTonnage);
    } else {
      if (manufactureInfo.recommendTonnage != null) {
        recommendTonnage = this.shareService.checkDirtyProperty('recommendTonnage', fieldColorsList) ? manufacturingObj?.recommendTonnage : recommendTonnage;
      }
      manufactureInfo.recommendTonnage = recommendTonnage;
    }

    //Cross section pending

    if (manufactureInfo.isDrillDiameterDirty && manufactureInfo.drillDiameter != null) {
      manufactureInfo.drillDiameter = Number(manufactureInfo.drillDiameter);
    } else {
      let drillDiameter = Number(stockOuterDiameter);
      if (manufactureInfo.drillDiameter != null) {
        drillDiameter = this.shareService.checkDirtyProperty('drillDiameter', fieldColorsList) ? manufacturingObj?.drillDiameter : drillDiameter;
      }
      manufactureInfo.drillDiameter = drillDiameter;
    }

    if (manufactureInfo.isCuttingLengthDirty && manufactureInfo.cuttingLength != null) {
      manufactureInfo.cuttingLength = Number(manufactureInfo.cuttingLength);
    } else {
      let cuttingLength = Number(stockLength);
      if (manufactureInfo.cuttingLength != null) {
        cuttingLength = this.shareService.checkDirtyProperty('cuttingLength', fieldColorsList) ? manufacturingObj?.cuttingLength : cuttingLength;
      }
      manufactureInfo.cuttingLength = cuttingLength;
    }

    if (manufactureInfo.isplatenSizeWidthDirty && manufactureInfo.platenSizeWidth != null) {
      manufactureInfo.platenSizeWidth = Number(manufactureInfo.platenSizeWidth);
    } else {
      let platenSizeWidth = Number(widthFromMaterial);
      if (manufactureInfo.platenSizeWidth != null) {
        platenSizeWidth = this.shareService.checkDirtyProperty('platenSizeWidth', fieldColorsList) ? manufacturingObj?.platenSizeWidth : platenSizeWidth;
      }
      manufactureInfo.platenSizeWidth = platenSizeWidth;
    }

    if (manufactureInfo.isDieOpeningThicknessDirty && manufactureInfo.dieOpeningThickness != null) {
      manufactureInfo.dieOpeningThickness = Number(manufactureInfo.dieOpeningThickness);
    } else {
      let dieOpeningThickness = Number(thicknessFromMaterial);
      if (manufactureInfo.dieOpeningThickness != null) {
        dieOpeningThickness = this.shareService.checkDirtyProperty('dieOpeningThickness', fieldColorsList) ? manufacturingObj?.dieOpeningThickness : dieOpeningThickness;
      }
      manufactureInfo.dieOpeningThickness = dieOpeningThickness;
    }

    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = this.shareService.isValidNumber(Math.round(Number(stockLength * 0.025)));
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = this.shareService.isValidNumber(Math.round(Number(stockLength * 0.01)));
      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    const forgingtbl1 = this.materialForgingConfigService.getProcessCycleTime().filter((x) => x.cuttingArea < manufactureInfo.cuttingArea);
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].processCycleTime : 0;
      if (manufactureInfo.processTime != null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = processTime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber((Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime)) * manufactureInfo.efficiency);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.totalTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    //Efficiency
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      if (manufactureInfo.efficiency != null)
        manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    }
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
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : this.shareService.isValidNumber(samplingrate);
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

    //Set up cost
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

    manufactureInfo.directProcessCost =
      this.shareService.isValidNumber(manufactureInfo.directMachineCost) +
      this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
      this.shareService.isValidNumber(manufactureInfo.directLaborCost) +
      this.shareService.isValidNumber(manufactureInfo.inspectionCost) +
      this.shareService.isValidNumber(manufactureInfo.yieldCost);

    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateHotForgingOpenClosedDieHot(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateHotForgingOpenClosedDieHot(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const perimeter = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.perimeter);
    const stockLength = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.blockLength);
    const materialNetWeight = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.netWeight);
    // const materialProjectedAreaOfPart = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.projectedArea);
    const grossWeight = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.grossWeight);
    // const materialPartHeight = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.dimZ); //partHeight);
    const partProjectedArea = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.projectedArea);

    // Machine Automation Level
    if (manufactureInfo.isSemiAutoOrAutoDirty && manufactureInfo.semiAutoOrAuto !== null) {
      manufactureInfo.semiAutoOrAuto = this.shareService.isValidNumber(Number(manufactureInfo.semiAutoOrAuto));
    } else {
      let automationLevel = 2;

      if (manufactureInfo.partArea !== null) automationLevel = this.shareService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList) ? manufacturingObj?.semiAutoOrAuto : automationLevel;
      manufactureInfo.semiAutoOrAuto = automationLevel;
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

    //Part area
    if (manufactureInfo.ispartAreaDirty && manufactureInfo.partArea != null) {
      manufactureInfo.partArea = this.shareService.isValidNumber(Number(manufactureInfo.partArea));
    } else {
      let partArea = partProjectedArea;

      if (manufactureInfo.partArea != null) partArea = this.shareService.checkDirtyProperty('partArea', fieldColorsList) ? manufacturingObj?.partArea : partArea;
      manufactureInfo.partArea = partArea;
    }
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
      let loadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
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

  // public calculateForgingTrimmingPress(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingTrimmingPress(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const materialNetWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.netWeight;

    const perimeter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.perimeter;
    const ultimateTensileStrength = manufactureInfo.materialmasterDatas?.tensileStrength;
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;

    // Deformation type:
    if (!(manufactureInfo.noOfbends != null && manufactureInfo.noOfbends !== 0 && manufactureInfo.noOfbends !== undefined)) {
      //   manufactureInfo.noOfbends = manufactureInfo.noOfbends;
      // } else {
      manufactureInfo.noOfbends = 2;
    }

    //Factor of safety
    if (manufactureInfo.ishlFactorDirty && manufactureInfo.hlFactor != null) {
      manufactureInfo.hlFactor = this.shareService.isValidNumber(Number(manufactureInfo.hlFactor));
    } else {
      let hlFactor = 1.2;
      if (manufactureInfo.hlFactor != null) hlFactor = this.shareService.checkDirtyProperty('hlFactor', fieldColorsList) ? manufacturingObj?.hlFactor : hlFactor;
      manufactureInfo.hlFactor = hlFactor;
    }

    // const theoriticalForcce = this.shareService.isValidNumber((manufactureInfo.lengthOfCut * Number(manufactureInfo.materialmasterDatas.shearingStrength) * Number(manufactureInfo.flashThickness)) / 9810);
    // manufactureInfo.recommendTonnage = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.25);

    //Length of Cut
    if (manufactureInfo.isLengthOfCutDirty && manufactureInfo.lengthOfCut != null) {
      manufactureInfo.lengthOfCut = this.shareService.isValidNumber(Number(manufactureInfo.lengthOfCut));
    } else {
      let lengthOfCut = this.shareService.isValidNumber(perimeter);
      if (manufactureInfo.lengthOfCut != null) lengthOfCut = this.shareService.checkDirtyProperty('lengthOfCut', fieldColorsList) ? manufacturingObj?.lengthOfCut : lengthOfCut;
      manufactureInfo.lengthOfCut = lengthOfCut;
    }
    //flash thickness
    //let complexity = currentPart?.partComplexity;

    // const widthGutter = 0;
    if (manufactureInfo.partComplexity === PartComplexity.High) {
      let thickLand = 0;
      const forgWeight = this.shareService.isValidNumber(Number(materialNetWeight / 1000));
      const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
      if (forgingtbl1.length > 0) {
        thickLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].hf : 0;
        manufactureInfo.flashThickness = this.shareService.isValidNumber(thickLand);
      }
    }

    if (manufactureInfo.partComplexity === PartComplexity.Medium) {
      let thickLand = 0;
      const forgWeight = this.shareService.isValidNumber(Number(materialNetWeight / 1000));
      const forgingtbl1 = this.materialForgingConfigService.getForgingComplexity().filter((x) => x.wt < forgWeight);
      if (forgingtbl1.length > 0) {
        thickLand = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].hf : 0;
        manufactureInfo.flashThickness = this.shareService.isValidNumber(thickLand);
      }
    }
    if (manufactureInfo.isflashThicknessDirty && manufactureInfo.flashThickness != null) {
      manufactureInfo.flashThickness = this.shareService.isValidNumber(Number(manufactureInfo.flashThickness));
    } else {
      if (manufactureInfo.flashThickness != null)
        manufactureInfo.flashThickness = this.shareService.checkDirtyProperty('flashThickness', fieldColorsList) ? manufacturingObj?.flashThickness : manufactureInfo.flashThickness;
    }

    //Shear strength of material
    if (manufactureInfo.isclampingPressureDirty && manufactureInfo.clampingPressure != null) {
      manufactureInfo.clampingPressure = this.shareService.isValidNumber(Number(manufactureInfo.clampingPressure));
    } else {
      let clampingPressure = this.shareService.isValidNumber(ultimateTensileStrength * 0.65);
      if (manufactureInfo.clampingPressure != null)
        clampingPressure = this.shareService.checkDirtyProperty('clampingPressure', fieldColorsList) ? manufacturingObj?.clampingPressure : clampingPressure;
      manufactureInfo.clampingPressure = clampingPressure;
    }

    //Factor of safety
    if (manufactureInfo.ishlFactorDirty && manufactureInfo.hlFactor != null) {
      manufactureInfo.hlFactor = this.shareService.isValidNumber(Number(manufactureInfo.hlFactor));
    } else {
      let hlFactor = this.shareService.isValidNumber(manufactureInfo.hlFactor);
      if (manufactureInfo.hlFactor != null) hlFactor = this.shareService.checkDirtyProperty('hlFactor', fieldColorsList) ? manufacturingObj?.hlFactor : hlFactor;
      manufactureInfo.hlFactor = hlFactor;
    }

    //Theoratical force
    if (manufactureInfo.isTheoreticalForceDirty && manufactureInfo.theoreticalForce != null) {
      manufactureInfo.theoreticalForce = this.shareService.isValidNumber(Number(manufactureInfo.theoreticalForce));
    } else {
      let theoreticalForce = this.shareService.isValidNumber(
        (Number(manufactureInfo.lengthOfCut) * Number(manufactureInfo.flashThickness) * Number(manufactureInfo.clampingPressure) * Number(manufactureInfo.hlFactor)) / 9810
      );
      if (manufactureInfo.theoreticalForce != null)
        theoreticalForce = this.shareService.checkDirtyProperty('theoreticalForce', fieldColorsList) ? manufacturingObj?.theoreticalForce : theoreticalForce;
      manufactureInfo.theoreticalForce = theoreticalForce;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime;

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

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
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

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateForgingShotBlasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingShotBlasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    //sub process type id:
    if (manufactureInfo.issubProcessTypeIDDirty && manufactureInfo.subProcessTypeID != null) {
      manufactureInfo.subProcessTypeID = Number(manufactureInfo.subProcessTypeID);
    } else {
      let subProcessTypeID = 1;
      if (manufactureInfo.subProcessTypeID != null) {
        subProcessTypeID = this.shareService.checkDirtyProperty('subProcessTypeID', fieldColorsList) ? manufacturingObj?.subProcessTypeID : subProcessTypeID;
      }
      manufactureInfo.subProcessTypeID = subProcessTypeID;
    }

    //Chamber Length
    if (manufactureInfo.isMuffleLengthDirty && manufactureInfo.muffleLength != null) {
      manufactureInfo.muffleLength = Number(manufactureInfo.muffleLength);
    } else {
      let flaskLength = 0;
      if (manufactureInfo.subProcessTypeID === 2) {
        flaskLength = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.workPieceHeight);
      } else {
        flaskLength = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.bedLength);
      }
      // let flaskLength = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.bedLength);
      if (manufactureInfo.muffleLength != null) {
        flaskLength = this.shareService.checkDirtyProperty('muffleLength', fieldColorsList) ? manufacturingObj?.muffleLength : flaskLength;
      }
      manufactureInfo.muffleLength = flaskLength;
    }

    //Chamber width / Pssage width
    if (manufactureInfo.isMuffleWidthDirty && manufactureInfo.muffleWidth != null) {
      manufactureInfo.muffleWidth = Number(manufactureInfo.muffleWidth);
    } else {
      let flaskWidth = 0;
      if (manufactureInfo.subProcessTypeID === 2) {
        flaskWidth = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.stockWidth);
      } else {
        flaskWidth = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.bedWidth);
      }
      if (manufactureInfo.muffleWidth != null) {
        flaskWidth = this.shareService.checkDirtyProperty('muffleWidth', fieldColorsList) ? manufacturingObj?.muffleWidth : flaskWidth;
      }
      manufactureInfo.muffleWidth = flaskWidth;
    }
    //Chamber height
    if (manufactureInfo.isinitialStockHeightDirty && manufactureInfo.initialStockHeight != null) {
      manufactureInfo.initialStockHeight = Number(manufactureInfo.initialStockHeight);
    } else {
      let flaskHeight = 0;
      if (manufactureInfo.subProcessTypeID === 2) {
        flaskHeight = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.stockWidth);
      } else {
        flaskHeight = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.bedWidth);
      }

      if (manufactureInfo.initialStockHeight != null) {
        flaskHeight = this.shareService.checkDirtyProperty('initialStockHeight', fieldColorsList) ? manufacturingObj?.initialStockHeight : flaskHeight;
      }
      manufactureInfo.initialStockHeight = flaskHeight;
    }

    //Max Weight machine chamber can hold (kg):
    if (manufactureInfo.isfurnaceOutputDirty && manufactureInfo.furnaceOutput != null) {
      manufactureInfo.furnaceOutput = Number(manufactureInfo.furnaceOutput);
    } else {
      let maxWeight = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.maxProcessableWeightKgs);
      if (manufactureInfo.furnaceOutput != null) {
        maxWeight = this.shareService.checkDirtyProperty('furnaceOutput', fieldColorsList) ? manufacturingObj?.furnaceOutput : maxWeight;
      }
      manufactureInfo.furnaceOutput = maxWeight;
    }

    //Part Surface Area
    if (manufactureInfo.ispartAreaDirty && manufactureInfo.partArea != null) {
      manufactureInfo.partArea = Number(manufactureInfo.furnaceOutput);
    } else {
      let partArea = this.shareService.isValidNumber(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partSurfaceArea);
      if (manufactureInfo.partArea != null) {
        partArea = this.shareService.checkDirtyProperty('partArea', fieldColorsList) ? manufacturingObj?.partArea : partArea;
      }
      manufactureInfo.partArea = partArea;
    }

    //Part Length (mm):

    if (manufactureInfo.isallowanceAlongLengthDirty && manufactureInfo.allowanceAlongLength != null) {
      manufactureInfo.allowanceAlongLength = Number(manufactureInfo.allowanceAlongLength);
    } else {
      let materialPartLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimX;

      if (manufactureInfo.allowanceAlongLength != null) {
        materialPartLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList)
          ? manufacturingObj?.allowanceAlongLength
          : this.shareService.isValidNumber(materialPartLength);
      }
      manufactureInfo.allowanceAlongLength = materialPartLength;
    }

    //Part Width (mm):
    if (manufactureInfo.isallowanceAlongWidthDirty && manufactureInfo.allowanceAlongWidth != null) {
      manufactureInfo.allowanceAlongWidth = Number(manufactureInfo.allowanceAlongWidth);
    } else {
      let materialPartWidth = manufactureInfo.materialInfoList[0]?.dimY;

      if (manufactureInfo.allowanceAlongWidth) {
        materialPartWidth = this.shareService.checkDirtyProperty('allowanceAlongWidth', fieldColorsList) ? manufacturingObj?.allowanceAlongWidth : this.shareService.isValidNumber(materialPartWidth);
      }
      manufactureInfo.allowanceAlongWidth = materialPartWidth;
    }

    //Part Height (mm):
    if (manufactureInfo.ispartEnvelopHeightDirty && manufactureInfo.partEnvelopHeight != null) {
      manufactureInfo.partEnvelopHeight = Number(manufactureInfo.partEnvelopHeight);
    } else {
      let materialPartHeight = manufactureInfo.materialInfoList[0]?.dimZ;

      if (manufactureInfo.partEnvelopHeight) {
        materialPartHeight = this.shareService.checkDirtyProperty('partEnvelopHeight', fieldColorsList) ? manufacturingObj?.partEnvelopHeight : this.shareService.isValidNumber(materialPartHeight);
      }
      manufactureInfo.partEnvelopHeight = materialPartHeight;
    }

    //Part weight (kg):
    if (manufactureInfo.ismeltingWeightDirty && manufactureInfo.meltingWeight != null) {
      manufactureInfo.meltingWeight = Number(manufactureInfo.meltingWeight);
    } else {
      let meltingWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfo.weight) / 1000);

      if (manufactureInfo.meltingWeight) {
        meltingWeight = this.shareService.checkDirtyProperty('meltingWeight', fieldColorsList) ? manufacturingObj?.meltingWeight : meltingWeight;
      }
      manufactureInfo.meltingWeight = meltingWeight;
    }

    //Stacking efficeincy  (%):
    if (manufactureInfo.isEfficiencyFactorDirty && manufactureInfo.efficiencyFactor != null) {
      manufactureInfo.efficiencyFactor = Number(manufactureInfo.efficiencyFactor);
    } else {
      manufactureInfo.efficiencyFactor = this.shareService.checkDirtyProperty('meltingWeight', fieldColorsList)
        ? manufacturingObj?.efficiencyFactor
        : this.shareService.isValidNumber(manufactureInfo.efficiencyFactor);
    }

    //No of  parts in Chamber Based on Volume(No.):
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = this.shareService.isValidNumber(Number(manufactureInfo.noOfParts));
    } else {
      let noOfParts = this.shareService.isValidNumber(
        Math.round(
          Number(manufactureInfo.muffleLength / manufactureInfo.allowanceAlongLength) *
          Number(manufactureInfo.muffleWidth / manufactureInfo.allowanceAlongWidth) *
          Number(manufactureInfo.initialStockHeight / manufactureInfo.partEnvelopHeight) *
          Number(manufactureInfo.efficiencyFactor / 100 / 100)
        )
      );
      if (manufactureInfo.noOfParts != null) noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
      manufactureInfo.noOfParts = noOfParts;
    }

    //No of  parts in Chamber Based onweight(No.):
    if (manufactureInfo.isNoOfHolesDirty && manufactureInfo.noOfHoles != null) {
      manufactureInfo.noOfHoles = this.shareService.isValidNumber(Number(manufactureInfo.noOfHoles));
    } else {
      let noOfHoles = this.shareService.isValidNumber(Math.round(Number(manufactureInfo.furnaceOutput / manufactureInfo.meltingWeight)));
      noOfHoles = this.shareService.checkDirtyProperty('noOfHoles', fieldColorsList) ? manufacturingObj?.noOfHoles : noOfHoles;
      manufactureInfo.noOfHoles = noOfHoles;
    }

    //Total parts in Chamber (Minimum of weight and volume) (No.)
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = this.shareService.isValidNumber(Number(manufactureInfo.noofStroke));
    } else {
      let noofStroke = this.shareService.isValidNumber(
        Math.min(
          Math.round(
            Number(manufactureInfo.muffleLength / manufactureInfo.allowanceAlongLength) *
            Number(manufactureInfo.muffleWidth / manufactureInfo.allowanceAlongWidth) *
            Number(manufactureInfo.initialStockHeight / manufactureInfo.partEnvelopHeight) *
            Number(manufactureInfo.efficiencyFactor / 100 / 100)
          ),
          Math.round(Number(manufactureInfo.furnaceOutput / manufactureInfo.meltingWeight))
        )
      );
      if (manufactureInfo.noofStroke != null) noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : noofStroke;
      manufactureInfo.noofStroke = noofStroke;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = 9;

      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = 0;
      if (manufactureInfo.subProcessTypeID === 2) {
        loadingTime = this.shareService.isValidNumber(manufactureInfo.meltingWeight * 0.5);
      } else {
        loadingTime = this.shareService.isValidNumber(Number(manufactureInfo.meltingWeight * 1 * manufactureInfo.noofStroke));
      }
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = 0;

      if (manufactureInfo.subProcessTypeID === 2) {
        unloadingTime = this.shareService.isValidNumber(manufactureInfo.meltingWeight * 0.5);
      } else {
        unloadingTime = this.shareService.isValidNumber(Number(manufactureInfo.meltingWeight * 1 * manufactureInfo.noofStroke));
      }
      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    //Setup Time(S/piece)
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime));
    } else {
      let dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime * 60) / Number(manufactureInfo.noofStroke));

      if (manufactureInfo.dryCycleTime != null) dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    //No of Manufacturing lot per batch
    if (manufactureInfo.isnoOfWeldPassesDirty && manufactureInfo.noOfWeldPasses != null) {
      manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses);
    } else {
      // let noOfWeldPasses = this.shareService.isValidNumber(Math.round((Number(manufactureInfo.lotSize) /
      //   Number(manufactureInfo.noofStroke))));
      let noOfWeldPasses = this.shareService.isValidNumber(Math.ceil(Number(manufactureInfo.lotSize) / Number(manufactureInfo.noofStroke)));
      if (manufactureInfo.noOfWeldPasses != null) {
        noOfWeldPasses = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList) ? manufacturingObj?.noOfWeldPasses : noOfWeldPasses;
      }
      manufactureInfo.noOfWeldPasses = noOfWeldPasses;
    }

    //Material Handling Time
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime));
    } else {
      let totalCycleTime = 60 * Number(manufactureInfo.noOfWeldPasses);

      if (manufactureInfo.totalCycleTime != null) totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : totalCycleTime;
      manufactureInfo.totalCycleTime = totalCycleTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber((Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime)) / manufactureInfo.noofStroke);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateForgingStaigtening(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingStaigtening(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const grossWeight = 0;
    let materialLength = 0,
      materialWidth = 0,
      meterialHeight = 0;

    if (manufactureInfo.materialInfoList?.length > 0) {
      materialLength = manufactureInfo.materialInfoList[0].dimX;
      materialWidth = manufactureInfo.materialInfoList[0].dimY;
      meterialHeight = manufactureInfo.materialInfoList[0].dimZ;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Part Length (mm):
    if (manufactureInfo.isallowanceAlongLengthDirty && manufactureInfo.allowanceAlongLength != null) {
      manufactureInfo.allowanceAlongLength = Number(manufactureInfo.allowanceAlongLength);
    } else {
      manufactureInfo.allowanceAlongLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList)
        ? manufacturingObj?.allowanceAlongLength
        : this.shareService.isValidNumber(materialLength);
    }

    //Part Width (mm):
    const partWidth = Math.min(materialWidth, meterialHeight);
    if (manufactureInfo.isallowanceAlongWidthDirty && manufactureInfo.allowanceAlongWidth != null) {
      manufactureInfo.allowanceAlongWidth = Number(manufactureInfo.allowanceAlongWidth);
    } else {
      manufactureInfo.allowanceAlongWidth = this.shareService.checkDirtyProperty('allowanceAlongWidth', fieldColorsList)
        ? manufacturingObj?.allowanceAlongWidth
        : this.shareService.isValidNumber(partWidth);
    }

    //Part Height (mm):
    if (manufactureInfo.ispartEnvelopHeightDirty && manufactureInfo.partEnvelopHeight != null) {
      manufactureInfo.partEnvelopHeight = Number(manufactureInfo.partEnvelopHeight);
    } else {
      let materialPartLength = materialLength;

      if (manufactureInfo.partEnvelopHeight) {
        materialPartLength = this.shareService.checkDirtyProperty('partEnvelopHeight', fieldColorsList) ? manufacturingObj?.partEnvelopHeight : this.shareService.isValidNumber(materialPartLength);
      }
      manufactureInfo.partEnvelopHeight = materialPartLength;
    }

    //Part weight (kg):
    if (manufactureInfo.ismeltingWeightDirty && manufactureInfo.meltingWeight != null) {
      manufactureInfo.meltingWeight = Number(manufactureInfo.meltingWeight);
    } else {
      manufactureInfo.meltingWeight = this.shareService.checkDirtyProperty('meltingWeight', fieldColorsList)
        ? manufacturingObj?.meltingWeight
        : this.shareService.isValidNumber(manufactureInfo.meltingWeight);
    }

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    //Number of Parts in a CT (Nos)
    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce != null) {
      manufactureInfo.noOfStartsPierce = this.shareService.isValidNumber(Number(manufactureInfo.noOfStartsPierce));
    } else {
      let noOfStartsPierce = this.shareService.isValidNumber(manufactureInfo.noOfStartsPierce);
      if (manufactureInfo.noOfStartsPierce != null)
        noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? manufacturingObj?.noOfStartsPierce : noOfStartsPierce;
      manufactureInfo.noOfStartsPierce = noOfStartsPierce;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = this.calCulateDiameterPartWeight(manufactureInfo.allowanceAlongWidth, manufactureInfo.partEnvelopHeight);

      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    //Setup Time(S/piece)
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime));
    } else {
      let dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime * 60) / Number(manufactureInfo.lotSize));

      if (manufactureInfo.dryCycleTime != null) dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(
        (Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime)) / manufactureInfo.noOfStartsPierce
      );
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    //No of Manufacturing lot per batch
    if (manufactureInfo.isNoOfWeldPassesDirty && manufactureInfo.noOfWeldPasses != null) {
      manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses);
    } else {
      manufactureInfo.noOfWeldPasses = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList)
        ? manufacturingObj?.noOfWeldPasses
        : this.shareService.isValidNumber(manufactureInfo.noOfWeldPasses);
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateForgingControl(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingControl(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // const grossWeight = 0;

    // const materialDensity = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.density;
    // //Max Weight machine chamber can hold (kg):
    // if (manufactureInfo.isfurnaceOutputDirty && manufactureInfo.furnaceOutput != null) {
    //   manufactureInfo.furnaceOutput = Number(manufactureInfo.furnaceOutput);
    // } else {
    //   manufactureInfo.furnaceOutput = this.shareService.checkDirtyProperty('furnaceOutput', fieldColorsList) ? manufacturingObj?.furnaceOutput : this.shareService.isValidNumber(manufactureInfo.furnaceOutput);
    // }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Part Length (mm):
    if (manufactureInfo.isallowanceAlongLengthDirty && manufactureInfo.allowanceAlongLength != null) {
      manufactureInfo.allowanceAlongLength = Number(manufactureInfo.allowanceAlongLength);
    } else {
      let materialPartLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partLength;

      if (manufactureInfo.allowanceAlongLength) {
        materialPartLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList)
          ? manufacturingObj?.allowanceAlongLength
          : this.shareService.isValidNumber(materialPartLength);
      }
      manufactureInfo.allowanceAlongLength = materialPartLength;
    }

    //Part Width (mm):
    if (manufactureInfo.isallowanceAlongWidthDirty && manufactureInfo.allowanceAlongWidth != null) {
      manufactureInfo.allowanceAlongWidth = Number(manufactureInfo.allowanceAlongWidth);
    } else {
      let materialPartWidth = manufactureInfo.materialInfoList[0]?.partWidth;

      if (manufactureInfo.allowanceAlongWidth) {
        materialPartWidth = this.shareService.checkDirtyProperty('allowanceAlongWidth', fieldColorsList) ? manufacturingObj?.allowanceAlongWidth : this.shareService.isValidNumber(materialPartWidth);
      }
      manufactureInfo.allowanceAlongWidth = materialPartWidth;
    }

    //Part Height (mm):
    if (manufactureInfo.ispartEnvelopHeightDirty && manufactureInfo.partEnvelopHeight != null) {
      manufactureInfo.partEnvelopHeight = Number(manufactureInfo.partEnvelopHeight);
    } else {
      let materialPartHeight = manufactureInfo.materialInfoList[0]?.partHeight;

      if (manufactureInfo.partEnvelopHeight) {
        materialPartHeight = this.shareService.checkDirtyProperty('partEnvelopHeight', fieldColorsList) ? manufacturingObj?.partEnvelopHeight : this.shareService.isValidNumber(materialPartHeight);
      }
      manufactureInfo.partEnvelopHeight = materialPartHeight;
    }

    //Part weight (kg):
    if (manufactureInfo.ismeltingWeightDirty && manufactureInfo.meltingWeight != null) {
      manufactureInfo.meltingWeight = this.shareService.isValidNumber(Number(manufactureInfo.meltingWeight));
    } else {
      let meltingWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfo.weight) / 1000);

      if (manufactureInfo.meltingWeight) {
        meltingWeight = this.shareService.checkDirtyProperty('meltingWeight', fieldColorsList) ? manufacturingObj?.meltingWeight : meltingWeight;
      }
      manufactureInfo.meltingWeight = meltingWeight;
    }

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = this.shareService.isValidNumber(Number(manufactureInfo.meltingWeight) * 5);
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = this.shareService.isValidNumber(Number(manufactureInfo.meltingWeight) * 4);
      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    //Number of Parts in a CT (Nos)
    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce != null) {
      manufactureInfo.noOfStartsPierce = this.shareService.isValidNumber(Number(manufactureInfo.noOfStartsPierce));
    } else {
      let noOfStartsPierce = this.shareService.isValidNumber(manufactureInfo.noOfStartsPierce);
      if (manufactureInfo.noOfStartsPierce != null)
        noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? manufacturingObj?.noOfStartsPierce : noOfStartsPierce;
      manufactureInfo.noOfStartsPierce = noOfStartsPierce;
    }
    // //Process Time
    // if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
    //   manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    // } else {
    //   let processTime = 30;
    //   let calc = this.shareService.isValidNumber(((Number(manufactureInfo.setUpTime) +
    //     Number(manufactureInfo.allowanceAlongLength) +
    //     Number(manufactureInfo.allowanceAlongWidth)) /
    //     Number(manufactureInfo.meltingWeight)));
    //   if (manufactureInfo?.semiAutoOrAuto === MachineType.Manual) {
    //     processTime = this.shareService.isValidNumber(calc * 0.025);
    //   } else if (manufactureInfo.semiAutoOrAuto === MachineType.SemiAuto) {
    //     processTime = this.shareService.isValidNumber(calc * 0.02);
    //   } else if (manufactureInfo.semiAutoOrAuto === MachineType.Automatic) {
    //     processTime = this.shareService.isValidNumber(calc * 0.01);
    //   }
    //   processTime = this.shareService.isValidNumber(processTime / 60)
    //   if (manufactureInfo.processTime != null)
    //     processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
    //   manufactureInfo.processTime = processTime;
    // }

    //Setup Time(S/piece)
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime));
    } else {
      let dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime * 60) / Number(manufactureInfo.lotSize));

      if (manufactureInfo.dryCycleTime != null) dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(
        (Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.meltingWeight)) / manufactureInfo.noOfStartsPierce
      );
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateForgingTesting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingTesting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // const grossWeight = 0;
    const forgedWeight = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.netWeight);
    const partSurfaceArea = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.partSurfaceArea);

    //Type of Operation
    manufactureInfo.subProcessTypeID = 1;

    //Number of Parts in a CT
    if (manufactureInfo.isDrillDiameterDirty && manufactureInfo.drillDiameter != null) {
      manufactureInfo.drillDiameter = this.shareService.isValidNumber(Number(manufactureInfo.drillDiameter));
    } else {
      let drillDiameter = 1;

      if (manufactureInfo.drillDiameter != null) drillDiameter = this.shareService.checkDirtyProperty('drillDiameter', fieldColorsList) ? manufacturingObj?.drillDiameter : drillDiameter;
      manufactureInfo.drillDiameter = drillDiameter;
    }

    // Machine Automation Level
    if (manufactureInfo.isSemiAutoOrAutoDirty && manufactureInfo.semiAutoOrAuto !== null) {
      manufactureInfo.semiAutoOrAuto = this.shareService.isValidNumber(Number(manufactureInfo.semiAutoOrAuto));
    } else {
      let automationLevel = 2;

      if (manufactureInfo.partArea !== null) automationLevel = this.shareService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList) ? manufacturingObj?.semiAutoOrAuto : automationLevel;
      manufactureInfo.semiAutoOrAuto = automationLevel;
    }

    let effectiveQuantity = this.shareService.isValidNumber(manufactureInfo?.drillDiameter ** 0.85);
    let partWeight = this.shareService.isValidNumber(forgedWeight / 1000);
    let loadingTimePerPart = this.forgingSubProcessConfig.getTestingLoadTimeForPartWeight(partWeight ?? 0);
    let unloadingTimePerPart = this.forgingSubProcessConfig.getTestingUnloadTimeForPartWeight(partWeight ?? 0);

    //Material Loading Time
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime));
    } else {
      let loadingTime = this.shareService.isValidNumber(effectiveQuantity * loadingTimePerPart);

      if (manufactureInfo.loadingTime != null) loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      manufactureInfo.loadingTime = loadingTime;
    }

    //Material Unloading Time
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = this.shareService.isValidNumber(Number(manufactureInfo.unloadingTime));
    } else {
      let unloadingTime = this.shareService.isValidNumber(effectiveQuantity * unloadingTimePerPart);

      if (manufactureInfo.unloadingTime != null) unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      manufactureInfo.unloadingTime = unloadingTime;
    }

    let visualInspectionTime = 0;
    if (manufactureInfo.semiAutoOrAuto === 3) {
      visualInspectionTime = this.shareService.isValidNumber(partSurfaceArea * 0.0003 * effectiveQuantity);
    } else {
      visualInspectionTime = this.shareService.isValidNumber(partSurfaceArea * 0.0003);
    }

    let documentationTime = this.shareService.isValidNumber(partSurfaceArea * effectiveQuantity * 0.0001);

    //Process Cycle time
    if (manufactureInfo.istimeRequiredCableTieDirty && manufactureInfo.timeRequiredCableTie != null) {
      manufactureInfo.timeRequiredCableTie = this.shareService.isValidNumber(Number(manufactureInfo.timeRequiredCableTie));
    } else {
      let timeRequiredCableTie = this.shareService.isValidNumber(documentationTime + visualInspectionTime + manufactureInfo?.loadingTime + manufactureInfo.unloadingTime);

      if (manufactureInfo.timeRequiredCableTie != null)
        timeRequiredCableTie = this.shareService.checkDirtyProperty('timeRequiredCableTie', fieldColorsList) ? manufacturingObj?.timeRequiredCableTie : timeRequiredCableTie;
      manufactureInfo.timeRequiredCableTie = timeRequiredCableTie;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = 3600;

      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }
    //Material Handling Time
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime));
    } else {
      let totalCycleTime = 3;

      if (manufactureInfo.totalCycleTime != null) totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : totalCycleTime;
      manufactureInfo.totalCycleTime = totalCycleTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo?.timeRequiredCableTie) / Number(manufactureInfo?.drillDiameter));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateForgingHeatTreatment(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingHeatTreatment(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // const stockLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockLength;
    // const stockWidth = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockWidth;
    // const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    // const stockDiameter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.stockDiameter;

    //Stock Length (mm):
    if (manufactureInfo.isWorkpieceStockLengthDirty && manufactureInfo.workpieceStockLength != null) {
      manufactureInfo.workpieceStockLength = Number(manufactureInfo.workpieceStockLength);
    } else {
      manufactureInfo.workpieceStockLength = this.shareService.checkDirtyProperty('workpieceStockLength', fieldColorsList)
        ? manufacturingObj?.workpieceStockLength
        : this.shareService.isValidNumber(manufactureInfo.workpieceStockLength);
    }

    //muffle Length
    if (manufactureInfo.isMuffleLengthDirty && manufactureInfo.muffleLength != null) {
      manufactureInfo.muffleLength = Number(manufactureInfo.muffleLength);
    } else {
      manufactureInfo.muffleLength = this.shareService.checkDirtyProperty('muffleLength', fieldColorsList)
        ? manufacturingObj?.muffleLength
        : this.shareService.isValidNumber(manufactureInfo.muffleLength);
    }

    //muffle width
    if (manufactureInfo.isMuffleWidthDirty && manufactureInfo.muffleWidth != null) {
      manufactureInfo.muffleWidth = Number(manufactureInfo.muffleWidth);
    } else {
      manufactureInfo.muffleWidth = this.shareService.checkDirtyProperty('muffleWidth', fieldColorsList) ? manufacturingObj?.muffleWidth : this.shareService.isValidNumber(manufactureInfo.muffleWidth);
    }

    //Total parts in muffle
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      let noOfParts = this.shareService.isValidNumber(
        Math.round((Number(manufactureInfo.muffleLength) * Number(manufactureInfo.muffleWidth)) / (Number(manufactureInfo.workpieceStockDiameter) * Number(manufactureInfo.workpieceStockLength)))
      );
      if (manufactureInfo.noOfParts != null) noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
      manufactureInfo.noOfParts = noOfParts;
    }

    //Muffle Quantity
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      let noofStroke = this.shareService.isValidNumber(Number(manufactureInfo.noOfParts) * Number(manufactureInfo.meltingWeight));
      if (manufactureInfo.noofStroke != null) noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : noofStroke;
      manufactureInfo.noofStroke = noofStroke;
    }

    const muffleQty = manufactureInfo.noofStroke; //Number(manufactureInfo.noOfParts) * Number(grossWeight);
    //final temp
    if (manufactureInfo.isfinalTempDirty && manufactureInfo.finalTemp != null) {
      manufactureInfo.finalTemp = this.shareService.isValidNumber(manufactureInfo.finalTemp);
    } else {
      manufactureInfo.finalTemp = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas.finalTemperature);
      manufactureInfo.finalTemp = this.shareService.checkDirtyProperty('finalTemp', fieldColorsList) ? manufacturingObj?.finalTemp : manufactureInfo.finalTemp;
    }

    //soaking time
    if (manufactureInfo.issoakingTimeDirty && manufactureInfo.soakingTime != null) {
      manufactureInfo.soakingTime = this.shareService.isValidNumber(manufactureInfo.soakingTime);
    } else {
      manufactureInfo.soakingTime = this.shareService.isValidNumber(this.shareService.isValidNumber(600 * 2));
      manufactureInfo.soakingTime = this.shareService.checkDirtyProperty('soakingTime', fieldColorsList) ? manufacturingObj?.soakingTime : manufactureInfo.soakingTime;
    }

    //batch heating time
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime != null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let coolingTime = this.shareService.isValidNumber(
        (Number(muffleQty / 1000) * Number(manufactureInfo?.moldTemp) * (Number(manufactureInfo.finalTemp) - Number(manufactureInfo.initialTemp))) /
        (Number(manufactureInfo?.powerSupply) * 1000 * Number(manufactureInfo.furanceEfficiency / 100) + Number(manufactureInfo.soakingTime))
      );
      if (manufactureInfo.processTime != null) coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
      manufactureInfo.coolingTime = coolingTime;
    }

    //Process cycle time per part
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = this.shareService.isValidNumber(Number(manufactureInfo.coolingTime) / Number(manufactureInfo.noOfParts));
      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    //Setup Time (S/piece) :

    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let dryCycleTime = this.shareService.isValidNumber((Number(manufactureInfo.setUpTime) / Number(manufactureInfo?.noOfParts)) * 60);
      if (manufactureInfo.dryCycleTime != null)
        dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : this.shareService.isValidNumber(dryCycleTime);
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    // No of Manufacturing lot per batch
    if (manufactureInfo.isNoOfWeldPassesDirty && manufactureInfo.noOfWeldPasses != null) {
      manufactureInfo.noOfWeldPasses = this.shareService.isValidNumber(Number(manufactureInfo.noOfWeldPasses));
    } else {
      let noOfWeldPasses = this.shareService.isValidNumber(Number(manufactureInfo.lotSize / manufactureInfo.noOfParts));
      if (manufactureInfo.noOfWeldPasses != null) noOfWeldPasses = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList) ? manufacturingObj?.noOfWeldPasses : noOfWeldPasses;
      manufactureInfo.noOfWeldPasses = noOfWeldPasses;
    }

    //Material Handling Time
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime));
    } else {
      let totalCycleTime = 60 * Number(manufactureInfo.noOfWeldPasses);

      if (manufactureInfo.totalCycleTime != null) totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : totalCycleTime;
      manufactureInfo.totalCycleTime = totalCycleTime;
    }

    //cycleTime
    //Cycle Time (s / part):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime) + Number(manufactureInfo.totalCycleTime));
      if (manufactureInfo.cycleTime != null) cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(cycleTime);
      manufactureInfo.cycleTime = cycleTime;
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateForgingBilletHeating(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingBilletHeating(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    let stockLength = 0;
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    let stockOuterDiameter = 0;
    const specificHeat = manufactureInfo?.machineMaster?.specificHeat;
    const ratedPower = manufactureInfo?.machineMaster?.ratedPower;
    // const furnanceEfficiency = manufactureInfo?.machineMaster?.furnaceCapacityTon;
    let maxLenght = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.maxLength);
    let maxWidht = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.maxWidth);
    const stockForm = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.stockForm;
    const partHeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimZ; //partHeight;
    const partWidth = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimY; //partWidth

    if (manufactureInfo.materialInfoList?.length > 0 && manufactureInfo.materialInfoList[0]?.processId === PrimaryProcessType.HotForgingClosedDieHot) {
      stockOuterDiameter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.stockOuterDiameter;
      stockLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockLength;
    } else if (manufactureInfo.materialInfoList?.length > 0 && manufactureInfo.materialInfoList[0]?.processId === PrimaryProcessType.HotForgingOpenDieHot) {
      stockOuterDiameter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.inputBilletDiameter;
      stockLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.inputBilletLength;
    }

    //Stock Length (mm):
    if (manufactureInfo.isWorkpieceStockLengthDirty && manufactureInfo.workpieceStockLength != null) {
      manufactureInfo.workpieceStockLength = Number(manufactureInfo.workpieceStockLength);
    } else {
      manufactureInfo.workpieceStockLength = this.shareService.checkDirtyProperty('workpieceStockLength', fieldColorsList)
        ? manufacturingObj?.workpieceStockLength
        : this.shareService.isValidNumber(manufactureInfo.workpieceStockLength);
    }

    //muffle Length
    if (manufactureInfo.isMuffleLengthDirty && manufactureInfo.muffleLength != null) {
      manufactureInfo.muffleLength = Number(manufactureInfo.muffleLength);
    } else {
      if (manufactureInfo.muffleLength != null) maxLenght = this.shareService.checkDirtyProperty('muffleLength', fieldColorsList) ? manufacturingObj?.muffleLength : maxLenght;

      manufactureInfo.muffleLength = Number(maxLenght);
    }

    //muffle width
    if (manufactureInfo.isMuffleWidthDirty && manufactureInfo.muffleWidth != null) {
      manufactureInfo.muffleWidth = Number(manufactureInfo.muffleWidth);
    } else {
      if (manufactureInfo.muffleWidth != null) maxWidht = this.shareService.checkDirtyProperty('muffleWidth', fieldColorsList) ? manufacturingObj?.muffleWidth : maxWidht;

      manufactureInfo.muffleWidth = maxWidht;
    }

    //Total parts in muffle
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      let diameter = stockOuterDiameter;
      if (stockForm === 'Rectangular bar') {
        diameter = Math.max(partHeight, partWidth);
      }

      let noOfParts = this.shareService.isValidNumber(Math.trunc((Number(manufactureInfo.muffleLength) * Number(manufactureInfo.muffleWidth)) / (Number(diameter) * Number(stockLength))));
      if (manufactureInfo.noOfParts != null) noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts || manufacturingObj?.noOfParts;
      manufactureInfo.noOfParts = noOfParts;
    }

    //Muffle Quantity
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      let noofStroke = this.shareService.isValidNumber((Number(manufactureInfo.noOfParts) * Number(grossWeight)) / 100);
      if (manufactureInfo.noofStroke != null) noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : noofStroke;
      manufactureInfo.noofStroke = noofStroke;
    }

    //rated Power
    if (manufactureInfo.isPowerSupplyDirty && manufactureInfo.powerSupply != null) {
      manufactureInfo.powerSupply = Number(manufactureInfo.powerSupply);
    } else {
      let powerSupply = this.shareService.isValidNumber(ratedPower);
      if (manufactureInfo.powerSupply != null) powerSupply = this.shareService.checkDirtyProperty('powerSupply', fieldColorsList) ? manufacturingObj?.powerSupply : powerSupply;
      manufactureInfo.powerSupply = powerSupply;
    }

    //Specific heat
    if (manufactureInfo.ismoldTempDirty && manufactureInfo.moldTemp != null) {
      manufactureInfo.moldTemp = Number(manufactureInfo.moldTemp);
    } else {
      let moldTemp = this.shareService.isValidNumber(specificHeat);
      if (manufactureInfo.moldTemp != null) moldTemp = this.shareService.checkDirtyProperty('moldTemp', fieldColorsList) ? manufacturingObj?.moldTemp : moldTemp;
      manufactureInfo.moldTemp = moldTemp;
    }

    const muffleQty = manufactureInfo.noofStroke; //Number(manufactureInfo.noOfParts) * Number(grossWeight);
    //final temp
    if (manufactureInfo.isfinalTempDirty && manufactureInfo.finalTemp != null) {
      manufactureInfo.finalTemp = this.shareService.isValidNumber(manufactureInfo.finalTemp);
    } else {
      manufactureInfo.finalTemp = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas.finalTemperature);
      manufactureInfo.finalTemp = this.shareService.checkDirtyProperty('finalTemp', fieldColorsList) ? manufacturingObj?.finalTemp : manufactureInfo.finalTemp;
    }

    //soaking time
    if (manufactureInfo.issoakingTimeDirty && manufactureInfo.soakingTime != null) {
      manufactureInfo.soakingTime = this.shareService.isValidNumber(manufactureInfo.soakingTime);
    } else {
      manufactureInfo.soakingTime = this.shareService.isValidNumber(this.shareService.isValidNumber(600 * 2));
      manufactureInfo.soakingTime = this.shareService.checkDirtyProperty('soakingTime', fieldColorsList) ? manufacturingObj?.soakingTime : manufactureInfo.soakingTime;
    }

    //batch heating time
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime != null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let coolingTime = this.shareService.isValidNumber(
        (Number(muffleQty / 1000) * Number(manufactureInfo?.moldTemp) * (Number(manufactureInfo.finalTemp) - Number(manufactureInfo.initialTemp))) /
        (Number(manufactureInfo?.powerSupply) * 1000 * Number(manufactureInfo.furanceEfficiency)) +
        Number(manufactureInfo.soakingTime)
      );
      if (manufactureInfo.processTime != null) coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
      manufactureInfo.coolingTime = coolingTime;
    }

    //Process cycle time per part //Total Cycle time per part (sec):
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = this.shareService.isValidNumber(Number(manufactureInfo.coolingTime) / Number(manufactureInfo.noOfParts));
      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    //Setup Time (S/piece) :

    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let dryCycleTime = this.shareService.isValidNumber((Number(manufactureInfo.setUpTime) / Number(manufactureInfo?.noOfParts)) * 60);
      if (manufactureInfo.dryCycleTime != null)
        dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : this.shareService.isValidNumber(dryCycleTime);
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    // // No of Manufacturing lot per batch
    // if (manufactureInfo.isNoOfWeldPassesDirty && manufactureInfo.noOfWeldPasses != null) {
    //   manufactureInfo.noOfWeldPasses = this.shareService.isValidNumber(Number(manufactureInfo.noOfWeldPasses));
    // } else {
    //   let noOfWeldPasses = this.shareService.isValidNumber(Number(manufactureInfo.lotSize / manufactureInfo.noOfParts));
    //   if (manufactureInfo.noOfWeldPasses != null)
    //     noOfWeldPasses = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList) ? manufacturingObj?.noOfWeldPasses : noOfWeldPasses;
    //   manufactureInfo.noOfWeldPasses = noOfWeldPasses;
    // }

    // //Material Handling Time
    // if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
    //   manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime));
    // } else {
    //   let totalCycleTime = 60 * Number(manufactureInfo.noOfWeldPasses);

    //   if (manufactureInfo.totalCycleTime != null)
    //     totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : totalCycleTime;
    //   manufactureInfo.totalCycleTime = totalCycleTime;
    // }

    //cycleTime
    //Cycle Time (s / part):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      //(Number(manufactureInfo.processTime) +      Number(manufactureInfo.totalCycleTime))
      let cycleTime = this.shareService.isValidNumber(
        Number(manufactureInfo.coolingTime) / (Number(manufactureInfo.noOfParts) + Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime))
      );
      if (manufactureInfo.cycleTime != null) cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(cycleTime);
      manufactureInfo.cycleTime = cycleTime;
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  public calculateForgingSawCuttingAndShearing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, currentPart: PartInfoDto): ProcessInfoDto {
    const stockOuterDiameter =
      currentPart?.commodityId === CommodityType.MetalForming ? manufactureInfo.materialInfoList?.[0]?.stockOuterDiameter : manufactureInfo.materialInfoList?.[0]?.stockDiameter;
    const stockInnerDiameter = currentPart?.commodityId === CommodityType.MetalForming ? manufactureInfo.materialInfoList?.[0]?.stockInnerDiameter : 0;
    const inputBilletLength = currentPart?.commodityId === CommodityType.MetalForming ? manufactureInfo.materialInfoList[0]?.blockLength : manufactureInfo.materialInfoList[0]?.stockLength;
    const materialDensity = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    // manufactureInfo.subProcessTypeID = stockOuterDiameter > 30 ? 1 : 2;
    // const subProcessTypeID = this.shareService.isValidNumber(Number(manufactureInfo.subProcessTypeID));
    const stockForm = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.stockForm;
    const ultimateTensileMaterial = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas?.tensileStrength);
    const inputBilletWidth = currentPart?.commodityId === CommodityType.MetalForming ? manufactureInfo.materialInfoList[0]?.blockWidth : manufactureInfo.materialInfoList[0]?.stockCrossSectionWidth;
    const inputBilletHeight = currentPart?.commodityId === CommodityType.MetalForming ? manufactureInfo.materialInfoList[0]?.blockHeight : manufactureInfo.materialInfoList[0]?.stockCrossSectionHeight;
    // manufactureInfo.noOfbends = stockForm === 'Rectangular Bar' ? 1 : 2; // cross section
    const thickness = manufactureInfo?.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockLength; // thickness (need to confirm)

    // Process Type
    if (manufactureInfo.issubProcessTypeIDDirty && !!manufactureInfo.subProcessTypeID) {
      manufactureInfo.subProcessTypeID = Number(manufactureInfo.subProcessTypeID);
    } else {
      let subProcessTypeID = stockOuterDiameter > 30 ? 1 : 2;
      if (!!manufactureInfo.subProcessTypeID) {
        subProcessTypeID = this.shareService.checkDirtyProperty('subProcessTypeID', fieldColorsList) ? manufacturingObj?.subProcessTypeID : subProcessTypeID;
      }
      manufactureInfo.subProcessTypeID = subProcessTypeID;
    }

    // Cross Section
    const STOCK_FORM_TO_BENDS: Record<string, number> = {
      'Rectangular Bar': 1,
      'Round Bar': 2,
      'Rectangular Tube': 3,
      'Round Tube': 4,
    };
    if (manufactureInfo.isNoOfBends && !!manufactureInfo.noOfbends) {
      manufactureInfo.noOfbends = Number(manufactureInfo.noOfbends);
    } else {
      let noOfbends = STOCK_FORM_TO_BENDS[stockForm] ?? 2;
      if (!!manufactureInfo.noOfbends) {
        noOfbends = this.shareService.checkDirtyProperty('noOfBends', fieldColorsList) ? manufacturingObj?.noOfbends : noOfbends;
      }
      manufactureInfo.noOfbends = noOfbends;
    }

    //Outer Diameter(mm) / Cross Section Height
    if (manufactureInfo.isDrillDiameterDirty || (manufactureInfo.drillDiameter != null && manufactureInfo.drillDiameter != 0)) {
      manufactureInfo.drillDiameter = this.shareService.isValidNumber(Number(manufactureInfo.drillDiameter));
    } else {
      let drillDiameter = manufactureInfo?.noOfbends === 2 ? this.shareService.isValidNumber(stockOuterDiameter) : this.shareService.isValidNumber(inputBilletHeight);
      if (manufactureInfo.drillDiameter != null) drillDiameter = this.shareService.checkDirtyProperty('drillDiameter', fieldColorsList) ? manufacturingObj?.drillDiameter : drillDiameter;
      manufactureInfo.drillDiameter = drillDiameter;
    }

    //Inner Diameter(mm) / Cross Section Width
    if (manufactureInfo.isWorkpieceStockDiameterDirty || (manufactureInfo.workpieceStockDiameter != null && manufactureInfo.workpieceStockDiameter != 0)) {
      manufactureInfo.workpieceStockDiameter = this.shareService.isValidNumber(Number(manufactureInfo.workpieceStockDiameter));
    } else {
      let workpieceStockDiameter = manufactureInfo?.noOfbends === 2 ? this.shareService.isValidNumber(stockInnerDiameter) : this.shareService.isValidNumber(inputBilletWidth);
      if (manufactureInfo.workpieceStockDiameter != null)
        workpieceStockDiameter = this.shareService.checkDirtyProperty('workpieceStockDiameter', fieldColorsList) ? manufacturingObj?.workpieceStockDiameter : workpieceStockDiameter;
      manufactureInfo.workpieceStockDiameter = workpieceStockDiameter;
    }

    //Cross Section Thickness
    if (manufactureInfo.isWorkpieceStockLengthDirty || (manufactureInfo.workpieceStockLength != null && manufactureInfo.workpieceStockLength != 0)) {
      manufactureInfo.workpieceStockLength = this.shareService.isValidNumber(Number(manufactureInfo.workpieceStockLength));
    } else {
      let workpieceStockLength = manufactureInfo?.noOfbends === 3 ? this.shareService.isValidNumber(thickness) : 0;
      if (manufactureInfo.workpieceStockLength != null)
        workpieceStockLength = this.shareService.checkDirtyProperty('workpieceStockLength', fieldColorsList) ? manufacturingObj?.workpieceStockLength : workpieceStockLength;
      manufactureInfo.workpieceStockLength = workpieceStockLength;
    }

    //cutting area
    let cuttingArea = 0;
    if (manufactureInfo.iscuttingAreaDirty && !!manufactureInfo.cuttingArea) {
      manufactureInfo.cuttingArea = Number(manufactureInfo.cuttingArea);
    } else {
      if (manufactureInfo?.noOfbends === 2) {
        cuttingArea = this.pi * Math.pow(Number(manufactureInfo?.drillDiameter / 2), 2);
        // cuttingArea = this.pi * Math.pow(stockOuterDiameter / 2, 2);
      } else if (manufactureInfo?.noOfbends === 4) {
        cuttingArea = this.pi * (Math.pow(manufactureInfo?.drillDiameter / 2, 2) - Math.pow(manufactureInfo?.workpieceStockDiameter / 2, 2));
      } else if (manufactureInfo?.noOfbends === 1) {
        cuttingArea = manufactureInfo?.drillDiameter * manufactureInfo?.workpieceStockDiameter;
      } else if (manufactureInfo?.noOfbends === 3) {
        cuttingArea =
          manufactureInfo?.drillDiameter * manufactureInfo?.workpieceStockDiameter -
          (manufactureInfo?.drillDiameter - 2 * manufactureInfo?.workpieceStockLength) * (manufactureInfo?.workpieceStockDiameter - 2 * manufactureInfo?.workpieceStockLength);
      } else {
        cuttingArea = manufactureInfo?.drillDiameter * manufactureInfo?.workpieceStockDiameter;
      }
      // cuttingArea = this.shareService.isValidNumber(cuttingArea * manufactureInfo.noOfParts);
      cuttingArea = this.shareService.isValidNumber(cuttingArea);
      if (!!manufactureInfo.cuttingArea) {
        cuttingArea = this.shareService.checkDirtyProperty('cuttingArea', fieldColorsList) ? manufacturingObj?.cuttingArea : cuttingArea;
      }
      manufactureInfo.cuttingArea = cuttingArea;
    }

    //cutting length(mm)
    if (manufactureInfo.isCuttingLengthDirty || (manufactureInfo.cuttingLength != null && manufactureInfo.cuttingLength != 0)) {
      manufactureInfo.cuttingLength = this.shareService.isValidNumber(Number(manufactureInfo.cuttingLength));
    } else {
      let cuttingLength = this.shareService.isValidNumber(inputBilletLength);
      if (manufactureInfo.cuttingLength != null) cuttingLength = this.shareService.checkDirtyProperty('cuttingLength', fieldColorsList) ? manufacturingObj?.cuttingLength : cuttingLength;
      manufactureInfo.cuttingLength = cuttingLength;
    }

    //Total weight of the Rod/Tube
    if (manufactureInfo.ismeltingWeightDirty || (manufactureInfo.meltingWeight != null && manufactureInfo.meltingWeight != 0)) {
      manufactureInfo.meltingWeight = Number(manufactureInfo.meltingWeight);
    } else {
      let meltingWeight = this.shareService.isValidNumber(materialDensity); // manufactureInfo.cuttingArea * manufactureInfo.cuttingLength * materialDensity
      if (manufactureInfo.meltingWeight != null) {
        meltingWeight = this.shareService.checkDirtyProperty('meltingWeight', fieldColorsList) ? manufacturingObj?.meltingWeight : meltingWeight;
      }
      manufactureInfo.meltingWeight = meltingWeight;
    }

    // Required tonnage
    let recommendTonnage = (manufactureInfo.cuttingArea * ultimateTensileMaterial * 0.6) / 1000;
    if (manufactureInfo.isRecommendTonnageDirty && !!manufactureInfo.recommendTonnage) {
      manufactureInfo.recommendTonnage = Number(manufactureInfo.recommendTonnage);
    } else {
      if (!!manufactureInfo.recommendTonnage) {
        recommendTonnage = this.shareService.checkDirtyProperty('recommendTonnage', fieldColorsList) ? manufacturingObj?.recommendTonnage : recommendTonnage;
      }
      manufactureInfo.recommendTonnage = recommendTonnage;
    }

    //process cycle time
    //For BandSawCutting
    if (manufactureInfo?.subProcessTypeID === ForgingCutting.BandSawCutting) {
      const materialType = manufactureInfo.materialInfoList[0]?.materialMasterData?.materialTypeName?.toLowerCase() || '';
      const bandSawCuttingSpeedLookup = this.forgingSubProcessConfig.bandSawCuttingSpeedLookup;
      const found = bandSawCuttingSpeedLookup.find((item) => materialType.includes(item.key));
      const cuttingSpeed = found ? found.value : 1;
      // const cuttingSpeed = this.shareService.isValidNumber(manufactureInfo.forgingLookupList?.find((x) => x.materialTypeId == manufactureInfo.materialType)?.cuttingSpeed);
      if (manufactureInfo.isProcessTimeDirty || (manufactureInfo.processTime != null && manufactureInfo.processTime != 0)) {
        manufactureInfo.processTime = Number(manufactureInfo.processTime);
      } else {
        let processTime = this.shareService.isValidNumber(manufactureInfo.cuttingArea / cuttingSpeed);
        if (manufactureInfo.processTime != null) {
          processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
        }
        manufactureInfo.processTime = processTime;
      }
    }

    //For Shearing
    if (manufactureInfo?.subProcessTypeID === ForgingCutting.StockShearing) {
      if (manufactureInfo.isProcessTimeDirty && !!manufactureInfo.processTime) {
        manufactureInfo.processTime = Number(manufactureInfo.processTime);
      } else {
        let processTime: number;

        // Handle edge cases with conditional fallback
        if (manufactureInfo.cuttingArea > 18000) {
          processTime = 15; // Max process cycle time
        } else if (manufactureInfo.cuttingArea < 1000) {
          processTime = 3; // Min process cycle time
        } else {
          // Standard lookup logic for values within range
          const forgingtbl1 = this.materialForgingConfigService
            .getSawCuttingProcessCycleTime()
            .filter((x) => x.crossSectionArea >= manufactureInfo.cuttingArea)
            .sort((a, b) => a.crossSectionArea - b.crossSectionArea);

          processTime = forgingtbl1?.length > 0 ? forgingtbl1[0].processCycleTime : this.materialForgingConfigService.getSawCuttingProcessCycleTime()[0].processCycleTime;
        }

        if (manufactureInfo.processTime != null) {
          processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
        }
        manufactureInfo.processTime = processTime;
      }
    }

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = Math.ceil(this.shareService.isValidNumber(Number(manufactureInfo.cuttingLength) * 0.025));
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = Math.ceil(this.shareService.isValidNumber(Number(manufactureInfo.cuttingLength) * 0.01));
      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    //efficiency
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = 0.85;
      if (manufactureInfo.efficiency != null) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }

    //Cycle time
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null && manufactureInfo.cycleTime != 0) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = 0;
      if (manufactureInfo.materialInfoList?.length > 0 && manufactureInfo.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingClosedDieHot) {
        // cycleTime = (this.shareService.isValidNumber((Number(manufactureInfo.loadingTime) +
        //   Number(manufactureInfo.unloadingTime) +
        //   Number(manufactureInfo.processTime))));
        cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime) / manufactureInfo.efficiency);
      } else if (
        manufactureInfo.materialInfoList?.length > 0 &&
        manufactureInfo.materialInfoList[0]?.processId === PrimaryProcessType.HotForgingClosedDieHot &&
        manufactureInfo?.subProcessTypeID === ForgingCutting.BandSawCutting
      ) {
        cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime));
      } else {
        cycleTime = Math.ceil(
          this.shareService.isValidNumber((Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime)) / manufactureInfo.efficiency)
        );
        // cycleTime = (this.shareService.isValidNumber((Number(manufactureInfo.processTime)) /
        //   manufactureInfo.efficiency));
      }
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    //Total machine hours required per lot (hr):
    if (manufactureInfo.isTotalTimeDirty || (manufactureInfo.totalTime != null && manufactureInfo.totalTime != 0)) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.totalTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);

    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateHotForgingOpenDieHot(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateHotForgingOpenDieHot(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    const inputBilletLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.inputBilletLength;
    // const partVolume = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partVolume;
    const materialPartHeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimZ; //partHeight;
    const partProjectedArea = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partProjectedArea;

    //Shape Factor
    let forgingShapeFactor = 0;
    if (manufactureInfo.typeOfOperationId != null) {
      forgingShapeFactor = this.materialForgingConfigService.getForgingShapeFactor()?.find((x) => x.id == manufactureInfo?.typeOfOperationId)?.shapeFactor || 0;
    }

    //Stock area

    if (manufactureInfo.isflashAreaDirty && manufactureInfo.flashArea != null) {
      manufactureInfo.flashArea = this.shareService.isValidNumber(Number(manufactureInfo.flashArea));
    } else {
      manufactureInfo.flashArea = this.shareService.checkDirtyProperty('flashArea', fieldColorsList) ? manufacturingObj?.flashArea : manufactureInfo.flashArea;
    }

    //ho,Intial ht of blank/billet (mm)
    if (manufactureInfo.isinitialStockHeightDirty && manufactureInfo.initialStockHeight != null) {
      manufactureInfo.initialStockHeight = this.shareService.isValidNumber(Number(manufactureInfo.initialStockHeight));
    } else {
      let initialStockHeight = this.shareService.isValidNumber(inputBilletLength);
      if (manufactureInfo.initialStockHeight != null)
        initialStockHeight = this.shareService.checkDirtyProperty('initialStockHeight', fieldColorsList) ? manufacturingObj?.initialStockHeight : initialStockHeight;
      manufactureInfo.initialStockHeight = initialStockHeight;
    }

    //strain
    const strain = this.shareService.isValidNumber((Number(manufactureInfo.initialStockHeight) - Number(materialPartHeight)) / Number(manufactureInfo.initialStockHeight));
    //strength CoEfficient
    const strengthCoEfficient = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strengthCoEfficient));
    //strainHardeningExponent
    const strainHardeningExponent = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strainHardeningExponent));
    //Flow stress
    const flowStress = this.shareService.isValidNumber(strengthCoEfficient * Math.pow(Math.log(1 + Number(strain)), strainHardeningExponent));

    //Part Area
    if (manufactureInfo.ispartAreaDirty && manufactureInfo.partArea != null) {
      manufactureInfo.partArea = this.shareService.isValidNumber(Number(manufactureInfo.partArea));
    } else {
      let partArea = this.shareService.isValidNumber(partProjectedArea);
      if (manufactureInfo.partArea != null) partArea = this.shareService.checkDirtyProperty('partArea', fieldColorsList) ? manufacturingObj?.partArea : partArea;
      manufactureInfo.partArea = partArea;
    }

    //Factor of safety
    if (manufactureInfo.ishlFactorDirty && manufactureInfo.hlFactor != null) {
      manufactureInfo.hlFactor = this.shareService.isValidNumber(Number(manufactureInfo.hlFactor));
    } else {
      let hlFactor = this.shareService.isValidNumber(manufactureInfo.hlFactor);
      if (manufactureInfo.hlFactor != null) hlFactor = this.shareService.checkDirtyProperty('hlFactor', fieldColorsList) ? manufacturingObj?.hlFactor : hlFactor;
      manufactureInfo.hlFactor = hlFactor;
    }

    //force required
    const forceRequired = this.shareService.isValidNumber(
      (Number(flowStress) * Number(manufactureInfo.hlFactor) * (Number(manufactureInfo.partArea) + Number(manufactureInfo.flashArea)) * Number(forgingShapeFactor)) / 10000
    );

    const theoriticalForcce = this.shareService.isValidNumber(Number(forceRequired) / 9810);
    //manufactureInfo.recommendTonnage = this.shareService.isValidNumber(Number(theoriticalForcce));

    //Forging Force (Tonne)
    manufactureInfo.recommendTonnage = theoriticalForcce;

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = 3600;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //No of hits required
    if (manufactureInfo.isNoOfHitsRequiredDirty && manufactureInfo.noOfHitsRequired != null) {
      manufactureInfo.noOfHitsRequired = this.shareService.isValidNumber(Number(manufactureInfo.noOfHitsRequired));
    } else {
      manufactureInfo.noOfHitsRequired = this.shareService.checkDirtyProperty('noOfHitsRequired', fieldColorsList) ? manufacturingObj?.noOfHitsRequired : manufactureInfo.noOfHitsRequired;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = this.shareService.isValidNumber(manufactureInfo.noOfHitsRequired * 30);

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
      let loadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
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

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculationForShotBlasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationForShotBlasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.setUpTimeBatch = 45;

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTimeBatch;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = 3600;

      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    //Material Handling Time
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime));
    } else {
      let totalCycleTime = 60 * Number(manufactureInfo.noOfWeldPasses);

      if (manufactureInfo.totalCycleTime != null) totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : totalCycleTime;
      manufactureInfo.totalCycleTime = totalCycleTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime) + Number(manufactureInfo.processTime));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateForgingLubricationPhosphate(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingLubricationPhosphate(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // const stockLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockLength;
    // const stockWidth = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockWidth;
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    const stockDiameter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.stockDiameter;
    const weldWeightWastage = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.weldWeightWastage;
    const lengthOfRawMaterial = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.sheetLength;

    //Stock Length (mm):
    if (manufactureInfo.isWorkpieceStockLengthDirty && manufactureInfo.workpieceStockLength != null) {
      manufactureInfo.workpieceStockLength = Number(manufactureInfo.workpieceStockLength);
    } else {
      manufactureInfo.workpieceStockLength = this.shareService.checkDirtyProperty('workpieceStockLength', fieldColorsList)
        ? manufacturingObj?.workpieceStockLength
        : this.shareService.isValidNumber(manufactureInfo.workpieceStockLength);
    }

    //muffle Length
    if (manufactureInfo.isMuffleLengthDirty && manufactureInfo.muffleLength != null) {
      manufactureInfo.muffleLength = Number(manufactureInfo.muffleLength);
    } else {
      manufactureInfo.muffleLength = this.shareService.checkDirtyProperty('muffleLength', fieldColorsList)
        ? manufacturingObj?.muffleLength
        : this.shareService.isValidNumber(manufactureInfo.muffleLength);
    }

    //muffle width
    if (manufactureInfo.isMuffleWidthDirty && manufactureInfo.muffleWidth != null) {
      manufactureInfo.muffleWidth = Number(manufactureInfo.muffleWidth);
    } else {
      manufactureInfo.muffleWidth = this.shareService.checkDirtyProperty('muffleWidth', fieldColorsList) ? manufacturingObj?.muffleWidth : this.shareService.isValidNumber(manufactureInfo.muffleWidth);
    }

    //Total parts in muffle
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      let noOfParts = 0;
      if (manufactureInfo.materialInfoList?.length > 0 && manufactureInfo.materialInfoList[0]?.processId === PrimaryProcessType.ColdForgingColdHeading) {
        noOfParts = this.shareService.isValidNumber(
          (Number(manufactureInfo.muffleLength) * Number(manufactureInfo.muffleWidth)) / this.shareService.isValidNumber(Number(stockDiameter) * Number(lengthOfRawMaterial))
        );
      } else {
        noOfParts = this.shareService.isValidNumber(
          Math.floor((Number(manufactureInfo.muffleLength) * Number(manufactureInfo.muffleWidth)) / this.shareService.isValidNumber(Number(stockDiameter) * Number(weldWeightWastage)))
        );
      }
      if (manufactureInfo.noOfParts != null) noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
      manufactureInfo.noOfParts = noOfParts;
    }

    //Muffle Quantity
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      let noofStroke = this.shareService.isValidNumber(Math.trunc((Number(manufactureInfo.noOfParts) * Number(grossWeight)) / 100));
      if (manufactureInfo.noofStroke != null) noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : noofStroke;
      manufactureInfo.noofStroke = noofStroke;
    }

    const muffleQty = manufactureInfo.noofStroke; //Number(manufactureInfo.noOfParts) * Number(grossWeight);
    //final temp
    if (manufactureInfo.isfinalTempDirty && manufactureInfo.finalTemp != null) {
      manufactureInfo.finalTemp = this.shareService.isValidNumber(manufactureInfo.finalTemp);
    } else {
      manufactureInfo.finalTemp = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas.finalTemperature);
      manufactureInfo.finalTemp = this.shareService.checkDirtyProperty('finalTemp', fieldColorsList) ? manufacturingObj?.finalTemp : manufactureInfo.finalTemp;
    }

    //soaking time
    if (manufactureInfo.issoakingTimeDirty && manufactureInfo.soakingTime != null) {
      manufactureInfo.soakingTime = this.shareService.isValidNumber(manufactureInfo.soakingTime);
    } else {
      manufactureInfo.soakingTime = this.shareService.isValidNumber(this.shareService.isValidNumber(600 * 2));
      manufactureInfo.soakingTime = this.shareService.checkDirtyProperty('soakingTime', fieldColorsList) ? manufacturingObj?.soakingTime : manufactureInfo.soakingTime;
    }

    //batch heating time
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime != null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let coolingTime = this.shareService.isValidNumber(
        (Number(muffleQty / 1000) * Number(manufactureInfo?.moldTemp) * (Number(manufactureInfo.finalTemp) - Number(manufactureInfo.initialTemp))) /
        (Number(manufactureInfo?.powerSupply) * 1000 * (Number(manufactureInfo.furanceEfficiency) / 100)) +
        Number(manufactureInfo.soakingTime)
      );
      if (manufactureInfo.processTime != null) coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
      manufactureInfo.coolingTime = coolingTime;
    }

    //Process cycle time per part
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = this.shareService.isValidNumber(Number(manufactureInfo.coolingTime) / Number(manufactureInfo.noOfParts));
      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    //Setup Time (S/piece) :

    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let dryCycleTime = this.shareService.isValidNumber((Number(manufactureInfo.setUpTime) / Number(manufactureInfo?.noOfParts)) * 60);
      if (manufactureInfo.dryCycleTime != null)
        dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : this.shareService.isValidNumber(dryCycleTime);
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    // No of Manufacturing lot per batch
    if (manufactureInfo.isNoOfWeldPassesDirty && manufactureInfo.noOfWeldPasses != null) {
      manufactureInfo.noOfWeldPasses = this.shareService.isValidNumber(Number(manufactureInfo.noOfWeldPasses));
    } else {
      let noOfWeldPasses = this.shareService.isValidNumber(Number(manufactureInfo.lotSize / manufactureInfo.noOfParts));
      if (manufactureInfo.noOfWeldPasses != null) noOfWeldPasses = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList) ? manufacturingObj?.noOfWeldPasses : noOfWeldPasses;
      manufactureInfo.noOfWeldPasses = noOfWeldPasses;
    }

    //Material Handling Time
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime));
    } else {
      let totalCycleTime = 60 * Number(manufactureInfo.noOfWeldPasses);

      if (manufactureInfo.totalCycleTime != null) totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : totalCycleTime;
      manufactureInfo.totalCycleTime = totalCycleTime;
    }

    //cycleTime
    //Cycle Time (s / part):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.coolingTime / manufactureInfo.noOfParts) + Number(manufactureInfo.loadingTime + manufactureInfo.unloadingTime));
      if (manufactureInfo.cycleTime != null) cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(cycleTime);
      manufactureInfo.cycleTime = cycleTime;
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateForgingThreadRolling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingThreadRolling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    let threadLength = 0;

    // Thread Length
    if (manufactureInfo.isallowanceAlongLengthDirty === true && manufactureInfo.allowanceAlongLength !== null && manufactureInfo.allowanceAlongLength !== undefined) {
      manufactureInfo.allowanceAlongLength = this.shareService.isValidNumber(Number(manufactureInfo.allowanceAlongLength));
    } else {
      let allowanceAlongLength = 0;
      if (manufactureInfo.allowanceAlongLength !== null && manufactureInfo.allowanceAlongLength !== undefined) {
        allowanceAlongLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList) ? (manufacturingObj?.allowanceAlongLength ?? allowanceAlongLength) : allowanceAlongLength;
      }
      manufactureInfo.allowanceAlongLength = allowanceAlongLength;
    }
    threadLength = this.shareService.isValidNumber(manufactureInfo?.allowanceAlongLength);

    //spline designation
    if (manufactureInfo.isWeldingPositionDirty && manufactureInfo.weldingPosition != null) {
      manufactureInfo.weldingPosition = this.shareService.isValidNumber(Number(manufactureInfo.weldingPosition));
    } else {
      if (manufactureInfo.weldingPosition != null)
        manufactureInfo.weldingPosition = this.shareService.checkDirtyProperty('weldingPosition', fieldColorsList) ? manufacturingObj?.weldingPosition : manufactureInfo.weldingPosition;
    }
    const splinDesignation = this.shareService.isValidNumber(manufactureInfo?.weldingPosition); ///M24x3 and use No oF Bend field for drop down

    //Material Tensile Strength (Mpa)
    if (manufactureInfo.isUltimateTensileMaterialDirty && manufactureInfo.ultimateTensileMaterial != null) {
      manufactureInfo.ultimateTensileMaterial = this.shareService.isValidNumber(Number(manufactureInfo.ultimateTensileMaterial));
    } else {
      let tensile = manufactureInfo.materialmasterDatas?.tensileStrength;
      if (manufactureInfo.ultimateTensileMaterial != null)
        tensile = this.shareService.checkDirtyProperty('ultimateTensileMaterial', fieldColorsList) ? manufacturingObj?.ultimateTensileMaterial : tensile;

      manufactureInfo.ultimateTensileMaterial = tensile;
    }
    const materialTensileStrength = this.shareService.isValidNumber(manufactureInfo.ultimateTensileMaterial);

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = 10;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    // Required Rolling Force (kN)
    let requiredRollingForce = 0;
    const threadDesignation = this.materialForgingConfigService.getThreadDesignationDetails().filter((x) => x.id === splinDesignation);
    // Total Thread Rolling time including Part Feeding time (Sec)
    let threadRollingAndPartFeedingTime = 0;
    //Actual Rolling Time (Sec)
    let actualRollingtime = 0;
    // Total Thread Rolling output (Pcs)/ Min
    // let totalThreadRollingOutPut;

    if (threadDesignation && threadDesignation.length > 0) {
      //BO30 Pitch
      const pitchBO30 = threadDesignation[0]?.pitch;
      //BO35 Pitch
      const pitch = threadDesignation[0]?.pitchDiaMax;
      //BO36 wpr
      let wpr = 0;
      //BO37 Rolling Force
      let rollingForce = 0;
      if (600 >= materialTensileStrength) {
        rollingForce = threadDesignation[0]?.rf600;
        wpr = threadDesignation[0]?.wpr600;
      } else if (800 >= materialTensileStrength) {
        rollingForce = threadDesignation[0]?.rf800;
        wpr = threadDesignation[0]?.wpr800;
      } else if (1000 >= materialTensileStrength) {
        rollingForce = threadDesignation[0]?.rf1000;
        wpr = threadDesignation[0]?.wpr1000;
      } else {
        rollingForce = threadDesignation[0]?.rf1200;
        wpr = threadDesignation[0]?.wpr1200;
      }

      requiredRollingForce = this.shareService.isValidNumber((threadLength / (10 * pitchBO30)) * rollingForce);

      //BO38
      let feeding = 0;
      if (10 >= threadLength) {
        feeding = threadDesignation[0]?.feeding10;
      } else if (20 >= threadLength) {
        feeding = threadDesignation[0]?.feeding20;
      } else if (30 >= threadLength) {
        feeding = threadDesignation[0]?.feeding30;
      } else if (40 >= threadLength) {
        feeding = threadDesignation[0]?.feeding40;
      } else if (50 >= threadLength) {
        feeding = threadDesignation[0]?.feeding50;
      } else if (75 >= threadLength) {
        feeding = threadDesignation[0]?.feeding75;
      } else {
        feeding = threadDesignation[0]?.feeding100;
      }

      //BO33
      const dieDiameter = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.maxToolDia); //.workPieceMinOrMaxDia);
      //BO34
      const spindleSpeed = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.spindleSpeed);

      actualRollingtime = this.shareService.isValidNumber((Number(wpr) * Number(pitch) * 60) / this.shareService.isValidNumber((Number(dieDiameter) - Number(pitch)) * Number(spindleSpeed * 0.6)));

      threadRollingAndPartFeedingTime = this.shareService.isValidNumber(Math.round(actualRollingtime + feeding) + 7);

      // Total Thread Rolling output (Pcs)/ Min
      // totalThreadRollingOutPut = this.shareService.isValidNumber(Math.round(60 / threadRollingAndPartFeedingTime));
    }

    //  Required Rolling Force (kN)
    if (manufactureInfo.isTheoreticalForceDirty && manufactureInfo.theoreticalForce != null) {
      manufactureInfo.theoreticalForce = Number(manufactureInfo.theoreticalForce);
    } else {
      let theoreticalForce = this.shareService.isValidNumber(requiredRollingForce);
      if (manufactureInfo.theoreticalForce != null) {
        theoreticalForce = this.shareService.checkDirtyProperty('theoreticalForce', fieldColorsList) ? manufacturingObj?.theoreticalForce : theoreticalForce;
      }
      manufactureInfo.theoreticalForce = theoreticalForce;
    }

    // Actual Rolling Time (Sec):  Actual Rolling Time (Sec)
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = this.shareService.isValidNumber(actualRollingtime);
      if (manufactureInfo.processTime != null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = processTime;
    }

    // Cycle time per part (s):  Total Thread Rolling time including Part Feeding time (Sec)
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(threadRollingAndPartFeedingTime);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    // Total Thread Rolling output (Pcs)/ Min
    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce != null) {
      manufactureInfo.noOfStartsPierce = this.shareService.isValidNumber(Number(manufactureInfo.noOfStartsPierce));
    } else {
      let noOfStartsPierce = this.shareService.isValidNumber((manufactureInfo.setUpTime / manufactureInfo.lotSize) * 60);

      if (manufactureInfo.noOfStartsPierce != null)
        noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? manufacturingObj?.noOfStartsPierce : noOfStartsPierce;
      manufactureInfo.noOfStartsPierce = noOfStartsPierce;
    }

    //Set up time/Part
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime));
    } else {
      let dryCycleTime = this.shareService.isValidNumber((manufactureInfo.setUpTime / manufactureInfo.lotSize) * 60);

      if (manufactureInfo.dryCycleTime != null) dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateColdHeadingThreadRolling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateColdHeadingThreadRolling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    let threadLength = 0;

    // Thread Length
    if (manufactureInfo.isallowanceAlongLengthDirty === true && manufactureInfo.allowanceAlongLength !== null && manufactureInfo.allowanceAlongLength !== undefined) {
      manufactureInfo.allowanceAlongLength = this.shareService.isValidNumber(Number(manufactureInfo.allowanceAlongLength));
    } else {
      let allowanceAlongLength = 0;
      if (manufactureInfo.allowanceAlongLength !== null && manufactureInfo.allowanceAlongLength !== undefined) {
        allowanceAlongLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList) ? (manufacturingObj?.allowanceAlongLength ?? allowanceAlongLength) : allowanceAlongLength;
      }
      manufactureInfo.allowanceAlongLength = allowanceAlongLength;
    }
    threadLength = this.shareService.isValidNumber(manufactureInfo?.allowanceAlongLength);

    //spline designation
    if (manufactureInfo.isWeldingPositionDirty && manufactureInfo.weldingPosition != null) {
      manufactureInfo.weldingPosition = this.shareService.isValidNumber(Number(manufactureInfo.weldingPosition));
    } else {
      if (manufactureInfo.weldingPosition != null)
        manufactureInfo.weldingPosition = this.shareService.checkDirtyProperty('weldingPosition', fieldColorsList) ? manufacturingObj?.weldingPosition : manufactureInfo.weldingPosition;
    }
    const splinDesignation = this.shareService.isValidNumber(manufactureInfo?.weldingPosition); ///M24x3 and use No oF Bend field for drop down

    //Material Tensile Strength (Mpa)
    if (manufactureInfo.isUltimateTensileMaterialDirty && manufactureInfo.ultimateTensileMaterial != null) {
      manufactureInfo.ultimateTensileMaterial = this.shareService.isValidNumber(Number(manufactureInfo.ultimateTensileMaterial));
    } else {
      let tensile = manufactureInfo.materialmasterDatas?.tensileStrength;
      if (manufactureInfo.ultimateTensileMaterial != null)
        tensile = this.shareService.checkDirtyProperty('ultimateTensileMaterial', fieldColorsList) ? manufacturingObj?.ultimateTensileMaterial : tensile;

      manufactureInfo.ultimateTensileMaterial = tensile;
    }
    const materialTensileStrength = this.shareService.isValidNumber(manufactureInfo.ultimateTensileMaterial);

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = 10;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    // Required Rolling Force (kN)
    let requiredRollingForce = 0;
    const threadDesignation = this.materialForgingConfigService.getThreadDesignationDetails().filter((x) => x.id === splinDesignation);
    // Total Thread Rolling time including Part Feeding time (Sec)
    let threadRollingAndPartFeedingTime = 0;
    //Actual Rolling Time (Sec)
    let actualRollingtime = 0;
    // Total Thread Rolling output (Pcs)/ Min
    // let totalThreadRollingOutPut;

    if (threadDesignation && threadDesignation.length > 0) {
      //BO30 Pitch
      const pitchBO30 = threadDesignation[0]?.pitch;
      //BO35 Pitch
      const pitch = threadDesignation[0]?.pitchDiaMax;
      //BO36 wpr
      let wpr = 0;
      //BO37 Rolling Force
      let rollingForce = 0;
      if (600 >= materialTensileStrength) {
        rollingForce = threadDesignation[0]?.rf600;
        wpr = threadDesignation[0]?.wpr600;
      } else if (800 >= materialTensileStrength) {
        rollingForce = threadDesignation[0]?.rf800;
        wpr = threadDesignation[0]?.wpr800;
      } else if (1000 >= materialTensileStrength) {
        rollingForce = threadDesignation[0]?.rf1000;
        wpr = threadDesignation[0]?.wpr1000;
      } else {
        rollingForce = threadDesignation[0]?.rf1200;
        wpr = threadDesignation[0]?.wpr1200;
      }

      requiredRollingForce = this.shareService.isValidNumber((threadLength / (10 * pitchBO30)) * rollingForce);

      //BO38
      let feeding = 0;
      if (10 >= threadLength) {
        feeding = threadDesignation[0]?.feeding10;
      } else if (20 >= threadLength) {
        feeding = threadDesignation[0]?.feeding20;
      } else if (30 >= threadLength) {
        feeding = threadDesignation[0]?.feeding30;
      } else if (40 >= threadLength) {
        feeding = threadDesignation[0]?.feeding40;
      } else if (50 >= threadLength) {
        feeding = threadDesignation[0]?.feeding50;
      } else if (75 >= threadLength) {
        feeding = threadDesignation[0]?.feeding75;
      } else {
        feeding = threadDesignation[0]?.feeding100;
      }

      //BO33
      const dieDiameter = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.maxToolDia); //.workPieceMinOrMaxDia);
      //BO34
      const spindleSpeed = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.spindleSpeed);

      actualRollingtime = this.shareService.isValidNumber((Number(wpr) * Number(pitch) * 60) / this.shareService.isValidNumber((Number(dieDiameter) - Number(pitch)) * Number(spindleSpeed * 0.6)));

      threadRollingAndPartFeedingTime = this.shareService.isValidNumber(Math.round(actualRollingtime + feeding) + 7);

      // Total Thread Rolling output (Pcs)/ Min
      // totalThreadRollingOutPut = this.shareService.isValidNumber(Math.round(60 / threadRollingAndPartFeedingTime));
    }

    //  Required Rolling Force (kN)
    if (manufactureInfo.isTheoreticalForceDirty && manufactureInfo.theoreticalForce != null) {
      manufactureInfo.theoreticalForce = Number(manufactureInfo.theoreticalForce);
    } else {
      let theoreticalForce = this.shareService.isValidNumber(requiredRollingForce);
      if (manufactureInfo.theoreticalForce != null) {
        theoreticalForce = this.shareService.checkDirtyProperty('theoreticalForce', fieldColorsList) ? manufacturingObj?.theoreticalForce : theoreticalForce;
      }
      manufactureInfo.theoreticalForce = theoreticalForce;
    }

    // Actual Rolling Time (Sec):  Actual Rolling Time (Sec)
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = this.shareService.isValidNumber(actualRollingtime);
      if (manufactureInfo.processTime != null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = processTime;
    }

    // Cycle time per part (s):  Total Thread Rolling time including Part Feeding time (Sec)
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(threadRollingAndPartFeedingTime);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    // Total Thread Rolling output (Pcs)/ Min
    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce != null) {
      manufactureInfo.noOfStartsPierce = this.shareService.isValidNumber(Number(manufactureInfo.noOfStartsPierce));
    } else {
      let noOfStartsPierce = this.shareService.isValidNumber((manufactureInfo.setUpTime / manufactureInfo.lotSize) * 60);

      if (manufactureInfo.noOfStartsPierce != null)
        noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? manufacturingObj?.noOfStartsPierce : noOfStartsPierce;
      manufactureInfo.noOfStartsPierce = noOfStartsPierce;
    }

    //Set up time/Part
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime));
    } else {
      let dryCycleTime = this.shareService.isValidNumber((manufactureInfo.setUpTime / manufactureInfo.lotSize) * 60);

      if (manufactureInfo.dryCycleTime != null) dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculateColdHeadingForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateColdHeadingForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    //const inputBilletLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.inputBilletLength;
    // const partVolume = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partVolume;
    //const materialPartHeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partHeight;

    const ultimateTensileMaterial = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas?.tensileStrength);

    //Material Tensile Strength (Mpa)
    if (manufactureInfo.isUltimateTensileMaterialDirty && manufactureInfo.ultimateTensileMaterial != null) {
      manufactureInfo.ultimateTensileMaterial = this.shareService.isValidNumber(Number(manufactureInfo.ultimateTensileMaterial));
    } else {
      let tensile = ultimateTensileMaterial;
      if (manufactureInfo.ultimateTensileMaterial != null)
        tensile = this.shareService.checkDirtyProperty('ultimateTensileMaterial', fieldColorsList) ? manufacturingObj?.ultimateTensileMaterial : tensile;

      manufactureInfo.ultimateTensileMaterial = tensile;
    }

    //formPerimeter : Final Dia of head Df(mm):D14
    //formLength: Final length  of head Hf (mm): D15
    //punchPerimeter: Initial Dia of head D0(mm) :  D13

    //Initial Height Ho (mm)
    let formHeight = this.shareService.isValidNumber(
      Number(Math.pow(Number(manufactureInfo.formPerimeter / 2), 2) * Number(manufactureInfo.formLength)) / Math.pow(Number(manufactureInfo.punchPerimeter / 2), 2)
    );

    if (manufactureInfo.isformHeightDirty && manufactureInfo.formHeight != null) {
      manufactureInfo.formHeight = this.shareService.isValidNumber(Number(manufactureInfo.formHeight));
    } else {
      // let initialStockHeight = this.shareService.isValidNumber(inputBilletLength);
      if (manufactureInfo.formHeight != null) formHeight = this.shareService.checkDirtyProperty('formHeight', fieldColorsList) ? manufacturingObj?.formHeight : formHeight;
      manufactureInfo.formHeight = formHeight;
    }

    //=IF(E153/E152<=1.6, 1, IF(E153/E152<=2.2, 2, IF(E153/E152<=2.8, 3, IF(E153/E152<=3.4, 4, ""))))
    //Number of Stages(or Number of Hits needed)

    //No of hits required
    if (manufactureInfo.isNoOfHitsRequiredDirty && manufactureInfo.noOfHitsRequired != null) {
      manufactureInfo.noOfHitsRequired = this.shareService.isValidNumber(Number(manufactureInfo.noOfHitsRequired));
    } else {
      let noofhits = this.shareService.isValidNumber(manufactureInfo.formPerimeter / manufactureInfo.punchPerimeter);
      if (noofhits <= 1.6) {
        noofhits = 1;
      } else if (noofhits <= 2.2) {
        noofhits = 2;
      } else if (noofhits <= 2.8) {
        noofhits = 3;
      } else if (noofhits <= 3.4) {
        noofhits = 4;
      } else {
        noofhits = 0;
      }
      if (manufactureInfo.noOfHitsRequired != null) noofhits = this.shareService.checkDirtyProperty('noOfHitsRequired', fieldColorsList) ? manufacturingObj?.noOfHitsRequired : noofhits;

      manufactureInfo.noOfHitsRequired = noofhits;
    }

    //Cross Sectional Area (mm2)
    if (manufactureInfo.ispartAreaDirty && manufactureInfo.partArea != null) {
      manufactureInfo.partArea = this.shareService.isValidNumber(Number(manufactureInfo.partArea));
    } else {
      let partArea = this.shareService.isValidNumber(this.pi * Math.pow(Number(manufactureInfo.formPerimeter / 2), 2));

      if (manufactureInfo.partArea != null) partArea = this.shareService.checkDirtyProperty('partArea', fieldColorsList) ? manufacturingObj?.partArea : partArea;

      manufactureInfo.partArea = partArea;
    }

    //Shape Factor
    // let forgingShapeFactor = 0;
    // if (manufactureInfo.subProcessTypeID != null) {
    //   forgingShapeFactor = this.materialForgingConfigService.getForgingShapeFactor()?.find((x) => x.id == manufactureInfo?.subProcessTypeID)?.shapeFactor || 0;
    // }

    //Stock area

    if (manufactureInfo.isflashAreaDirty && manufactureInfo.flashArea != null) {
      manufactureInfo.flashArea = this.shareService.isValidNumber(Number(manufactureInfo.flashArea));
    } else {
      manufactureInfo.flashArea = this.shareService.checkDirtyProperty('flashArea', fieldColorsList) ? manufacturingObj?.flashArea : manufactureInfo.flashArea;
    }

    //strain
    //const strain = this.shareService.isValidNumber((Number(manufactureInfo.initialStockHeight) - Number(materialPartHeight)) / Number(manufactureInfo.initialStockHeight));
    //strength CoEfficient
    const strengthCoEfficient = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strengthCoEfficient));
    //strainHardeningExponent
    const strainHardeningExponent = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strainHardeningExponent));
    //Flow stress
    //const flowStress = this.shareService.isValidNumber(strengthCoEfficient * Math.pow(Math.log(1 + Number(strain)), strainHardeningExponent));

    //strength CoEfficient
    if (manufactureInfo.isShearStrengthMaterialDirty && manufactureInfo.shearStrengthMaterial != null) {
      manufactureInfo.shearStrengthMaterial = this.shareService.isValidNumber(Number(manufactureInfo.shearStrengthMaterial));
    } else {
      let shearStrengthMaterial = this.shareService.isValidNumber(strengthCoEfficient);
      if (manufactureInfo.shearStrengthMaterial != null)
        shearStrengthMaterial = this.shareService.checkDirtyProperty('shearStrengthMaterial', fieldColorsList) ? manufacturingObj?.shearStrengthMaterial : shearStrengthMaterial;
      manufactureInfo.shearStrengthMaterial = shearStrengthMaterial;
    }

    //Strain hardening exponent ((n)):
    if (manufactureInfo.isclampingPressureDirty && manufactureInfo.clampingPressure != null) {
      manufactureInfo.clampingPressure = this.shareService.isValidNumber(Number(manufactureInfo.clampingPressure));
    } else {
      let clampingPressure = this.shareService.isValidNumber(strainHardeningExponent);
      if (manufactureInfo.clampingPressure != null)
        clampingPressure = this.shareService.checkDirtyProperty('clampingPressure', fieldColorsList) ? manufacturingObj?.clampingPressure : clampingPressure;
      manufactureInfo.clampingPressure = clampingPressure;
    }

    //Factor of safety
    if (manufactureInfo.ishlFactorDirty && manufactureInfo.hlFactor != null) {
      manufactureInfo.hlFactor = this.shareService.isValidNumber(Number(manufactureInfo.hlFactor));
    } else {
      let hlFactor = 1.2;
      if (manufactureInfo.hlFactor != null) hlFactor = this.shareService.checkDirtyProperty('hlFactor', fieldColorsList) ? manufacturingObj?.hlFactor : hlFactor;
      manufactureInfo.hlFactor = hlFactor;
    }

    //force required
    //let forceRequired = this.shareService.isValidNumber((Number(flowStress) * Number(manufactureInfo.hlFactor)) * (Number(manufactureInfo.partArea) + Number(manufactureInfo.flashArea)) * Number(forgingShapeFactor) / 10000);

    //const theoriticalForcce = this.shareService.isValidNumber(Number(forceRequired) / 9810);
    //manufactureInfo.recommendTonnage = this.shareService.isValidNumber(Number(theoriticalForcce));

    //Forging Force (Tonne)
    const strain = this.shareService.isValidNumber(Math.log(manufactureInfo.formHeight / manufactureInfo.formLength));

    const d60 = this.shareService.isValidNumber(manufactureInfo.shearStrengthMaterial * Math.pow(strain, manufactureInfo.clampingPressure)); //strength coefficient ((K)) Mpa * (Equivalent Strain ^ strain hardening exponent )
    const d51 = this.shareService.isValidNumber(this.pi * Math.pow(manufactureInfo.formPerimeter / 2, 2));
    const d71 = this.shareService.isValidNumber((d60 * d51) / 1000);
    const d23 = this.shareService.isValidNumber(manufactureInfo.hlFactor * (d71 / 9.81));

    if (manufactureInfo.isselectedTonnageDirty && manufactureInfo.recommendTonnage != null) {
      manufactureInfo.recommendTonnage = this.shareService.isValidNumber(Number(manufactureInfo.recommendTonnage));
    } else {
      let recommendTonnage = d23;

      if (manufactureInfo.recommendTonnage != null)
        recommendTonnage = this.shareService.checkDirtyProperty('recommendTonnage', fieldColorsList) ? manufacturingObj?.recommendTonnage : recommendTonnage;

      manufactureInfo.recommendTonnage = recommendTonnage;
    }

    //Machine Tonnage
    if (manufactureInfo.isselectedTonnageDirty && manufactureInfo.selectedTonnage != null) {
      manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
    } else {
      if (manufactureInfo.selectedTonnage != null)
        manufacturingObj.selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : manufactureInfo.selectedTonnage;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = 60;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Set up Time (S/Piece)
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime));
    } else {
      let dryCycleTime = this.shareService.isValidNumber(manufactureInfo.setUpTime / manufactureInfo.lotSize);

      if (manufactureInfo.dryCycleTime != null) dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    //Machine Stroke Per Min
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = this.shareService.isValidNumber(Number(manufactureInfo.noofStroke));
    } else {
      let noofStroke = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.strokeRateMin);

      if (manufactureInfo.noofStroke != null) noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : noofStroke;
      manufactureInfo.noofStroke = noofStroke;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = this.shareService.isValidNumber((60 / (manufactureInfo?.noofStroke * 0.65)) * manufactureInfo?.noOfHitsRequired);

      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    // Get loading/unloading times based on gross weight
    const grossWeightInKg = grossWeight / 1000;
    const loadingUnloadingTimeRange = this.forgingSubProcessConfig.loadingUnloadingTimeLookup?.find((x) => x.weightFrom < grossWeightInKg && x.weightTo >= grossWeightInKg);

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = loadingUnloadingTimeRange?.loadingTime ?? 0;
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = loadingUnloadingTimeRange?.unloadingTime ?? 0;
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

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  public calculateBilletCuttingSawAndShearingForColdDie(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
    const inputBilletDiameter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.inputBilletDiameter;
    const inputBilletLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.inputBilletLength;
    const materialDensity = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.density;

    //Outer Diameter(mm)
    if (manufactureInfo.isDrillDiameterDirty && manufactureInfo.drillDiameter != null) {
      manufactureInfo.drillDiameter = this.shareService.isValidNumber(Number(manufactureInfo.drillDiameter));
    } else {
      let drillDiameter = this.shareService.isValidNumber(inputBilletDiameter);
      if (manufactureInfo.drillDiameter != null) drillDiameter = this.shareService.checkDirtyProperty('drillDiameter', fieldColorsList) ? manufacturingObj?.drillDiameter : drillDiameter;
      manufactureInfo.drillDiameter = drillDiameter;
    }

    //cutting length(mm)
    if (manufactureInfo.isCuttingLengthDirty && manufactureInfo.cuttingLength != null) {
      manufactureInfo.cuttingLength = this.shareService.isValidNumber(Number(manufactureInfo.cuttingLength));
    } else {
      let cuttingLength = this.shareService.isValidNumber(inputBilletLength);
      if (manufactureInfo.cuttingLength != null) cuttingLength = this.shareService.checkDirtyProperty('cuttingLength', fieldColorsList) ? manufacturingObj?.cuttingLength : cuttingLength;
      manufactureInfo.cuttingLength = cuttingLength;
    }

    //cutting area
    let cuttingArea = 0;
    if (manufactureInfo.iscuttingAreaDirty && manufactureInfo.cuttingArea != null) {
      manufactureInfo.cuttingArea = Number(manufactureInfo.cuttingArea);
    } else {
      // if (stockFormId == "Round Bar") {
      cuttingArea = this.shareService.isValidNumber(this.pi * Math.pow(Number(inputBilletDiameter / 2), 2) * manufactureInfo.noOfParts);
      // } else {
      //   cuttingArea = Number(inputBilletHeight) * Number(inputBilletWidth);
      // }
      if (manufactureInfo.cuttingArea != null) {
        cuttingArea = this.shareService.checkDirtyProperty('cuttingArea', fieldColorsList) ? manufacturingObj?.cuttingArea : cuttingArea;
      }
      manufactureInfo.cuttingArea = cuttingArea;
    }

    //Total weight of the Rod/Tube
    if (manufactureInfo.ismeltingWeightDirty && manufactureInfo.meltingWeight != null) {
      manufactureInfo.meltingWeight = Number(manufactureInfo.meltingWeight);
    } else {
      let meltingWeight = this.shareService.isValidNumber(manufactureInfo.cuttingArea * manufactureInfo.cuttingLength * materialDensity);
      if (manufactureInfo.meltingWeight != null) {
        meltingWeight = this.shareService.checkDirtyProperty('meltingWeight', fieldColorsList) ? manufacturingObj?.meltingWeight : meltingWeight;
      }
      manufactureInfo.meltingWeight = meltingWeight;
    }

    //process cycle time
    //For Shearing
    if (manufacturingObj.subProcessTypeID === ForgingCutting.BandSawCutting) {
      const cuttingSpeed = this.shareService.isValidNumber(manufactureInfo.forgingLookupList?.find((x) => x.materialTypeId == manufactureInfo.materialType)?.cuttingSpeed);
      if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
        manufactureInfo.processTime = Number(manufactureInfo.processTime);
      } else {
        let processTime = this.shareService.isValidNumber(manufactureInfo.cuttingArea / cuttingSpeed);
        if (manufactureInfo.processTime != null) {
          processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
        }
        manufactureInfo.processTime = processTime;
      }
    }

    //For Shearing
    if (manufacturingObj.subProcessTypeID === ForgingCutting.StockShearing) {
      const forgingtbl1 = this.materialForgingConfigService.getSawCuttingProcessCycleTime().filter((x) => x.crossSectionArea < manufactureInfo.cuttingArea);
      // const cuttingSpeed = this.shareService.isValidNumber(manufactureInfo.forgingLookupList?.find((x) => x.materialTypeId == manufactureInfo.materialType)?.cuttingSpeed);
      if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
        manufactureInfo.processTime = Number(manufactureInfo.processTime);
      } else {
        let processTime = forgingtbl1?.length > 0 ? forgingtbl1[forgingtbl1.length - 1].processCycleTime : 0;
        if (manufactureInfo.processTime != null) {
          processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
        }
        manufactureInfo.processTime = processTime;
      }
    }

    //Cycle time
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber((Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime)) * manufactureInfo.efficiency);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    //Total machine hours required per lot (hr):
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.totalTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);

    return new Observable((obs) => {
      obs.next(manufactureInfo);
    });
  }

  calculateCostDriver(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    //Efficiency
    // if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
    //   manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    // } else {
    //   if (manufactureInfo.efficiency != null)
    //     manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    // }
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = 0.85;
      if (manufactureInfo.efficiency != null) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }

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
        // manufactureInfo.noOfSkilledLabours = this.shareService.checkDirtyProperty('noOfSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfSkilledLabours : manufactureInfo.noOfSkilledLabours;
        manufactureInfo.noOfSkilledLabours = this.shareService.checkDirtyProperty('noOfSkilledLabours', fieldColorsList)
          ? this.shareService.isValidNumber(manufacturingObj?.noOfSkilledLabours)
          : this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours);
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
      this.shareService.isValidNumber(manufactureInfo.inspectionCost)
    );

    if (Number(manufactureInfo?.processTypeID) === ProcessType.Testing) {
      manufactureInfo.directProcessCost = this.shareService.isValidNumber(manufactureInfo?.directProcessCost * manufactureInfo?.samplingRate);
    }
  }
  calculateRecommandedTonnage(manufactureInfo: ProcessInfoDto) {
    let recommendTonnage = 0;
    const stockOuterDiameter = manufactureInfo?.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.stockOuterDiameter;
    const widthFromMaterial = manufactureInfo?.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockWidth;
    const ultimateTensileMaterial = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas?.tensileStrength);
    const stockForm = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.stockForm;

    if (stockForm === 'Rectangular Bar') {
      //rectangle stockForm === "Round Bar"
      recommendTonnage = this.shareService.isValidNumber(Number(this.pi * Number(Math.pow(widthFromMaterial, 2)) * ultimateTensileMaterial * 0.6) / Number(4 * 1000));
    } else {
      recommendTonnage = this.shareService.isValidNumber(Number(this.pi * Number(Math.pow(stockOuterDiameter, 2)) * ultimateTensileMaterial * 0.6) / Number(4 * 1000));
    }
    return recommendTonnage;
  }

  calCulateDiameterPartWeight(diameter: number, height: number): number {
    if (!diameter || !height) {
      return 0;
    }
    const twoDimentions = this.materialForgingConfigService.getForgingDiameterPart();
    let heightIndex = 0;
    let diameterIndex = 0;
    for (let i = 0; i < 13; i++) {
      if (twoDimentions[i][0] >= diameter && diameterIndex == 0) {
        diameterIndex = i;
      }

      for (let j = 0; j < 12; j++) {
        if (twoDimentions[i][j] >= height && heightIndex == 0) {
          heightIndex = j;
          break;
        }
      }
    }
    return twoDimentions[diameterIndex][heightIndex];
  }

  //Kstr, Yield strength for strain rate and forging temp (N/mm^2)
  calCulateYieldStrengthForStrainRate(grade: string, shapeFactor: number): number {
    if (!grade || shapeFactor <= 0) {
      return 0;
    }
    const gradeIds = this.materialForgingConfigService.getGrades().filter((x) => x.desc === grade);

    if (gradeIds.length <= 0) {
      return 0;
    }
    const gradeIndex = gradeIds[0].id;

    const twoDimentions = this.materialForgingConfigService.getForgingYeildStrength();
    let shapeFactorIndex = 0;
    for (let i = 0; i == 0; i++) {
      for (let j = 0; j < 12; j++) {
        if (twoDimentions[i][j] >= Math.round(shapeFactor)) {
          shapeFactorIndex = j;
          break;
        }
      }
    }
    return twoDimentions[gradeIndex][shapeFactorIndex];
  }
  // public calculateColdCloseDieForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateColdCloseDieForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    //const inputBilletLength = manufactureInfo.materialInfoList?.length >0? manufactureInfo.materialInfoList[0]?.inputBilletLength:0;
    //const partVolume = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partVolume;
    //const materialPartHeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partHeight;

    // const ultimateTensileMaterial = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas?.tensileStrength);
    const processId: number = Number(manufactureInfo.processTypeID);
    let totalTonnage: number = 0;
    let totalNoOfHitsRequired: number = 0;
    if (processId === ProcessType.ColdHeading || processId === ProcessType.ClosedDieForging) {
      const throughHoleInfo = manufactureInfo?.processInfoList?.find((x) => x.processTypeID === processId);
      for (let i = 0; i < manufactureInfo.subProcessFormArray?.length; i++) {
        // const chckInfo = manufactureInfo.subProcessFormArray[i];
        const info = manufactureInfo.subProcessFormArray.controls[i];
        // const ctrl = info.get('workpieceInnerDia');

        const prevEntry = throughHoleInfo?.subProcessTypeInfos[i];

        //let infoObj = manufacturingObj.subProcessFormArray.controls.find(x => x.value.subProcessId === info.value.subProcessId);
        //const subProcessId = Number(info?.subProcessTypeID);

        //pitchDiameter : Final Dia of head Df(mm):D14
        //spiralAngle: Final length  of head Hf (mm): D15
        //lengthOfCut: Initial Dia of head D0(mm) :  D13
        //partInitialDia : Initial Height Ho (mm) :
        if (info.value.subProcessTypeID === ColdDieForgingSubProcess.ColdForgingUpsetting) {
          this.calculateForSubProcessUpsetting(manufactureInfo, fieldColorsList, prevEntry, info);
          totalTonnage += info.value.formingForce;
          totalNoOfHitsRequired += info?.value?.typeOfSplice;
        } else if (info.value.subProcessTypeID === ColdDieForgingSubProcess.ColdForgingForwardExtrusion) {
          this.calculateForgingSubProcessForward(manufactureInfo, fieldColorsList, prevEntry, info);
          totalTonnage += info.value.formingForce;
          totalNoOfHitsRequired += info?.value?.typeOfSplice;
        } else if (info.value.subProcessTypeID === ColdDieForgingSubProcess.ColdForgingBackwardExtrusion) {
          this.calculateForgingSubProcessBackward(manufactureInfo, fieldColorsList, prevEntry, info);
          totalTonnage += info.value.formingForce;
          totalNoOfHitsRequired += info?.value?.typeOfSplice;
        }

        //pressureAngle: Strength coefficient (K) (Mpa)
        //workpieceInitialDia: Strain hardening exponent ((n))
        //workpieceOuterDia: Equivalent Strain (έ):
        //workpieceInnerDia: Factor of safety:
        //formingForce: Forging Force (Tonne)
      }
    }

    // //Material Tensile Strength (Mpa)
    // if (manufactureInfo.isUltimateTensileMaterialDirty && manufactureInfo.ultimateTensileMaterial != null) {
    //   manufactureInfo.ultimateTensileMaterial = this.shareService.isValidNumber(Number(manufactureInfo.ultimateTensileMaterial));

    // } else {
    //   let tensile = ultimateTensileMaterial
    //   if (manufactureInfo.ultimateTensileMaterial != null)
    //     tensile = this.shareService.checkDirtyProperty('ultimateTensileMaterial', fieldColorsList) ? manufacturingObj?.ultimateTensileMaterial : tensile;

    //   manufactureInfo.ultimateTensileMaterial = tensile;
    // }

    //Add all the tonnages From Upsetting+extrusion_Backwrd Extrusion
    totalTonnage = this.shareService.isValidNumber(totalTonnage);
    manufactureInfo.recommendTonnage = totalTonnage;

    //Number of hits required
    if (manufactureInfo.isNoOfHitsRequiredDirty && manufactureInfo.noOfHitsRequired != null) {
      manufactureInfo.noOfHitsRequired = this.shareService.isValidNumber(Number(manufactureInfo.noOfHitsRequired));
    } else {
      let noOfHitsRequired = this.shareService.isValidNumber(totalNoOfHitsRequired);

      if (manufactureInfo.noOfHitsRequired != null)
        noOfHitsRequired = this.shareService.checkDirtyProperty('noOfHitsRequired', fieldColorsList) ? manufacturingObj?.noOfHitsRequired : noOfHitsRequired;

      manufactureInfo.noOfHitsRequired = noOfHitsRequired;
    }

    //Selected Tonnage
    if (manufactureInfo.isselectedTonnageDirty && manufactureInfo.selectedTonnage != null) {
      manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
    } else {
      let selectedTonnage = manufactureInfo?.machineMaster?.machineTonnageTons;

      if (manufactureInfo.selectedTonnage != null) selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : selectedTonnage;

      manufactureInfo.selectedTonnage = selectedTonnage;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = 60;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Set up Time (S/Piece)
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime));
    } else {
      let dryCycleTime = this.shareService.isValidNumber(manufactureInfo.setUpTime / manufactureInfo.lotSize);

      if (manufactureInfo.dryCycleTime != null) dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    //Machine Stroke Per Min
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = this.shareService.isValidNumber(Number(manufactureInfo.noofStroke));
    } else {
      // let noofStroke = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.strokeRateMin);
      let noofStroke: number;

      // Check if machine is a hydraulic forging press and has tonnage capacity
      const isHydraulicForgingPress = manufactureInfo?.machineMaster?.machineName?.includes('Forging Press - Hydraulic');
      const tonnage = manufactureInfo?.machineMaster?.machineTonnageTons;

      if (isHydraulicForgingPress && tonnage) {
        // For hydraulic forging presses, use stroke time from capacity table
        const strokeTimeInSeconds = this.getStrokeTimeForForgingPressTonnage(tonnage);
        noofStroke = this.shareService.isValidNumber(strokeTimeInSeconds);
      } else {
        // For other machines, use the default stroke rate
        noofStroke = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.strokeRateMin);
      }

      if (manufactureInfo.noofStroke != null) noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : noofStroke;
      manufactureInfo.noofStroke = noofStroke;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      // let processTime = this.shareService.isValidNumber(manufactureInfo.noofStroke * 0.65);
      let processTime: number;
      const isHydraulicForgingPress = manufactureInfo?.machineMaster?.machineName?.includes('Forging Press - Hydraulic');
      if (isHydraulicForgingPress) {
        processTime = this.shareService.isValidNumber(manufactureInfo.noofStroke * 1);
      } else {
        processTime = this.shareService.isValidNumber((60 / (manufactureInfo?.noofStroke * 0.65)) * manufactureInfo?.noOfHitsRequired);
      }

      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    // Get loading/unloading times based on gross weight
    const grossWeightInKg = grossWeight / 1000;
    const loadingUnloadingTimeRange = this.forgingSubProcessConfig.loadingUnloadingTimeLookup?.find((x) => x.weightFrom < grossWeightInKg && x.weightTo >= grossWeightInKg);

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = loadingUnloadingTimeRange?.loadingTime ?? 0;
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = loadingUnloadingTimeRange?.unloadingTime ?? 0;
      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    /// Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }
  calculateForSubProcessUpsetting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: SubProcessTypeInfoDto, info: any) {
    let partInitialDia = this.shareService.isValidNumber(Number(Math.pow(Number(info.value.pitchDiameter / 2), 2) * Number(info.value.spiralAngle)) / Math.pow(Number(info.value.helixAngle / 2), 2));

    if (info.get('partInitialDia')?.dirty && info.value.partInitialDia != null) {
      info.value.partInitialDia = this.shareService.isValidNumber(Number(info.value.partInitialDia));
    } else {
      if (info.value.partInitialDia != null)
        partInitialDia = this.checkDirtyProperty('partInitialDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.partInitialDia : partInitialDia;

      info.value.partInitialDia = partInitialDia;
    }

    //blankArea: Cross Sectional Area
    //console.log('Foeld color ' + this.shareService.checkDirtyProperty('blankArea', fieldColorsList))

    const crossectionArea = this.shareService.isValidNumber(this.pi * Math.pow(Number(info.value.pitchDiameter / 2), 2));
    // if (info && info.get('blankArea').dirty) {
    //   info.value.blankArea = this.shareService.isValidNumber(Number(info.value.blankArea));

    // }
    if (info.get('blankArea')?.dirty && info.value.blankArea != null) {
      info.value.blankArea = this.shareService.isValidNumber(Number(info.value.blankArea));
    } else {
      let blankArea = crossectionArea;
      if (info.value.blankArea != null) blankArea = this.checkDirtyProperty('blankArea', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.blankArea : blankArea;

      info.value.blankArea = blankArea;
    }

    //strength CoEfficient
    const strengthCoEfficient = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strengthCoEfficient));
    if (info.get('pressureAngle')?.dirty && info.value.pressureAngle != null) {
      info.value.pressureAngle = this.shareService.isValidNumber(Number(info.value.pressureAngle));
    } else {
      let pressureAngle = strengthCoEfficient;
      if (info.value.pressureAngle != null) pressureAngle = this.checkDirtyProperty('pressureAngle', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.pressureAngle : pressureAngle;

      info.value.pressureAngle = pressureAngle;
    }

    //strainHardeningExponent
    const strainHardeningExponent = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strainHardeningExponent));
    if (info.get('workpieceInitialDia')?.dirty && info.value.workpieceInitialDia != null) {
      info.value.workpieceInitialDia = this.shareService.isValidNumber(Number(info.value.workpieceInitialDia));
    } else {
      let workpieceInitialDia = strainHardeningExponent;
      if (info.value.workpieceInitialDia != null)
        workpieceInitialDia = this.checkDirtyProperty('workpieceInitialDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.workpieceInitialDia : workpieceInitialDia;

      info.value.workpieceInitialDia = workpieceInitialDia;
    }

    // Equivalent Strain (έ)
    const strain = this.shareService.isValidNumber(Math.log(info.value.partInitialDia / info.value.spiralAngle));

    if (info.get('workpieceOuterDia')?.dirty && info.value.workpieceOuterDia != null) {
      info.value.workpieceOuterDia = this.shareService.isValidNumber(Number(info.value.workpieceOuterDia));
    } else {
      let workpieceOuterDia = strain;
      if (info.value.workpieceOuterDia != null)
        workpieceOuterDia = this.checkDirtyProperty('workpieceOuterDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.workpieceOuterDia : workpieceOuterDia;

      info.value.workpieceOuterDia = workpieceOuterDia;
    }

    //Factor of safety:
    if (info.get('workpieceInnerDia')?.dirty && info.value.workpieceInnerDia != null) {
      info.value.workpieceInnerDia = this.shareService.isValidNumber(Number(info.value.workpieceInnerDia));
    } else {
      let workpieceInnerDia = info.value.workpieceInnerDia;

      if (info.value.workpieceInnerDia != null)
        workpieceInnerDia = this.checkDirtyProperty('workpieceInnerDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.workpieceInnerDia : workpieceInnerDia;

      info.value.workpieceInnerDia = workpieceInnerDia;
    }
    // else {
    //   console.log(info.value);
    // }

    //Flow stress
    const flowStress = this.shareService.isValidNumber(Number(Math.pow(Number(info.value.workpieceOuterDia), info.value.workpieceInitialDia) * info.value.pressureAngle));
    if (info.get('wheelWidth')?.dirty && info.value.wheelWidth != null) {
      info.value.wheelWidth = this.shareService.isValidNumber(Number(info.value.wheelWidth));
    } else {
      let wheelWidth = flowStress;

      if (info.value.wheelWidth != null) wheelWidth = this.checkDirtyProperty('wheelWidth', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.wheelWidth : wheelWidth;

      info.value.wheelWidth = wheelWidth;
    }

    //Forging Force (Tonne)
    // const forgingForce = this.shareService.isValidNumber(Number((flowStress * crossectionArea) / (1000 * 9.81)) * this.shareService.isValidNumber(info.value.workpieceInnerDia));
    const forgingForce = this.shareService.isValidNumber(Number((info?.value?.wheelWidth * info?.value?.blankArea) / (1000 * 9.81)) * this.shareService.isValidNumber(info.value.workpieceInnerDia));
    if (info.get('formingForce')?.dirty && info.value.formingForce != null) {
      info.value.formingForce = this.shareService.isValidNumber(Number(info.value.formingForce));
    } else {
      let formingForce = forgingForce;

      if (info.value.formingForce != null) formingForce = this.checkDirtyProperty('formingForce', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.formingForce : formingForce;

      info.value.formingForce = formingForce;
    }

    //Number of Stages (Nos.)
    if (info.get('typeOfSplice')?.dirty === true && !!info.value.typeOfSplice) {
      info.value.typeOfSplice = this.shareService.isValidNumber(Number(info.value.typeOfSplice));
    } else {
      const numberOfStages = this.calculateNumberOfStages(info?.value?.pitchDiameter, info?.value?.helixAngle);
      let typeOfSplice = numberOfStages;

      if (info.value.typeOfSplice != null) typeOfSplice = this.checkDirtyProperty('typeOfSplice', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.typeOfSplice : typeOfSplice;

      info.value.typeOfSplice = typeOfSplice;
    }
  }
  calculateForgingSubProcessForward(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: SubProcessTypeInfoDto, info: any) {
    //pitchDiameter : Final Dia of head Df(mm):D14
    //spiralAngle: Final length  of head Hf (mm): D15
    //helixAngle: Initial Dia of head D0(mm) :  D13
    //partInitialDia : Initial Height Ho (mm) :
    //finalGrooveDia : area befor forming
    if (info.value.subProcessTypeID === ColdDieForgingSubProcess.ColdForgingForwardExtrusion) {
      let partInitialDia = this.shareService.isValidNumber(Number(Math.pow(Number(info.value.pitchDiameter / 2), 2) * Number(info.value.spiralAngle)) / Math.pow(Number(info.value.helixAngle / 2), 2));

      if (info.get('partInitialDia')?.dirty && info.value.partInitialDia != null) {
        info.value.partInitialDia = this.shareService.isValidNumber(Number(info.value.partInitialDia));
      } else {
        if (info.value.partInitialDia != null)
          partInitialDia = this.checkDirtyProperty('partInitialDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.partInitialDia : partInitialDia;

        info.value.partInitialDia = partInitialDia;
      }

      //area befor forming
      let finalGrooveDia = this.shareService.isValidNumber(this.pi * Math.pow(Number(info.value.helixAngle / 2), 2));

      if (info.get('finalGrooveDia')?.dirty && info.value.finalGrooveDia != null) {
        info.value.finalGrooveDia = this.shareService.isValidNumber(Number(info.value.finalGrooveDia));
      } else {
        if (info.finalGrooveDia != null) finalGrooveDia = this.checkDirtyProperty('finalGrooveDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.finalGrooveDia : finalGrooveDia;

        info.value.finalGrooveDia = finalGrooveDia;
      }

      //area befor forming
      let widthOfCut = this.shareService.isValidNumber(this.pi * Math.pow(Number(info.value.pitchDiameter / 2), 2));

      if (info.get('widthOfCut')?.dirty && info.value.widthOfCut != null) {
        info.value.widthOfCut = this.shareService.isValidNumber(Number(info.value.widthOfCut));
      } else {
        if (info.widthOfCut != null) widthOfCut = this.checkDirtyProperty('widthOfCut', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.widthOfCut : widthOfCut;

        info.value.widthOfCut = widthOfCut;
      }

      //strength CoEfficient
      const strengthCoEfficient = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strengthCoEfficient));
      if (info.get('pressureAngle')?.dirty && info.value.pressureAngle != null) {
        info.value.pressureAngle = this.shareService.isValidNumber(Number(info.value.pressureAngle));
      } else {
        let pressureAngle = strengthCoEfficient;
        if (info.pressureAngle != null) pressureAngle = this.checkDirtyProperty('pressureAngle', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.pressureAngle : pressureAngle;

        info.value.pressureAngle = pressureAngle;
      }

      const tensileStrength = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.tensileStrength));
      // Equivalent Strain (έ)
      const strain = this.shareService.isValidNumber(Math.log(Number(info.value.finalGrooveDia / info.value.widthOfCut)));
      if (info.get('workpieceOuterDia')?.dirty && info.value.workpieceOuterDia != null) {
        info.value.workpieceOuterDia = this.shareService.isValidNumber(Number(info.value.workpieceOuterDia));
      } else {
        let workpieceOuterDia = strain;
        if (info.workpieceOuterDia != null) {
          workpieceOuterDia = this.checkDirtyProperty('workpieceOuterDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.workpieceOuterDia : workpieceOuterDia;
        }
        info.value.workpieceOuterDia = workpieceOuterDia;
      }

      //Forging Force (Tonne)
      let formingForce = this.shareService.isValidNumber(
        (info.value.finalGrooveDia *
          tensileStrength * //info.value.pressureAngle *
          info.value.workpieceOuterDia *
          info.value.workpieceInnerDia) /
        (info.value.totalDepOfCut * 1000) /
        9.8
      );

      if (info.get('formingForce')?.dirty && info.value.formingForce != null) {
        info.value.formingForce = this.shareService.isValidNumber(Number(info.value.formingForce));
      } else {
        if (info.formingForce != null) formingForce = this.checkDirtyProperty('formingForce', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.formingForce : formingForce;

        info.value.formingForce = formingForce;
      }

      //Number of Stages (Nos.)
      if (info.get('typeOfSplice')?.dirty === true && !!info.value.typeOfSplice) {
        info.value.typeOfSplice = this.shareService.isValidNumber(Number(info.value.typeOfSplice));
      } else {
        const numberOfStages = this.calculateNumberOfStages(info?.value?.pitchDiameter, info?.value?.helixAngle);
        let typeOfSplice = numberOfStages;

        if (info.value.typeOfSplice != null) typeOfSplice = this.checkDirtyProperty('typeOfSplice', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.typeOfSplice : typeOfSplice;

        info.value.typeOfSplice = typeOfSplice;
      }
    }
  }

  calculateForgingSubProcessBackward(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: SubProcessTypeInfoDto, info: any) {
    //pitchDiameter : Final Dia of head Df(mm):D14
    //spiralAngle: Final length  of head Hf (mm): D15
    //helixAngle: Initial Dia of head D0(mm) :  D13
    //partInitialDia : Initial Height Ho (mm) :
    //finalGrooveDia : area befor forming
    if (info.value.subProcessTypeID === ColdDieForgingSubProcess.ColdForgingBackwardExtrusion) {
      let partInitialDia = this.shareService.isValidNumber(Number(Math.pow(Number(info.value.pitchDiameter / 2), 2) * Number(info.value.spiralAngle)) / Math.pow(Number(info.value.helixAngle / 2), 2));

      if (info.get('partInitialDia')?.dirty && info.value.partInitialDia != null) {
        info.value.partInitialDia = this.shareService.isValidNumber(Number(info.value.partInitialDia));
      } else {
        if (info.value.partInitialDia != null)
          partInitialDia = this.checkDirtyProperty('partInitialDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.partInitialDia : partInitialDia;

        info.value.partInitialDia = partInitialDia;
      }

      //area befor forming
      let finalGrooveDia = this.shareService.isValidNumber(this.pi * Math.pow(Number(info.value.helixAngle / 2), 2));
      if (info.get('finalGrooveDia')?.dirty && info.value.finalGrooveDia != null) {
        info.value.finalGrooveDia = this.shareService.isValidNumber(Number(info.value.finalGrooveDia));
      } else {
        if (info.finalGrooveDia != null) finalGrooveDia = this.checkDirtyProperty('finalGrooveDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.finalGrooveDia : finalGrooveDia;

        info.value.finalGrooveDia = finalGrooveDia;
      }

      //area after forming
      let widthOfCut = this.shareService.isValidNumber(this.pi * Math.pow(Number(info.value.pitchDiameter / 2), 2));
      if (info.get('widthOfCut')?.dirty && info.value.widthOfCut != null) {
        info.value.widthOfCut = this.shareService.isValidNumber(Number(info.value.widthOfCut));
      } else {
        if (info.widthOfCut != null) widthOfCut = this.checkDirtyProperty('widthOfCut', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.widthOfCut : widthOfCut;

        info.value.widthOfCut = widthOfCut;
      }

      // //blankArea: Cross Sectional Area
      // let crossectionArea = this.shareService.isValidNumber(this.pi * Math.pow(Number(info.value.formHeight / 2), 2));
      // info.value.blankArea = crossectionArea;

      //strength CoEfficient
      const strengthCoEfficient = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strengthCoEfficient));
      if (info.get('pressureAngle')?.dirty && info.value.pressureAngle != null) {
        info.value.pressureAngle = this.shareService.isValidNumber(Number(info.value.pressureAngle));
      } else {
        let pressureAngle = strengthCoEfficient;
        if (info.pressureAngle != null) pressureAngle = this.checkDirtyProperty('pressureAngle', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.pressureAngle : pressureAngle;

        info.value.pressureAngle = pressureAngle;
      }

      // //strainHardeningExponent
      // const strainHardeningExponent = this.shareService.isValidNumber(Number(manufactureInfo.materialmasterDatas.strainHardeningExponent));
      // info.value.workpieceInitialDia = strengthCoEfficient;

      // Equivalent Strain (έ)
      const strain = this.shareService.isValidNumber(Math.log(1 + Number(info.value.finalGrooveDia / info.value.widthOfCut)));
      if (info.get('workpieceOuterDia')?.dirty && info.value.workpieceOuterDia != null) {
        info.value.workpieceOuterDia = this.shareService.isValidNumber(Number(info.value.workpieceOuterDia));
      } else {
        let workpieceOuterDia = strain;
        if (info.workpieceOuterDia != null) {
          workpieceOuterDia = this.checkDirtyProperty('workpieceOuterDia', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.workpieceOuterDia : workpieceOuterDia;
        }
        info.value.workpieceOuterDia = workpieceOuterDia;
      }

      // //Flow stress
      // const flowStress = this.shareService.isValidNumber(strengthCoEfficient * Math.pow(Math.log(1 + Number(strain)), strainHardeningExponent));
      // info.value.wheelWidth = flowStress;

      //Forging Force (Tonne)
      let formingForce = this.shareService.isValidNumber(
        (info.value.widthOfCut * info.value.pressureAngle * info.value.workpieceOuterDia * info.value.workpieceInnerDia) / (info.value.totalDepOfCut * 1000) / 9.8
      );

      if (info.get('formingForce')?.dirty && info.value.formingForce != null) {
        info.value.formingForce = this.shareService.isValidNumber(Number(info.value.formingForce));
      } else {
        if (info.formingForce != null) formingForce = this.checkDirtyProperty('formingForce', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.formingForce : formingForce;

        info.value.formingForce = formingForce;
      }

      //Number of Stages (Nos.)
      if (info.get('typeOfSplice')?.dirty === true && !!info.value.typeOfSplice) {
        info.value.typeOfSplice = this.shareService.isValidNumber(Number(info.value.typeOfSplice));
      } else {
        const numberOfStages = this.calculateNumberOfStages(info?.value?.pitchDiameter, info?.value?.helixAngle);
        let typeOfSplice = numberOfStages;

        if (info.value.typeOfSplice != null) typeOfSplice = this.checkDirtyProperty('typeOfSplice', fieldColorsList, info.value.subProcessTypeID) ? manufacturingObj?.typeOfSplice : typeOfSplice;

        info.value.typeOfSplice = typeOfSplice;
      }
    }
  }

  private calculateNumberOfStages(pitchDiameter: number, helixAngle: number): number {
    let numberOfStages = this.shareService.isValidNumber(pitchDiameter / helixAngle);
    if (numberOfStages <= 1.6) {
      numberOfStages = 1;
    } else if (numberOfStages <= 2.2) {
      numberOfStages = 2;
    } else if (numberOfStages <= 2.8) {
      numberOfStages = 3;
    } else if (numberOfStages <= 3.4) {
      numberOfStages = 4;
    } else {
      numberOfStages = 4;
    }
    return numberOfStages;
  }

  public checkDirtyProperty(formCotrolName: string, fieldList: any[], subProcessInfoId: number) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.formControlName == formCotrolName && x.isDirty == true && x?.subProcessInfoId === subProcessInfoId);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }

  reCalculateforgingSubProcessColdDieCost(
    processInfo: ProcessInfoDto,
    dirtyFields: FieldColorsDto[],
    selecteProcess: ProcessInfoDto,
    totProcessList: ProcessInfoDto[],
    forgingSubProcessFormArray: FormArray<any>,
    subProcessFormArray: FormArray<any>,
    selectedProcessInfoId: number,
    conversionValue: any,
    isEnableUnitConversion: boolean
  ) {
    console.log('Cold die forging sub process Calc');
    processInfo.setUpTimeBatch = 60;
    if (selecteProcess?.subProcessTypeInfos) {
      if (!forgingSubProcessFormArray || !subProcessFormArray) {
        console.error('forgingSubProcessFormArray or subProcessFormArray is null or undefined');
        return;
      }
      if (forgingSubProcessFormArray.length > 0) {
        forgingSubProcessFormArray.clear();
      }
      if (subProcessFormArray.length > 0) {
        subProcessFormArray.clear();
      }
      for (let i = 0; i < selecteProcess?.subProcessTypeInfos?.length; i++) {
        const info = selecteProcess?.subProcessTypeInfos[i];
        const formGroup = this.formbuilder.group({
          ...this.forgingSubProcessConfig.getForgingFormFields(),
          subProcessInfoId: info.subProcessInfoId,
          ...this.forgingSubProcessConfig.setForgingSubProcess(selectedProcessInfoId, info, conversionValue, isEnableUnitConversion, 'defaultReturn'),
        });
        forgingSubProcessFormArray.push(formGroup);
        subProcessFormArray.push(formGroup);
      }
      //processInfo.machiningOperationTypeFormArray = this.machiningOperationTypeFormArray;
      processInfo.subProcessFormArray = subProcessFormArray;
    }
    const processResult = this.calculateColdCloseDieForging(processInfo, dirtyFields, selecteProcess);
    // .pipe(takeUntil(this.unsubscribeAll$)).subscribe((processResult: ProcessInfoDto) => {
    processResult.subProcessTypeInfos = [];
    for (let i = 0; i < processResult.subProcessFormArray?.controls?.length; i++) {
      const info = processResult.subProcessFormArray?.controls[i];
      let subProcessInfo = new SubProcessTypeInfoDto();
      subProcessInfo.subProcessInfoId = 0;
      subProcessInfo = { ...subProcessInfo, ...this.forgingSubProcessConfig.setForgingSubProcess(selecteProcess.processInfoId, info.value, conversionValue, isEnableUnitConversion, 'defaultReturn') };
      processResult.subProcessTypeInfos.push(subProcessInfo);
    }
    //  processInfo.machiningOperationTypeFormArray = null;
    //  processResult.machiningOperationTypeFormArray = null;
    if (processResult) {
      processResult.processInfoId = selecteProcess.processInfoId;
      processResult.subProcessFormArray = null;
      totProcessList.push(processResult);
    }
    // });
  }

  calculateColdDieForgingSubProcess(
    manufactureInfo: ProcessInfoDto,
    forgingSubProcessFormArray: FormArray<any>,
    forgingSubProcessFormGroup: FormGroup<any>,
    selectedProcessInfoId: number,
    conversionValue: any,
    isEnableUnitConversion: boolean,
    fieldColorsList: any,
    manufacturingObj: ProcessInfoDto
  ): any {
    manufactureInfo.subProcessFormArray = forgingSubProcessFormArray;
    manufactureInfo.setUpTimeBatch = 60;
    for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
      const info = manufactureInfo.subProcessFormArray?.controls[i];

      (forgingSubProcessFormArray.controls as FormGroup[])[i].patchValue({
        ...this.forgingSubProcessConfig.setForgingSubProcess(selectedProcessInfoId, info?.value, conversionValue, isEnableUnitConversion, 'convertUomToSaveAndCalculation'),
      });
    }
    const result = this.calculateColdCloseDieForging(manufactureInfo, fieldColorsList, manufacturingObj);
    if (result) {
      for (let i = 0; i < result?.subProcessFormArray?.controls?.length; i++) {
        const info = result.subProcessFormArray?.controls[i];
        (forgingSubProcessFormArray.controls as FormGroup[])[i].patchValue({
          ...this.forgingSubProcessConfig.setForgingSubProcess(selectedProcessInfoId, info?.value, conversionValue, isEnableUnitConversion, 'convertUomInUI'),
        });
      }
      //this.forgingSubProcessFormGroup.patchValue({ subProcessList: result.subProcessFormArray });
      forgingSubProcessFormGroup.setControl('subProcessList', result.subProcessFormArray);
      // this.patchCalculationResult(result);
      return result;
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
  }
}
