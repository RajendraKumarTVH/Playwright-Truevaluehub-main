
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { SubProcessTypeInfoDto } from '../models/subprocess-info.model';
import { CommodityType, CostingConfig, PrimaryProcessType, ProcessType, ScreeName } from 'src/app/modules/costing/costing.config';
import { PartInfoDto, ProcessInfoDto } from '../models';
import { FieldColorsDto } from '../models/field-colors.model';

export class ManufacturingForgingSubProcessConfigService {
  conversionValue: any;
  isEnableUnitConversion: any;

  loadingUnloadingTimeLookup = [
    { weightFrom: 0, weightTo: 1, loadingTime: 1.8, unloadingTime: 1.7 },
    { weightFrom: 1, weightTo: 3, loadingTime: 2.5, unloadingTime: 2.4 },
    { weightFrom: 3, weightTo: 5, loadingTime: 3.3, unloadingTime: 3.2 },
    { weightFrom: 5, weightTo: 10, loadingTime: 4.4, unloadingTime: 4.2 },
    { weightFrom: 10, weightTo: 20, loadingTime: 6, unloadingTime: 5.7 },
    { weightFrom: 20, weightTo: 30, loadingTime: 7.8, unloadingTime: 7.5 },
    { weightFrom: 30, weightTo: 50, loadingTime: 8.5, unloadingTime: 8.2 },
    { weightFrom: 50, weightTo: 80, loadingTime: 11.5, unloadingTime: 11.2 },
    { weightFrom: 80, weightTo: 120, loadingTime: 15, unloadingTime: 14.5 },
    { weightFrom: 120, weightTo: 200, loadingTime: 19.5, unloadingTime: 18.9 },
    { weightFrom: 200, weightTo: 300, loadingTime: 26.5, unloadingTime: 25.8 },
    { weightFrom: 300, weightTo: 1000, loadingTime: 33.8, unloadingTime: 33 },
  ];

  machineThresholdsBilletHeatingContinuousFurnace = [
    { max: 10, name: 'Billet Heating-Induction_500kw_1 Module_USA' },
    { max: 20, name: 'Billet Heating-Induction_900kw_2 Module_USA' },
    { max: 30, name: 'Billet Heating-Induction_1250kw_3 Module_USA' },
    { max: 40, name: 'Billet Heating-Induction_2000kw_4 Module_USA' },
    { max: 50, name: 'Billet Heating-Induction_2500kw_5 Module_USA' },
    { max: Infinity, name: 'Billet Heating-Induction_3000kw_6 Module_USA' },
  ];

  billetHeatingSpecificHeatLookup = [
    { key: 'steel', value: 0.5 },
    { key: 'aluminum', value: 0.9 },
    { key: 'copper', value: 0.385 },
    { key: 'brass', value: 0.38 },
    { key: 'titanium', value: 0.52 },
  ];

  bandSawCuttingSpeedLookup = [
    { key: 'aluminum', value: 200 },
    { key: 'copper', value: 133 },
    { key: 'magnesium', value: 167 },
    { key: 'alloy steel', value: 75 },
    { key: 'carbon steel', value: 92 },
    { key: 'stainless steel', value: 58 },
    { key: 'brass', value: 83 },
  ];

  bandSawCuttingMachines = [
    'Band Saw_H330xW900mm_USA',
    'Band Saw_H330xW330mm_USA',
    'Band Saw_H430xW455mm_USA',
    'Band Saw_H355xW482mm_USA',
    'Band Saw_H560xW610mm_USA',
    'Band Saw_H670xW635mm_USA',
    'Band Saw_H700xW800mm_USA',
    'Band Saw_H1500xW1500mm_China',
    'Band Saw_H1600xW1600mm_China',
    'Band Saw_H1800xW1800mm_China',
    'Band Saw_H2000xW2000mm_China',
    'Band Saw_Ø250xL1000mm_China',
    'Band Saw_Ø50xL1000mm_USA',
    'EV_HBS-1',
    'EV_TS-1',
  ];

  stockShearingMachines = [
    'Stock Shearing _200T_Ø30mm_India',
    'Stock Shearing _500T_Ø50mm_India',
    'Stock Shearing _800T_Ø55mm_India',
    'Stock Shearing _1500T_Ø75mm_India',
    'Stock Shearing _2000T_Ø100mm_India',
    'Stock Shearing _4000T_Ø125mm_India',
    'Stock Shearing _5000T_Ø155mm_India',
  ];

