import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { FormGroupKeys } from 'src/app/shared/enums/manufacturing-formgroups.enum';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { CommodityType, CostingConfig, MachineType, PrimaryProcessType, ProcessType, SamplingLevel, ScreeName, StampingType } from 'src/app/modules/costing/costing.config';
import { FieldColorsDto } from '../models/field-colors.model';
import { PartComplexity } from '../enums';
import { MaterialInfoDto, MedbMachinesMasterDto, MedbProcessTypeMasterDto } from '../models';
import { WiringHarnessConfig } from 'src/app/shared/config/wiring-harness-config';
import { ManufacturingSemiRigidConfigService } from 'src/app/shared/config/manufacturing-semi-rigid-config';
import { ManufacturingPCBConfigService } from 'src/app/shared/config/manufacturing-pcb-config';
import { MedbMasterService } from '../services';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingHelperService {
  private materialInfo = { weight: 0, scrapPrice: 0, totalCost: 0 };
  constructor(
    public sharedService: SharedService,
    public _manufacturingConfig: ManufacturingConfigService,
    public _costingConfig: CostingConfig,
    private _harnessConfig: WiringHarnessConfig,
    private _pcbConfig: ManufacturingPCBConfigService,
    private _semiRigidConfig: ManufacturingSemiRigidConfigService,
    private medbMasterService: MedbMasterService
  ) {}
  public markFormGroupControls(element: any, processFlag: any, costingManufacturingInfoform: FormGroup) {
    if (!element?.formControlName) return;
    const controlName = element.formControlName;
    const formGroupKeys = [
      // 'costingManufacturingInfoform',
      processFlag.IsProcessElectronics && 'electronicsFormGroup',
      processFlag.IsProcessMachining && 'machiningFormGroup',
      processFlag.IsProcessCleaningForging && 'cleaningForgingFormGroup',
      processFlag.IsProcessBilletHeatingForging && 'billetHeatingForgingFormGroup',
      processFlag.IsProcessTestingMpiForging && 'testingMpiForgingFormGroup',
      processFlag.IsProcessTrimmingHydraulicForging && 'trimmingHydraulicForgingFormGroup',
      processFlag.IsProcessStraighteningOptionalForging && 'straighteningOptionalForgingFormGroup',
      processFlag.IsProcessPiercingHydraulicForging && 'piercingHydraulicForgingFormGroup',
      processFlag.IsProcessTubeBending && 'tubeBendingFormGroup',
      processFlag.IsInsulationJacket && 'insulationJacketFormGroup',
      'assemblyFormGroup',
      processFlag.IsProcessBrazing && 'brazingFormGroup',
      processFlag.IsCasting && 'castingFormGroup',
      (processFlag.IsMetalTubeExtrusion || processFlag.IsMetalExtrusion) && 'metalExtrusionFormGroup',
      (processFlag.IsProcessPlasticTubeExtrusion || processFlag.IsProcessPlasticConvolutedTubeExtrusion) && 'plasticTubeExtrusionFormGroup',
      // processFlag.IsProcessPlasticVacuumForming && 'plasticVacuumFormingFormGroup',
      processFlag.IsProcessCustomCable && 'customCableFormGroup',
      processFlag.IsProcessWiringHarness && 'wiringHarnessFormGroup',
      'sustainabilityFormGroup',
    ].filter(Boolean);
    if (element.isTouched) {
      costingManufacturingInfoform.get(controlName)?.markAsTouched();
    }
    if (element.isDirty) {
      costingManufacturingInfoform.get(controlName)?.markAsDirty();
    }
    formGroupKeys.forEach((key) => {
      // const formGroup = context[key];
      // const formGroup = getFormGroup(key);
      const formGroup = costingManufacturingInfoform.get(key) as FormGroup;
      if (element.isTouched) {
        formGroup?.get(controlName)?.markAsTouched();
      }
      if (element.isDirty) {
        formGroup?.get(controlName)?.markAsDirty();
      }
    });
  }

  getSubFormGroup(processFlag, getFormGroup: (key: FormGroupKeys) => any): any {
    const processChecks: [boolean, FormGroupKeys][] = [
      [processFlag.IsProcessMachining, FormGroupKeys.Machining],
      [processFlag.IsProcessElectronics, FormGroupKeys.Electronics],
      [processFlag.IsProcessCleaningForging, FormGroupKeys.CleaningForging],
      [processFlag.IsProcessBilletHeatingForging, FormGroupKeys.BilletHeatingForging],
      [processFlag.IsProcessTestingMpiForging, FormGroupKeys.TestingMpiForging],
      [processFlag.IsProcessTrimmingHydraulicForging, FormGroupKeys.TrimmingHydraulicForging],
      [processFlag.IsProcessStraighteningOptionalForging, FormGroupKeys.StraighteningOptionalForging],
      [processFlag.IsProcessPiercingHydraulicForging, FormGroupKeys.PiercingHydraulicForging],
      [processFlag.IsProcessTubeBending, FormGroupKeys.TubeBending],
      [processFlag.IsInsulationJacket, FormGroupKeys.InsulationJacket],
      [processFlag.IsProcessBrazing, FormGroupKeys.Brazing],
      [processFlag.IsCasting && !processFlag.IsSecondaryProcess, FormGroupKeys.Casting],
      [processFlag.IsMetalTubeExtrusion || processFlag.IsMetalExtrusion, FormGroupKeys.MetalExtrusion],
      [processFlag.IsProcessPlasticTubeExtrusion || processFlag.IsProcessPlasticConvolutedTubeExtrusion, FormGroupKeys.PlasticTubeExtrusion],
      [processFlag.IsProcessPlasticVacuumForming, FormGroupKeys.CompressionMolding],
      [processFlag.IsProcessTypeCompressionMolding, FormGroupKeys.CompressionMolding],
      [processFlag.IsProcessTypeTransferMolding, FormGroupKeys.CompressionMolding],
      [processFlag.IsProcessTypePlasticCutting, FormGroupKeys.CompressionMolding],
      [processFlag.IsProcessCustomCable, FormGroupKeys.CustomCable],
      [processFlag.IsProcessWiringHarness, FormGroupKeys.WiringHarness],
      [processFlag.IsProcessTubeLaser || processFlag.IsProcessTubeBendingMetal, FormGroupKeys.SheetMetalProcess],
    ];
    for (const [flag, key] of processChecks) {
      if (flag) return getFormGroup(key);
    }
    return false;
  }

  getSubFormGroupSustainability(getFormGroup: (key: FormGroupKeys) => any): any {
    // const processChecks: [boolean, FormGroupKeys][] = [[true, FormGroupKeys.Sustainability]];
    // for (const [flag, key] of processChecks) {
    //   if (flag) return getFormGroup(key);
    // }
    // return false;
    return getFormGroup(FormGroupKeys.Sustainability) ?? false;
  }

  getMatchingFormGroupByElement(el: string, processFlag, getFormGroup: (key: FormGroupKeys) => any): any {
    const formMap: { el: string; flag: boolean; key: FormGroupKeys }[] = [
      { el: 'machiningFormGroup', flag: processFlag.IsProcessMachining, key: FormGroupKeys.Machining },
      { el: 'cleaningForgingFormGroup', flag: processFlag.IsProcessCleaningForging, key: FormGroupKeys.CleaningForging },
      { el: 'billetHeatingForgingFormGroup', flag: processFlag.IsProcessBilletHeatingForging, key: FormGroupKeys.BilletHeatingForging },
      { el: 'testingMpiForgingFormGroup', flag: processFlag.IsProcessTestingMpiForging, key: FormGroupKeys.TestingMpiForging },
      { el: 'trimmingHydraulicForgingFormGroup', flag: processFlag.IsProcessTrimmingHydraulicForging, key: FormGroupKeys.TrimmingHydraulicForging },
      { el: 'straighteningOptionalForgingFormGroup', flag: processFlag.IsProcessStraighteningOptionalForging, key: FormGroupKeys.StraighteningOptionalForging },
      { el: 'piercingHydraulicForgingFormGroup', flag: processFlag.IsProcessPiercingHydraulicForging, key: FormGroupKeys.PiercingHydraulicForging },
      { el: 'tubeBendingFormGroup', flag: processFlag.IsProcessTubeBending, key: FormGroupKeys.TubeBending },
      { el: 'insulationJacketFormGroup', flag: processFlag.IsInsulationJacket, key: FormGroupKeys.InsulationJacket },
      { el: 'electronicsFormGroup', flag: processFlag.IsProcessElectronics, key: FormGroupKeys.Electronics },
      { el: 'assemblyFormGroup', flag: processFlag.IsProcessAssembly, key: FormGroupKeys.Assembly },
      { el: 'brazingFormGroup', flag: processFlag.IsProcessBrazing, key: FormGroupKeys.Brazing },
      { el: 'castingFormGroup', flag: processFlag.IsCasting, key: FormGroupKeys.Casting },
      { el: 'metalExtrusionFormGroup', flag: processFlag.IsMetalTubeExtrusion || processFlag.IsMetalExtrusion, key: FormGroupKeys.MetalExtrusion },
      { el: 'plasticTubeExtrusionFormGroup', flag: processFlag.IsProcessPlasticTubeExtrusion || processFlag.IsProcessPlasticConvolutedTubeExtrusion, key: FormGroupKeys.PlasticTubeExtrusion },
      // { el: 'plasticVacuumFormingFormGroup', flag: processFlag.IsProcessPlasticVacuumForming, key: FormGroupKeys.PlasticVacuumForming },
      {
        el: 'compressionMoldingFormGroup',
        flag: processFlag.IsProcessTypeCompressionMolding || processFlag.IsProcessPlasticVacuumForming || processFlag.IsProcessTypeThermoForming,
        key: FormGroupKeys.CompressionMolding,
      },
      { el: 'compressionMoldingFormGroup', flag: processFlag.IsProcessTypeTransferMolding, key: FormGroupKeys.CompressionMolding },
      { el: 'compressionMoldingFormGroup', flag: processFlag.IsProcessTypePlasticCutting, key: FormGroupKeys.CompressionMolding },
      { el: 'customCableFormGroup', flag: processFlag.IsProcessCustomCable, key: FormGroupKeys.CustomCable },
      { el: 'wiringHarnessFormGroup', flag: processFlag.IsProcessWiringHarness, key: FormGroupKeys.WiringHarness },
      { el: 'sustainabilityFormGroup', flag: true, key: FormGroupKeys.Sustainability },
      { el: 'sheetMetalProcessFormGroup', flag: processFlag.IsProcessTubeLaser, key: FormGroupKeys.SheetMetalProcess },
      { el: 'sheetMetalProcessFormGroup', flag: processFlag.IsProcessTubeBendingMetal, key: FormGroupKeys.SheetMetalProcess },
    ];
    const match = formMap.find((item) => item.el === el && item.flag);
    return match ? getFormGroup(match.key) : false;
  }

  getMaterialObjectTotals(materialInfoList: MaterialInfoDto[]) {
    let totalCost = 0;
    let totWeight = 0;
    let totscrapPrice = 0;
    const materialInfoItem = this.materialInfo;
    materialInfoList?.forEach(function (x) {
      totalCost = totalCost + x.netMatCost;
    });
    materialInfoList?.forEach(function (x) {
      totWeight = totWeight + x.netWeight;
    });
    materialInfoList?.forEach(function (x) {
      totscrapPrice = totscrapPrice + (x.scrapPricePerKg ?? 0);
    });
    materialInfoItem.scrapPrice = totscrapPrice;
    materialInfoItem.weight = totWeight;
    materialInfoItem.totalCost = totalCost;
    return materialInfoItem;
  }

  showAddProcessButtonPatches(machiningOperationTypeFormArray: FormGroup[], index: number, operationType: number, operationNameList: any[]) {
    machiningOperationTypeFormArray[index].patchValue({ operationTypeId: operationType });
    const opName = operationNameList.find((x) => x.id == operationType)?.name || '';
    let opNameIndex = 0;
    for (let i = 0; i < machiningOperationTypeFormArray.length; i++) {
      const info = machiningOperationTypeFormArray[i];
      if (info?.value.operationTypeId === operationType) {
        opNameIndex++;
      }
    }
    machiningOperationTypeFormArray[index].patchValue({
      operationName: opName ? opName + '-' + opNameIndex : '',
    });
  }

  calculateCostSetValue(costingManufacturingInfoformCntrl, yieldPer, fieldColorsList, processFlag, defaultValue, manufacturingObj) {
    if (!costingManufacturingInfoformCntrl['yieldPer'].dirty) {
      yieldPer = this.sharedService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
    } else {
      yieldPer = costingManufacturingInfoformCntrl['yieldPer'].value || yieldPer;
    }
    costingManufacturingInfoformCntrl['yieldPer'].setValue(Number(yieldPer));
    defaultValue.samplingRate =
      !processFlag.IsCasting || processFlag.IsSecondaryProcess || processFlag.IsProcessMachining
        ? //  ||
          // (processFlag.IsCasting && (processFlag.IsRadiographyForCasting || processFlag.IsMetullurgicalForCasting || processFlag.IsManualInspectionForCasting))
          defaultValue.samplingRate
        : 0;
    let samplingRate = 0;
    if (!costingManufacturingInfoformCntrl['samplingRate'].dirty) {
      samplingRate = this.sharedService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : defaultValue.samplingRate;
    } else {
      samplingRate = costingManufacturingInfoformCntrl['samplingRate'].value;
    }
    costingManufacturingInfoformCntrl['samplingRate'].setValue(Number(samplingRate));
  }

  calculateCostWeldingSetValue(costingManufacturingInfoformCntrl, laborCountByMachineType, fieldColorsList, manufacturingObj) {
    const machineType = Number(costingManufacturingInfoformCntrl['semiAutoOrAuto'].value);
    const machineObj = laborCountByMachineType?.find((x) => x.machineTypeId === machineType);
    let noOfLowSkilledLabours = machineObj?.lowSkilledLaborRate || 0.5;
    if (!costingManufacturingInfoformCntrl['noOfLowSkilledLabours'].dirty) {
      noOfLowSkilledLabours = this.sharedService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
    } else {
      noOfLowSkilledLabours = costingManufacturingInfoformCntrl['noOfLowSkilledLabours'].value;
    }
    costingManufacturingInfoformCntrl['noOfLowSkilledLabours'].setValue(Number(noOfLowSkilledLabours));
    let machineHourRate = this._manufacturingConfig.getMachineHourRateByMachineType(manufacturingObj, machineType) || costingManufacturingInfoformCntrl['machineHourRate'].value;
    if (!costingManufacturingInfoformCntrl['machineHourRate'].dirty) {
      machineHourRate = this.sharedService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : machineHourRate;
    } else {
      machineHourRate = costingManufacturingInfoformCntrl['machineHourRate'].value;
    }
    costingManufacturingInfoformCntrl['machineHourRate'].setValue(Number(machineHourRate));
  }

  setLaborRateBasedOnCountrySetValue(costingManufacturingInfoformCntrl, fieldColorsList, laborRateInfo, commodityId: number, processFlag, machineMaster?: MedbMachinesMasterDto) {
    if (
      !(processFlag.IsProcessTypeCutting || processFlag.IsProcessTypeBending || processFlag.IsProcessTypeStampingProgressive || processFlag.IsProcessTypeStamping || processFlag.IsProcessTypeWelding)
    ) {
      if (!this.sharedService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList) && !this.sharedService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList)) {
        costingManufacturingInfoformCntrl['lowSkilledLaborRatePerHour'].setValue(this.sharedService.isValidNumber(laborRateInfo.laborLowSkilledCost));
      }
    }
    if (commodityId !== CommodityType.MetalForming && commodityId !== CommodityType.PlasticAndRubber && !processFlag.IsProcessTypeWelding && commodityId !== CommodityType.Casting) {
      if (!this.sharedService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) && !this.sharedService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList)) {
        costingManufacturingInfoformCntrl['noOfLowSkilledLabours'].setValue(this.sharedService.isValidNumber(machineMaster?.machineMarketDtos[0]?.noOfLowSkilledLabours));
      }
    }
  }

  setSamplingDataValues(costingManufacturingInfoform, currentPartLotSize, defaultValues, data, fieldColorsList, manufacturingObj) {
    let forgingShapeFactor = 0;
    const processingForm = costingManufacturingInfoform?.value;
    const inspectionType = processingForm?.inspectionType || 1;
    const lotSize = currentPartLotSize ? currentPartLotSize : 0;
    // let insplevel = inspectionType == SamplingLevel.None ? data?.inspectionLevel0 :
    //   inspectionType == SamplingLevel.Level1 ? data?.inspectionLevel1 :
    //     inspectionType == SamplingLevel.Level2 ? data?.inspectionLevel2 : data?.inspectionLevel3;
    let insplevel;
    if (inspectionType == SamplingLevel.None) {
      insplevel = data?.inspectionLevel0;
    } else if (inspectionType == SamplingLevel.Level1) {
      insplevel = data?.inspectionLevel1;
    } else if (inspectionType == SamplingLevel.Level2) {
      insplevel = data?.inspectionLevel2;
    } else {
      insplevel = data?.inspectionLevel3;
    }
    let rate = this.sharedService.isValidNumber((Number(insplevel) / Number(lotSize)) * 100);
    defaultValues.samplingRate = Number(rate);
    if (this.sharedService.checkDirtyProperty('samplingRate', fieldColorsList) || manufacturingObj?.samplingRate) {
      rate = this.sharedService.isValidNumber(manufacturingObj?.samplingRate);
    }
    if (!this.sharedService.checkDirtyProperty('forgingShapeFactor', fieldColorsList)) {
      forgingShapeFactor = this._costingConfig.partComplexityValues().find((x) => x.id == Number(inspectionType))?.ShapeFactor || 0;
    } else {
      forgingShapeFactor = this.sharedService.isValidNumber(manufacturingObj?.forgingShapeFactor);
    }
    costingManufacturingInfoform.patchValue({
      samplingRate: this.sharedService.isValidNumber(Number(rate)),
      inspectionLevelValue: insplevel,
      forgingShapeFactor: forgingShapeFactor,
    });
  }

  setSamplingDataValuesForStitching(costingManufacturingInfoform, defaultValues, currentPartLotSize, data) {
    const processingForm = costingManufacturingInfoform?.value;
    const inspectionType = processingForm?.inspectionType;
    const lotSize = currentPartLotSize ? currentPartLotSize : 0;
    // let insplevel = inspectionType == SamplingLevel.None ? data?.inspectionLevel0 :
    //   inspectionType == SamplingLevel.Level1 ? data?.inspectionLevel1 :
    //     inspectionType == SamplingLevel.Level2 ? data?.inspectionLevel2 : data?.inspectionLevel3;
    let insplevel;
    if (inspectionType === SamplingLevel.None) {
      insplevel = data?.inspectionLevel0;
    } else if (inspectionType === SamplingLevel.Level1) {
      insplevel = data?.inspectionLevel1;
    } else if (inspectionType === SamplingLevel.Level2) {
      insplevel = data?.inspectionLevel2;
    } else {
      insplevel = data?.inspectionLevel3;
    }
    let rate = this.sharedService.isValidNumber((Number(insplevel) / Number(lotSize)) * 100);
    if (inspectionType === SamplingLevel.None) {
      rate = 0;
    }
    defaultValues.samplingRate = Number(rate);
    // if (this._manufacturingConfig.checkDirtyProperty('samplingRate', this.fieldColorsList)) {
    //   rate = this.sharedService.isValidNumber(this.manufacturingObj?.samplingRate);
    // }
    costingManufacturingInfoform.patchValue({
      samplingRate: this.sharedService.isValidNumber(Number(rate)),
      inspectionLevelValue: insplevel,
    });
  }

  processTypesListSort(groupToValues: { [key: string]: any }): { group: string; data: any }[] {
    return Object.keys(groupToValues)
      .map((key) => ({
        group: key === 'null' ? '' : key,
        data: groupToValues[key],
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }

  saveColoringModel(frm, el, selectedProcessInfoId, partInfoId) {
    const fieldColorsDto = new FieldColorsDto();
    fieldColorsDto.isDirty = frm.controls[el].dirty;
    fieldColorsDto.formControlName = el;
    fieldColorsDto.isTouched = frm.controls[el].touched;
    fieldColorsDto.partInfoId = partInfoId;
    fieldColorsDto.screenId = ScreeName.Manufacturing;
    fieldColorsDto.primaryId = selectedProcessInfoId;
    fieldColorsDto.subProcessIndex = null;
    return fieldColorsDto;
  }

  setFormSubProcessType(processType, formingLargerLength, bendWithLargerLength, axisWiseLength, conversionValue, isEnableUnitConversion) {
    return {
      isBlankingPunching: processType === StampingType.BlankingPunching,
      isForming: processType === StampingType.Forming,
      isDrawing: processType === StampingType.Drawing,
      isBending: processType === StampingType.Bending,
      isPiercing: processType === StampingType.Piercing,
      isCoining: processType === StampingType.Coining,
      isCompound: processType === StampingType.Compound,
      isShallowDrawRect: processType === StampingType.ShallowDrawRect,
      isRedrawRect: processType === StampingType.RedrawRect,
      isShallowDrawCir: processType === StampingType.ShallowDrawCir,
      isRedrawCir: processType === StampingType.RedrawCir,
      isTrimming: processType === StampingType.Trimming,
      recommendTonnage: 0,
      formLength: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormLength : 0,
      formHeight: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormHeight : 0,
      hlFactor: this.sharedService.extractedProcessData?.LengthOfCut ? this.sharedService.extractedProcessData?.HlFactor : 0,
      lengthOfCut:
        processType === StampingType.Piercing
          ? this.sharedService.convertUomInUI(this.sharedService.extractedProcessData?.InternalPerimeter ?? 0, conversionValue, isEnableUnitConversion)
          : processType === StampingType.BlankingPunching
            ? this.sharedService.convertUomInUI(this.sharedService.extractedProcessData?.ExternalPerimeter ?? 0, conversionValue, isEnableUnitConversion)
            : this.sharedService.convertUomInUI(this.sharedService.extractedProcessData?.LengthOfCut ?? 0, conversionValue, isEnableUnitConversion),
      bendingLineLength:
        processType === StampingType.Bending
          ? axisWiseLength[0]?.lengthSum || 0
          : this.sharedService.convertUomInUI(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].Length : 0, conversionValue, isEnableUnitConversion),
      shoulderWidth: this.sharedService.convertUomInUI(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].Width : 0, conversionValue, isEnableUnitConversion),
      noOfBends: bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].BendCount : 0,
      formPerimeter: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormPerimeter : 0,
      formingForce: 0,
      noOfHoles: 0,
      blankArea: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormArea : 0,
    };
  }

  recalculateProcessCostModel(processInfo, costingManufacturingInfoformCtrl, currentPart, materialmasterDatas, materialInfo, extractedProcessData, thisMaterialInfo) {
    processInfo.noOfHitsRequired = 1;
    processInfo.inspectionType = costingManufacturingInfoformCtrl['inspectionType'].value || 1;
    processInfo.partInfoId = currentPart.partInfoId;
    processInfo.newToolingRequired = false;
    processInfo.meltTemp = materialmasterDatas?.meltingTemp || 0;
    processInfo.ejecTemp = materialmasterDatas?.ejectDeflectionTemp || 0;
    processInfo.mouldTemp = materialmasterDatas?.moldTemp || 0;
    processInfo.wallAverageThickness = this.sharedService.isValidNumber(materialInfo?.wallAverageThickness);
    processInfo.thermalConductivity = 0.187;
    processInfo.specificHeatCapacity = 2.13;
    processInfo.thermalDiffusivity = materialmasterDatas?.thermalDiffusivity || 0;
    processInfo.sideCoreMechanisms =
      currentPart?.partComplexity == PartComplexity.Low ? 2 : currentPart?.partComplexity == PartComplexity.Medium ? 4 : currentPart?.partComplexity == PartComplexity.High ? 8 : 0;
    processInfo.packAndHoldTime =
      currentPart?.partComplexity == PartComplexity.Low ? 1 : currentPart?.partComplexity == PartComplexity.Medium ? 2 : currentPart?.partComplexity == PartComplexity.High ? 3 : 5;

    processInfo.partEjection =
      currentPart?.partComplexity == PartComplexity.Low ? 3 : currentPart?.partComplexity == PartComplexity.Medium ? 5.5 : currentPart?.partComplexity == PartComplexity.High ? 8 : 0;

    processInfo.others = 0;
    //processInfo.setUpTime = 60;
    processInfo.lowSkilledLaborRatePerHour = Number(costingManufacturingInfoformCtrl['lowSkilledLaborRatePerHour'].value);
    processInfo.noOfLowSkilledLabours = Number(costingManufacturingInfoformCtrl['noOfLowSkilledLabours'].value);
    processInfo.noOfSemiSkilledLabours = Number(costingManufacturingInfoformCtrl['noOfSemiSkilledLabours'].value);
    processInfo.qaOfInspector = Number(costingManufacturingInfoformCtrl['qaOfInspector'].value);
    processInfo.qaOfInspectorRate = Number(costingManufacturingInfoformCtrl['qaOfInspectorRate'].value);
    processInfo.totalToolLendingTime = Number(costingManufacturingInfoformCtrl['totalToolLendingTime'].value);
    processInfo.mfrCountryId = currentPart?.mfrCountryId;
    processInfo.materialmasterDatas = materialmasterDatas;
    processInfo.materialInfo = thisMaterialInfo;
    processInfo.partComplexity = currentPart?.partComplexity;
    processInfo.lotSize = currentPart.lotSize ? currentPart.lotSize : 1;
    processInfo.yieldCost = Number(costingManufacturingInfoformCtrl['yieldCost'].value);
    processInfo.cavityPressure = materialmasterDatas?.clampingPressure || 0;
    processInfo.efficiency = Number(costingManufacturingInfoformCtrl['efficiency'].value);
    processInfo.directLaborCost = costingManufacturingInfoformCtrl['directLaborCost'].value;
    processInfo.skilledLaborRatePerHour = Number(costingManufacturingInfoformCtrl['skilledLaborRatePerHour'].value);
    processInfo.noOfSkilledLabours = Number(costingManufacturingInfoformCtrl['noOfSkilledLabours'].value);
    processInfo.lineOfInspectorRate = Number(costingManufacturingInfoformCtrl['lineOfInspectorRate'].value);
    processInfo.lineOfInspector = Number(costingManufacturingInfoformCtrl['lineOfInspector'].value);
    processInfo.qaOfInspector = Number(costingManufacturingInfoformCtrl['qaOfInspector'].value);
    processInfo.bendingCoeffecient = Number(costingManufacturingInfoformCtrl['bendingCoeffecient'].value);
    const bendWithLargerLength = extractedProcessData?.ProcessBendingInfo?.sort((a, b) => b.Length - a.Length);
    processInfo.lengthOfCut = Number(extractedProcessData?.LengthOfCut);
    processInfo.bendingLineLength = Number(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0]?.Length : 0);
    processInfo.shoulderWidth = Number(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0]?.Width : 0);
    processInfo.cuttingLength = Number(extractedProcessData?.CuttingLength);
    processInfo.innerRadius = Number(extractedProcessData?.InnerRadius);
    processInfo.noOfHoles = Number(extractedProcessData?.NoOfHoles);
    processInfo.noOfStartsPierce = Number(extractedProcessData?.NoOfStartsPierce) || processInfo.noOfStartsPierce;
    processInfo.partThickness = Number(extractedProcessData?.PartThickness);
    processInfo.noofStroke = Number(extractedProcessData?.NoOfStrokes) || 1;
    processInfo.lengthOfCutInternal = Number(extractedProcessData?.LengthOfCutInternal);
    processInfo.noOfCavities = Number(materialInfo?.noOfCavities);
    !processInfo.weldingPosition && (processInfo.weldingPosition = 1);
  }

  machineDescChangeOnNotEdit(result, processFlag, currentPartEav, costingManufacturingInfoform, machiningFlags, conversionValue, isEnableUnitConversion) {
    let setuptime = 0;
    const setUpTimeinHour = result?.setUpTimeinHour || result?.machineMarketDtos?.[0]?.setUpTimeinHour || 0;
    if (setUpTimeinHour > 0) {
      setuptime = this.sharedService.isValidNumber(Number(setUpTimeinHour) * 60);
    } else if (processFlag.IsProcessTypeInjectionMolding) {
      setuptime = 60;
    }
    costingManufacturingInfoform.patchValue({
      setUpTime: setuptime,
      efficiency: result?.machineMarketDtos.length > 0 ? result?.machineMarketDtos[0].efficiency : 0,
      selectedTonnage: result?.machineTonnageTons || 0,
    });
    if (processFlag.IsProcessMelting || processFlag.IsMeltingForCasting || processFlag.IsPouringForCasting) {
      costingManufacturingInfoform.controls['furnaceCapacityTon'].setValue(result?.furnaceCapacityTon || 0);
    }
    costingManufacturingInfoform.patchValue({
      sandShooting: result?.sandShootingSpeed || 0,
      machineCapacity: this.sharedService.convertUomInUI(result?.machineCapacity, conversionValue, isEnableUnitConversion),
      dryCycleTime: result?.machineDryCycleTimeInSec,
      bourdanRate: result?.burdenRate,
      semiAutoOrAuto: this._manufacturingConfig.setMachineTypeIdByName(result?.machineMarketDtos[0].machineType),
      furnaceOutput: 32,
    });
    (machiningFlags.isTurning || machiningFlags.isMilling) && costingManufacturingInfoform.controls['sheetLoadUloadTime']?.setValue(result?.toolChangingCycleTimeInSec); // toolChangingCycleTimeInSec
  }

  setSubProcessListForHarness(processTypeId: number) {
    this.medbMasterService.getProcessTypeList(processTypeId?.toString()).subscribe((result) => {
      return result;
    });
  }

  setSubProcessList(processTypeId: number, primaryProcessId: number, materialInfoList: MaterialInfoDto[], corePrepSubProcessIds: number[] = []): Observable<any> {
    if (
      [
        ProcessType.CablePreparation,
        ProcessType.LineAssembly,
        ProcessType.FinalInspection,
        ProcessType.ConduitTubeSleeveHSTPreparation,
        ProcessType.FunctionalTestCableHarness,
        ProcessType.EMPartAssemblyTesting,
      ].includes(processTypeId)
    ) {
      const mappedId = this._harnessConfig.getHarnessMappingId(processTypeId);
      return this.medbMasterService
        .getProcessTypeList(mappedId.toString())
        .pipe(map((processes: MedbProcessTypeMasterDto[]) => processes.sort((a, b) => a.primaryProcess.localeCompare(b.primaryProcess))));
    } else if (primaryProcessId === PrimaryProcessType.ConventionalPCB) {
      return of(this._pcbConfig.getSubProcessList(processTypeId));
    } else if (primaryProcessId === PrimaryProcessType.SemiRigidFlex) {
      return of(this._semiRigidConfig.getSubProcessList(processTypeId));
    } else if ([ProcessType.Stage, ProcessType.Progressive, ProcessType.TransferPress].includes(processTypeId)) {
      return of(this._manufacturingConfig._sheetMetalConfig.getStampingSubProcessList());
    } else if (ProcessType.CastingCorePreparation === processTypeId) {
      return of(this._manufacturingConfig._castingConfig.getCastingCorePreparationSubProcessList(materialInfoList, corePrepSubProcessIds));
    } else {
      return of([]);
    }
  }

  setSemiAutoOrAutoValue(result: any, forgingCutting, costingManufacturingInfoform): void {
    if (!result?.machineMarketDtos?.length || !result?.machineMarketDtos[0].machineType) return;
    if (forgingCutting.bandSawCutting || forgingCutting.stockShearing) {
      // forging cutting saw
      costingManufacturingInfoform.controls['semiAutoOrAuto'].setValue(MachineType.SemiAuto); // Semi-Automatic
    }
    // else {
    //   costingManufacturingInfoform.controls['semiAutoOrAuto'].setValue(this._manufacturingConfig.setMachineTypeIdByName(result?.machineMarketDtos[0].machineType));
    // }
  }
}
