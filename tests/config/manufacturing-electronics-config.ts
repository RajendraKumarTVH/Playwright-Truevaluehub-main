import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { SubProcessTypeInfoDto } from '../models/subprocess-info.model';
import { ProcessType } from 'src/app/modules/costing/costing.config';
import { MaterialInfoDto, MedbMachinesMasterDto, ProcessInfoDto } from '../models';
import { ManufacturingPCBConfigService } from './manufacturing-pcb-config';
import { FieldColorsDto } from '../models/field-colors.model';
import { WiringHarnessConfig } from './wiring-harness-config';

export class ElectronicsConfigService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService,
    private _fb: FormBuilder,
    private _pcb: ManufacturingPCBConfigService,
    private _wiringHarness: WiringHarnessConfig
  ) { }

  getFunctionalTestLookup() {
    let list: any[] = [];
    list = [
      { complexity: 1, consumerElectronics: 12, medical: 16, automotive: 16 },
      { complexity: 2, consumerElectronics: 16, medical: 20, automotive: 24 },
      { complexity: 3, consumerElectronics: 20, medical: 24, automotive: 30 },
    ];
    return list;
  }

  getSubProcessList(processTypeId: number) {
    let list: any[] = [];
    if (processTypeId === ProcessType.ThroughHoleLine) {
      list = [
        { id: ThroughHoleLineTypes.AxialCompManualPreforming, name: 'Axial Comp Manual Preforming' },
        { id: ThroughHoleLineTypes.AxialCompSemiPreforming, name: 'Axial Comp Semi Preforming' },
        { id: ThroughHoleLineTypes.RadialComponentManualPreforming, name: 'Radial Component Manual Preforming' },
        { id: ThroughHoleLineTypes.RadialComponentSemiPreforming, name: 'Radial Component Semi Preforming' },
        { id: ThroughHoleLineTypes.AxialCompAutoPlacement, name: 'Axial Comp Auto Placement', automate: true, machine: 'ACAP_VCD 88 HT' },
        { id: ThroughHoleLineTypes.AxialCompManualPlacement, name: 'Axial Comp Manual Placement' },
        { id: ThroughHoleLineTypes.RadialCompAutoPlacement, name: 'Radial Comp Auto Placement', automate: true, machine: 'RCAP_Radial 88 HT' },
        { id: ThroughHoleLineTypes.RadialCompManualPlacement, name: 'Radial Comp Manual Placement' },
        { id: ThroughHoleLineTypes.CustomCompManualPlacement, name: 'Custom Comp Manual Placement' },
        { id: ThroughHoleLineTypes.WaveSoldering, name: 'Wave Soldering', automate: true, machine: 'WS_POWERWAVE 3.0-F' },
        { id: ThroughHoleLineTypes.HandSoldering, name: 'Hand Soldering' },
        { id: ThroughHoleLineTypes.SelectiveSoldering, name: 'Selective Soldering', machine: 'SWS_MySelective 6748' },
        { id: ThroughHoleLineTypes.Pressfit, name: 'Pressfit', machine: 'PF_CMP-5T MKII' },
        { id: ThroughHoleLineTypes.Washing, name: 'Washing' },
      ];
    } else if (processTypeId === ProcessType.Coating) {
      list = [
        { id: CoatingTypes.ConformalCoating, name: 'Conformal Coating', automate: true, machine: 'CC_PVA650C' },
        { id: CoatingTypes.UVLightCuringSystem, name: 'UV Light Curing System', automate: true, machine: 'CU_UV2000' },
        { id: CoatingTypes.ConformalCoatInspection, name: 'Conformal Coat Inspection', automate: true, machine: 'CCI_FX-940UV' },
      ];
    } else if (processTypeId === ProcessType.AdhesivePotting) {
      list = [
        { id: PottingTypes.PottingMaterial, name: 'Potting Material Metering', automate: true, machine: 'PT_PVA650C' },
        { id: PottingTypes.UVLightCuringSystem, name: 'UV Light Curing System(Potting)', automate: true, machine: 'PT_UV2000' },
      ];
    } else if (processTypeId === ProcessType.RoutingVScoring) {
      list = [
        { id: RoutingVScoring.DepanelTabRouting, name: 'Depanel- Tab Routing', automate: true, machine: 'DTR_Y-S168CE' },
        { id: RoutingVScoring.DepanelVscoring, name: 'Depanel- V-scoring', automate: true, machine: 'DVS_GAM 30 V CUT PCB' },
      ];
    } else if (processTypeId === ProcessType.SMTLine) {
      list = [
        { id: SMTTypes.InLoader, name: 'In Loader', automate: true, machine: 'IL_SLD-120Y' },
        { id: SMTTypes.SolderPastePrinting, name: 'Solder Paste Printing', automate: true, machine: 'SPP_DEK 03iX' },
        { id: SMTTypes.SolderPasteInspection, name: 'Solder Paste Inspection', automate: true, machine: 'SPI_KY8030-2L' },
        { id: SMTTypes.PickAndPlaceHighSpeed, name: 'Pick and Place - High Speed', automate: true, machine: 'HSP_CM602' },
        { id: SMTTypes.PickAndPlaceHighFlexibility, name: 'Pick and Place - High Flexibility', automate: true, machine: 'HMS_CM602' },
        { id: SMTTypes.PickAndPlaceMultifunctionalHead, name: 'Pick and Place - Multifunctional Head', automate: true, machine: 'HP_CM602' },
        { id: SMTTypes.ReflowSoldering, name: 'Reflow Soldering', automate: true, machine: 'RS_1936 MK5' },
        { id: SMTTypes.AOI, name: 'AOI', automate: true, machine: 'AOI_SJ 50 Series' },
        { id: SMTTypes.UnLoader, name: 'UnLoader', automate: true, machine: 'UL_SLD-120Y' },
        { id: SMTTypes.ConveyorFlipConveyor, name: 'Conveyor / Flip conveyor' },
        { id: SMTTypes.HighSpeedPickAandPlace, name: 'High Speed-Pick and Place' },
        { id: SMTTypes.HighFlexibilityPickAndPlace, name: 'High Flexibility-Pick and Place' },
        { id: SMTTypes.MultifunctionalHeadPickAndPlace, name: 'Multifunctional Head-Pick and Place' },
      ];
    }
    return list;
  }

  getSMTDuplicateEntries() {
    const list = [
      { id: SMTTypes.ConveyorFlipConveyor, name: 'Conveyor / Flip conveyor', machine: 'FC_ASYS BFS01' },
      { id: SMTTypes.SolderPastePrinting, name: 'Solder Paste Printing', machine: 'SPP_DEK 03iX' },
      { id: SMTTypes.SolderPasteInspection, name: 'Solder Paste Inspection', machine: 'SPI_KY8030-2L' },
      { id: SMTTypes.HighSpeedPickAandPlace, name: 'High Speed-Pick and Place', machine: 'HSP_CM602' },
      { id: SMTTypes.HighFlexibilityPickAndPlace, name: 'High Flexibility-Pick and Place', machine: 'HMS_CM602' },
      { id: SMTTypes.MultifunctionalHeadPickAndPlace, name: 'Multifunctional Head-Pick and Place', machine: 'HP_CM602' },
      { id: SMTTypes.ReflowSoldering, name: 'Reflow Soldering', automate: true, machine: 'RS_1936 MK5' },
      { id: SMTTypes.AOI, name: 'AOI', automate: true, machine: 'AOI_SJ 50 Series' },
      { id: SMTTypes.UnLoader, name: 'UnLoader', automate: true, machine: 'UL_SLD-120Y' },
    ];
    return list;
  }
  getThroughHoleAdditionalEntries(mountType: number) {
    let list = [];
    if ([MountingTechnology.DoubleSideTH].includes(mountType)) {
      list = [{ id: ThroughHoleLineTypes.SelectiveSoldering, name: 'Selective Soldering', machine: 'SWS_MySelective 6748' }];
    } else if ([MountingTechnology.DoubleSideSMTTH, MountingTechnology.DoubleSideTHOneSideSMT].includes(mountType)) {
      list = [
        { id: ThroughHoleLineTypes.SelectiveSoldering, name: 'Selective Soldering', machine: 'SWS_MySelective 6748' },
        { id: ThroughHoleLineTypes.Pressfit, name: 'Pressfit', machine: 'PF_CMP-5T MKII' },
      ];
    } else if ([MountingTechnology.OneSideSMTOneSideTH, MountingTechnology.SingleSideSMTTH, MountingTechnology.DoubleSideSMTOneSideTH].includes(mountType)) {
      list = [{ id: ThroughHoleLineTypes.Pressfit, name: 'Pressfit', machine: 'PF_CMP-5T MKII' }];
    }
    return list;
  }

  getMachineName(processTypeId: number) {
    let machineName = '';
    if (processTypeId === ProcessType.MaterialKitting) {
      machineName = 'MK_Tool Crib';
    } else if (processTypeId === ProcessType.InCircuitTestProgramming) {
      machineName = 'ICTP_i1000';
    } else if (processTypeId === ProcessType.FunctionalTest) {
      machineName = 'Custom';
    } else if (processTypeId === ProcessType.LabellingnternalPackaging) {
      machineName = 'Pkg_Tool Crib';
    } else if (processTypeId === ProcessType.ElectronicsVisualInspection) {
      machineName = 'VI_Tool Crib';
    }
    return machineName;
  }

  getElectronicsFormFields() {
    return {
      subProcessList: this.formbuilder.array([]),
      subProcessTypeID: '',
    };
  }
  getDynamicFormGroup(subprocessInfo: SubProcessTypeInfoDto, processFlags: any): FormGroup {
    const formGroup = this.formbuilder.group({
      subProcessInfoId: 0,
      processInfoId: subprocessInfo.processInfoId,
      subProcessTypeID: subprocessInfo.subProcessTypeId,
      isThroughHoleLine:
        [
          ThroughHoleLineTypes.AxialCompManualPreforming,
          ThroughHoleLineTypes.AxialCompSemiPreforming,
          ThroughHoleLineTypes.RadialComponentManualPreforming,
          ThroughHoleLineTypes.RadialComponentSemiPreforming,
          ThroughHoleLineTypes.AxialCompAutoPlacement,
          ThroughHoleLineTypes.AxialCompManualPlacement,
          ThroughHoleLineTypes.RadialCompAutoPlacement,
          ThroughHoleLineTypes.RadialCompManualPlacement,
          ThroughHoleLineTypes.CustomCompManualPlacement,
          ThroughHoleLineTypes.WaveSoldering,
          ThroughHoleLineTypes.HandSoldering,
          ThroughHoleLineTypes.SelectiveSoldering,
          ThroughHoleLineTypes.Pressfit,
          ThroughHoleLineTypes.Washing,
        ].includes(subprocessInfo?.subProcessTypeId) && processFlags.ThroughHoleLine,

      isCoating: [CoatingTypes.ConformalCoatInspection, CoatingTypes.ConformalCoating, CoatingTypes.UVLightCuringSystem].includes(subprocessInfo?.subProcessTypeId) && processFlags.Coating,

      isConformalCoatInspection: subprocessInfo?.subProcessTypeId === CoatingTypes.ConformalCoatInspection && processFlags.Coating,
      isConformalCoating: subprocessInfo?.subProcessTypeId === CoatingTypes.ConformalCoating && processFlags.Coating,
      isUVLightCuringSystem: subprocessInfo?.subProcessTypeId === CoatingTypes.UVLightCuringSystem && processFlags.Coating,

      isAdhesivePotting: [PottingTypes.PottingMaterial, PottingTypes.UVLightCuringSystem].includes(subprocessInfo?.subProcessTypeId) && processFlags.AdhesivePotting,
      isPottingMaterial: subprocessInfo?.subProcessTypeId === PottingTypes.PottingMaterial && processFlags.AdhesivePotting,
      isUVLightCuring: subprocessInfo?.subProcessTypeId === PottingTypes.UVLightCuringSystem && processFlags.AdhesivePotting,

      isRoutingVScoring: [RoutingVScoring.DepanelTabRouting, RoutingVScoring.DepanelVscoring].includes(subprocessInfo?.subProcessTypeId) && processFlags.RoutingVScoring,

      isSMTLine:
        [
          SMTTypes.InLoader,
          SMTTypes.SolderPastePrinting,
          SMTTypes.SolderPasteInspection,
          SMTTypes.PickAndPlaceHighSpeed,
          SMTTypes.PickAndPlaceHighFlexibility,
          SMTTypes.PickAndPlaceMultifunctionalHead,
          SMTTypes.ReflowSoldering,
          SMTTypes.AOI,
          SMTTypes.UnLoader,
          SMTTypes.ConveyorFlipConveyor,
          SMTTypes.HighSpeedPickAandPlace,
          SMTTypes.HighFlexibilityPickAndPlace,
          SMTTypes.MultifunctionalHeadPickAndPlace,
        ].includes(subprocessInfo?.subProcessTypeId) && processFlags.SMTLine,
    });
    return formGroup;
  }

  electronicsFormPatch(manufactureInfo: ProcessInfoDto) {
    if (
      [
        ProcessType.MaterialKitting,
        ProcessType.ThroughHoleLine,
        ProcessType.InCircuitTestProgramming,
        ProcessType.Coating,
        ProcessType.AdhesivePotting,
        ProcessType.RoutingVScoring,
        ProcessType.FunctionalTest,
        ProcessType.LabellingnternalPackaging,
        ProcessType.BarCodeReader,
        ProcessType.SMTLine,
        ProcessType.ElectronicsLaserMarking,
        ProcessType.ElectronicsVisualInspection,
      ].includes(Number(manufactureInfo.processTypeID))
    ) {
      return {
        subProcessList: manufactureInfo.subProcessFormArray?.length > 0 ? manufactureInfo?.subProcessFormArray?.value : null,
      };
    } else {
      return null;
    }
  }

  setCalculationObject(_manufactureInfo, _formCtrl) {
    // manufactureInfo.shotSize = formCtrl['shotSize'].value;
  }

  electronicsDirtyCheck(manufactureInfo, _formCtrl) {
    // manufactureInfo.ismoldTempDirty = formCtrl['moldTemp']?.dirty;
    return manufactureInfo;
  }

  getProcessListByMountingTech(materialInfo: MaterialInfoDto) {
    const processList: ProcessType[] = [];
    const mountingTechnology = Number(materialInfo?.typeOfCable);
    const thhroughHoleLine = Number(materialInfo.closingTime);
    const smtComponents = Number(materialInfo.injectionTime);
    const coating = Number(materialInfo.holdingTime);
    const potting = Number(materialInfo.coolingTime);
    const depaneling = Number(materialInfo.ejectionTime);

    processList.push(ProcessType.MaterialKitting);
    if (mountingTechnology === MountingTechnology.SingleSideTH) {
      thhroughHoleLine === 1 && processList.push(ProcessType.ThroughHoleLine);
    } else if (mountingTechnology === MountingTechnology.DoubleSideTH) {
      thhroughHoleLine === 1 && processList.push(ProcessType.ThroughHoleLine);
    } else if (mountingTechnology === MountingTechnology.SingleSideSMT) {
      smtComponents === 1 && processList.push(ProcessType.SMTLine);
    } else if (mountingTechnology === MountingTechnology.DoubleSideSMT) {
      smtComponents === 1 && processList.push(ProcessType.SMTLine); //multiple entry need to handle
    } else if (mountingTechnology === MountingTechnology.DoubleSideSMTOneSideTH) {
      smtComponents === 1 && processList.push(ProcessType.SMTLine);
      thhroughHoleLine === 1 && processList.push(ProcessType.ThroughHoleLine);
    } else if (mountingTechnology === MountingTechnology.SingleSideSMTTH) {
      smtComponents === 1 && processList.push(ProcessType.SMTLine);
      thhroughHoleLine === 1 && processList.push(ProcessType.ThroughHoleLine);
    } else if (mountingTechnology === MountingTechnology.OneSideSMTOneSideTH) {
      smtComponents === 1 && processList.push(ProcessType.SMTLine);
      thhroughHoleLine === 1 && processList.push(ProcessType.ThroughHoleLine);
    } else if (mountingTechnology === MountingTechnology.DoubleSideTHOneSideSMT) {
      smtComponents === 1 && processList.push(ProcessType.SMTLine);
      thhroughHoleLine === 1 && processList.push(ProcessType.ThroughHoleLine);
    } else if (mountingTechnology === MountingTechnology.DoubleSideSMTTH) {
      smtComponents === 1 && processList.push(ProcessType.SMTLine);
      thhroughHoleLine === 1 && processList.push(ProcessType.ThroughHoleLine);
    }
    processList.push(ProcessType.InCircuitTestProgramming);
    coating === 1 && processList.push(ProcessType.Coating);
    potting === 1 && processList.push(ProcessType.AdhesivePotting);
    [RoutingVScoring.DepanelTabRouting, RoutingVScoring.DepanelVscoring].includes(depaneling) && processList.push(ProcessType.RoutingVScoring);
    processList.push(ProcessType.FunctionalTest);
    processList.push(ProcessType.LabellingnternalPackaging);
    processList.push(ProcessType.ElectronicsVisualInspection);
    return processList;
  }

  setElectronicsSubprocess(selecteProcess: ProcessInfoDto) {
    const resultArray = this.formbuilder.array([]) as FormArray;
    for (let i = 0; i < selecteProcess?.subProcessTypeInfos?.length; i++) {
      const info = selecteProcess?.subProcessTypeInfos[i];
      const formGroup = this._fb.group({
        subProcessTypeID: info.subProcessTypeId,
        processInfoId: info.processInfoId,
        subProcessInfoId: info.subProcessInfoId,
        isThroughHoleLine:
          [
            ThroughHoleLineTypes.AxialCompManualPreforming,
            ThroughHoleLineTypes.AxialCompSemiPreforming,
            ThroughHoleLineTypes.RadialComponentManualPreforming,
            ThroughHoleLineTypes.RadialComponentSemiPreforming,
            ThroughHoleLineTypes.AxialCompAutoPlacement,
            ThroughHoleLineTypes.AxialCompManualPlacement,
            ThroughHoleLineTypes.RadialCompAutoPlacement,
            ThroughHoleLineTypes.RadialCompManualPlacement,
            ThroughHoleLineTypes.CustomCompManualPlacement,
            ThroughHoleLineTypes.WaveSoldering,
            ThroughHoleLineTypes.HandSoldering,
            ThroughHoleLineTypes.SelectiveSoldering,
            ThroughHoleLineTypes.Pressfit,
            ThroughHoleLineTypes.Washing,
          ].includes(info?.subProcessTypeId) && selecteProcess.processTypeID === ProcessType.ThroughHoleLine,

        isCoating:
          [CoatingTypes.ConformalCoatInspection, CoatingTypes.ConformalCoating, CoatingTypes.UVLightCuringSystem].includes(info?.subProcessTypeId) &&
          selecteProcess.processTypeID === ProcessType.Coating,

        isConformalCoatInspection: info?.subProcessTypeId === CoatingTypes.ConformalCoatInspection && selecteProcess.processTypeID === ProcessType.Coating,
        isConformalCoating: info?.subProcessTypeId === CoatingTypes.ConformalCoating && selecteProcess.processTypeID === ProcessType.Coating,
        isUVLightCuringSystem: info?.subProcessTypeId === CoatingTypes.UVLightCuringSystem && selecteProcess.processTypeID === ProcessType.Coating,

        isAdhesivePotting: [PottingTypes.PottingMaterial, PottingTypes.UVLightCuringSystem].includes(info?.subProcessTypeId) && selecteProcess.processTypeID === ProcessType.AdhesivePotting,
        isPottingMaterial: info?.subProcessTypeId === PottingTypes.PottingMaterial && selecteProcess.processTypeID === ProcessType.AdhesivePotting,
        isUVLightCuring: info?.subProcessTypeId === PottingTypes.UVLightCuringSystem && selecteProcess.processTypeID === ProcessType.AdhesivePotting,

        isRoutingVScoring: [RoutingVScoring.DepanelTabRouting, RoutingVScoring.DepanelVscoring].includes(info?.subProcessTypeId) && selecteProcess.processTypeID === ProcessType.RoutingVScoring,

        isSMTLine:
          [
            SMTTypes.InLoader,
            SMTTypes.SolderPastePrinting,
            SMTTypes.SolderPasteInspection,
            SMTTypes.PickAndPlaceHighSpeed,
            SMTTypes.PickAndPlaceHighFlexibility,
            SMTTypes.PickAndPlaceMultifunctionalHead,
            SMTTypes.ReflowSoldering,
            SMTTypes.AOI,
            SMTTypes.UnLoader,
            SMTTypes.ConveyorFlipConveyor,
            SMTTypes.HighSpeedPickAandPlace,
            SMTTypes.HighFlexibilityPickAndPlace,
            SMTTypes.MultifunctionalHeadPickAndPlace,
          ].includes(info?.subProcessTypeId) && selecteProcess.processTypeID === ProcessType.SMTLine,
      });
      resultArray.push(formGroup);
    }
    return resultArray;
  }

  electronicsProcessPayload(_formCtrl) {
    return {
      // unloadingTime: formCtrl['unloadingTime'].value,
      // processTime: formCtrl['processTime'].value,
    };
  }

  getSubTypeNamebyId(processInfo: ProcessInfoDto) {
    let subProcessName = 'N/A';
    const subProcessTypeID = processInfo?.subProcessTypeInfos && processInfo?.subProcessTypeInfos[0]?.subProcessTypeId;
    if (
      [
        ProcessType.MaterialKitting,
        ProcessType.ThroughHoleLine,
        ProcessType.InCircuitTestProgramming,
        ProcessType.Coating,
        ProcessType.AdhesivePotting,
        ProcessType.RoutingVScoring,
        ProcessType.FunctionalTest,
        ProcessType.LabellingnternalPackaging,
        ProcessType.BarCodeReader,
        ProcessType.SMTLine,
        ProcessType.ElectronicsLaserMarking,
        ProcessType.ElectronicsVisualInspection,
      ].includes(processInfo?.processTypeID)
    ) {
      if (processInfo?.subProcessTypeInfos && processInfo?.subProcessTypeInfos?.length) {
        const subprocessList = this.getSubProcessList(processInfo?.processTypeID);
        subProcessName = subprocessList?.find((x) => x.id === subProcessTypeID)?.name;
      }
    } else if (
      [
        ProcessType.InnerLayer,
        ProcessType.LaminationBonding,
        ProcessType.PCBDrilling,
        ProcessType.PCBPlating,
        ProcessType.OuterLayer,
        ProcessType.Soldermask,
        ProcessType.SilkScreen,
        ProcessType.SurfaceFinish,
        ProcessType.RoutingScoring,
        ProcessType.ETestBBT,
      ].includes(processInfo?.processTypeID)
    ) {
      const subprocessList = this._pcb.getSubProcessList(processInfo?.processTypeID);
      subProcessName = subprocessList?.find((x) => x.id === subProcessTypeID)?.name;
    }
    return subProcessName;
  }

  setMachineForPCBASubProcessEntries(
    selecteProcess: ProcessInfoDto,
    obj: ProcessInfoDto,
    machineTypeDescription: MedbMachinesMasterDto[],
    fieldColorsList: FieldColorsDto[],
    machine: MedbMachinesMasterDto[],
    machineTypeObj
  ) {
    let machineName = '';
    if (selecteProcess?.subProcessTypeInfos?.length > 0) {
      obj.subProcessFormArray = this.setElectronicsSubprocess(selecteProcess);
      const subProcessList = this.getSubProcessList(obj.processTypeID)?.filter((x) => x.automate === true);
      const subprocessTypeId = obj?.subProcessFormArray?.at(0)?.value?.subProcessTypeID;
      machineName = subProcessList?.find((x) => x.id === subprocessTypeId)?.machine;
      if (obj.processTypeID === ProcessType.SMTLine && machineName === undefined) {
        machineName = this.getSMTDuplicateEntries()?.find((x) => x.id === subprocessTypeId)?.machine;
      }
    } else {
      machineName = this.getMachineName(obj.processTypeID);
    }
    if (machineName?.length > 0) {
      machine = machineTypeDescription?.filter((x) => x.machineName?.trim() === machineName);
    } else {
      machine = machineTypeDescription;
    }
    if (this.sharedService.checkDirtyProperty('machineId', fieldColorsList)) {
      machineTypeObj = machineTypeDescription?.find((x) => x.machineMarketDtos.find((y) => y.machineMarketID == obj?.machineMarketId));
    } else {
      machineTypeObj = machine[0];
    }
    return machineTypeObj;
  }

  setMachineForAutomation(subProcessList: any[], index, machineTypeDescription: MedbMachinesMasterDto[], machineTypeObj: MedbMachinesMasterDto, obj: ProcessInfoDto) {
    if (subProcessList && subProcessList?.length > 0) {
      const machineName = subProcessList?.find((x) => x.id === subProcessList[index]?.id)?.machine;
      const machine = machineTypeDescription?.filter((x) => x.machineName?.trim() === machineName);
      machineTypeObj = machine[0];
    } else {
      const machineName = this.getMachineName(obj.processTypeID);
      const machine = machineTypeDescription?.filter((x) => x.machineName?.trim() === machineName);
      machineTypeObj = machine[0];
    }
    return machineTypeObj;
  }

  setSubArrayForPCBA(calculationRes: ProcessInfoDto) {
    for (let i = 0; i < calculationRes?.subProcessFormArray?.controls?.length; i++) {
      const info = calculationRes?.subProcessFormArray?.controls[i];
      const subProcessInfo = new SubProcessTypeInfoDto();
      subProcessInfo.subProcessTypeId = info?.value?.subProcessTypeID;
      subProcessInfo.processInfoId = info?.value?.processInfoId;
      subProcessInfo.subProcessInfoId = info?.value?.subProcessInfoId;
      if (calculationRes.subProcessTypeInfos == null) {
        calculationRes.subProcessTypeInfos = [];
      }
      calculationRes.subProcessTypeInfos.push(subProcessInfo);
    }
    calculationRes.subProcessFormArray = null;
  }

  getFullSubprocessBasedOnProcessId(processTypeID: number, materialInfo: MaterialInfoDto) {
    let subProcessList = this.getSubProcessList(processTypeID)?.filter((x) => x.automate === true);
    if (processTypeID === ProcessType.RoutingVScoring && Number(materialInfo?.ejectionTime) > 0) {
      subProcessList = subProcessList.filter((x) => x.id === Number(materialInfo?.ejectionTime));
    } else if (processTypeID === ProcessType.SMTLine) {
      if (Number(materialInfo?.partInnerDiameter) <= 0) {
        subProcessList = subProcessList.filter((x) => x.id != SMTTypes.PickAndPlaceHighSpeed);
      }
      if (Number(materialInfo?.runnerRiser) <= 0) {
        subProcessList = subProcessList.filter((x) => x.id != SMTTypes.PickAndPlaceHighFlexibility);
      }
      if (Number(materialInfo?.oxidationLossWeight) <= 0) {
        subProcessList = subProcessList.filter((x) => x.id != SMTTypes.PickAndPlaceMultifunctionalHead);
      }
      if ([MountingTechnology.DoubleSideSMT, MountingTechnology.DoubleSideSMTOneSideTH, MountingTechnology.DoubleSideSMTTH].includes(Number(materialInfo?.typeOfCable))) {
        subProcessList = subProcessList.filter((x) => x.id != SMTTypes.UnLoader);
        subProcessList = subProcessList.concat(this.getSMTDuplicateEntries());
        if (Number(materialInfo?.pouringWeight) <= 0) {
          subProcessList = subProcessList.filter((x) => x.id != SMTTypes.HighSpeedPickAandPlace);
        }
        if (Number(materialInfo?.cavityArrangementLength) <= 0) {
          subProcessList = subProcessList.filter((x) => x.id != SMTTypes.HighFlexibilityPickAndPlace);
        }
        if (Number(materialInfo?.cavityArrangementWidth) <= 0) {
          subProcessList = subProcessList.filter((x) => x.id != SMTTypes.MultifunctionalHeadPickAndPlace);
        }
      }
    } else if (processTypeID === ProcessType.ThroughHoleLine) {
      subProcessList = subProcessList.concat(this.getThroughHoleAdditionalEntries(Number(materialInfo?.typeOfCable)));
      if (Number(materialInfo?.mainInsulatorOD) <= 0) {
        subProcessList = subProcessList.filter((x) => x.id != ThroughHoleLineTypes.RadialCompAutoPlacement);
      }
      if (Number(materialInfo?.mainCableSheathingMaterial) <= 0) {
        subProcessList = subProcessList.filter((x) => x.id != ThroughHoleLineTypes.AxialCompAutoPlacement);
      }
      if (
        [
          MountingTechnology.DoubleSideSMTOneSideTH,
          MountingTechnology.SingleSideSMTTH,
          MountingTechnology.OneSideSMTOneSideTH,
          MountingTechnology.DoubleSideTHOneSideSMT,
          MountingTechnology.DoubleSideSMTTH,
        ].includes(Number(materialInfo?.typeOfCable)) &&
        this.sharedService.isValidNumber(materialInfo.coilWidth) <= 0
      ) {
        subProcessList = subProcessList.filter((x) => x.id != ThroughHoleLineTypes.Pressfit);
      }
    }
    return subProcessList;
  }
}