  /**
   * Forging Press Capacity (Tons) to Typical Stroke Time (seconds) lookup table
   * Based on hydraulic forging press standards
   */
  forgingColdClosedCapacityToStrokeTime: { [key: number]: number } = {
    250: 3,
    315: 3,
    400: 4,
    500: 4,
    630: 5,
    800: 5,
    1000: 6,
    1250: 6,
    1600: 7,
    2000: 8,
    2500: 9,
    3150: 10,
    4000: 11,
  };

  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService,
    private _costingConfig: CostingConfig
  ) { }

  setForgingFlags(processTypeId: number, commodityId: number, materialProcessId: number) {
    return {
      hotForgingClosedDieHot: processTypeId === ProcessType.HotClosedDieForging,
      hotForgingOpenDieHot: processTypeId === ProcessType.HotOpenDieForging,
      coldForgingClosedDieCold: processTypeId === ProcessType.ClosedDieForging,
      cutting: processTypeId === ProcessType.SawCutting,
      stockHeating: processTypeId === ProcessType.StockHeating,
      heatTreatment: processTypeId === ProcessType.HeatTreatment,
      stockShearing: processTypeId === ProcessType.StockShearing,
      trimmingPress: processTypeId === ProcessType.TrimmingPressForging && commodityId === CommodityType.MetalForming,
      piercing: processTypeId === ProcessType.Piercing && commodityId === CommodityType.MetalForming,
      straightening: processTypeId === ProcessType.Straightening && commodityId === CommodityType.MetalForming,
      control: processTypeId === ProcessType.Control && commodityId === CommodityType.MetalForming,
      testing: processTypeId === ProcessType.Testing && commodityId === CommodityType.MetalForming,
      shotBlasting: processTypeId === ProcessType.ShotBlasting && commodityId === CommodityType.MetalForming && materialProcessId === PrimaryProcessType.HotForgingClosedDieHot,
      shotBlastingforOpenDie: processTypeId === ProcessType.ShotBlasting && commodityId === CommodityType.MetalForming && materialProcessId === PrimaryProcessType.HotForgingOpenDieHot,
      lubricationPhosphating: processTypeId === ProcessType.LubricationPhosphating && commodityId === CommodityType.MetalForming,
      threadRolling: processTypeId === ProcessType.ThreadRolling && materialProcessId === PrimaryProcessType.ColdForgingClosedDieHot && commodityId === CommodityType.MetalForming,
      threadRollingColdHeadingForging: processTypeId === ProcessType.ThreadRolling && materialProcessId === PrimaryProcessType.ColdForgingColdHeading && commodityId === CommodityType.MetalForming,
      coldColdHeadingForging: processTypeId === ProcessType.ColdHeading && materialProcessId === PrimaryProcessType.ColdForgingColdHeading && commodityId === CommodityType.MetalForming,
      billetHeatingContinuousFurnace:
        processTypeId === ProcessType.BilletHeatingContinuousFurnace && materialProcessId === PrimaryProcessType.HotForgingClosedDieHot && commodityId === CommodityType.MetalForming,
      billetHeating:
        processTypeId === ProcessType.BilletHeating &&
        [PrimaryProcessType.HotForgingClosedDieHot, PrimaryProcessType.HotForgingOpenDieHot].includes(materialProcessId) &&
        commodityId === CommodityType.MetalForming,
    };
  }

  clearForgingFlags() {
    return {
      forging: {
        hotForgingClosedDieHot: false,
        hotForgingOpenDieHot: false,
        coldForgingClosedDieCold: false,
        cutting: false,
        stockHeating: false,
        heatTreatment: false,
        trimmingPress: false,
        piercing: false,
        shotBlasting: false,
        straightening: false,
        control: false,
        testing: false,
        lubricationPhosphating: false,
        threadRolling: false,
        threadRollingColdHeadingForging: false,
        coldColdHeadingForging: false,
        billetHeating: false,
        isMaterialStockFormRectangleBar: false,
        billetHeatingContinuousFurnace: false,
      },
      forgingCutting: {
        bandSawCutting: false,
        stockShearing: false,
      },
    };
  }
  getForgingFormFields() {
    return {
      subProcessList: this.formbuilder.array([]),
      subProcessInfoId: 0, //
      subProcessTypeID: 0,
      // processInfoId: selectedProcessInfoId || 0,//
      // helixAngle: 0,
      // pitchDiameter: 0,
      // spiralAngle: 0,
      // formPerimeter: 0,
      // blankArea: 0,
      // pressureAngle: 0,
      // moldTemp: 0,
      // workpieceInitialDia: 0,
      // workpieceFinalDia: 0,
      // workpieceOuterDia: 0,
      // workpieceInnerDia: 1.2,
      // formingForce: 0,
      // partInitialDia: 0,
      // finalGrooveDia: 0,
      // widthOfCut: 0,
      // totalDepOfCut: 0,
      // wheelDiameter: 0,
      // wheelWidth: 0,
      // isWorkpieceOuterDiaDirty: false,
    };
  }
  //getDynamicFormGroup(subprocessInfo: SubProcessTypeInfoDto, processFlags: any): FormGroup {
  getDynamicFormGroup(subprocessInfo: SubProcessTypeInfoDto): FormGroup {
    const formGroup = this.formbuilder.group({
      ...this.fillSubprocessInforDto(subprocessInfo),
    });
    return formGroup;
  }

  forgingFormPatch(manufactureInfo: ProcessInfoDto) {
    const resultArray = this.formbuilder.array([]) as FormArray;
    manufactureInfo?.subProcessTypeInfos?.forEach((subProcess) => {
      const formGroup = this.formbuilder.group({
        subProcessInfoId: null,
        subProcessTypeID: subProcess.subProcessTypeId,
        helixAngle: subProcess.helixAngle,
        pitchDiameter: subProcess.pitchDiameter,
        spiralAngle: subProcess.spiralAngle,
        formPerimeter: subProcess.formPerimeter,
        blankArea: subProcess.blankArea,
        pressureAngle: subProcess.pressureAngle,
        workpieceInitialDia: subProcess.workpieceInitialDia,
        workpieceFinalDia: subProcess.workpieceFinalDia,
        workpieceOuterDia: subProcess.workpieceOuterDia || 0,
        workpieceInnerDia: subProcess.workpieceInnerDia || 0,
        formingForce: subProcess.formingForce || 0,
        partInitialDia: subProcess.partInitialDia || 0,
        finalGrooveDia: subProcess.finalGrooveDia || 0,
        widthOfCut: subProcess.widthOfCut || 0,
        totalDepOfCut: subProcess.totalDepOfCut || 0,
        wheelDiameter: subProcess.wheelDiameter || 0,
        wheelWidth: subProcess.wheelWidth || 0,
        typeOfSplice: subProcess.typeOfSplice || 0,
        //isWorkpieceOuterDiaDirty: subProcess.isWorkpieceOuterDiaDirty || false,
        //isPickAndPlaceParts: subProcess?.subProcessTypeId === AssemblyType.PickAndPlaceParts,
      });
      resultArray.push(formGroup);
    });
    return resultArray;
  }

  convertToFormBuilderArray(formArray: FormArray<any>): FormArray {
    const newArray = this.formbuilder.array([]);
    formArray?.controls?.forEach((control) => {
      newArray.push(new FormControl(control.value));
    });
    return newArray;
  }

  // forgingProcessPayload(formCtrl, conversionValue, isEnableUnitConversion) {
  //   return {
  //     helixAngle: formCtrl['helixAngle'].value,
  //     pitchDiameter: formCtrl['pitchDiameter'].value,
  //     spiralAngle: formCtrl['spiralAngle'].value,
  //     subProcessTypeId: formCtrl['subProcessTypeID'].value,
  //     formPerimeter: formCtrl['formPerimeter'].value,
  //     blankArea: formCtrl['blankArea'].value,
  //     pressureAngle: formCtrl['pressureAngle'].value,
  //     workpieceInitialDia: formCtrl['workpieceInitialDia'].value,
  //     workpieceFinalDia: formCtrl['workpieceFinalDia'].value,
  //     workpieceOuterDia: formCtrl['workpieceOuterDia'].value,
  //     workpieceInnerDia: formCtrl['workpieceInnerDia'].value,
  //     formingForce: formCtrl['formingForce'].value,
  //     partInitialDia: formCtrl['partInitialDia'].value,
  //     finalGrooveDia: formCtrl['finalGrooveDia'].value,
  //     widthOfCut: formCtrl['widthOfCut'].value,
  //     totalDepOfCut: formCtrl['totalDepOfCut'].value,
  //     wheelDiameter: formCtrl['wheelDiameter'].value,
  //     wheelWidth: formCtrl['wheelWidth'].value,
  //   };
  // }

  setForgingSubProcess(selectedProcessInfoId, info, conversionValue, isEnableUnitConversion, _fn = 'defaultReturn') {
    this.conversionValue = conversionValue;
    this.isEnableUnitConversion = isEnableUnitConversion;
    return {
      processInfoId: this.sharedService.isValidNumber(selectedProcessInfoId),
      //subProcessInfoId: info?.subProcessInfoId,
      subProcessTypeID: this.sharedService.isValidNumber(Number(info.subProcessTypeID ?? info.subProcessTypeId)),
      helixAngle: this.sharedService.isValidNumber(Number(info.helixAngle)),
      pitchDiameter: this.sharedService.isValidNumber(Number(info.pitchDiameter)),
      spiralAngle: this.sharedService.isValidNumber(Number(info.spiralAngle)),
      formPerimeter: this.sharedService.isValidNumber(Number(info.formPerimeter)),
      blankArea: this.sharedService.isValidNumber(Number(info.blankArea)),
      pressureAngle: this.sharedService.isValidNumber(Number(info.pressureAngle)),
      workpieceInitialDia: this.sharedService.isValidNumber(Number(info.workpieceInitialDia)),
      workpieceFinalDia: this.sharedService.isValidNumber(Number(info.workpieceFinalDia)),
      workpieceOuterDia: this.sharedService.isValidNumber(Number(info.workpieceOuterDia)),
      workpieceInnerDia: this.sharedService.isValidNumber(Number(info.workpieceInnerDia)),
      formingForce: this.sharedService.isValidNumber(Number(info.formingForce)),
      partInitialDia: this.sharedService.isValidNumber(Number(info.partInitialDia)),
      finalGrooveDia: this.sharedService.isValidNumber(Number(info.finalGrooveDia)),
      widthOfCut: this.sharedService.isValidNumber(Number(info.widthOfCut)),
      totalDepOfCut: this.sharedService.isValidNumber(Number(info.totalDepOfCut)),
      wheelDiameter: this.sharedService.isValidNumber(Number(info.wheelDiameter)),
      wheelWidth: this.sharedService.isValidNumber(Number(info.wheelWidth)),
      typeOfSplice: this.sharedService.isValidNumber(Number(info.typeOfSplice)),
    };
  }

  fillSubprocessInforDto(subprocessInfo: SubProcessTypeInfoDto) {
    return {
      subProcessInfoId: 0,
      subProcessTypeID: subprocessInfo.subProcessTypeId || 0,
      spiralAngle: subprocessInfo.spiralAngle || 0,
      helixAngle: subprocessInfo.helixAngle || 0,
      formPerimeter: subprocessInfo.formPerimeter || 0,
      pitchDiameter: subprocessInfo.pitchDiameter || 0,
      blankArea: subprocessInfo.blankArea || 0,
      pressureAngle: subprocessInfo.pressureAngle || 0,
      workpieceInitialDia: subprocessInfo.workpieceInitialDia || 0,
      workpieceFinalDia: subprocessInfo.workpieceFinalDia || 0,
      workpieceOuterDia: subprocessInfo.workpieceOuterDia || 0,
      workpieceInnerDia: subprocessInfo.workpieceInnerDia || 1.2,
      formingForce: subprocessInfo.formingForce || 0,
      partInitialDia: subprocessInfo.partInitialDia || 0,
      finalGrooveDia: subprocessInfo.finalGrooveDia || 0,
      widthOfCut: subprocessInfo.widthOfCut || 0,
      totalDepOfCut: subprocessInfo.totalDepOfCut || 0,
      wheelDiameter: subprocessInfo.wheelDiameter || 0,
      wheelWidth: subprocessInfo.wheelWidth || 0,
      typeOfSplice: subprocessInfo.typeOfSplice || 0,
    };
  }
  // setCalculationObject(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
  //     manufactureInfo.subProcessTypeID = formCtrl['subProcessTypeID'].value;
  //     manufactureInfo.helixAngle = formCtrl['helixAngle'].value;
  //     manufactureInfo.pitchDiameter = formCtrl['pitchDiameter'].value;
  //     manufactureInfo.spiralAngle = formCtrl['spiralAngle'].value;
  //     manufactureInfo.formPerimeter = formCtrl['formPerimeter'].value;
  //     manufactureInfo.blankArea = formCtrl['blankArea'].value;
  //     manufactureInfo.pressureAngle = formCtrl['pressureAngle'].value;

  // }

  forgingDirtyCheck(manufactureInfo, formCtrl) {
    manufactureInfo.isWorkpieceOuterDiaDirty = formCtrl['workpieceOuterDia'].dirty;
    // manufactureInfo.ispitchDiameterDirty = formCtrl['pitchDiameter'].dirty;
    // manufactureInfo.isformPerimeterDirty = formCtrl['formPerimeter'].dirty;
  }

  defaultReturn(value: number) {
    return value;
  }

  convertUomInUI(value: number) {
    return this.sharedService.convertUomInUI(value, this.conversionValue, this.isEnableUnitConversion);
  }

  convertUomToSaveAndCalculation(value: number) {
    return this.sharedService.convertUomToSaveAndCalculation(value, this.conversionValue, this.isEnableUnitConversion);
  }
  getSubProcessList(): any[] {
    return [
      { id: 1, name: 'Cold Forging-Upsetting' },
      { id: 2, name: 'Cold Forging-Backward extrusion' },
      { id: 3, name: 'Cold Forging-Forward extrusion' },
    ];
  }

  getSubTypeNamebyId(processInfo: ProcessInfoDto) {
    let subProcessName = 'N/A';
    if ([ProcessType.ColdHeading, ProcessType.ClosedDieForging].includes(processInfo?.processTypeID)) {
      if (processInfo?.subProcessTypeInfos && processInfo?.subProcessTypeInfos?.length) {
        const subProcessTypeID = processInfo?.subProcessTypeInfos[0]?.subProcessTypeId;
        const subprocessList = this.getSubProcessList().find((x) => x.id === subProcessTypeID)?.name;
        subProcessName = Array.isArray(subprocessList) ? subprocessList.find((x) => x.id === subProcessTypeID)?.name : typeof subprocessList === 'string' ? subprocessList : 'N/A';
      }
    }
    return subProcessName;
  }

  forgingSetEditCallMethod(
    machineInfo: ProcessInfoDto,
    isColdForgingClosedDieCold: boolean,
    forgingSubProcessFormArray: FormArray<any>,
    selectedProcessInfoId: number,
    conversionValue: any,
    isEnableUnitConversion: boolean
  ) {
    //forging
    if (isColdForgingClosedDieCold) {
      forgingSubProcessFormArray.clear();
      for (let i = 0; i < machineInfo?.subProcessTypeInfos?.length; i++) {
        const info = machineInfo?.subProcessTypeInfos[i];
        const formGroup = this.formbuilder.group({
          ...this.getForgingFormFields(),
          subProcessInfoId: info.subProcessInfoId,
          //...this._manufacturingForgingSubProcessConfigService.fillSubprocessInforDto(info)
          ...this.setForgingSubProcess(selectedProcessInfoId, info, conversionValue, isEnableUnitConversion, 'convertUomInUI'),
        });
        forgingSubProcessFormArray.push(formGroup);
      }
    }
  }

  forgingSubProcessOnFormSubmit(model: ProcessInfoDto, forging: any, forgingSubProcessFormGroup: FormGroup<any>, conversionValue: any, isEnableUnitConversion: boolean) {
    if (forging.coldForgingClosedDieCold || forging.coldColdHeadingForging) {
      const subProcessFormArray = forgingSubProcessFormGroup.controls['subProcessList']?.value;
      for (let i = 0; i < subProcessFormArray?.length; i++) {
        const info = subProcessFormArray[i];
        let subProcessInfo = new SubProcessTypeInfoDto();
        subProcessInfo.subProcessInfoId = 0;
        subProcessInfo = { ...subProcessInfo, ...this.setForgingSubProcess(model.processInfoId, info, conversionValue, isEnableUnitConversion, 'convertUomToSaveAndCalculation') };
        if (model.subProcessTypeInfos == null) {
          model.subProcessTypeInfos = [];
        }
        model.subProcessTypeInfos.push(subProcessInfo);
      }
    }
  }

  saveForgingSubProcessColorInfo(dirtyItems: FieldColorsDto[], isColdForgingClosedDieCold: boolean, forgingSubProcessFormGroup: FormGroup, currentPart: PartInfoDto, selectedProcessInfoId: number) {
    if (isColdForgingClosedDieCold && forgingSubProcessFormGroup?.controls['subProcessList']?.value.length > 0) {
      const subProcessFormArray = forgingSubProcessFormGroup?.controls['subProcessList'] as FormArray;
      for (let i = 0; i < forgingSubProcessFormGroup?.controls['subProcessList']?.value.length; i++) {
        const info = subProcessFormArray.controls[i] as FormGroup;
        //const subProcessInfoId = info?.value?.subProcessTypeID;
        for (const el in info?.controls) {
          //console.log(subProcessFormArray.controls[i].value.controls[el]);
          if ((info.controls[el].dirty || info.controls[el].touched) && el !== 'subProcessTypeID') {
            const fieldColorsDto = new FieldColorsDto();
            fieldColorsDto.isDirty = info.controls[el].dirty;
            fieldColorsDto.formControlName = el;
            fieldColorsDto.isTouched = info.controls[el].touched;
            fieldColorsDto.partInfoId = currentPart.partInfoId;
            fieldColorsDto.screenId = ScreeName.Manufacturing;
            fieldColorsDto.primaryId = selectedProcessInfoId;
            fieldColorsDto.subProcessInfoId = info.controls['subProcessTypeID'].value; //info.controls['subProcessInfoId'].value;//
            dirtyItems.push(fieldColorsDto);
          }
        }
      }
    }
  }

  getForgingSubProcessColorInfo(dirtyItems: FieldColorsDto[], isColdForgingClosedDieCold: boolean, forgingSubProcessFormGroup: FormGroup) {
    if (isColdForgingClosedDieCold && dirtyItems.length > 0) {
      for (let i = 0; i < forgingSubProcessFormGroup?.controls['subProcessList']?.value.length; i++) {
        const subProcessFormArray = forgingSubProcessFormGroup?.controls['subProcessList'] as FormArray;
        const info = subProcessFormArray.controls[i] as FormGroup;
        const subProcessInfoId = info?.value?.subProcessTypeID; //info?.value?.subProcessInfoId;
        for (const el in info?.controls) {
          const ctrlChk = dirtyItems.find((x) => x.subProcessInfoId === subProcessInfoId && x.formControlName === el);
          if (ctrlChk && ctrlChk.isDirty) {
            info.controls[el].markAsDirty();
          }
          if (ctrlChk && ctrlChk.isTouched) {
            info.controls[el].markAsTouched();
          }
        }
      }
    }
  }

  getTestingLoadTimeForPartWeight(partWeight: number): number {
    if (partWeight <= 1) return 3;
    if (partWeight <= 2) return 6;
    if (partWeight <= 5) return 10;
    if (partWeight <= 10) return 15;
    if (partWeight <= 20) return 25;
    if (partWeight <= 50) return 35;
    if (partWeight <= 100) return 50;
    if (partWeight <= 200) return 70;
    return 0;
  }

  getTestingUnloadTimeForPartWeight(partWeight: number): number | 0 {
    if (partWeight <= 1) return 2;
    if (partWeight <= 2) return 4;
    if (partWeight <= 5) return 8;
    if (partWeight <= 10) return 12;
    if (partWeight <= 20) return 20;
    if (partWeight <= 50) return 28;
    if (partWeight <= 100) return 40;
    if (partWeight <= 200) return 56;
    return 0;
  }
}
export enum ColdDieForgingSubProcess {
  ColdForgingUpsetting = 1,
  ColdForgingBackwardExtrusion = 2,
  ColdForgingForwardExtrusion = 3,
}
