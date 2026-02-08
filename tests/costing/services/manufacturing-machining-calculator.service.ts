import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LaborRateMasterDto, ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';
import { PartComplexity } from 'src/app/shared/enums';
import { GrindingType } from 'src/app/shared/enums/GrindingTypes.enum';
import { DrillingCutting } from 'src/app/shared/models/drilling-cutting.model';
import { TurningInfoDto } from 'src/app/shared/models/turning-info.model';
import { ManufacturingMachiningConfigService } from 'src/app/shared/config/manufacturing-machining-config';
import { MachiningTypes } from '../costing.config';
import { PartInfoDto } from 'src/app/shared/models/part-info.model';
import { MachiningHelperService } from 'src/app/modules/costing/services/machining.helper.service';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingMachiningCalculatorService {
  intialDia: number[] = [];
  finalDia: number[] = [];
  lengthOfCut: number[] = [];
  widthOfCut: number[] = [];
  depthOfDrill: number[] = [];
  diameterOfDrill: number[] = [];
  pitchDiameter: number[] = [];
  wheelWidth: number[] = [];
  workpieceFinalDia: number[] = [];
  surfaceArea: number[] = [];
  totalDepOfCut: number[] = [];
  cutterDia: number[] = [];
  minLength: number[] = [];
  // outerDia: number;
  rootDia: number[] = [];
  workpieceOuterDia: number[] = [];
  depthOfCutRoughing: number[] = [];
  // workpieceInnerDia: number;
  private debug = localStorage.getItem('machiningDebug') === 'true';
  private operationsLength: number;
  private operationArray: any[] = [];

  constructor(
    private shareService: SharedService,
    private machiningConfig: ManufacturingMachiningConfigService,
    private machiningHelperService: MachiningHelperService
  ) {}

  public autoPullFeaturesProcessing(featureData, documentRecords, processTypeId, featureEntries = []): any {
    if (featureData === 'all') {
      featureData = this.shareService.getAllFeatureEntries(documentRecords);
    } else if (featureData === 'lesser') {
      featureData = this.machiningHelperService.getReorderedFeatures(featureData, this.shareService.datumCentroid, 'lesser');
    } else if (featureData === 'greater') {
      featureData = this.machiningHelperService.getReorderedFeatures(featureData, this.shareService.datumCentroid, 'greater');
    }

    const operationEntries = [];
    // const featureEntries = [];
    if (featureData?.length > 0) {
      console.log('passentry data:', [...featureData]);
      // featureData = this.shareService.sortObjectbyInteger(
      //   featureData,
      //   'name',
      //   this.machiningConfig.getMachiningFeatureList(processTypeId).map((x) => x.featureName)
      // );
      // console.log('passentry data after sorting:', [...featureData]);
      for (const fd of featureData) {
        // featureEntries.push({ id: fd?.id, dimTolerance: fd?.dimTolerance, gdtSelect: fd?.gdtSelect, gdtVal: fd?.gdtVal, surfaceFinish: fd?.surfaceFinish });
        const delIndex = featureEntries.findIndex((x) => x.id === fd.id);
        delIndex >= 0 && featureEntries.splice(delIndex, 1);
        featureEntries.push({ ...fd });
        if (!fd?.disabled) {
          const operationTypes = this.machiningConfig.getMachiningFeatureList(processTypeId, fd).find((x) => x.featureName === fd.name)?.operationTypes || [];
          for (const operationType of operationTypes) {
            operationEntries.push({ operationType, fd });
          }
        }
      }
    }
    console.log('featureEntries:', [...featureEntries]);
    if (['lesser', 'greater'].includes(featureData)) {
      return { operationEntries, featureEntries };
    }
    return new Observable((obs) => obs.next({ operationEntries, featureEntries }));
  }

  public calculationForMachiningTypes(
    manufactureInfo: ProcessInfoDto,
    fieldColorsList: any,
    manufacturingObj: ProcessInfoDto,
    laborRateDto: LaborRateMasterDto[],
    currentPart: PartInfoDto,
    fieldName?: string
  ): ProcessInfoDto {
    const materialInfo = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;

    manufactureInfo.subProcessTypeInfos = manufacturingObj.subProcessTypeInfos || [];
    this.operationsLength = manufacturingObj.subProcessTypeInfos?.length || 0;
    this.operationArray = manufacturingObj.subProcessTypeInfos || [];

    const featureDetails: any[] = JSON.parse(manufactureInfo.featureDetails || '[]');
    let featuresFound = [];
    if (featureDetails?.length > 0) {
      for (let i = 0; i < this.operationsLength; i++) {
        if (featureDetails.find((x) => x.id === this.operationArray[i].featureId)) {
          featuresFound.push(this.operationArray[i].featureId);
        }
      }
    }
    featuresFound = [...new Set(featuresFound)];

    let manufacturingAutomationData = this.machiningConfig.getManufacturingAutomationData(
      materialInfo?.grossWeight / 1000 || 0,
      manufactureInfo.mfrCountryId || 0,
      currentPart?.eav / 12 || 0,
      featuresFound?.length || 0
    );
    console.log('grossWeight', materialInfo?.grossWeight);
    console.log('mfrCountryId', manufactureInfo.mfrCountryId);
    console.log('eav', currentPart?.eav);
    console.log('featuresFound', featuresFound);
    console.log('manufacturingAutomationData', manufacturingAutomationData);

    if (manufactureInfo.isSheetLoadULoadTimeDirty && !!manufactureInfo.sheetLoadUloadTime) {
      // Tool Changing Cycle Time (s)
      manufactureInfo.sheetLoadUloadTime = Number(manufactureInfo.sheetLoadUloadTime);
    } else {
      let sheetLoadUloadTime = manufactureInfo.machineMaster?.toolChangingCycleTimeInSec;
      if (manufactureInfo.sheetLoadUloadTime) {
        sheetLoadUloadTime = this.shareService.checkDirtyProperty('sheetLoadUloadTime', fieldColorsList)
          ? manufacturingObj?.sheetLoadUloadTime
          : this.shareService.isValidNumber(manufactureInfo.sheetLoadUloadTime);
      }
      manufactureInfo.sheetLoadUloadTime = sheetLoadUloadTime;
    }

    if (manufactureInfo.isSemiAutoOrAutoDirty && !!manufactureInfo.semiAutoOrAuto) {
      manufactureInfo.semiAutoOrAuto = manufactureInfo.semiAutoOrAuto;
    } else {
      let semiAutoOrAuto = manufacturingAutomationData?.machineType || manufactureInfo.semiAutoOrAuto || 1;
      if (manufactureInfo.semiAutoOrAuto) {
        semiAutoOrAuto = this.shareService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList) ? manufacturingObj?.semiAutoOrAuto : semiAutoOrAuto;
      }
      manufactureInfo.semiAutoOrAuto = semiAutoOrAuto;
    }

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = manufacturingAutomationData?.machineEfficiency || 85;
      if (manufactureInfo.efficiency) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }
    if (Number(manufactureInfo.efficiency) < 1) {
      manufactureInfo.efficiency *= 100;
    }

    if (manufactureInfo?.MachiningFlags?.isTurning) {
      for (let i = 0; i < this.operationsLength; i++) {
        const op = this.operationArray[i];
        if (Number(op?.operationTypeId) <= 0) {
          this.operationArray[i].cycleTime = 0;
          continue;
        }
        const fd = featureDetails?.length > 0 ? featureDetails.find((x) => x.id === op?.featureId) : null;
        if (
          op?.isFacingRoughing ||
          op?.isFacingFinishing ||
          op?.isTaperTurningRoughing ||
          op?.isTaperTurningFinishing ||
          op?.isTurningODRoughing ||
          op?.isTurningODFinishing ||
          op?.isTurningIDRoughing ||
          op?.isTurningIDFinishing ||
          op?.isThreadCutting ||
          op?.isKnurling ||
          op?.isParting ||
          op?.isODGrooving ||
          op?.isIdGrooving ||
          op?.isFaceGrooving
        ) {
          manufactureInfo = this.calculateMachiningTurning(op, i, manufactureInfo, fd, fieldName);
        } else {
          manufactureInfo = this.calculateMachiningMilling(op, i, manufactureInfo, fd, fieldName);
        }
      }
    } else if (manufactureInfo?.MachiningFlags?.isMilling) {
      for (let i = 0; i < this.operationsLength; i++) {
        const op = this.operationArray[i];
        if (Number(op?.operationTypeId) <= 0) {
          this.operationArray[i].cycleTime = 0;
          continue;
        }
        const fd = featureDetails?.length > 0 ? featureDetails.find((x) => x.id === op?.featureId) : null;
        manufactureInfo = this.calculateMachiningMilling(op, i, manufactureInfo, fd, fieldName);
      }
    } else if (manufactureInfo?.MachiningFlags?.isDrilling) {
      for (let i = 0; i < this.operationsLength; i++) {
        manufactureInfo = this.calculateMachiningDrilling(this.operationArray[i], i, manufactureInfo);
      }
    } else if (manufactureInfo?.MachiningFlags?.isBoring) {
      for (let i = 0; i < this.operationsLength; i++) {
        manufactureInfo = this.calculateMachiningBoring(this.operationArray[i], i, manufactureInfo);
      }
    } else if (manufactureInfo?.MachiningFlags?.isSurfaceGrinding) {
      for (let i = 0; i < this.operationsLength; i++) {
        manufactureInfo = this.calculateMachiningGrinding(GrindingType.SurfaceGrinding, this.operationArray[i], i, manufactureInfo);
      }
    } else if (manufactureInfo?.MachiningFlags?.isCylindricalGrinding) {
      for (let i = 0; i < this.operationsLength; i++) {
        manufactureInfo = this.calculateMachiningGrinding(GrindingType.CylindricalGrinding, this.operationArray[i], i, manufactureInfo);
      }
    } else if (manufactureInfo?.MachiningFlags?.isCenterlessGrinding) {
      for (let i = 0; i < this.operationsLength; i++) {
        manufactureInfo = this.calculateMachiningGrinding(GrindingType.CenterlessGrinding, this.operationArray[i], i, manufactureInfo);
      }
    } else if (
      manufactureInfo?.MachiningFlags?.isGearCutting ||
      manufactureInfo?.MachiningFlags?.isGearBroaching ||
      manufactureInfo?.MachiningFlags?.isGearSplineRolling ||
      manufactureInfo?.MachiningFlags?.isGearShaving ||
      manufactureInfo?.MachiningFlags?.isGearGrinding
    ) {
      for (let i = 0; i < this.operationsLength; i++) {
        manufactureInfo = this.calculateMachiningGear(this.operationArray[i], i, manufactureInfo, fieldName, this.operationsLength);
      }
    }

    if (manufactureInfo.isUnloadingTimeDirty && !!manufactureInfo.unloadingTime) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = manufacturingAutomationData?.loadingTimeSec || 0;
      if (manufactureInfo.unloadingTime) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    let totalcycleTime = 0;
    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      totalcycleTime = Number(manufactureInfo.cycleTime) - Number(manufactureInfo.unloadingTime);
    } else {
      for (let i = 0; i < this.operationsLength; i++) {
        const info = this.operationArray[i];
        totalcycleTime += Number(info?.cycleTime);
      }
      totalcycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? Number(manufacturingObj?.cycleTime) - Number(manufactureInfo.unloadingTime) : totalcycleTime;
    }

    manufactureInfo.cycleTime = this.shareService.isValidNumber(totalcycleTime + Number(manufactureInfo.unloadingTime));

    if (manufactureInfo.ismachineHourRateDirty && !!manufactureInfo.machineHourRate) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList)
        ? manufacturingObj?.machineHourRate
        : this.shareService.isValidNumber(manufactureInfo.machineHourRate);
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && !!manufactureInfo.noOfLowSkilledLabours) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      let noOfLowSkilledLabours = manufacturingAutomationData?.labour || 0;
      // manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
      //   ? manufacturingObj?.noOfLowSkilledLabours
      //   : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
      if (manufactureInfo.noOfLowSkilledLabours) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && !!manufactureInfo.lowSkilledLaborRatePerHour) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    if (manufactureInfo.isSkilledLaborRatePerHourDirty && !!manufactureInfo.skilledLaborRatePerHour) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }

    if (manufactureInfo.isQaInspectorRateDirty && !!manufactureInfo.qaOfInspectorRate) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
        ? manufacturingObj?.samplingRate
        : this.shareService.isValidNumber(manufactureInfo.samplingRate);
    }

    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = manufacturingAutomationData?.setupTimeMins || 60;
      // manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime) || 60;
      if (manufactureInfo.setUpTime) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isinspectionTimeDirty && !!manufactureInfo.inspectionTime) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime = 0;
      if (manufactureInfo?.MachiningFlags?.isDrilling) {
        inspectionTime =
          manufactureInfo?.partComplexity == PartComplexity.Low
            ? 0.083
            : manufactureInfo?.partComplexity == PartComplexity.Medium
              ? 0.167
              : manufactureInfo?.partComplexity == PartComplexity.High
                ? 0.33
                : 0;
      } else if (!manufactureInfo?.MachiningFlags?.isMilling) {
        inspectionTime =
          manufactureInfo?.partComplexity == PartComplexity.Low ? 5 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 10 : manufactureInfo?.partComplexity == PartComplexity.High ? 20 : 0;
      }
      if (manufactureInfo.inspectionTime) {
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
    }

    let toolCost = 2500 / 81;
    let toolLife = 25000;
    if (manufactureInfo.MachiningFlags?.isDrilling || manufactureInfo.MachiningFlags?.isBoring) {
      toolCost = 15;
      toolLife = 8000;
    }

    if (manufactureInfo.isDirectToolingDirty && !!manufactureInfo.directTooling) {
      manufactureInfo.directTooling = Number(manufactureInfo.directTooling);
    } else {
      let directTooling = this.shareService.isValidNumber((toolCost / toolLife) * this.operationsLength);
      if (manufactureInfo.directTooling) {
        directTooling = this.shareService.checkDirtyProperty('directTooling', fieldColorsList) ? manufacturingObj?.directTooling : directTooling;
      }
      manufactureInfo.directTooling = directTooling;
    }

    if (manufactureInfo.isdirectMachineCostDirty && !!manufactureInfo.directMachineCost) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime) + Number(manufactureInfo.directTooling));
      if (manufactureInfo.directMachineCost) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && !!manufactureInfo.directSetUpCost) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.setUpTime) / 60) * (Number(manufactureInfo.machineHourRate) + Number(manufactureInfo.lowSkilledLaborRatePerHour))) / Number(manufactureInfo?.lotSize)
      );
      if (manufactureInfo.directSetUpCost) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && !!manufactureInfo.directLaborCost) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      if (manufactureInfo.directLaborCost) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && !!manufactureInfo.inspectionCost) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo?.lotSize))) /
          Number(manufactureInfo?.lotSize)
      );
      if (manufactureInfo.inspectionCost) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
    );

    if (manufactureInfo.isyieldCostDirty && !!manufactureInfo.yieldCost) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const fromYeild = 1 - Number(manufactureInfo.yieldPer) / 100;
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        fromYeild * (Number(manufactureInfo.materialInfo.totalCost) + processCost) - (fromYeild * Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000
      );
      manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(processCost + Number(manufactureInfo.yieldCost));
    // if (manufactureInfo.MachiningFlags?.isTurning) {
    //   manufactureInfo.directProcessCost = this.shareService.isValidNumber((processCost + Number(manufactureInfo.directTooling)) / (Number(manufactureInfo?.yieldPer) / 100));
    // } else {
    //   manufactureInfo.directProcessCost = this.shareService.isValidNumber(processCost + Number(manufactureInfo.directTooling));
    // }

    manufactureInfo.totalElectricityConsumption = this.shareService.isValidNumber((totalcycleTime * manufactureInfo?.machineMaster?.ratedPower) / 3600);
    if (manufactureInfo.isesgImpactElectricityConsumptionDirty && !!manufactureInfo.esgImpactElectricityConsumption) {
      manufactureInfo.esgImpactElectricityConsumption = Number(manufactureInfo.esgImpactElectricityConsumption);
    } else {
      let esgImpactElectricityConsumption = 0;
      if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
        const country = manufactureInfo.countryList.find((x) => x.countryId == manufactureInfo.mfrCountryId);
        if (country) {
          esgImpactElectricityConsumption = this.shareService.isValidNumber(manufactureInfo.totalElectricityConsumption * Number(laborRateDto?.length > 0 ? laborRateDto[0].powerESG : 0));
          if (manufactureInfo.esgImpactElectricityConsumption) {
            esgImpactElectricityConsumption = this.shareService.checkDirtyProperty('esgImpactElectricityConsumption', fieldColorsList)
              ? manufacturingObj?.esgImpactElectricityConsumption
              : esgImpactElectricityConsumption;
          }
        }
      }
      manufactureInfo.esgImpactElectricityConsumption = esgImpactElectricityConsumption;
    }
    manufactureInfo.totalFactorySpaceRequired = this.shareService.isValidNumber((manufactureInfo?.machineMaster?.maxLength * manufactureInfo?.machineMaster?.maxWidth) / 1000000);
    if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
      const country = manufactureInfo.countryList.find((x) => x.countryId == manufactureInfo.mfrCountryId);
      if (country) {
        manufactureInfo.esgImpactFactoryImpact = this.shareService.isValidNumber(
          (manufactureInfo.totalFactorySpaceRequired * Number(laborRateDto?.length > 0 ? laborRateDto[0].factorESG : 0) * totalcycleTime) / 3600
        );
      }
    }

    return manufactureInfo;
  }

  private calculateMachiningTurning(info: any, index: number, manufactureInfo: ProcessInfoDto, fd: any, fieldName?: string) {
    const rodMaterialInfo = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList.find((x) => x.processId === MachiningTypes.Rod) : null;
    const tubeMaterialInfo = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList.find((x) => x.processId === MachiningTypes.Tube) : null;
    const materialInfo = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;

    let cycleTime = 0;
    let workpieceInitialDia = Number(info?.workpieceInitialDia);
    let workpieceFinalDia = Number(info?.workpieceFinalDia);
    let lengthOfCut = Number(info?.lengthOfCut);
    let widthOfCut = Number(info?.widthOfCut);
    let totalDepOfCut = Number(info?.totalDepOfCut);
    const cutterDia = Number(info?.cutterDia);
    let noOfToolInserts = Number(info?.noOfToolInserts) || 1;
    let noOfPasses = Number(info?.noOfPasses);
    let noOfHoles = Number(info?.noOfHoles);
    const pitchDiameter = Number(info?.pitchDiameter);
    const diameterOfDrill = Number(info?.diameterOfDrill);
    const noOfMultiples = 2; // (2 * noOfHoles);
    let toothDepth = 2;
    const finalGrooveDia = Number(info?.finalGrooveDia);
    let partInitialDia = finalGrooveDia + toothDepth * 2;

    let cuttingSpeed = Number(info?.cuttingSpeed);
    let feedPerRev = Number(info?.feed);
    let depthOfCut = Number(info?.depthOfCut);

    let lookupInfo: TurningInfoDto = manufactureInfo.turningLookupList?.find((x) => x.materialTypeId == manufactureInfo.materialType);
    if (!lookupInfo && manufactureInfo.materialType) {
      // use material ref id if data not found for selected material
      const refId = this.machiningConfig.getCuttingParametersForRefMaterials(manufactureInfo.materialType);
      if (refId) {
        lookupInfo = manufactureInfo.turningLookupList?.find((x) => x.materialTypeId == refId);
      }
    }

    if (lookupInfo && fieldName === 'automation' && fd) {
      const diameter = fd?.radius ? fd.radius * 2 : fd?.diameter || 0;
      const length = fd?.length ?? (fd?.depth || 0);
      const depth = fd?.depth || 0;
      const maxDia = fd?.maxdaimeter || 0;
      const minDia = fd?.mindaimeter || 0;
      const width = fd?.width || 0;
      // const featureId = fd?.id || 0;
      const axis = fd?.axis?.findIndex((x) => Number(x) !== 0) || -1;
      const centroid = fd?.centroid[axis] || 0;
      const partOuterDiameter = materialInfo?.partOuterDiameter || 0;

      switch (true) {
        case info?.isTurningODRoughing:
          workpieceInitialDia ||= materialInfo.processId === MachiningTypes.Tube ? materialInfo?.stockOuterDiameter : materialInfo?.stockDiameter; // rod
          workpieceFinalDia ||= (diameter || partOuterDiameter) + lookupInfo?.turningODFinishingDepth;
          lengthOfCut ||= length || materialInfo?.partLength;
          break;
        case info?.isTurningODFinishing:
          workpieceInitialDia ||= (diameter || partOuterDiameter) + lookupInfo?.turningODFinishingDepth;
          workpieceFinalDia ||= diameter || partOuterDiameter;
          lengthOfCut ||= length || materialInfo?.partLength;
          break;
        case info?.isFacingRoughing || info?.isFacingFinishing:
          workpieceInitialDia ||= materialInfo.processId === MachiningTypes.Tube ? materialInfo?.stockOuterDiameter : materialInfo?.stockDiameter; // rod
          workpieceFinalDia ||= minDia;
          lengthOfCut ||= this.shareService.isValidNumber(
            minDia === 0 && centroid !== 0 && !!rodMaterialInfo
              ? materialInfo?.stockOuterDiameter / 2
              : minDia > 0 && centroid !== 0 && !!tubeMaterialInfo
                ? (materialInfo?.stockOuterDiameter - materialInfo?.stockInnerDiameter) / 2
                : centroid > 0
                  ? maxDia - minDia
                  : (workpieceInitialDia - workpieceFinalDia) / 2
          );
          if (info?.isFacingRoughing) {
            totalDepOfCut ||= this.shareService.isValidNumber(
              centroid === 0 ? (materialInfo?.stockLength - materialInfo?.partLength) / 2 - lookupInfo?.facingFinishingDepth : lookupInfo?.facingFinishingDepth
            );
          }
          break;
        case info?.isTaperTurningRoughing:
          workpieceInitialDia ||= maxDia + lookupInfo?.taperTurningFinishingDepth;
          workpieceFinalDia ||= minDia + lookupInfo?.taperTurningFinishingDepth;
          lengthOfCut ||= length;
          break;
        case info?.isTaperTurningFinishing:
          workpieceInitialDia ||= maxDia;
          workpieceFinalDia ||= minDia;
          lengthOfCut ||= length;
          break;
        case info?.isODGrooving:
          workpieceInitialDia ||= maxDia;
          workpieceFinalDia ||= minDia;
          widthOfCut ||= width;
          break;
        case info?.isFaceGrooving:
          workpieceInitialDia ||= maxDia;
          workpieceFinalDia ||= minDia;
          lengthOfCut ||= depth;
          break;
        case info?.isIdGrooving:
          workpieceInitialDia ||= minDia;
          workpieceFinalDia ||= maxDia;
          widthOfCut ||= width;
          break;
        case info?.isTurningIDRoughing:
          workpieceInitialDia ||= !!tubeMaterialInfo ? minDia : this.machiningConfig.getDrillingSize(diameter)?.drillSize || 1;
          workpieceFinalDia ||= diameter - lookupInfo?.turningIDFinishingDepth;
          lengthOfCut ||= length;
          break;
        case info?.isTurningIDFinishing:
          workpieceInitialDia ||= diameter - lookupInfo?.turningIDFinishingDepth;
          workpieceFinalDia ||= diameter;
          lengthOfCut ||= length;
          break;
      }
    }

    const srcFieldChanged =
      fieldName === 'automation' ||
      (fieldName === 'workpieceInitialDia' && this.intialDia[index] !== workpieceInitialDia) ||
      (fieldName === 'workpieceFinalDia' && this.finalDia[index] !== workpieceFinalDia);

    if (!widthOfCut || srcFieldChanged) {
      if (info?.isFaceGrooving) {
        widthOfCut = this.shareService.isValidNumber((workpieceInitialDia - workpieceFinalDia) / 2);
      }
    }

    if (lookupInfo) {
      const setVals = (cs, feed, depth?) => {
        cuttingSpeed = !cuttingSpeed ? lookupInfo?.[cs] : cuttingSpeed;
        feedPerRev =
          !feedPerRev || (fieldName === 'pitchDiameter' && this.pitchDiameter[index] !== pitchDiameter) ? (info?.isTapping || info?.isThreadCutting ? pitchDiameter : lookupInfo?.[feed]) : feedPerRev;

        if (info?.isODGrooving || info?.isIdGrooving || info?.isFaceGrooving) {
          depthOfCut = !depthOfCut || (fieldName === 'widthOfCut' && this.widthOfCut[index] !== widthOfCut) ? this.machiningConfig.getGroovCutter(widthOfCut)?.insertWidth : depthOfCut;
        } else {
          depthOfCut = !depthOfCut ? lookupInfo?.[depth] : depthOfCut;
        }
      };

      switch (true) {
        case info?.isFacingRoughing:
          setVals('facingRoughingCS', 'facingRoughingFeed', 'facingRoughingDepth');
          break;
        case info?.isFacingFinishing:
          setVals('facingFinishingCS', 'facingFinishingFeed', 'facingFinishingDepth');
          break;
        case info?.isTaperTurningRoughing:
          setVals('taperTurningRoughingCS', 'taperTurningRoughingFeed', 'taperTurningRoughingDepth');
          break;
        case info?.isTaperTurningFinishing:
          setVals('taperTurningFinishingCS', 'taperTurningFinishingFeed', 'taperTurningFinishingDepth');
          break;
        case info?.isTurningODRoughing:
          setVals('turningODRoughingCS', 'turningODRoughingFeed', 'turningODRoughingDepth');
          break;
        case info?.isTurningODFinishing:
          setVals('turningODFinishingCS', 'turningODFinishingFeed', 'turningODFinishingDepth');
          break;
        case info?.isTurningIDRoughing:
          partInitialDia = finalGrooveDia - toothDepth * 2;
          setVals('turningIDRoughingCS', 'turningIDRoughingFeed', 'turningIDRoughingDepth');
          break;
        case info?.isTurningIDFinishing:
          partInitialDia = finalGrooveDia - toothDepth * 2;
          setVals('turningIDFinishingCS', 'turningIDFinishingFeed', 'turningIDFinishingDepth');
          break;
        case info?.isThreadCutting:
          setVals('threadCuttingCS', 'threadCuttingFeed', 'threadCuttingDepth');
          break;
        case info?.isKnurling:
          setVals('knurlingCS', 'knurlingFeed', 'knurlingDepth');
          break;
        case info?.isParting:
          setVals('partingCS', 'partingFeed', 'partingDepth');
          depthOfCut ||= 3;
          break;
        case info?.isODGrooving || info?.isIdGrooving:
          setVals('odGroovingCS', 'odGroovingFeed', 'odGroovingDepth');
          break;
        case info?.isFaceGrooving:
          setVals('faceGroovingCS', 'faceGroovingFeed', 'faceGroovingDepth');
          break;
      }
    }

    if (!lengthOfCut || srcFieldChanged) {
      if (info?.isParting || info?.isODGrooving || info?.isIdGrooving || info?.isFaceGrooving || (fieldName !== 'automation' && (info?.isFacingRoughing || info?.isFacingFinishing))) {
        lengthOfCut = this.shareService.isValidNumber((workpieceInitialDia - workpieceFinalDia) / 2);
      }
    }

    if (!totalDepOfCut || srcFieldChanged) {
      switch (true) {
        case !!(info?.isTurningODRoughing || info?.isTurningODFinishing || info?.isTaperTurningRoughing || info?.isTaperTurningFinishing || info?.isThreadCutting):
          totalDepOfCut = this.shareService.isValidNumber((workpieceInitialDia - workpieceFinalDia) / 2);
          break;
        case !!(info?.isTurningIDRoughing || info?.isTurningIDFinishing):
          totalDepOfCut = this.shareService.isValidNumber((workpieceFinalDia - workpieceInitialDia) / 2);
          break;
        case !!info?.isFacingFinishing:
          totalDepOfCut = this.shareService.isValidNumber(lookupInfo?.facingFinishingDepth);
          break;
        case !!info?.isKnurling:
          totalDepOfCut = this.shareService.isValidNumber((diameterOfDrill - workpieceInitialDia) / 2);
          break;
        default:
          break;
      }
    }

    let spindleRpm = 0;
    switch (true) {
      case info?.isThreadCutting || info?.isParting || info?.isODGrooving || info?.isIdGrooving || info?.isFaceGrooving:
        spindleRpm = this.shareService.isValidNumber((1000 * Number(cuttingSpeed)) / (3.1428 * ((workpieceInitialDia + workpieceFinalDia) / 2)));
        break;
      case info?.isKnurling:
        spindleRpm = this.shareService.isValidNumber((1000 * Number(cuttingSpeed)) / (3.1428 * diameterOfDrill));
        break;
      default:
        spindleRpm = this.shareService.isValidNumber((1000 * Number(cuttingSpeed)) / (3.1428 * workpieceInitialDia));
        break;
    }

    const feedRate = this.shareService.isValidNumber(feedPerRev * spindleRpm * noOfToolInserts);

    switch (true) {
      case info?.isParting:
        noOfPasses ||= 1;
        break;
      case info?.isODGrooving || info?.isIdGrooving || info?.isFaceGrooving:
        noOfPasses = this.shareService.isValidNumber(Math.ceil(widthOfCut / depthOfCut));
        break;
      default:
        noOfPasses = this.shareService.isValidNumber(Math.ceil(totalDepOfCut / depthOfCut));
        break;
    }

    const toolChangeTime = Number(manufactureInfo.sheetLoadUloadTime);
    let cuttingTime = 0;
    switch (true) {
      case info?.isFacingRoughing ||
        info?.isFacingFinishing ||
        info?.isTurningODRoughing ||
        info?.isTurningODFinishing ||
        info?.isTurningIDRoughing ||
        info?.isTurningIDFinishing ||
        info?.isTaperTurningRoughing ||
        info?.isTaperTurningFinishing ||
        info?.isThreadCutting:
        cuttingTime = this.shareService.isValidNumber((((lengthOfCut + 4) / (feedPerRev * spindleRpm)) * noOfPasses * 60) / (manufactureInfo.efficiency / 100));
        break;
      case info?.isParting:
        cuttingTime = this.shareService.isValidNumber((1.2 * (((lengthOfCut + 2) / (feedPerRev * spindleRpm)) * noOfPasses * 60)) / (manufactureInfo.efficiency / 100));
        break;
      case info?.isODGrooving || info?.isIdGrooving || info?.isFaceGrooving:
        cuttingTime = this.shareService.isValidNumber(
          (((lengthOfCut + 2) / (feedPerRev * spindleRpm)) * noOfPasses * 60 + ((widthOfCut - depthOfCut + (lengthOfCut + 2) * 2) / (feedPerRev * spindleRpm)) * 60) /
            (manufactureInfo.efficiency / 100)
        );
        break;
      case info?.isKnurling:
        cuttingTime = this.shareService.isValidNumber((((totalDepOfCut + 4) / (feedPerRev * spindleRpm)) * noOfPasses * 60) / (manufactureInfo.efficiency / 100));
        break;
      default:
        cuttingTime = this.shareService.isValidNumber((((lengthOfCut + 4) / feedRate) * noOfPasses * 60) / (manufactureInfo.efficiency / 100));
    }

    cycleTime = cuttingTime + toolChangeTime;

    manufactureInfo.subProcessTypeInfos[index] = {
      ...this.operationArray[index],
      toothDepth,
      partInitialDia,
      finalGrooveDia,
      workpieceInitialDia,
      workpieceFinalDia,
      noOfHoles,
      noOfPasses,
      lengthOfCut,
      widthOfCut,
      totalDepOfCut,
      noOfMultiples,
      cycleTime,
      cuttingTime,
      noOfToolInserts,
      cuttingSpeed,
      feed: feedPerRev,
      depthOfCut,
      diameterOfDrill,
    };

    this.intialDia[index] = workpieceInitialDia;
    this.finalDia[index] = workpieceFinalDia;
    this.pitchDiameter[index] = pitchDiameter;
    this.widthOfCut[index] = widthOfCut;

    const logCalc = {
      operationType: info?.operationTypeId,
      operationName: info?.operationName,
      overallInitialDia: partInitialDia,
      overallFinalDia: finalGrooveDia,
      overallDepth: toothDepth,
      efficiency: manufactureInfo.efficiency,
      workpieceInitialDiameter: workpieceInitialDia,
      workpieceFinalDiameter: workpieceFinalDia,
      lengthOfCut: lengthOfCut,
      widthOfCut: widthOfCut,
      totalDepOfCut: totalDepOfCut,
      cuttingSpeed: cuttingSpeed,
      cutterDia: cutterDia,
      noOfToolInserts: noOfToolInserts,
      depthOfCut: depthOfCut,
      feedPerRev: feedPerRev,
      spindleRpm: spindleRpm,
      noOfPasses: noOfPasses,
      noOfHoles: noOfHoles,
      pitchDiameter: info?.pitchDiameter,
      diameterOfDrill: diameterOfDrill,
      cutTimePerPart: cuttingTime,
      toolChangeTime: toolChangeTime,
      cycleTime: cycleTime,
      noOfMultiples: noOfMultiples,
    };
    this.debug && console.table(logCalc);
    return manufactureInfo;
  }

  private calculateMachiningMilling(info: any, index: number, manufactureInfo: ProcessInfoDto, fd: any, fieldName?: string) {
    // const materialInfo = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;

    let cycleTime = 0;
    let workpieceInitialDia = Number(info?.workpieceInitialDia);
    let workpieceFinalDia = Number(info?.workpieceFinalDia);
    let lengthOfCut = Number(info?.lengthOfCut);
    let widthOfCut = Number(info?.widthOfCut);
    let totalDepOfCut = Number(info?.totalDepOfCut);
    const surfaceArea = Number(info?.surfaceArea);
    let volume = Number(info?.volume);
    let cutterDia = Number(info?.cutterDia);
    let diameterOfDrill = Number(info?.diameterOfDrill); // hole/thread dia
    let depthOfDrill = Number(info?.depthOfDrill); // pre drill
    const noOfHoles = Number(info?.noOfHoles) || 1; // no of places
    let noOfToolInserts = Number(info?.noOfToolInserts); // no of cutting edges
    let pitchDiameter = Number(info?.pitchDiameter);
    let minLength = Number(info?.minLength);
    let materialRemovalRate = Number(info?.totalHobRoughing); // Material Removal Rate
    let toothDepth = Number(info?.toothDepth); // Radial depth of cut
    let wheelWidth = Number(info?.wheelWidth); // Tool width
    let noOfMultiples = 1;

    let cuttingSpeed = Number(info?.cuttingSpeed);
    let feedPerRev = Number(info?.feed);
    let depOfCutPerPass = Number(info?.depthOfCut);

    let lookupInfo = manufactureInfo.millingLookupList?.find((x) => x.materialTypeId == manufactureInfo.materialType);
    if (!lookupInfo && manufactureInfo.materialType) {
      // use material ref id if data not found for selected material
      const refId = this.machiningConfig.getCuttingParametersForRefMaterials(manufactureInfo.materialType);
      if (refId) {
        lookupInfo = manufactureInfo.millingLookupList?.find((x) => x.materialTypeId == refId);
      }
    }

    if (lookupInfo && fieldName === 'automation' && fd) {
      const diameter = fd?.radius ? fd.radius * 2 : fd?.diameter || 0;
      const radius = fd?.radius || 0;
      const angle = fd?.angle || 0;
      const length = fd?.length ?? (fd?.depth || 0);
      const depth = fd?.depth || 0;
      // const maxDia = fd?.maxdaimeter || 0;
      // const minDia = fd?.mindaimeter || 0;
      const width = fd?.width || 0;
      const height = fd?.height || 0;
      // const featureId = fd?.id || 0;
      // const axis = fd?.axis?.findIndex((x) => Number(x) !== 0) || -1;
      // const centroid = fd?.centroid[axis] || 0;
      // const partOuterDiameter = materialInfo?.partOuterDiameter || 0;
      switch (true) {
        case info?.isDrilling && this.operationArray[index + 1]?.isCircularPocketRoughing:
          diameterOfDrill ||= this.machiningConfig.getDrillingSize(diameter - lookupInfo?.endMillingFinishingDepth)?.drillSize || 1; // pre drill size of circularpocketRoughing
          lengthOfCut ||= length - lookupInfo?.endMillingFinishingDepth; // totalDepOfCut of circularpocketRoughing
          break;
        case info?.isSpotFaceMilling || info?.isDrilling || info?.isPeckDrilling || info?.isCounterSinking:
          lengthOfCut ||= depth;
          diameterOfDrill ||= diameter;
          break;
        case info?.isLinearPocketRoughing:
          lengthOfCut ||= length - 2 * lookupInfo?.endMillingFinishingDepth;
          widthOfCut ||= width - 2 * lookupInfo?.endMillingFinishingDepth;
          totalDepOfCut ||= depth - lookupInfo?.endMillingFinishingDepth;
          break;
        case info?.isLinearPocketFinishing:
          lengthOfCut ||= length;
          widthOfCut ||= width;
          totalDepOfCut ||= lookupInfo?.endMillingFinishingDepth;
          break;
        case info?.isCircularPocketRoughing:
          diameterOfDrill ||= diameter - lookupInfo?.endMillingFinishingDepth; // Hole Diameter
          depthOfDrill ||= this.machiningConfig.getDrillingSize(diameterOfDrill)?.drillSize || 1; // pre drill size
          totalDepOfCut ||= length - lookupInfo?.endMillingFinishingDepth;
          break;
        case info?.isCircularPocketFinishing:
          diameterOfDrill ||= diameter; // Hole Diameter
          depthOfDrill ||= diameter - lookupInfo?.endMillingFinishingDepth; // pre drill size
          totalDepOfCut ||= lookupInfo?.endMillingFinishingDepth;
          break;
        case info?.isCircularBossRoughing:
          diameterOfDrill ||= width * 2;
          depthOfDrill ||= length + 2 * lookupInfo?.endMillingFinishingDepth;
          totalDepOfCut ||= height - lookupInfo?.endMillingFinishingDepth;
          break;
        case info?.isCircularBossFinishing:
          diameterOfDrill ||= width * 2;
          depthOfDrill ||= length;
          totalDepOfCut ||= lookupInfo?.endMillingFinishingDepth;
          break;
        case info?.isFaceMillingRoughing:
          lengthOfCut ||= length;
          widthOfCut ||= width;
          totalDepOfCut ||= length - lookupInfo?.faceMillingFinishingDepth; // tbd
          break;
        case info?.isFaceMillingFinishing:
          lengthOfCut ||= length;
          widthOfCut ||= width;
          totalDepOfCut ||= lookupInfo?.faceMillingFinishingDepth;
          break;
        case info?.isSlotMillingRoughing:
          lengthOfCut ||= length - lookupInfo?.slotMillingFinishingDepth;
          widthOfCut ||= width - lookupInfo?.slotMillingFinishingDepth;
          totalDepOfCut ||= depth - lookupInfo?.slotMillingFinishingDepth;
          break;
        case info?.isSlotMillingFinishing:
          lengthOfCut ||= length;
          widthOfCut ||= width;
          totalDepOfCut ||= lookupInfo?.slotMillingFinishingDepth;
          break;
        case info?.isEndMillingRoughing:
          lengthOfCut ||= length;
          widthOfCut ||= width;
          totalDepOfCut ||= depth - lookupInfo?.slotMillingFinishingDepth; // tbd
          break;
        case info?.isEndMillingFinishing:
          lengthOfCut ||= length;
          widthOfCut ||= width;
          totalDepOfCut ||= lookupInfo?.endMillingFinishingDepth;
          break;
        case info?.isSideMillingRoughing:
          lengthOfCut ||= length;
          widthOfCut ||= width;
          // totalDepOfCut ||= //tdb
          break;
        case info?.isSideMillingFinishing:
          lengthOfCut ||= length;
          widthOfCut ||= width;
          // totalDepOfCut ||= //tdb
          break;
        case info?.isEdgeBreakingChamferFillet:
          lengthOfCut ||= length;
          totalDepOfCut ||= angle > 0 ? angle : radius;
          break;
      }
    }

    let srcFieldChanged = fieldName === 'automation';
    if (info?.isEdgeBreakingChamferFillet) {
      srcFieldChanged = srcFieldChanged || (fieldName === 'totalDepOfCut' && this.totalDepOfCut[index] !== totalDepOfCut) || (fieldName === 'cutterDia' && this.cutterDia[index] !== cutterDia);
    } else if (info?.isVolumetricMillingRoughing || info?.isVolumetricMillingFinishing) {
      srcFieldChanged =
        srcFieldChanged ||
        (fieldName === 'surfaceArea' && this.surfaceArea[index] !== surfaceArea) ||
        (fieldName === 'totalDepOfCut' && this.totalDepOfCut[index] !== totalDepOfCut) ||
        (fieldName === 'minLength' && this.minLength[index] !== minLength);
      if (!volume || srcFieldChanged) {
        volume = this.shareService.isValidNumber(surfaceArea * totalDepOfCut);
      }
      toothDepth ||= info?.isVolumetricMillingRoughing ? 0.6 : 0.5;
    } else {
      srcFieldChanged =
        srcFieldChanged ||
        (fieldName === 'widthOfCut' && this.widthOfCut[index] !== widthOfCut) ||
        (fieldName === 'wheelWidth' && this.wheelWidth[index] !== wheelWidth) ||
        (fieldName === 'pitchDiameter' && this.pitchDiameter[index] !== pitchDiameter) ||
        (fieldName === 'depthOfDrill' && this.depthOfDrill[index] !== depthOfDrill) ||
        (fieldName === 'diameterOfDrill' && this.diameterOfDrill[index] !== diameterOfDrill) ||
        (fieldName === 'workpieceFinalDia' && this.workpieceFinalDia[index] !== workpieceFinalDia);
    }
    srcFieldChanged = srcFieldChanged || (fieldName === 'cutterDia' && this.cutterDia[index] !== cutterDia);

    let cuttingValues = null;
    switch (true) {
      case (info?.isFaceMillingRoughing || info?.isFaceMillingFinishing) && ['automation', 'widthOfCut', 'cutterDia'].includes(fieldName): {
        const fieldParams: [number, string] = fieldName === 'cutterDia' && cutterDia > 0 ? [cutterDia, 'cutterDia'] : [widthOfCut, 'widthOfCut'];
        cuttingValues = this.machiningConfig.getFaceMillingCutter(...fieldParams);
        break;
      }
      case (info?.isCircularPocketRoughing || info?.isCircularPocketFinishing) && ['automation', 'diameterOfDrill', 'cutterDia'].includes(fieldName): {
        const fieldParams: [number, string] = fieldName === 'cutterDia' && cutterDia > 0 ? [cutterDia, 'cutterDia'] : [diameterOfDrill, 'diameterOfDrill'];
        cuttingValues = this.machiningConfig.getEndMillingCutter(...fieldParams);
        break;
      }
      case (info?.isVolumetricMillingRoughing || info?.isVolumetricMillingFinishing) && ['automation', 'minLength', 'cutterDia'].includes(fieldName): {
        const fieldParams: [number, string] = fieldName === 'cutterDia' && cutterDia > 0 ? [cutterDia, 'cutterDia'] : [minLength, 'minLength'];
        cuttingValues = this.machiningConfig.getVolumetricMillCutter(...fieldParams);
        break;
      }
      case (info?.isSlotMillingRoughing ||
        info?.isSlotMillingFinishing ||
        info?.isLinearPocketRoughing ||
        info?.isLinearPocketFinishing ||
        info?.isEndMillingRoughing ||
        info?.isEndMillingFinishing ||
        info?.isSideMillingRoughing ||
        info?.isSideMillingFinishing) &&
        ['automation', 'widthOfCut', 'cutterDia'].includes(fieldName): {
        const fieldParams: [number, string] = fieldName === 'cutterDia' && cutterDia > 0 ? [cutterDia, 'cutterDia'] : [widthOfCut, 'widthOfCut'];
        cuttingValues = this.machiningConfig.getEndMillingCutter(...fieldParams);
        break;
      }
      case (info?.isCircularBossRoughing || info?.isCircularBossFinishing) && ['automation', 'workpieceFinalDia', 'cutterDia'].includes(fieldName): {
        const fieldParams: [number, string] = fieldName === 'cutterDia' && cutterDia > 0 ? [cutterDia, 'cutterDia'] : [workpieceFinalDia, 'workpieceFinalDia'];
        cuttingValues = this.machiningConfig.getCircularBossCutter(...fieldParams);
        break;
      }
      case info?.isThreadMilling && ['automation', 'diameterOfDrill', 'pitchDiameter', 'cutterDia'].includes(fieldName): {
        pitchDiameter = fieldName === 'diameterOfDrill' && this.diameterOfDrill[index] !== diameterOfDrill ? 0 : pitchDiameter;
        cuttingValues = this.machiningConfig.getThreadMillingCutter(diameterOfDrill, pitchDiameter);
        pitchDiameter = !pitchDiameter ? cuttingValues.pitch : pitchDiameter;
        depthOfDrill = diameterOfDrill - pitchDiameter;
        break;
      }
      case info?.isSpotFaceMilling && ['automation', 'cutterDia'].includes(fieldName): {
        cuttingValues = this.machiningConfig.getSpotFaceMillingCutter(cutterDia);
        break;
      }
      case info?.isTslot && ['automation', 'widthOfCut', 'depthOfDrill', 'cutterDia', 'wheelWidth'].includes(fieldName): {
        cuttingValues = this.machiningConfig.getTSlotCutter(widthOfCut, depthOfDrill, cutterDia, fieldName === 'wheelWidth' ? 'cutterDia' : fieldName);
        break;
      }
      case info?.isTslotTnut && ['automation', 'widthOfCut', 'depthOfDrill', 'cutterDia', 'wheelWidth'].includes(fieldName): {
        cuttingValues = this.machiningConfig.getTSlotTNutCutter(widthOfCut, depthOfDrill, cutterDia, fieldName === 'wheelWidth' ? 'cutterDia' : fieldName);
        break;
      }
      case info?.isEdgeBreakingChamferFillet && ['automation', 'totalDepOfCut', 'cutterDia'].includes(fieldName): {
        const fieldParams: [number, string] = fieldName === 'cutterDia' && cutterDia > 0 ? [cutterDia, 'cutterDia'] : [totalDepOfCut, 'totalDepOfCut'];
        cuttingValues = this.machiningConfig.getEdgeBreakingChamferFillet(...fieldParams);
        break;
      }
    }

    if (cuttingValues) {
      cutterDia = (!cutterDia || srcFieldChanged) && cuttingValues?.cutterDia && (fieldName !== 'cutterDia' || !cutterDia) && fieldName !== 'wheelWidth' ? cuttingValues.cutterDia : cutterDia;
      noOfToolInserts = (!noOfToolInserts || srcFieldChanged) && cuttingValues?.noOfInserts && fieldName !== 'wheelWidth' ? cuttingValues.noOfInserts : noOfToolInserts;
      if (info?.isTslot || info?.isTslotTnut) {
        wheelWidth = (!wheelWidth || srcFieldChanged) && cuttingValues?.toolWidth && (fieldName !== 'wheelWidth' || !wheelWidth) ? cuttingValues.toolWidth : wheelWidth;
      }
    }

    noOfToolInserts ||= 1;

    if (lookupInfo) {
      const setVals = (csKey: string, feedKey: string, depthKey?: string, usePitch = false) => {
        cuttingSpeed = !cuttingSpeed ? lookupInfo?.[csKey] : cuttingSpeed;
        feedPerRev = !feedPerRev || (fieldName === 'pitchDiameter' && this.pitchDiameter[index] !== pitchDiameter) ? (usePitch ? pitchDiameter : lookupInfo?.[feedKey]) : feedPerRev;

        if (info?.isSideMillingRoughing || info?.isSideMillingFinishing) {
          toothDepth ||= lookupInfo?.[depthKey];
          depOfCutPerPass = cutterDia * toothDepth;
        } else if (info?.isThreadMilling) {
          depOfCutPerPass = !depOfCutPerPass || srcFieldChanged ? this.shareService.isValidNumber((pitchDiameter / 2) * lookupInfo?.[depthKey]) : depOfCutPerPass;
        } else if (info?.isTslot) {
          depOfCutPerPass = !depOfCutPerPass || srcFieldChanged ? this.shareService.isValidNumber(wheelWidth * lookupInfo?.[depthKey]) : depOfCutPerPass;
        } else {
          depOfCutPerPass = !depOfCutPerPass ? lookupInfo?.[depthKey] : depOfCutPerPass;
        }
      };

      switch (true) {
        case info?.isFaceMillingRoughing:
          setVals('faceMillingRoughingCS', 'faceMillingRoughingFeed', 'faceMillingRoughingDepth');
          break;
        case info?.isFaceMillingFinishing:
          setVals('faceMillingFinishingCS', 'faceMillingFinishingFeed', 'faceMillingFinishingDepth');
          break;
        case info?.isSlotMillingRoughing:
          if (widthOfCut > 20) setVals('sholderMillInsertedCutterRoughingCS', 'sholderMillInsertedCutterRoughingFeed', 'sholderMillInsertedCutterRoughingDepth');
          else setVals('slotMillingRoughingCS', 'slotMillingRoughingFeed', 'slotMillingRoughingDepth');
          break;
        case info?.isSlotMillingFinishing:
          if (widthOfCut > 20) setVals('sholderMillInsertedCutterFinishingCS', 'sholderMillInsertedCutterFinishingFeed', 'sholderMillInsertedCutterFinishingDepth');
          else setVals('slotMillingFinishingCS', 'slotMillingFinishingFeed', 'slotMillingFinishingDepth');
          break;
        case info?.isSideMillingRoughing:
          if (widthOfCut > 20) setVals('sholderMillInsertedCutterRoughingCS', 'sholderMillInsertedCutterRoughingFeed', 'sholderMillInsertedCutterRoughingDepth');
          else setVals('sideMillingRoughingCS', 'sideMillingRoughingFeed', 'sideMillingRoughingDepth');
          break;
        case info?.isSideMillingFinishing:
          if (widthOfCut > 20) setVals('sholderMillInsertedCutterFinishingCS', 'sholderMillInsertedCutterFinishingFeed', 'sholderMillInsertedCutterFinishingDepth');
          else setVals('sideMillingFinishingCS', 'sideMillingFinishingFeed', 'sideMillingFinishingDepth');
          break;
        case info?.isEndMillingRoughing:
          if (widthOfCut > 20) setVals('sholderMillInsertedCutterRoughingCS', 'sholderMillInsertedCutterRoughingFeed', 'sholderMillInsertedCutterRoughingDepth');
          else setVals('endMillingRoughingCS', 'endMillingRoughingFeed', 'endMillingRoughingDepth');
          break;
        case info?.isEndMillingFinishing:
          if (widthOfCut > 20) setVals('sholderMillInsertedCutterFinishingCS', 'sholderMillInsertedCutterFinishingFeed', 'sholderMillInsertedCutterFinishingDepth');
          else setVals('endMillingFinishingCS', 'endMillingFinishingFeed', 'endMillingFinishingDepth');
          break;
        case info?.isLinearPocketRoughing || info?.isCircularPocketRoughing || info?.isCircularBossRoughing:
          setVals('endMillingRoughingCS', 'endMillingRoughingFeed', 'endMillingRoughingDepth');
          break;
        case info?.isLinearPocketFinishing || info?.isCircularPocketFinishing || info?.isCircularBossFinishing:
          setVals('endMillingFinishingCS', 'endMillingFinishingFeed', 'endMillingFinishingDepth');
          break;
        case info?.isThreadMilling:
          setVals('treadMillingCS', 'treadMillingFeed', 'treadMillingDepth');
          noOfToolInserts = 3;
          break;
        case info?.isSpotFaceMilling:
          setVals('spotFaceMillingCS', 'spotFaceMillingFeed', 'spotFaceMillingDepth');
          noOfToolInserts ||= 3;
          break;
        case info?.isDrilling || info?.isPeckDrilling:
          setVals('drillingCS', 'drillingFeed', 'drillingDepth');
          noOfToolInserts = 1;
          noOfMultiples = info?.isPeckDrilling ? 1.2 : 1;
          break;
        case info?.isReaming:
          setVals('reamingCS', 'reamingFeed', 'reamingDepth');
          noOfToolInserts = 4;
          noOfMultiples = 1.2;
          break;
        case info?.isTapping:
          setVals('tappingCS', 'tappingFeed', 'tappingDepth', true);
          noOfToolInserts = 1;
          noOfMultiples = 2;
          break;
        case info?.isCounterSinking:
          setVals('counterSinkingCS', 'counterSinkingFeed', 'counterSinkingDepth');
          noOfToolInserts = 2;
          break;
        case info?.isBoringRoughing:
          setVals('boringRoughingCS', 'boringRoughingFeed', 'boringRoughingDepth');
          noOfToolInserts = 2;
          break;
        case info?.isBoringFinishing:
          setVals('boringFinishingCS', 'boringFinishingFeed', 'boringFinishingDepth');
          noOfToolInserts = 2;
          break;
        case info?.isTrepanning:
          setVals('trepanningCS', 'trepanningFeed', 'trepanningDepth');
          noOfToolInserts = 3;
          break;
        case info?.isTslot || info?.isTslotTnut:
          setVals('tSlotCS', 'tSlotFeed', 'tSlotDepth');
          break;
        case info?.isVolumetricMillingRoughing:
          setVals('volumetricMillingRoughingCS', 'volumetricMillingRoughingFeed', 'volumetricMillingRoughingDepth');
          break;
        case info?.isVolumetricMillingFinishing:
          setVals('volumetricMillingFinishingCS', 'volumetricMillingFinishingFeed', 'volumetricMillingFinishingDepth');
          break;
        case info?.isEdgeBreakingChamferFillet:
          setVals('edgeBreakingChamferFilletCS', 'edgeBreakingChamferFilletFeed', 'edgeBreakingChamferFilletDepth');
          break;
      }
    }

    let spindleRpm = 0;
    if (info?.isDrilling || info?.isPeckDrilling || info?.isReaming || info?.isTapping) {
      spindleRpm = this.shareService.isValidNumber((1000 * cuttingSpeed) / (3.1428 * diameterOfDrill));
    } else {
      spindleRpm = this.shareService.isValidNumber((1000 * cuttingSpeed) / (3.1428 * cutterDia));
    }

    const feedRate = this.shareService.isValidNumber(feedPerRev * spindleRpm * noOfToolInserts);

    let noOfPassesDepth = 0;
    switch (true) {
      case info?.isFaceMillingRoughing ||
        info?.isFaceMillingFinishing ||
        info?.isEndMillingRoughing ||
        info?.isEndMillingFinishing ||
        info?.isSlotMillingRoughing ||
        info?.isSlotMillingFinishing ||
        info?.isLinearPocketRoughing ||
        info?.isLinearPocketFinishing ||
        info?.isCircularPocketRoughing ||
        info?.isCircularPocketFinishing ||
        info?.isCircularBossRoughing ||
        info?.isCircularBossFinishing ||
        info?.isEdgeBreakingChamferFillet: {
        noOfPassesDepth = this.shareService.isValidNumber(Math.ceil(totalDepOfCut / depOfCutPerPass));
        break;
      }
      case info?.isTslotTnut:
        noOfPassesDepth = this.shareService.isValidNumber(Math.ceil(depthOfDrill / wheelWidth));
        break;
      case info?.isTslot:
        noOfPassesDepth = this.shareService.isValidNumber(Math.ceil(depthOfDrill / depOfCutPerPass));
        break;
      case info?.isThreadMilling:
        noOfPassesDepth = this.shareService.isValidNumber(1 + Math.ceil(lengthOfCut / pitchDiameter));
        break;
      case info?.isSideMillingRoughing || info?.isSideMillingFinishing:
        noOfPassesDepth = this.shareService.isValidNumber(Math.ceil(widthOfCut / (1.5 * cutterDia)));
        break;
      default:
        noOfPassesDepth = this.shareService.isValidNumber(Math.ceil(noOfHoles / depOfCutPerPass));
    }

    let passPer = 0;
    if (info?.isFaceMillingRoughing || info?.isEndMillingRoughing || info?.isSlotMillingRoughing || info?.isLinearPocketRoughing || info?.isCircularPocketRoughing || info?.isCircularBossRoughing) {
      passPer = 0.7;
    } else {
      passPer = 0.6;
    }

    let noOfPassesWidth = 0;
    switch (true) {
      case info?.isCircularPocketRoughing || info?.isCircularPocketFinishing:
        noOfPassesWidth = this.shareService.isValidNumber(Math.ceil((diameterOfDrill - depthOfDrill) / 2 / (cutterDia * passPer)));
        break;
      case info?.isCircularBossRoughing || info?.isCircularBossFinishing:
        noOfPassesWidth = this.shareService.isValidNumber(Math.ceil((workpieceInitialDia - workpieceFinalDia) / 2 / (cutterDia * passPer)));
        break;
      case info?.isSlotMillingRoughing || info?.isSlotMillingFinishing || info?.isLinearPocketRoughing || info?.isLinearPocketFinishing:
        noOfPassesWidth = this.shareService.isValidNumber(1 + Math.ceil((widthOfCut - cutterDia) / (cutterDia * passPer)));
        break;
      case info?.isSideMillingRoughing || info?.isSideMillingFinishing:
        noOfPassesWidth = this.shareService.isValidNumber(Math.ceil(totalDepOfCut / depOfCutPerPass));
        break;
      case info?.isTslotTnut || info?.isTslot:
        noOfPassesWidth = this.shareService.isValidNumber(Math.ceil(widthOfCut / cutterDia));
        break;
      case info?.isThreadMilling:
        noOfPassesWidth = this.shareService.isValidNumber(Math.ceil(pitchDiameter / 2 / depOfCutPerPass));
        break;
      default:
        noOfPassesWidth = this.shareService.isValidNumber(Math.ceil(widthOfCut / (cutterDia * passPer)));
    }

    let totalNoOfPasses = 0;
    if (
      info?.isFaceMillingRoughing ||
      info?.isFaceMillingFinishing ||
      info?.isEndMillingRoughing ||
      info?.isEndMillingFinishing ||
      info?.isSlotMillingRoughing ||
      info?.isSlotMillingFinishing ||
      info?.isSideMillingRoughing ||
      info?.isSideMillingFinishing ||
      info?.isLinearPocketRoughing ||
      info?.isLinearPocketFinishing ||
      info?.isCircularPocketRoughing ||
      info?.isCircularPocketFinishing ||
      info?.isCircularBossRoughing ||
      info?.isCircularBossFinishing ||
      info?.isThreadMilling
    ) {
      totalNoOfPasses = Number(noOfPassesDepth) * Number(noOfPassesWidth);
    } else {
      totalNoOfPasses = noOfPassesDepth;
    }

    let cuttingTime = 0;
    switch (true) {
      case info?.isFaceMillingRoughing || info?.isFaceMillingFinishing || info?.isEndMillingRoughing || info?.isEndMillingFinishing || info?.isSlotMillingRoughing || info?.isSlotMillingFinishing:
        cuttingTime = this.shareService.isValidNumber((((lengthOfCut + cutterDia + cutterDia * 0.6 + 4) / feedRate) * totalNoOfPasses * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
        break;
      case info?.isLinearPocketRoughing || info?.isLinearPocketFinishing: {
        const tempPer = info?.isLinearPocketRoughing ? 0.6 : 0.5;
        cuttingTime = this.shareService.isValidNumber((((lengthOfCut - cutterDia + cutterDia * tempPer + 4) / feedRate) * totalNoOfPasses * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
        break;
      }
      case info?.isCircularPocketRoughing || info?.isCircularPocketFinishing:
        cuttingTime = this.shareService.isValidNumber(((((diameterOfDrill - cutterDia) * 3.14 + 4) / feedRate) * totalNoOfPasses * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
        break;
      case info?.isCircularBossRoughing || info?.isCircularBossFinishing:
        cuttingTime = this.shareService.isValidNumber(((((workpieceFinalDia + cutterDia) * 3.14 + 4) / feedRate) * totalNoOfPasses * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
        break;
      case info?.isSideMillingRoughing || info?.isSideMillingFinishing:
        cuttingTime = this.shareService.isValidNumber((((lengthOfCut + cutterDia + 4) / feedRate) * totalNoOfPasses * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
        break;
      case info?.isThreadMilling:
        cuttingTime = this.shareService.isValidNumber(((((diameterOfDrill * 3.14 + cutterDia * 0.2 * 2) / feedRate) * totalNoOfPasses * 60) / (manufactureInfo.efficiency / 100)) * noOfHoles);
        break;
      case info?.isSpotFaceMilling || info?.isCounterSinking:
        cuttingTime = this.shareService.isValidNumber(((((lengthOfCut + cutterDia * 0.3 + 4) / feedRate) * noOfMultiples * 60) / (manufactureInfo.efficiency / 100)) * noOfHoles);
        break;
      case info?.isBoringRoughing || info?.isBoringFinishing || info?.isTrepanning:
        cuttingTime = this.shareService.isValidNumber(((((depthOfDrill + cutterDia * 0.3 + 4) / feedRate) * noOfMultiples * 60) / (manufactureInfo.efficiency / 100)) * noOfHoles);
        break;
      case info?.isDrilling || info?.isPeckDrilling || info?.isReaming:
        cuttingTime = this.shareService.isValidNumber(((((lengthOfCut + diameterOfDrill * 0.3 + 4) / feedRate) * noOfMultiples * 60) / (manufactureInfo.efficiency / 100)) * noOfHoles);
        break;
      case info?.isTapping:
        cuttingTime = this.shareService.isValidNumber(((((lengthOfCut + diameterOfDrill * 0.1 + 4) / feedRate) * noOfMultiples * 60) / (manufactureInfo.efficiency / 100)) * noOfHoles);
        break;
      case info?.isTslotTnut || info?.isTslot:
        cuttingTime = this.shareService.isValidNumber((((lengthOfCut + cutterDia + 4) / feedRate) * totalNoOfPasses * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
        break;
      case info?.isVolumetricMillingRoughing || info?.isVolumetricMillingFinishing: {
        materialRemovalRate = this.shareService.isValidNumber(depOfCutPerPass * feedRate * cutterDia * toothDepth);
        cuttingTime = this.shareService.isValidNumber(((volume / materialRemovalRate) * 60 * noOfHoles) / (manufactureInfo.efficiency / 100));
        break;
      }
      case info?.isEdgeBreakingChamferFillet:
        cuttingTime = this.shareService.isValidNumber((((lengthOfCut + cutterDia * 0.25) / feedRate) * totalNoOfPasses * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
        break;
      default:
        cuttingTime = this.shareService.isValidNumber((((lengthOfCut * 1.1) / feedRate) * totalNoOfPasses * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
    }

    const toolChangeTime = Number(manufactureInfo.sheetLoadUloadTime);
    cycleTime = cuttingTime + toolChangeTime;

    manufactureInfo.subProcessTypeInfos[index] = {
      ...this.operationArray[index],
      lengthOfCut,
      widthOfCut,
      workpieceFinalDia,
      totalDepOfCut,
      cutterDia,
      noOfToolInserts,
      cuttingSpeed,
      feed: feedPerRev,
      depthOfCut: depOfCutPerPass,
      pitchDiameter,
      depthOfDrill,
      diameterOfDrill,
      wheelWidth,
      cuttingTime,
      cycleTime,
      totalNoOfPasses,
      noOfHoles,
      noOfMultiples,
      volume,
      toothDepth,
      totalHobRoughing: materialRemovalRate,
    };

    this.widthOfCut[index] = widthOfCut;
    this.depthOfDrill[index] = depthOfDrill;
    this.diameterOfDrill[index] = diameterOfDrill;
    this.pitchDiameter[index] = pitchDiameter;
    this.wheelWidth[index] = wheelWidth;
    this.workpieceFinalDia[index] = workpieceFinalDia;
    this.surfaceArea[index] = surfaceArea;
    this.minLength[index] = minLength;
    this.totalDepOfCut[index] = totalDepOfCut;
    this.cutterDia[index] = cutterDia;

    const logCalc = {
      operationType: info?.operationTypeId,
      operationName: info?.operationName,
      efficiency: manufactureInfo.efficiency,
      lengthOfCut: lengthOfCut,
      widthOfCut: widthOfCut,
      totalDepth: totalDepOfCut,
      depthOfDrill,
      diameterOfDrill,
      noOfHoles: noOfHoles,
      cuttingSpeed: cuttingSpeed,
      cutterDia: cutterDia,
      noOfToolInserts: noOfToolInserts,
      depOfCutPerPass: depOfCutPerPass,
      feedPerRev: feedPerRev,
      spindleRpm: spindleRpm,
      noOfPassesDepth: noOfPassesDepth,
      noOfPassesWidth: noOfPassesWidth,
      totalNoOfPasses: totalNoOfPasses,
      noOfMultiples: noOfMultiples,
      pitchDiameter,
      cutTimePerPart: cuttingTime,
      toolChangeTime: toolChangeTime,
      cycleTime: cycleTime,
    };
    this.debug && console.table(logCalc);
    return manufactureInfo;
  }

  private calculateMachiningDrilling(info: any, index: number, manufactureInfo: ProcessInfoDto) {
    let cycleTime = 0;
    let drillingSpeedEntity: DrillingCutting = new DrillingCutting();
    const diameterOfDrill = Number(info?.diameterOfDrill);
    const depthOfDrill = Number(info?.depthOfDrill);
    const noOfHoles = Number(info?.noOfHoles);
    let noOfPasses = Number(info?.noOfPasses);
    const pitchDiameter = Number(info?.pitchDiameter);
    const noOfMultiples = Number(info?.noOfMultiples) || 2;
    let cuttingTime = Number(info?.cuttingTime);
    const totalHobRoughing = Number(info?.totalHobRoughing); // positioning cycle time

    let roundedDrillDiameter = Math.round(diameterOfDrill);
    roundedDrillDiameter = roundedDrillDiameter >= 25 ? 19.1 : roundedDrillDiameter;

    if (info?.isDrilling) {
      drillingSpeedEntity = manufactureInfo.drillingCuttingSpeedList?.find(
        (x) => x.operationTypeId == info?.operationTypeId && x.materialTypeId == manufactureInfo.materialType && x.fromFRPDrillDia <= roundedDrillDiameter && x.toFRPDrillDia >= roundedDrillDiameter
      );
    } else if (info?.isTapping) {
      drillingSpeedEntity = manufactureInfo.drillingCuttingSpeedList?.find((x) => x.operationTypeId == info?.operationTypeId && x.materialTypeId == manufactureInfo.materialType);
    }
    if (drillingSpeedEntity) {
      const cuttingSpeed = Number(drillingSpeedEntity?.cuttingSpeed80Percent);
      let feedPerRev = Number(drillingSpeedEntity?.frpValue);
      const spindleRpm = this.shareService.isValidNumber((1000 * cuttingSpeed) / (Math.PI * diameterOfDrill));
      if (info?.isDrilling) {
        const peckDrillingLength = 5; // constant
        const retractionTime = 2; // constant
        noOfPasses = depthOfDrill / peckDrillingLength;
        cycleTime = this.shareService.isValidNumber(((((peckDrillingLength + retractionTime) * noOfPasses) / (feedPerRev * spindleRpm)) * 60 * noOfHoles) / (manufactureInfo.efficiency / 100));
        manufactureInfo.subProcessTypeInfos[index] = {
          ...this.operationArray[index],
          cycleTime,
          noOfPasses,
        };
      } else if (info?.isTapping) {
        feedPerRev = pitchDiameter;
        cuttingTime = (((depthOfDrill + 4) / (feedPerRev * spindleRpm)) * noOfHoles * noOfMultiples * 60) / (manufactureInfo.efficiency / 100);
        cycleTime = cuttingTime + Number(manufactureInfo.sheetLoadUloadTime) + totalHobRoughing;
        manufactureInfo.subProcessTypeInfos[index] = {
          ...this.operationArray[index],
          noOfMultiples,
          cuttingTime,
          totalHobRoughing,
          cycleTime,
        };
      }
      const logCalc = {
        operationType: info?.operationTypeId,
        operationName: info?.operationName,
        efficiency: manufactureInfo.efficiency,
        diameterOfDrill: diameterOfDrill,
        depthOfDrill: depthOfDrill,
        noOfPasses: noOfPasses,
        noOfHoles: noOfHoles,
        noOfMultiples: noOfMultiples,
        cuttingSpeed: cuttingSpeed,
        feedPerRev: feedPerRev,
        spindleRpm: spindleRpm,
        cuttingTime: cuttingTime,
        positioningCycleTime: totalHobRoughing,
        cycleTime: cycleTime,
      };
      this.debug && console.table(logCalc);
    } else {
      manufactureInfo.subProcessTypeInfos[index] = {
        ...this.operationArray[index],
        cycleTime: 0,
      };
    }
    return manufactureInfo;
  }

  private calculateMachiningBoring(info: any, index: number, manufactureInfo: ProcessInfoDto) {
    let cycleTime = 0;
    const diameterOfDrill = Number(info?.diameterOfDrill);
    const lengthOfCut = Number(info?.lengthOfCut);
    const noOfHoles = Number(info?.noOfHoles);

    const lookupInfo = manufactureInfo.boringLookupList?.find((x) => x.materialTypeId == manufactureInfo.materialType);
    if (lookupInfo) {
      let cuttingSpeed = 0;
      let feedPerRev = 0;
      // let depthOfCut = 0;
      if (info?.isBoringRoughing) {
        cuttingSpeed = lookupInfo?.boringRoughingCS;
        feedPerRev = lookupInfo?.boringRoughingFeed;
        // depthOfCut = lookupInfo?.boringRoughingDepth;
      } else if (info?.isBoringFinishing) {
        cuttingSpeed = lookupInfo?.boringFinishingCS;
        feedPerRev = lookupInfo?.boringFinishingFeed;
        // depthOfCut = lookupInfo?.boringFinishingDepth;
        // } else if (info?.isTaperBoringFinishing || info?.isVerticalTaperBoringFinishing) {
        //   cuttingSpeed = lookupInfo?.taperTurningFinishingCS;
        //   feedPerRev = lookupInfo?.taperTurningFinishingFeed;
        //   depthOfCut = lookupInfo?.taperTurningFinishingDepth;
        // } else if (info?.isTaperBoringRoughing || info?.isVerticalTaperBoringRoughing) {
        //   cuttingSpeed = lookupInfo?.taperTurningRoughingCS;
        //   feedPerRev = lookupInfo?.taperTurningRoughingFeed;
        //   depthOfCut = lookupInfo?.taperTurningRoughingDepth;
      }

      const spindleRpm = this.shareService.isValidNumber((1000 * cuttingSpeed) / (3.1428 * diameterOfDrill));
      cycleTime = this.shareService.isValidNumber((((lengthOfCut * 1.1) / (feedPerRev * spindleRpm)) * noOfHoles * 60) / (manufactureInfo.efficiency / 100));
      manufactureInfo.subProcessTypeInfos[index] = {
        ...this.operationArray[index],
        cycleTime,
      };
      const logCalc = {
        operationType: info?.operationTypeId,
        operationName: info?.operationName,
        efficiency: manufactureInfo.efficiency,
        lengthOfBore: lengthOfCut,
        diameterBore: diameterOfDrill,
        noOfBores: noOfHoles,
        cuttingSpeed: cuttingSpeed,
        feedPerRev: feedPerRev,
        spindleRpm: spindleRpm,
        cycleTime: cycleTime,
      };
      this.debug && console.table(logCalc);
    } else {
      manufactureInfo.subProcessTypeInfos[index] = {
        ...this.operationArray[index],
        cycleTime: 0,
      };
    }
    return manufactureInfo;
  }

  private calculateMachiningGrinding(grindingId: number, info: any, index: number, manufactureInfo: ProcessInfoDto) {
    let cycleTime = 0;
    const lengthOfCut = Number(info?.lengthOfCut);
    const widthOfCut = Number(info?.widthOfCut);
    const totalDepOfCut = Number(info?.totalDepOfCut);
    const wheelDiameter = Number(info?.wheelDiameter);
    let wheelWidth = Number(info?.wheelWidth);
    let totalNoOfPasses = Number(info?.totalNoOfPasses);
    let noOfPasses = Number(info?.noOfPasses);
    const diameterOfDrill = Number(info?.diameterOfDrill);

    const lookupInfo = manufactureInfo.grindingLookupList?.find((x) => x.grindingType == grindingId && Math.round(wheelDiameter) >= x.fromWheelDia && Math.round(wheelDiameter) <= x.toWheelDia);
    let grindingSpeed,
      feedPerRev,
      depthOfGrinding = 0;
    if (lookupInfo) {
      if (info?.isSurfaceGrindingRoughing || info?.isCenterlessGrindingRoughing || info?.isCylindricalGrindingRoughing) {
        grindingSpeed = lookupInfo?.roughingCuttingSpeed;
        feedPerRev = lookupInfo?.roughingFeed;
        depthOfGrinding = lookupInfo?.roughingDepthOfCut;
      } else if (info?.isSurfaceGrindingFinishing || info?.isCenterlessGrindingFinishing || info?.isCylindricalGrindingFinishing) {
        grindingSpeed = lookupInfo?.finishingCuttingSpeed;
        feedPerRev = lookupInfo?.finishingFeed;
        depthOfGrinding = lookupInfo?.finishingDepthOfCut;
      }

      const spindleRpm = this.shareService.isValidNumber((1000 * grindingSpeed) / (3.1428 * wheelDiameter));

      if (grindingId === 1) {
        // surface
        const noOfPassesWidth = this.shareService.isValidNumber(Math.ceil(widthOfCut / wheelDiameter));
        const noOfPassesDepth = this.shareService.isValidNumber(Math.ceil(totalDepOfCut / depthOfGrinding));
        totalNoOfPasses = totalNoOfPasses ? totalNoOfPasses : noOfPassesWidth * noOfPassesDepth;
        cycleTime = this.shareService.isValidNumber((((lengthOfCut + wheelDiameter / 2) / (feedPerRev * spindleRpm)) * totalNoOfPasses * 60) / (manufactureInfo.efficiency / 100));
      }
      if (grindingId === 2) {
        // cylindrical
        noOfPasses = noOfPasses ? noOfPasses : this.shareService.isValidNumber(Math.ceil(totalDepOfCut / depthOfGrinding));
        cycleTime =
          lengthOfCut > wheelWidth
            ? this.shareService.isValidNumber(((((lengthOfCut - wheelWidth) * 1.1) / (feedPerRev * spindleRpm)) * noOfPasses * 60) / (manufactureInfo.efficiency / 100))
            : this.shareService.isValidNumber((((lengthOfCut * 1.1) / (feedPerRev * spindleRpm)) * noOfPasses * 60) / (manufactureInfo.efficiency / 100));
      } else if (grindingId === 3) {
        // centerless
        wheelWidth = wheelWidth ? wheelWidth : lengthOfCut + 10;
        noOfPasses = noOfPasses ? noOfPasses : 1;
        cycleTime = this.shareService.isValidNumber((((totalDepOfCut * 1.1) / (feedPerRev * spindleRpm)) * noOfPasses * 60) / (manufactureInfo.efficiency / 100));
      }

      manufactureInfo.subProcessTypeInfos[index] = {
        ...this.operationArray[index],
        totalNoOfPasses,
        noOfPasses,
        wheelWidth,
        cycleTime,
      };
      const logCalc = {
        operationType: info?.operationTypeId,
        operationName: info?.operationName,
        efficiency: manufactureInfo.efficiency,
        diameterOfGrinding: diameterOfDrill,
        lengthOfGrinding: lengthOfCut,
        widthOfGrinding: widthOfCut,
        totalDepOfCut: totalDepOfCut,
        wheelDiameter: wheelDiameter,
        wheelWidth: wheelWidth,
        grindingSpeed: grindingSpeed,
        feedPerRev: feedPerRev,
        depthOfGrinding: depthOfGrinding,
        spindleRpm: spindleRpm,
        // noOfPassesWidth: noOfPassesWidth,
        // noOfPassesDepth: noOfPassesDepth,
        totalNoOfPasses: totalNoOfPasses,
        noOfPasses: noOfPasses,
        cycleTime: cycleTime,
      };
      this.debug && console.table(logCalc);
    } else {
      manufactureInfo.subProcessTypeInfos[index] = {
        ...this.operationArray[index],
        cycleTime: 0,
      };
    }
    return manufactureInfo;
  }

  private calculateMachiningGear(info: any, index: number, manufactureInfo: ProcessInfoDto, fieldName?: string, operationsLength?: number) {
    const materialInfo = manufactureInfo.materialInfoList[0];
    let cycleTime = 0;
    let cuttingSpeedFeed = null;
    if (manufactureInfo.MachiningFlags.isGearCutting) {
      cuttingSpeedFeed = this.machiningConfig.getGearCuttingSpeedFeed();
    } else if (manufactureInfo.MachiningFlags.isGearBroaching) {
      cuttingSpeedFeed = this.machiningConfig.getGearBroachingFeed();
    } else if (manufactureInfo.MachiningFlags.isGearSplineRolling) {
      cuttingSpeedFeed = this.machiningConfig.getGearSplineRollingCuttingSpeed();
    } else if (manufactureInfo.MachiningFlags.isGearShaving) {
      const csfd = this.machiningConfig.getGearShavingCuttingSpeedFeedDepth();
      if (info?.isShavingSemiFinish) {
        cuttingSpeedFeed = { cs: csfd.semiFinishCS, feed: csfd.semiFinishFeed, depth: csfd.semiFinishDepth };
      } else if (info?.isShavingFinish) {
        cuttingSpeedFeed = { cs: csfd.finishCS, feed: csfd.finishFeed, depth: csfd.finishDepth };
      }
    } else if (manufactureInfo.MachiningFlags.isGearGrinding) {
      const csfd = this.machiningConfig.getGearGrindingCuttingSpeedFeedDepth();
      if (info?.isGearGrindingSemiFinish) {
        cuttingSpeedFeed = { cs: csfd.semiFinishCS, feed: csfd.semiFinishFeed, depth: csfd.semiFinishDepth };
      } else if (info?.isGearGrindingFinish) {
        cuttingSpeedFeed = { cs: csfd.finishCS, feed: csfd.finishFeed, depth: csfd.finishDepth };
      }
    }
    const noOfTeeth = Number(info?.noOfTeeth);
    const workpieceInnerDia = Number(info?.workpieceInnerDia);
    const workpieceOuterDia = Number(info?.workpieceOuterDia);
    const outerDiameter = Number(info?.outerDiameter);
    const rootDiameter = Number(info?.rootDiameter);
    const lengthOfCut = Number(info?.lengthOfCut);
    const widthOfCut = Number(info?.widthOfCut);
    let totalDepOfCut = Number(info?.totalDepOfCut);
    let hobDiameter = Number(info?.hobDiameter);
    const noOfStarts = Number(info?.noOfStarts) || 1;
    let noOfPasses = Number(info?.noOfPasses) || 1;
    const cuttingTime = Number(info?.cuttingTime) || cuttingSpeedFeed?.cs;
    let finishCutMatAllowance = Number(info?.finishCutMatAllowance) || cuttingSpeedFeed?.feed;
    const depthOfCutRoughing = Number(info?.depthOfCutRoughing) || cuttingSpeedFeed?.depth;
    const noOfMultiples = Number(info?.noOfMultiples) || 1;
    let hobApproachRoughing = Number(info?.hobApproachRoughing);

    const srcFieldChangedLen = fieldName === 'lengthOfCut' && this.lengthOfCut[index] !== lengthOfCut;
    const srcFieldChangedRootDia = fieldName === 'rootDiameter' && this.rootDia[index] !== rootDiameter;
    const srcFieldChangedWorkPieceOuterDia = fieldName === 'workpieceOuterDia' && this.workpieceOuterDia[index] !== workpieceOuterDia;
    const srcFieldChangedDepthOfCutRoughing = fieldName === 'depthOfCutRoughing' && this.depthOfCutRoughing[index] !== depthOfCutRoughing;

    if (manufactureInfo.MachiningFlags.isGearBroaching) {
      totalDepOfCut = this.shareService.isValidNumber((rootDiameter - workpieceInnerDia) / 2);
    } else {
      // all others
      totalDepOfCut = this.shareService.isValidNumber((outerDiameter - rootDiameter) / 2);
    }

    if (manufactureInfo.MachiningFlags.isGearCutting) {
      if (!hobDiameter || srcFieldChangedLen) {
        hobDiameter = this.machiningConfig.getGearCuttingModuleData(lengthOfCut);
      }
    } else if (manufactureInfo.MachiningFlags.isGearBroaching) {
      hobDiameter = rootDiameter;
    } else if (manufactureInfo.MachiningFlags.isGearSplineRolling) {
      !hobDiameter && (hobDiameter = 200);
      !finishCutMatAllowance && (finishCutMatAllowance = 0.2);
    } else if (manufactureInfo.MachiningFlags.isGearShaving) {
      !hobDiameter && (hobDiameter = 200);
    } else if (manufactureInfo.MachiningFlags.isGearGrinding) {
      !hobDiameter && (hobDiameter = 250);
    }

    if ((!noOfPasses || srcFieldChangedLen) && manufactureInfo.MachiningFlags.isGearCutting) {
      noOfPasses = this.machiningConfig.getNoOfPassesGearCutting(lengthOfCut);
    } else if (
      (!noOfPasses || srcFieldChangedWorkPieceOuterDia || srcFieldChangedDepthOfCutRoughing) &&
      (manufactureInfo.MachiningFlags.isGearShaving || manufactureInfo.MachiningFlags.isGearGrinding)
    ) {
      noOfPasses = Math.ceil(workpieceOuterDia / depthOfCutRoughing) || 1;
    }

    let hobspeedRoughing = (cuttingTime * 1000) / (3.14 * hobDiameter);
    let totalHobRoughing = 0;
    if (manufactureInfo.MachiningFlags.isGearCutting) {
      hobApproachRoughing = Math.sqrt((hobDiameter - totalDepOfCut) * totalDepOfCut);
      totalHobRoughing = ((hobApproachRoughing + widthOfCut * noOfMultiples + 5) * noOfTeeth) / (hobspeedRoughing * finishCutMatAllowance * noOfStarts * noOfPasses);
    } else if (manufactureInfo.MachiningFlags.isGearBroaching) {
      if (!hobApproachRoughing || srcFieldChangedRootDia) {
        hobApproachRoughing = this.machiningConfig.getGearBroachingModuleData(rootDiameter);
      }
      totalHobRoughing = (widthOfCut + hobApproachRoughing) / finishCutMatAllowance / (Number(manufactureInfo.efficiency) / 100);
    } else if (manufactureInfo.MachiningFlags.isGearSplineRolling) {
      hobApproachRoughing = Math.sqrt((hobDiameter - totalDepOfCut) * totalDepOfCut);
      totalHobRoughing = (lengthOfCut + hobApproachRoughing) / (finishCutMatAllowance * hobspeedRoughing) / (Number(manufactureInfo.efficiency) / 100);
    } else if (manufactureInfo.MachiningFlags.isGearShaving || manufactureInfo.MachiningFlags.isGearGrinding) {
      hobApproachRoughing = Math.sqrt((hobDiameter - totalDepOfCut) * totalDepOfCut);
      totalHobRoughing = ((hobApproachRoughing + 3.14 * outerDiameter) / (finishCutMatAllowance * hobspeedRoughing)) * noOfPasses;
    }
    hobspeedRoughing = this.shareService.isValidNumber(hobspeedRoughing);
    hobApproachRoughing = this.shareService.isValidNumber(hobApproachRoughing);
    totalHobRoughing = this.shareService.isValidNumber(totalHobRoughing);

    const handlingTime = this.machiningConfig.getHandlingTimeGear(Number(materialInfo?.netWeight) / 1000); // coverting weight from g to kg
    cycleTime = this.shareService.isValidNumber((totalHobRoughing + handlingTime / operationsLength) * 60); // handlingtime is split accross multiple operations

    manufactureInfo.subProcessTypeInfos[index] = {
      ...this.operationArray[index],
      cycleTime,
      noOfPasses,
      hobDiameter,
      totalDepOfCut,
      finishCutMatAllowance,
      cuttingTime,
      depthOfCutRoughing,
      noOfMultiples,
      noOfStarts,
      hobspeedRoughing,
      hobApproachRoughing,
      totalHobRoughing,
    };

    // this.outerDia = outerDiameter;
    this.rootDia[index] = rootDiameter;
    // this.workpieceInnerDia = workpieceInnerDia;
    this.workpieceOuterDia[index] = workpieceOuterDia;
    this.depthOfCutRoughing[index] = depthOfCutRoughing;
    this.lengthOfCut[index] = lengthOfCut;
    const logCalc = {
      operationType: info?.operationTypeId,
      operationName: info?.operationName,
      efficiency: manufactureInfo.efficiency,
      noOfTeeth: noOfTeeth,
      outerDiameter: outerDiameter,
      rootDiameter: rootDiameter,
      workpieceInnerDia: workpieceInnerDia,
      workpieceOuterDia: workpieceOuterDia,
      moduleTeethThickness: lengthOfCut,
      faceWidthTeethLength: widthOfCut,
      wholeDepth: totalDepOfCut,
      hobDiameter: hobDiameter,
      noOfStarts: noOfStarts,
      noOfPasses: noOfPasses,
      cuttingSpeed: cuttingTime,
      rpm: hobspeedRoughing,
      feed: finishCutMatAllowance,
      depthOfCut: depthOfCutRoughing,
      approach: hobApproachRoughing,
      noOfComponents: noOfMultiples,
      machingTime: totalHobRoughing,
      handlingTime: handlingTime,
      cycleTime: cycleTime,
    };
    this.debug && console.table(logCalc);
    return manufactureInfo;
  }
}