export enum ThroughHoleLineTypes {
  AxialCompManualPreforming = 1,
  AxialCompSemiPreforming = 2,
  RadialComponentManualPreforming = 3,
  RadialComponentSemiPreforming = 4,
  AxialCompAutoPlacement = 5,
  AxialCompManualPlacement = 6,
  RadialCompAutoPlacement = 7,
  RadialCompManualPlacement = 8,
  CustomCompManualPlacement = 9,
  WaveSoldering = 10,
  HandSoldering = 11,
  SelectiveSoldering = 12,
  Pressfit = 13,
  Washing = 14,
}

export enum CoatingTypes {
  ConformalCoating = 1,
  UVLightCuringSystem = 2,
  ConformalCoatInspection = 3,
}

export enum PottingTypes {
  PottingMaterial = 1,
  UVLightCuringSystem = 2,
}

export enum RoutingVScoring {
  DepanelTabRouting = 1,
  DepanelVscoring = 2,
}

export enum RoutingProcessType {
  Routing = 1,
  VScore = 2,
}
export enum ConformalCoating {
  No = 1,
  Yes = 2,
}
export enum ApplicationTypes {
  Medical = 1,
  ConsumerElectronics = 2,
  Automotive = 3,
}

export enum SMTTypes {
  InLoader = 1,
  SolderPastePrinting = 2,
  SolderPasteInspection = 3,
  PickAndPlaceHighSpeed = 4,
  PickAndPlaceHighFlexibility = 5,
  PickAndPlaceMultifunctionalHead = 6,
  ReflowSoldering = 7,
  AOI = 8,
  UnLoader = 9,
  ConveyorFlipConveyor = 10,
  HighSpeedPickAandPlace = 11,
  HighFlexibilityPickAndPlace = 12,
  MultifunctionalHeadPickAndPlace = 13,
}
export enum MountingTechnology {
  SingleSideTH = 1,
  DoubleSideTH = 2,
  SingleSideSMT = 3,
  SingleSideSMTTH = 4,
  OneSideSMTOneSideTH = 5,
  DoubleSideSMT = 6,
  DoubleSideSMTOneSideTH = 7,
  DoubleSideTHOneSideSMT = 8,
  DoubleSideSMTTH = 9,
}
export enum PCBTypes {
  ThroughHoleComponents = 1,
  SMT = 2,
  Coating = 3,
  RoutingVScoring = 4,
  AdhesivePotting = 5,
}
export enum SelectionType {
  Yes = 1,
  No = 2,
}
