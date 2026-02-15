import { LaborRateMasterDto, ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { costingConfig as _costingConfig } from '../utils/costing-config';
import { PrimaryProcessType, ProcessType, PartComplexity, MachineType } from '../utils/constants';
import { CastingConfigService } from './casting-config';
import { ManufacturingCastingConfigService } from './manufacturing-casting-config';

export class ManufacturingCastingCalculatorService {
  private _costingConfig = _costingConfig;

  constructor(
    private shareService: SharedService,
    private castingConfigService: CastingConfigService,
    private manufacturingCastingConfigService: ManufacturingCastingConfigService
  ) { }

  public doCostCalculationForCasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    let defaultSetupTime = 60;
    let defaultNoOfLowSkilledLabours = 1;
    let cycleTime = 0;
    let defaultSamplingRate = 0;

    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      manufactureInfo.noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : this.shareService.isValidNumber(manufactureInfo.noOfParts);
    }

    const materialInfoList = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList.length > 0 ? manufactureInfo?.materialInfoList : [];
    if (materialInfoList.length === 0) {

      return manufactureInfo;
    }

    const IsNoBakeCasting = materialInfoList[0].processId === PrimaryProcessType.NoBakeCasting;
    const IsInvestmentCasting = materialInfoList[0].processId === PrimaryProcessType.InvestmentCasting;
    const IsGreenCastingAuto = materialInfoList[0].processId === PrimaryProcessType.GreenCastingAuto;
    const IsGreenCastingSemiAuto = materialInfoList[0].processId === PrimaryProcessType.GreenCastingSemiAuto;
    const IsGreenCasting = IsGreenCastingAuto || IsGreenCastingSemiAuto;
    const IsHPDCCasting = materialInfoList[0].processId === PrimaryProcessType.HPDCCasting;
    const IsLPDCCasting = materialInfoList[0].processId === PrimaryProcessType.LPDCCasting;
    const IsGDCCasting = materialInfoList[0].processId === PrimaryProcessType.GDCCasting;
    // const IsShellCasting = materialInfoList[0].processId === PrimaryProcessType.ShellCasting;

    const matMetal = (IsHPDCCasting ? materialInfoList[0] : materialInfoList.filter((rec) => rec.secondaryProcessId === 1)[0]) || null;
    const matCore = materialInfoList.filter((rec) => rec.secondaryProcessId === 2)[0] || null;
    const matMold = materialInfoList.filter((rec) => rec.secondaryProcessId === 3)[0] || null;

    let matSlurryCost = null;
    let matPatternWax = null;
    if (IsInvestmentCasting) {
      matSlurryCost = materialInfoList.filter((rec) => rec.secondaryProcessId === 5)[0] || null;
      matPatternWax = materialInfoList.filter((rec) => rec.secondaryProcessId === 4)[0] || null;
    }

    let processMoldMaking = null;
    let processHPDC = null;
    let processLPDC = null;
    let processCoreAssembly = null;
    let processGDC = null;
    let processMelting = null;
    let assemblingOfCore = null;
    // let processSlurryCoating = null;
    // let processTreePatternAssembly = null;
    const noOfCores = (matCore?.coreCostDetails?.length ?? 0) > 0 ? matCore?.coreCostDetails.reduce((accVal: number, currentRec: any) => accVal + currentRec.noOfCore, 0) || 1 : 0;
    if (IsHPDCCasting) {
      processHPDC = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.HighPressureDieCasting)[0] || null;
    } else if (IsLPDCCasting) {
      processLPDC = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.LowPressureDieCasting)[0] || null;
      processCoreAssembly = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.CastingCoreAssembly)[0] || null;
      assemblingOfCore = this.manufacturingCastingConfigService.getAssemblyOfCore(Number(processCoreAssembly?.noOfCore) || noOfCores, Number(manufactureInfo.partComplexity));
    } else if (IsGDCCasting) {
      processGDC = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.GravityDieCasting)[0] || null;
    } else if (IsInvestmentCasting) {
      // processSlurryCoating = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.SlurryCoating)[0] || null;
      // processTreePatternAssembly = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.TreePatternAssembly)[0] || null;
    }
    if (IsNoBakeCasting) {
      processMoldMaking = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.CastingMoldMaking)[0] || null;
    } else {
      processMoldMaking = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.MoldPerparation)[0] || null;
    }
    processMelting = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.MeltingCasting)[0] || null;
    // Slider Movement Length
    if (manufactureInfo.isplatenSizeLengthDirty && !!manufactureInfo.platenSizeLength) {
      manufactureInfo.platenSizeLength = Number(manufactureInfo.platenSizeLength);
    } else {
      manufactureInfo.platenSizeLength = this.shareService.checkDirtyProperty('platenSizeLength', fieldColorsList)
        ? manufacturingObj?.platenSizeLength
        : this.shareService.isValidNumber(manufactureInfo.platenSizeLength);
    }
    // Slider Movement Width
    if (manufactureInfo.isplatenSizeWidthDirty && !!manufactureInfo.platenSizeWidth) {
      manufactureInfo.platenSizeWidth = Number(manufactureInfo.platenSizeWidth);
    } else {
      manufactureInfo.platenSizeWidth = this.shareService.checkDirtyProperty('platenSizeWidth', fieldColorsList)
        ? manufacturingObj?.platenSizeWidth
        : this.shareService.isValidNumber(manufactureInfo.platenSizeWidth);
    }
    /** Begin - Process based calc */
    if (Number(manufactureInfo?.processTypeID) === ProcessType.CastingCorePreparation) {
      //1
      if (IsNoBakeCasting || IsGreenCasting || IsGDCCasting || IsLPDCCasting) {
        const selectedMatcore =
          materialInfoList.filter((rec) => rec.secondaryProcessId === 2).map((x) => x.coreCostDetails.find((core) => core.coreCostDetailsId === manufactureInfo.subProcessTypeID)) || [];
        const noOfCompLength = Math.ceil(matMetal?.noOfCavities / 2) || 0;
        const noOfCompWidth = Math.floor(matMetal?.noOfCavities / 2) || 0;
        const cavityToEdgeLength = 75;
        const cavityToEdgeWidth = 75;
        const cavityToCavityLength = noOfCompLength > 1 ? 50 : 0;
        const cavityToCavityWidth = noOfCompWidth > 1 ? 50 : 0;


        // Required Core Box Length
        if (manufactureInfo.isallowanceAlongLengthDirty && !!manufactureInfo.allowanceAlongLength) {
          manufactureInfo.allowanceAlongLength = Number(manufactureInfo.allowanceAlongLength);
        } else {
          let allowanceAlongLength = 0;
          if (IsGDCCasting || IsLPDCCasting) {
            allowanceAlongLength = ((matMetal?.grossWeight || 0) + Number(manufactureInfo.platenSizeLength)) * noOfCompLength + cavityToCavityLength * noOfCompLength + cavityToEdgeLength * 2;
          } else if (IsGreenCasting) {
            // allowanceAlongLength =
            //   ((matCore?.coreCostDetails[0]?.coreLength || 0) + Number(manufactureInfo.platenSizeLength)) * noOfCompLength + cavityToCavityLength * noOfCompLength + cavityToEdgeLength * 2;
            allowanceAlongLength = ((selectedMatcore[0]?.coreLength || 0) + Number(manufactureInfo.platenSizeLength)) * noOfCompLength + cavityToCavityLength * noOfCompLength + cavityToEdgeLength * 2;
          }
          if (manufactureInfo.allowanceAlongLength) {
            allowanceAlongLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList) ? manufacturingObj?.allowanceAlongLength : allowanceAlongLength;
          }
          manufactureInfo.allowanceAlongLength = allowanceAlongLength;
        }
        // Required Core Box Width
        if (manufactureInfo.isallowanceAlongWidthDirty && !!manufactureInfo.allowanceAlongWidth) {
          manufactureInfo.allowanceAlongWidth = Number(manufactureInfo.allowanceAlongWidth);
        } else {
          let allowanceAlongWidth = 0;
          if (IsGDCCasting || IsLPDCCasting) {
            allowanceAlongWidth = ((matMetal?.materialCostPart || 0) + Number(manufactureInfo.platenSizeWidth)) * noOfCompWidth + cavityToCavityWidth * noOfCompWidth + cavityToEdgeWidth * 2;
          } else if (IsGreenCasting) {
            // allowanceAlongWidth =
            //   ((matCore?.coreCostDetails[0]?.coreWidth || 0) + Number(manufactureInfo.platenSizeWidth)) * noOfCompWidth + cavityToCavityWidth * noOfCompWidth + cavityToEdgeWidth * 2;
            allowanceAlongWidth = ((selectedMatcore[0]?.coreWidth || 0) + Number(manufactureInfo.platenSizeWidth)) * noOfCompWidth + cavityToCavityWidth * noOfCompWidth + cavityToEdgeWidth * 2;
          }
          if (manufactureInfo.allowanceAlongWidth) {
            allowanceAlongWidth = this.shareService.checkDirtyProperty('allowanceAlongWidth', fieldColorsList) ? manufacturingObj?.allowanceAlongWidth : allowanceAlongWidth;
          }
          manufactureInfo.allowanceAlongWidth = allowanceAlongWidth;
        }

        // Sand Volume Required
        if (manufactureInfo.issandShootingDirty && !!manufactureInfo.sandShooting) {
          manufactureInfo.sandShooting = this.shareService.isValidNumber(Number(manufactureInfo.sandShooting));
        } else {
          // let sandShooting = (matCore?.coreCostDetails[0]?.coreVolume * matMetal?.noOfCavities) / Math.pow(10, 6);
          let sandShooting = ((selectedMatcore[0]?.coreVolume ?? 0) * (matMetal?.noOfCavities ?? 0)) / Math.pow(10, 6);
          // let sandShooting = (matCore?.totalSandVolume * matMetal?.noOfCavities) / Math.pow(10, 6);
          if (manufactureInfo.sandShooting) {
            sandShooting = this.shareService.checkDirtyProperty('sandShooting', fieldColorsList) ? manufacturingObj?.sandShooting : sandShooting;
          }
          manufactureInfo.sandShooting = sandShooting;
        }

        // Machine Core Box Length
        if (manufactureInfo.islengthOfCoatedDirty && !!manufactureInfo.lengthOfCoated) {
          manufactureInfo.lengthOfCoated = this.shareService.isValidNumber(Number(manufactureInfo.lengthOfCoated));
        } else {
          manufactureInfo.lengthOfCoated = Number(manufactureInfo?.machineMaster?.maxCoreBoxLength) || 0; //confirm machine db before removing default
        }
        // Machine Core Box Width
        if (manufactureInfo.iswidthOfCoatedDirty && !!manufactureInfo.widthOfCoated) {
          manufactureInfo.widthOfCoated = this.shareService.isValidNumber(Number(manufactureInfo.widthOfCoated));
        } else {
          manufactureInfo.widthOfCoated = Number(manufactureInfo?.machineMaster?.maxCoreBoxWidth) || 0; //confirm machine db before removing default
        }
        // const coreSandWeightTotal = matCore?.coreCostDetails.length > 0 ? matCore?.coreCostDetails.reduce((accVal, currentRec) => accVal + currentRec.coreWeight, 0) : 0;
        const selectedCoreSandWeight = selectedMatcore.length > 0 ? selectedMatcore[0]?.coreWeight : 0;
        if (IsGDCCasting || IsLPDCCasting || IsGreenCastingSemiAuto) {
          manufactureInfo.recommendTonnage = Math.ceil((((selectedMatcore[0]?.coreVolume ?? 0) * (matMetal?.noOfCavities ?? 0)) / Math.pow(10, 6)) * (matCore?.density ?? 0)) || 0;
        } else if (IsGreenCastingAuto) {
          manufactureInfo.recommendTonnage = Math.ceil(((selectedMatcore[0]?.coreVolume ?? 0) * (matMetal?.noOfCavities ?? 0)) / Math.pow(10, 6)) || 0;
        } else if (IsNoBakeCasting) {
          // const coreSandWeightMax =
          //   matCore?.coreCostDetails.length > 0 ? matCore?.coreCostDetails.reduce((selectedVal, currentRec) => (selectedVal > currentRec.coreWeight ? selectedVal : currentRec.coreWeight), 0) : 0;
          const coresPerHr = 15;
          const coreSandReqPerHr = selectedMatcore[0]?.coreWeight * coresPerHr;
          manufactureInfo.recommendTonnage = Math.ceil(coreSandReqPerHr / 1000);
        }

        if (manufactureInfo.isselectedTonnageDirty && !!manufactureInfo.selectedTonnage) {
          manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
        } else {
          // let selectedTonnage = manufactureInfo?.furnaceCapacityTon || 1; // confirm machine db before removing default
          let selectedTonnage = manufactureInfo.furnaceCapacityTon || manufactureInfo?.machineMaster?.furnaceCapacityTon || 1;
          if (manufactureInfo.selectedTonnage) {
            selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : selectedTonnage;
          }
          manufactureInfo.selectedTonnage = selectedTonnage;
        }

        const dryCycleTime = Number(manufactureInfo?.dryCycleTime) || 13; //confirm machine db before removing default
        const dragCopeMovement = dryCycleTime * 0.8;
        const sandShooting = Number(manufactureInfo?.machineMaster?.sandShootingSpeed) || 2; // constant
        const coreFilling = ((Number(manufactureInfo.selectedTonnage || 1) * 1000 * 0.8) / 3600) * (selectedCoreSandWeight || 1);
        // const gassing = (matCore?.totalCoreWeight || 0) * 1000 * 0.0015 * 0.04;
        const gassing = (selectedCoreSandWeight || 0) * 1000 * 0.0015 * 0.04;
        const coreMovement = dryCycleTime * 0.2;
        // const unloadingCore = Number(manufactureInfo?.machineMaster?.sandShootingSpeed) || 3; //confirm machine db before removing default (should it be divided by 60?)
        const unloadingCore = this._costingConfig.loadingUnloadingTime(matMetal?.netWeight);
        const coreDefining = IsNoBakeCasting || IsGDCCasting ? this.manufacturingCastingConfigService.getCoreCycleTime(selectedCoreSandWeight || 0) : 5;
        // const inspectionOfCore = 3;
        const coreDipping = IsNoBakeCasting || IsGDCCasting ? this.manufacturingCastingConfigService.getCoreCycleTime(selectedCoreSandWeight || 0) : 5;
        if (IsNoBakeCasting || IsGDCCasting) {
          cycleTime = dragCopeMovement + coreFilling + gassing + coreMovement + unloadingCore + coreDefining + coreDipping;
        } else {
          cycleTime = dragCopeMovement + sandShooting + gassing + coreMovement + unloadingCore + coreDefining + coreDipping;
        }

      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.CastingCoreAssembly) {
      //2
      defaultSetupTime = 20;
      if (manufactureInfo.isNoOfCoreDirty && !!manufactureInfo.noOfCore) {
        manufactureInfo.noOfCore = this.shareService.isValidNumber(Number(manufactureInfo.noOfCore));
      } else {
        let noOfCore = noOfCores;
        if (manufactureInfo.noOfCore) {
          noOfCore = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : noOfCore;
        }
        manufactureInfo.noOfCore = noOfCore;
      }
      // manufactureInfo.subProcessTypeID = Number(manufactureInfo.subProcessTypeID) ? manufactureInfo.subProcessTypeID : 1;

      const cleaningOfCores = manufactureInfo.noOfCore * 15;
      const movementOfCores = manufactureInfo.noOfCore * 10;
      const CoreLoading = manufactureInfo.noOfCore * 20;

      const assemblingOfCore = this.manufacturingCastingConfigService.getAssemblyOfCore(Number(manufactureInfo.noOfCore), Number(manufactureInfo.partComplexity));
      cycleTime = this.shareService.isValidNumber(cleaningOfCores + movementOfCores + CoreLoading + assemblingOfCore);
    } else if (
      (IsNoBakeCasting && Number(manufactureInfo?.processTypeID) == ProcessType.CastingMoldMaking) ||
      (IsGreenCasting && Number(manufactureInfo?.processTypeID) == ProcessType.MoldPerparation) // mold making
    ) {
      //3
      manufactureInfo.recommendedDimension = Math.ceil(matMold?.moldBoxLength ?? 0) + ' x ' + Math.ceil(matMold?.moldBoxWidth ?? 0) + ' x ' + Math.ceil(matMold?.moldBoxHeight ?? 0);
      manufactureInfo.selectedDimension =
        Math.ceil(manufactureInfo?.machineMaster?.flaskLength ?? 0) +
        ' x ' +
        Math.ceil(manufactureInfo?.machineMaster?.flaskWidth ?? 0) +
        ' x ' +
        Math.ceil(manufactureInfo?.machineMaster?.flaskHeight ?? 0);

      if (IsGreenCasting) {
        const moldsPerHr = Number(manufactureInfo?.machineMaster?.moldRateNoCoreCyclesPerHr) || 30; //confirm machine db before removing default

        if (manufactureInfo.isNoOfCoreDirty && !!manufactureInfo.noOfCore) {
          manufactureInfo.noOfCore = this.shareService.isValidNumber(Number(manufactureInfo.noOfCore));
        } else {
          let noOfCore = moldsPerHr;
          if (manufactureInfo.noOfCore) {
            noOfCore = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : noOfCore;
          }
          manufactureInfo.noOfCore = noOfCore;
        }
        cycleTime = 3600 / Number(manufactureInfo.noOfCore) / Number(matMetal.noOfCavities);
      } else {
        let selectedTonnage = manufactureInfo?.machineMaster?.machineTonnageTons ?? 0;
        // const sandShootingSpeed = Number(manufactureInfo?.sandShooting) || 1000 / 60; //confirm machine db before removing default
        const sandShootingSpeed = (selectedTonnage * 1000) / 60;
        if (matMold) {
          const moldBox = Number(matMold.moldBoxLength) * Number(matMold.moldBoxWidth) * Number(matMold.moldBoxHeight);
          const moldSandWeight = this.shareService.isValidNumber(((moldBox - (Number(matMetal?.partVolume) || 0)) * Number(matMold.density)) / Math.pow(10, 6));

          // const moldSandFillingTime = sandShootingSpeed ? (matMold?.moldSandWeight / 2 / sandShootingSpeed) * 60 : 0;
          const moldSandFillingTime = sandShootingSpeed ? (Math.ceil(moldSandWeight) / 2 / sandShootingSpeed) * 60 : 0;
          const sandRamming = (matMold?.moldBoxLength * matMold?.moldBoxWidth) / 4900;
          const moldMovement = 30;
          const moldCuring = 60;
          const totalCycletimePerMold = moldSandFillingTime + sandRamming + moldMovement + moldCuring;
          const moldFloodCoating = (matMold?.moldBoxLength * matMold?.moldBoxWidth) / 15000 + 10;
          cycleTime = (moldFloodCoating + totalCycletimePerMold) * 2;

          if (manufactureInfo.isNoOfCoreDirty && !!manufactureInfo.noOfCore) {
            manufactureInfo.noOfCore = this.shareService.isValidNumber(Number(manufactureInfo.noOfCore));
          } else {
            let noOfCore = Math.ceil(3600 / cycleTime);
            if (manufactureInfo.noOfCore) {
              noOfCore = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : noOfCore;
            }
            manufactureInfo.noOfCore = noOfCore;
          }
          const moldSandReqPerHr = manufactureInfo.noOfCore * Math.ceil(moldSandWeight);
          manufactureInfo.recommendTonnage = Math.ceil((moldSandReqPerHr * manufactureInfo.noOfCore) / 1000);
          manufactureInfo.allowanceAlongLength = this.shareService.isValidNumber(Number(matMold?.moldBoxLength)) || 0;
          manufactureInfo.allowanceAlongWidth = this.shareService.isValidNumber(Number(matMold?.moldBoxWidth)) || 0;
          manufactureInfo.allowanceBetweenParts = this.shareService.isValidNumber(Number(matMold?.moldBoxHeight)) || 0;
          // selectedTonnage = Math.ceil(matMold?.moldSandWeight + (matCore?.totalCoreWeight || 0) + (matMetal?.totalPouringWeight || 0));
        } else {
          cycleTime = (30 + 60 + 10) * 2;
          if (!manufactureInfo.noOfCore) {
            manufactureInfo.noOfCore = Math.ceil(3600 / cycleTime);
          }
          selectedTonnage = (matCore?.totalCoreWeight || 0) + (matMetal?.totalPouringWeight || 0);
        }
        manufactureInfo.selectedTonnage = selectedTonnage;
        // if (manufactureInfo.isselectedTonnageDirty && !!manufactureInfo.selectedTonnage) {
        //   manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
        // } else {
        //   if (manufactureInfo.selectedTonnage) {
        //     selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : selectedTonnage;
        //   }
        //   manufactureInfo.selectedTonnage = selectedTonnage;
        // }
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.WaxInjectionMolding) {
      if (matMetal) {
        const meltTemp = 129;
        const ejecTemp = 80;
        const mouldTemp = 70;
        const thermalConductivity = 7.1;
        const specificHeatCapacity = 2.13;
        const thermalDiffusivity = thermalConductivity / (specificHeatCapacity * matPatternWax?.density);
        const sideCore = 0;
        const materialInjection = matMetal?.partVolume / 2500;
        const partEjection = 2.5;
        const pick = 3;
        // const machineDryCycleTime = 12;
        const coolingTime = (Math.pow(matMetal?.partTickness, 2) / Math.pow(Math.PI, 2) / thermalDiffusivity) * Math.log((4 / Math.PI) * ((meltTemp - ejecTemp) / (ejecTemp - mouldTemp)));
        const others = 0;
        cycleTime = sideCore + materialInjection + partEjection + pick + coolingTime + others;
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.TreePatternAssembly) {
      // defaultSetupTime = 60;
      if (matMetal) {
        // const maxTreeWeight = 100 / 2.204;
        // const noOfCavitiesWeight = Math.floor(maxTreeWeight / matMetal?.netWeight);
        // const noBranches = 4;
        // const heightTree = 600;
        // const noComponentHeight = Math.floor(heightTree / (matMetal?.partLength + 50));
        // const noCavitiesTreeAcc = noBranches * noComponentHeight;
        // const finalCavities = this.castingConfigService.castingConstants.finalCavitiesPerTree;
        // const partHandlingTime = 10;
        const netWeightGrams = matMetal?.moldSandWeight * 1000;
        const partHandlingTime = this.manufacturingCastingConfigService.getTreePatternPartHandlingTime(netWeightGrams);
        const partGluingTime = 5;
        // const cycleTimePart = partGluingTime + partHandlingTime;
        const cycleTimePart = (partGluingTime + partHandlingTime) * matMetal.noOfCavities;
        manufactureInfo.dryCycleTime = this.shareService.isValidNumber(cycleTimePart);
        // cycleTime = cycleTimePart * finalCavities;
        cycleTime = partGluingTime + partHandlingTime;
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.SlurryCoating) {
      defaultSetupTime = 30;
      // if (manufactureInfo.isNoOfCoreDirty && !!manufactureInfo.noOfCore) {
      //   manufactureInfo.noOfCore = this.shareService.isValidNumber(Number(manufactureInfo.noOfCore));
      // } else {
      //   let noOfCore = matSlurryCost?.primaryCount + matSlurryCost?.secondaryCount;
      //   if (manufactureInfo.noOfCore) {
      //     noOfCore = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : noOfCore;
      //   }
      //   manufactureInfo.noOfCore = noOfCore;
      // }
      manufactureInfo.noOfCore = matSlurryCost?.primaryCount + matSlurryCost?.secondaryCount;
      const dipTime = this.castingConfigService.castingConstants.dipTimePerCoating;
      const stuccoingTime = 60;
      const totalSlurryCoatingTime = (dipTime + stuccoingTime) * Number(manufactureInfo.noOfCore);
      cycleTime = totalSlurryCoatingTime / matMetal?.noOfCavities;
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.Dry) {
      defaultSetupTime = 30;
      // const totDryingTime = 48 * 60 * 60;
      let totalDryingTime = 0;
      if (manufactureInfo?.machineMaster?.machineName.toLocaleLowerCase() === 'dehumidifier') {
        totalDryingTime = 4 * 3600 * (matSlurryCost?.primaryCount + matSlurryCost?.secondaryCount) || 0;
      } else if (manufactureInfo?.machineMaster?.machineName.toLocaleLowerCase() === 'infrared drying system') {
        totalDryingTime = 0.5 * 3600 * (matSlurryCost?.primaryCount + matSlurryCost?.secondaryCount) || 0;
      }
      const dryingCabinVolume = 80 * 0.5;
      const averageTreeVolume = 0.3;
      // const noPartsCoated = (3600 / processSlurryCoating?.cycleTime) * 48;
      const noPartsAccomodation = Number(dryingCabinVolume / averageTreeVolume) * 0.85 * Number(matMetal?.noOfCavities);
      cycleTime = totalDryingTime / noPartsAccomodation;
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.Dewaxing) {
      defaultSetupTime = 30;
      const workingLength = 1.2;
      const workingWidth = 0.7;
      // const workingArea = 2.1;
      const treeLengthWithAllowance = (matMetal?.dimX + 50) * 2; // 583.5;
      const treeWidthWithAllowance = (matMetal?.dimY + 50) * 2; // 583.5;
      const noTreeAccLength = Math.floor((workingLength * 1000) / treeLengthWithAllowance);
      const noTreeAccWidth = Math.floor((workingWidth * 1000) / treeWidthWithAllowance);
      const totTreeAcc = noTreeAccLength * noTreeAccWidth;
      // const totPartAcc = totTreeAcc * this.castingConfigService.castingConstants.finalCavitiesPerTree;
      const totPartAcc = totTreeAcc * matMetal?.noOfCavities;
      const treeLoadingTime = 600;
      const burnoutTime = 1800;
      const treeUnloadingTime = 600;
      cycleTime = (treeLoadingTime + burnoutTime + treeUnloadingTime) / totPartAcc;
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.ShellMoldFiring) {
      defaultSetupTime = 30;
      const workingLength = 2;
      const workingWidth = 2;
      // const workingArea = 2;
      const treeLengthWithAllowance = (matMetal?.dimX + 50) * 2; // 583.5;
      const treeWidthWithAllowance = (matMetal?.dimY + 50) * 2; // 583.5;
      const noTreeAccLength = Math.floor((workingLength * 1000) / treeLengthWithAllowance);
      const noTreeAccWidth = Math.floor((workingWidth * 1000) / treeWidthWithAllowance);
      const totTreeAcc = noTreeAccLength * noTreeAccWidth;
      // const totPartAcc = totTreeAcc * this.castingConfigService.castingConstants.finalCavitiesPerTree;
      const totPartAcc = totTreeAcc * matMetal?.noOfCavities;
      const treeLoadingTime = 600;
      const soakingTime = 1200;
      const treeUnloadingTime = 600;
      cycleTime = (treeLoadingTime + soakingTime + treeUnloadingTime) / totPartAcc;
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.MeltingCasting) {
      //4
      defaultSetupTime = 30;
      // const factorOfSafety = 25 / 100;
      // manufactureInfo.furnaceCapacityTon = manufactureInfo?.furnaceCapacityTon ? manufactureInfo.furnaceCapacityTon : 1; // Furnace Capacity per hour (tons)
      manufactureInfo.furnaceCapacityTon = manufactureInfo?.furnaceCapacityTon ? manufactureInfo.furnaceCapacityTon : manufactureInfo?.machineMaster?.furnaceCapacityTon || 1;

      // let otherCycleTime = 0;
      // if (IsHPDCCasting) {
      //   otherCycleTime = processHPDC?.cycleTime || 0;
      // } else if (IsGDCCasting) {
      //   otherCycleTime = processGDC?.cycleTime || 0;
      // } else if (IsInvestmentCasting) {
      //   otherCycleTime = processTreePatternAssembly?.cycleTime || 0;
      // } else {
      //   otherCycleTime = processMoldMaking?.cycleTime || 0;
      // }

      if (matMetal) {
        this.manufacturingCastingConfigService.getMeltingTonnage(manufactureInfo, fieldColorsList, manufacturingObj);
        const furnaceCapacityPerSec = Number(((manufactureInfo.selectedTonnage * 1000) / (3600 * 0.85)).toFixed(4));
        if (IsHPDCCasting) {
          // grams
          cycleTime = matMetal?.totalPouringWeight / 1000 / furnaceCapacityPerSec;
        } else {
          cycleTime = matMetal?.totalPouringWeight / furnaceCapacityPerSec;
        }

        // let mtReqPerHr = 0;
        // if (IsHPDCCasting) { // grams
        //   mtReqPerHr = ((matMetal?.totalPouringWeight / 1000) * Number(manufactureInfo.noOfCore)) + ((matMetal?.totalPouringWeight / 1000) * factorOfSafety * Number(manufactureInfo.noOfCore));
        // } else if (IsGreenCasting || IsGDCCasting || IsInvestmentCasting) {
        //   mtReqPerHr = (matMetal?.totalPouringWeight * Number(manufactureInfo.noOfCore)) + (matMetal?.totalPouringWeight * factorOfSafety * Number(manufactureInfo.noOfCore));
        // } else { // nobake
        //   mtReqPerHr = (matMetal?.totalPouringWeight * processMoldMaking?.noOfCore) + (matMetal?.totalPouringWeight * processMoldMaking?.noOfCore * Number(manufactureInfo.noOfCore));
        // }
        // manufactureInfo.recommendTonnage = Math.ceil(mtReqPerHr / 1000); // Furnace Capacity required (tons)
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.CastingMoldAssembly) {
      //5
      if (matMold) {
        const moldBox = Number(matMold.moldBoxLength) * Number(matMold.moldBoxWidth) * Number(matMold.moldBoxHeight);
        const moldSandWeight = Math.ceil(((moldBox - (Number(matMetal?.partVolume) || 0)) * Number(matMold.density)) / Math.pow(10, 6));

        const manipulatorType = this._costingConfig.manipulatorType().find((x) => x.fromWeight <= matMold?.moldSandWeight && x.toWeight >= matMold?.moldSandWeight)?.type || 1;
        if (!IsGDCCasting && !IsLPDCCasting && !IsGreenCasting && !IsNoBakeCasting) {
          manufactureInfo.subProcessTypeID = Number(manufactureInfo.subProcessTypeID) ? manufactureInfo.subProcessTypeID : manipulatorType;
        }
        const moldPositioning = this.shareService.isValidNumber(moldSandWeight / 1.5);
        const moldAssemlbly = this.shareService.isValidNumber(moldSandWeight * 1);
        cycleTime = moldPositioning + moldAssemlbly + 120;
      } else {
        cycleTime = 120;
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.PouringCasting) {
      //6
      defaultSetupTime = 30;
      // if (IsGreenCastingAuto) {
      //   const moldsPerHr = Number(manufactureInfo?.machineMaster?.moldRateNoCoreCyclesPerHr) || 300; //confirm machine db before removing default
      //   if (manufactureInfo.noOfCore) {
      //     manufactureInfo.noOfCore = this.shareService.isValidNumber(Number(manufactureInfo.noOfCore));
      //   } else {
      //     manufactureInfo.noOfCore = moldsPerHr;
      //   }
      //   if (matMetal) {
      //     manufactureInfo.recommendTonnage = manufactureInfo.noOfCore * matMetal?.totalPouringWeight;
      //   }
      //   cycleTime = 3600 / Number(manufactureInfo.noOfCore);
      // } else {
      // manufactureInfo.furnaceCapacityTon = manufactureInfo?.furnaceCapacityTon ? manufactureInfo.furnaceCapacityTon : 1; // Furnace Capacity per hour (tons)
      manufactureInfo.furnaceCapacityTon = manufactureInfo?.furnaceCapacityTon ? manufactureInfo.furnaceCapacityTon : manufactureInfo?.machineMaster?.furnaceCapacityTon || 1;
      if (matMetal) {
        //Mold per Hour
        if (IsInvestmentCasting) {
          manufactureInfo.noOfParts = Math.min(manufactureInfo.noOfParts, 5);
        }

        if (manufactureInfo.isNoOfCoreDirty && !!manufactureInfo.noOfCore) {
          manufactureInfo.noOfCore = this.shareService.isValidNumber(Number(manufactureInfo.noOfCore));
        } else {
          let noOfCore = 0;
          // if (IsInvestmentCasting) {
          //   noOfCore = Math.floor((processSlurryCoating?.cycleTime * 1000) / 5 / matMetal?.totalPouringWeight);
          // }
          if (IsGreenCasting) {
            noOfCore = processMoldMaking?.noOfCore || 0;
          } else if (IsNoBakeCasting) {
            noOfCore = processMelting?.noOfCore || 0;
          } else if (!IsInvestmentCasting) {
            noOfCore = Math.floor((processMelting?.selectedTonnage * 1000) / 5 / matMetal?.totalPouringWeight);
          }

          if (!IsGreenCasting && !IsInvestmentCasting) {
            noOfCore = Math.min(noOfCore, 20);
          }

          if (manufactureInfo.noOfCore) {
            noOfCore = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : noOfCore;
          }
          manufactureInfo.noOfCore = noOfCore;
        }

        manufactureInfo.recommendTonnage = Math.ceil((IsInvestmentCasting ? manufactureInfo.noOfParts : manufactureInfo.noOfCore) * matMetal?.totalPouringWeight);

        if (manufactureInfo.isselectedTonnageDirty && !!manufactureInfo.selectedTonnage) {
          manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
        } else {
          let selectedTonnage = manufactureInfo?.machineMaster?.pourCapacity ?? 0;
          if (manufactureInfo.selectedTonnage) {
            selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : selectedTonnage;
          }
          manufactureInfo.selectedTonnage = selectedTonnage;
        }

        const gravitationalConstant = 9.81;
        let sprueHeight = 1;
        // const totalDieWidth = manufactureInfo.processInfoList.find((p) => p.processTypeID === 17)?.widthOfCoated;
        const totalDieWidth = processGDC?.widthOfCoated || 0;
        if (IsGreenCasting) {
          sprueHeight = matMold ? matMold?.moldBoxHeight / 2 : 1;
        } else if (IsInvestmentCasting) {
          sprueHeight = matMold ? this.castingConfigService.castingConstants.dipTimePerCoating / 2 : 1;
        } else if (IsGDCCasting) {
          sprueHeight = totalDieWidth / 2;
        } else {
          // nobake
          sprueHeight = matMold ? matMold?.moldBoxHeight / 2 / 1000 : 1;
        }

        let drillDiameter = 30;
        if (IsNoBakeCasting || IsGreenCasting || IsGDCCasting) {
          if (manufactureInfo.isDrillDiameterDirty && !!manufactureInfo.drillDiameter) {
            // Dia of sprue
            manufactureInfo.drillDiameter = this.shareService.isValidNumber(Number(manufactureInfo.drillDiameter));
          } else {
            drillDiameter = this.manufacturingCastingConfigService.getSprueDiameter(matMetal?.totalPouringWeight || 0);
            if (manufactureInfo.drillDiameter) {
              drillDiameter = this.shareService.checkDirtyProperty('drillDiameter', fieldColorsList) ? manufacturingObj?.drillDiameter : drillDiameter;
            }
            manufactureInfo.drillDiameter = drillDiameter;
          }
          // diaSprue = manufactureInfo.drillDiameter / 2;
        }
        // if (IsNoBakeCasting) {
        //   diaSprue = this.manufacturingCastingConfigService.getSprueDiameter(matMetal?.totalPouringWeight || 0);
        // }
        const castingsCrossSectionArea = IsNoBakeCasting
          ? (Math.PI * Math.pow(Number(manufactureInfo.drillDiameter) / 2, 2)) / 1000000
          : (Math.PI * Math.pow(Number(manufactureInfo.drillDiameter), 2)) / 1000000;
        const velocityOfLiquid = Math.sqrt(2 * gravitationalConstant * sprueHeight);
        const volumetricFlowRate = castingsCrossSectionArea * velocityOfLiquid;
        const volumeOfShotWeight = ((matMetal?.totalPouringWeight / matMetal?.density) * Math.pow(10, 6)) / Math.pow(10, 9);
        const partVolume = matMetal?.partVolume / Math.pow(10, 9);
        if (IsNoBakeCasting || IsGreenCasting || IsGDCCasting) {
          const moldFillingTime = volumeOfShotWeight / volumetricFlowRate;
          // const metalTransferFromFurance = 300 / (Number(manufactureInfo.recommendTonnage) / matMetal?.totalPouringWeight);
          const metalTransferFromFurnace =
            300 /
            ((IsGDCCasting
              ? // ? matMetal?.totalPouringWeight * Math.ceil(3600 / (manufactureInfo.processInfoList.find((p) => p.processTypeID === 17)?.cycleTime ?? 1))
              matMetal?.totalPouringWeight * Math.ceil(3600 / (processGDC?.cycleTime ?? 1))
              : Number(manufactureInfo.recommendTonnage)) /
              (matMetal?.totalPouringWeight ?? 1));

          cycleTime = IsGreenCasting || IsGDCCasting ? (moldFillingTime + metalTransferFromFurnace) / matMetal?.noOfCavities : moldFillingTime + metalTransferFromFurnace;
        } else {
          const moldFillingTime = partVolume / volumetricFlowRate;
          let metalTransferFromFurnace = 300 / (Number(manufactureInfo.selectedTonnage) / matMetal?.totalPouringWeight);
          if (IsInvestmentCasting) {
            metalTransferFromFurnace = 300 / Number(manufactureInfo.noOfParts);
          }
          cycleTime = IsInvestmentCasting ? (moldFillingTime + metalTransferFromFurnace) / matMetal?.noOfCavities : moldFillingTime + metalTransferFromFurnace;
        }
      }
      // }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.CastingShakeout) {
      //7
      defaultSetupTime = 30;
      let moldweight = 0;
      if (IsGreenCastingAuto) {
        moldweight = (matMold?.moldSandWeight || 0) + (matCore?.totalCoreWeight || 0) + (matMetal?.totalPouringWeight || 0);
        // const moldsPerHr = Number(manufactureInfo?.machineMaster?.moldRateNoCoreCyclesPerHr) || 300; //confirm machine db before removing default

        if (manufactureInfo.isNoOfCoreDirty && !!manufactureInfo.noOfCore) {
          manufactureInfo.noOfCore = this.shareService.isValidNumber(Number(manufactureInfo.noOfCore));
        } else {
          let noOfCore = processMoldMaking?.noOfCore;
          if (manufactureInfo.noOfCore) {
            noOfCore = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : noOfCore;
          }
          manufactureInfo.noOfCore = noOfCore;
        }
        cycleTime = 3600 / Number(manufactureInfo.noOfCore) / Number(matMetal.noOfCavities);
        manufactureInfo.recommendTonnage = Math.ceil((moldweight * (processMoldMaking?.noOfCore || 0)) / 1000) || 0;
      } else {
        if (IsNoBakeCasting) {
          const moldBox = Number(matMold.moldBoxLength) * Number(matMold.moldBoxWidth) * Number(matMold.moldBoxHeight);
          const moldSandWeight = Math.ceil(((moldBox - (Number(matMetal?.partVolume) || 0)) * Number(matMold.density)) / Math.pow(10, 6));
          moldweight = Math.ceil(moldSandWeight + (matCore?.totalCoreWeight || 0) + (matMetal?.totalPouringWeight || 0));

          if (matMetal) {
            const partLoadUnloadTime = this._costingConfig.moldLoadingTime(Number(matMold?.moldBoxLength));
            const totalShakeOutTime = (Number(matMold?.moldBoxLength) * Number(matMold?.moldBoxWidth)) / 1000;
            cycleTime = (totalShakeOutTime + partLoadUnloadTime) / matMetal?.noOfCavities;
          }
        } else {
          if (IsGreenCastingSemiAuto) {
            moldweight = (matMold?.moldSandWeight || 0) + (matCore?.totalCoreWeight || 0) + (matMetal?.totalPouringWeight || 0);
          }

          if (matMetal) {
            // const partLoadUnloadTime = this._costingConfig.loadingUnloadingTime().find((x) => x.fromWeight <= matMetal?.netWeight && x.toWeight >= matMetal?.netWeight)?.time || 0;
            const partLoadUnloadTime = this._costingConfig.loadingUnloadingTime(moldweight);
            const totalShakeOutTime = 0.5 * (matMetal?.totalPouringWeight || 0);
            cycleTime = (totalShakeOutTime + partLoadUnloadTime) / matMetal?.noOfCavities;
          }
        }
        manufactureInfo.recommendTonnage = Math.ceil((moldweight * (processMoldMaking?.noOfCore || 0)) / 1000) || 0;
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.MoldKnockout) {
      defaultSetupTime = 30;
      const partLoadUnloadTime = 60;
      const processTime = 300;
      // cycleTime = (processTime + partLoadUnloadTime) / this.castingConfigService.castingConstants.finalCavitiesPerTree;
      cycleTime = (processTime + partLoadUnloadTime) / matMetal?.noOfCavities;
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.CastingDegating) {
      //8
      defaultSetupTime = 20;
      let gateFaceArea = 0;
      if (IsNoBakeCasting || IsGreenCasting || IsGDCCasting) {
        if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
          manufactureInfo.cuttingSpeed = this.shareService.isValidNumber(Number(manufactureInfo.cuttingSpeed));
        } else {
          let cuttingSpeed = this.manufacturingCastingConfigService.getDegatingCuttingRate(
            manufactureInfo.materialmasterDatas?.materialTypeId,
            manufactureInfo.semiAutoOrAuto,
            manufactureInfo.materialmasterDatas?.materialGroup
          );
          if (manufactureInfo.cuttingSpeed) {
            cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : cuttingSpeed;
          }
          manufactureInfo.cuttingSpeed = cuttingSpeed;
        }
        // Gate Width / Dia
        if (manufactureInfo.isDrillDiameterDirty && !!manufactureInfo.drillDiameter) {
          manufactureInfo.drillDiameter = this.shareService.isValidNumber(Number(manufactureInfo.drillDiameter));
        } else {
          let drillDiameter = 40;
          if (manufactureInfo.drillDiameter) {
            drillDiameter = this.shareService.checkDirtyProperty('drillDiameter', fieldColorsList) ? manufacturingObj?.drillDiameter : drillDiameter;
          }
          manufactureInfo.drillDiameter = drillDiameter;
        }
        // Gate Thick
        if (manufactureInfo.isflashThicknessDirty && !!manufactureInfo.flashThickness) {
          manufactureInfo.flashThickness = this.shareService.isValidNumber(Number(manufactureInfo.flashThickness));
        } else {
          let flashThickness = 6;
          if (manufactureInfo.flashThickness) {
            flashThickness = this.shareService.checkDirtyProperty('flashThickness', fieldColorsList) ? manufacturingObj?.flashThickness : flashThickness;
          }
          manufactureInfo.flashThickness = flashThickness;
        }
        // Number of Gates
        if (manufactureInfo.isnoOfPartsDirty && !!manufactureInfo.noOfParts) {
          manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
        } else {
          let noOfGates = this.shareService.isValidNumber(Math.ceil(matMetal.dimX / 180));
          if (manufactureInfo.noOfParts) {
            manufactureInfo.noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : Number(noOfGates);
          }
          manufactureInfo.noOfParts = noOfGates;
        }
        if (manufactureInfo.noOfbends === 2) {
          gateFaceArea = 3.142 * Number(manufactureInfo.drillDiameter / 2) * Number(manufactureInfo.drillDiameter / 2);
        } else {
          gateFaceArea = Number(manufactureInfo.drillDiameter) * Number(manufactureInfo.flashThickness);
        }
      }
      let processTimePerGate = this.shareService.isValidNumber(gateFaceArea / Number(manufactureInfo.cuttingSpeed));
      let partPositioningTime = this._costingConfig.loadingUnloadingTime(matMetal?.netWeight);
      if (IsInvestmentCasting) {
        if (matMetal) {
          const cuttingSpeed = 150;
          const surfaceArea = 314.2;
          const processTime = surfaceArea / cuttingSpeed;
          const rapidMovementTime = processTime * 0.05;
          // const partLoadUnloadTime = this._costingConfig.loadingUnloadingTime().find((x) => x.fromWeight <= matMetal?.netWeight && x.toWeight >= matMetal?.netWeight)?.time || 0;
          const partLoadUnloadTime = this._costingConfig.loadingUnloadingTime(matMetal?.netWeight);
          cycleTime = processTime + rapidMovementTime + partLoadUnloadTime;
        }
        // } else if (IsGreenCasting || IsGDCCasting) {
        //   cycleTime = this.manufacturingCastingConfigService.getDegatingCycleTime(
        //     matMetal?.netWeight,
        //     manufactureInfo.materialmasterDatas?.materialTypeId,
        //     manufactureInfo.materialmasterDatas?.materialGroup
        //   );
      } else if (IsNoBakeCasting || IsGreenCasting || IsGDCCasting) {
        cycleTime = this.shareService.isValidNumber(processTimePerGate * manufactureInfo.noOfParts * 60 + partPositioningTime);
      } else {
        cycleTime = 60;
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.ShotBlasting) {
      //9
      defaultSetupTime = 30;
      if (matMetal) {
        const netWeightGrams = IsHPDCCasting ? matMetal?.netWeight / 1000 : matMetal?.netWeight;
        manufactureInfo.recommendTonnage = Math.ceil(netWeightGrams * matMetal?.noOfCavities * (processMoldMaking?.noOfCore || 0));
        if (IsHPDCCasting || IsGDCCasting || IsLPDCCasting) {
          manufactureInfo.recommendTonnage = Math.ceil(netWeightGrams * (processMelting?.noOfCore || 0));
        }

        if (manufactureInfo.isselectedTonnageDirty && !!manufactureInfo.selectedTonnage) {
          manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
        } else {
          let selectedTonnage = manufactureInfo?.machineMaster?.maxProcessableWeightKgs ?? 0;
          if (manufactureInfo.selectedTonnage) {
            selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : selectedTonnage;
          }
          manufactureInfo.selectedTonnage = selectedTonnage;
        }

        const heightOfHanger = 1600; // todo should come from machine db
        const hangerBranchLength = 850; // todo should come from machine db
        // const maxPossibleWeight = IsHPDCCasting ? 600 : 180; // todo should come from machine db
        const timeReqBatch = 600; // todo should come from machine db
        // const noOfBranches = Math.floor(heightOfHanger / (matMetal?.dimX + 100));
        const noOfBranches = Math.floor(heightOfHanger / (IsGDCCasting ? matMetal?.totalPouringWeight : (IsHPDCCasting || IsLPDCCasting ? matMetal?.dimZ : (matMetal?.dimX ?? 0)) + 100));
        const noOfPartsPerBranch = Math.floor(hangerBranchLength / ((IsHPDCCasting ? matMetal?.partTickness : matMetal?.dimY) + 100));
        let partAccomodation = noOfPartsPerBranch * noOfBranches;
        const usage = Number(manufactureInfo.selectedTonnage) * 0.85;
        const partAccomodation2 = Math.floor(usage / netWeightGrams);
        if (IsNoBakeCasting || IsHPDCCasting) {
          partAccomodation = partAccomodation > partAccomodation2 ? partAccomodation : partAccomodation2;
        } else {
          // min
          partAccomodation = partAccomodation > partAccomodation2 ? partAccomodation2 : partAccomodation;
        }
        cycleTime = timeReqBatch / partAccomodation;
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.CastingFettling) {
      //10
      defaultSetupTime = 20;
      if (matMetal) {
        const netWeightGrams = IsHPDCCasting ? matMetal?.netWeight / 1000 : matMetal?.netWeight;
        // const partLoadUnloadTime = this._costingConfig.loadingUnloadingTime(netWeightGrams);
        // const partLoadUnloadTime = this.manufacturingCastingConfigService.getFettlingPartPositioningTime(netWeightGrams);
        const partLoadUnloadTime =
          IsHPDCCasting || IsLPDCCasting ? this._costingConfig.loadingUnloadingTime(netWeightGrams) : this.manufacturingCastingConfigService.getFettlingPartPositioningTime(netWeightGrams);
        const fetlingRequired = (matMetal?.dimX + matMetal?.dimY) * 2;
        const totalPerimeter = fetlingRequired + fetlingRequired * 0.3;
        // const fettlingSpeed = IsGreenCastingAuto ? 150 : 20;
        const fettlingSpeed = manufactureInfo.semiAutoOrAuto === MachineType.Automatic ? 30 : 20;

        // if (IsNoBakeCasting || IsGreenCasting || IsHPDCCasting || IsGDCCasting || IsLPDCCasting) {
        if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
          manufactureInfo.cuttingSpeed = this.shareService.isValidNumber(Number(manufactureInfo.cuttingSpeed));
        } else {
          let cuttingSpeed = fettlingSpeed;
          if (manufactureInfo.cuttingSpeed) {
            cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : cuttingSpeed;
          }
          manufactureInfo.cuttingSpeed = cuttingSpeed;
        }
        // }

        cycleTime = totalPerimeter / Number(manufactureInfo.cuttingSpeed) + partLoadUnloadTime;
      }
    } else if ([ProcessType.RadiographyTesting, ProcessType.CMMInspection].includes(Number(manufactureInfo?.processTypeID))) {
      //11
      manufactureInfo.lotSize = manufactureInfo?.lotSize ?? 1;
      defaultSamplingRate = this.manufacturingCastingConfigService.getSamplingSizeByLotSize(manufactureInfo.lotSize);
      defaultSetupTime = 30;
      if (matMetal) {
        const netWeightGrams = IsHPDCCasting ? matMetal?.netWeight / 1000 : matMetal?.netWeight;
        // const partLoadUnloadTime = this._costingConfig.loadingUnloadingTime(netWeightGrams);
        const partLoadUnloadTime = this.manufacturingCastingConfigService.getFettlingPartPositioningTime(netWeightGrams) * 2;
        cycleTime = matMetal?.partSurfaceArea / 560 + partLoadUnloadTime;
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.MetullurgicalInspection) {
      //12
      defaultSamplingRate = 100;
      defaultSetupTime = IsGreenCasting || IsGDCCasting || IsHPDCCasting || IsLPDCCasting ? 30 : 20;
      cycleTime = IsInvestmentCasting ? 600 * 0.02 : 600;
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.ManualInspection) {
      //13
      defaultSamplingRate = 100;
      defaultSetupTime = 10;
      if (matMetal) {
        const netWeightGrams = IsHPDCCasting ? matMetal?.netWeight / 1000 : matMetal?.netWeight;
        cycleTime = this.manufacturingCastingConfigService.getManualInspectionCycleTime(netWeightGrams);
      }
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.CleaningCasting) {
      defaultSetupTime = 10;
      cycleTime = 85;
      if (matMetal) {
        const netWeightGrams = IsHPDCCasting ? matMetal?.netWeight / 1000 : matMetal?.netWeight;
        cycleTime = IsHPDCCasting || IsLPDCCasting ? this.manufacturingCastingConfigService.getCleaningCastingCycleTime(netWeightGrams) : cycleTime;
      }
    } else if ([ProcessType.LeakTesting, ProcessType.BearingPressing, ProcessType.VaccumeImpregnation, ProcessType.CMMInspection].includes(Number(manufactureInfo?.processTypeID))) {
      // hpdc
      // but cmm has been added for a temporary calculation
      defaultSetupTime = 20;
      cycleTime = 85;
    } else if ([ProcessType.IonicWashing, ProcessType.IonicTesting].includes(Number(manufactureInfo?.processTypeID))) {
      // hpdc ionic washing/testing
      defaultSetupTime = 20;
      cycleTime = 60;
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.TrimmingPress) {
      // trimming
      if (IsHPDCCasting) {
        processHPDC && !processHPDC?.newToolingRequired && (manufactureInfo.newToolingRequired = false);
      } else if (IsLPDCCasting) {
        processLPDC && !processLPDC?.newToolingRequired && (manufactureInfo.newToolingRequired = false);
      }
      defaultSetupTime = 30;

      manufactureInfo.recommendedDimension = Math.ceil(matMetal?.dimX ?? 0) + ' x ' + Math.ceil(matMetal?.dimY ?? 0);
      manufactureInfo.selectedDimension = Math.ceil(manufactureInfo?.machineMaster?.platenLengthmm ?? 0) + ' x ' + Math.ceil(manufactureInfo?.machineMaster?.platenWidthmm ?? 0);

      const netWeightGrams = IsHPDCCasting ? matMetal?.netWeight : matMetal?.netWeight * 1000;
      cycleTime = this.manufacturingCastingConfigService.getTrimmingCycleTime(netWeightGrams);
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.HighPressureDieCasting) {
      // hpdc die casting
      const { cavityToCavityLength, cavityToCavityWidth, cavityToEdgeLength, cavityToEdgeWidth, noComponentWidth, noComponentLength } = {
        ...this.manufacturingCastingConfigService.getHpdcConfigValues(matMetal, ProcessType.HighPressureDieCasting),
      };
      // const cavityToCavityLength = 80, cavityToCavityWidth = 120, cavityToEdgeLength = 60, cavityToEdgeWidth = 60;
      // const factorOfSafety = 0.20, cavityPressure = 900, runnerProjectedArea = 0.6;
      // const noComponentWidth = Math.floor(matMetal?.noOfCavities / 2);
      // const noComponentLength = matMetal?.noOfCavities / noComponentWidth;

      this.manufacturingCastingConfigService.getHpdcTonnage(manufactureInfo);
      // const totalProjectedArea = (Number(matMetal?.projectedArea) + (Number(matMetal?.projectedArea) * runnerProjectedArea)) * matMetal?.noOfCavities;
      // const clampingForce = ((totalProjectedArea / 100) * cavityPressure) / 1000;
      // manufactureInfo.recommendTonnage = clampingForce + (clampingForce * factorOfSafety); // Machine Tonnage required (tons)

      // Slider Movement Length
      // if (manufactureInfo.isplatenSizeLengthDirty && !!manufactureInfo.platenSizeLength) {
      //   manufactureInfo.platenSizeLength = Number(manufactureInfo.platenSizeLength);
      // } else {
      //   manufactureInfo.platenSizeLength = this.shareService.checkDirtyProperty('platenSizeLength', fieldColorsList)
      //     ? manufacturingObj?.platenSizeLength
      //     : this.shareService.isValidNumber(manufactureInfo.platenSizeLength);
      // }
      // // Slider Movement Width
      // if (manufactureInfo.isplatenSizeWidthDirty && !!manufactureInfo.platenSizeWidth) {
      //   manufactureInfo.platenSizeWidth = Number(manufactureInfo.platenSizeWidth);
      // } else {
      //   manufactureInfo.platenSizeWidth = this.shareService.checkDirtyProperty('platenSizeWidth', fieldColorsList)
      //     ? manufacturingObj?.platenSizeWidth
      //     : this.shareService.isValidNumber(manufactureInfo.platenSizeWidth);
      // }

      // Total die Length
      if (manufactureInfo.lengthOfCoated) {
        manufactureInfo.lengthOfCoated = this.shareService.isValidNumber(Number(manufactureInfo.lengthOfCoated));
      } else {
        // manufactureInfo.lengthOfCoated = ((matMetal?.dimX + Number(manufactureInfo.platenSizeLength)) * noComponentLength) + (cavityToCavityLength * (noComponentLength - 1)) + (cavityToEdgeLength * 2);
        manufactureInfo.lengthOfCoated = (matMetal?.dimX + cavityToEdgeLength * 2) * noComponentLength + cavityToCavityLength * 2;
      }
      // Total die Width
      if (manufactureInfo.widthOfCoated) {
        manufactureInfo.widthOfCoated = this.shareService.isValidNumber(Number(manufactureInfo.widthOfCoated));
      } else {
        // manufactureInfo.widthOfCoated = ((matMetal?.dimY + Number(manufactureInfo.platenSizeWidth)) * noComponentWidth) + (cavityToCavityWidth * (noComponentWidth - 1)) + (cavityToEdgeWidth * 2);
        manufactureInfo.widthOfCoated = (matMetal?.dimY + cavityToEdgeWidth * 2) * noComponentWidth + cavityToCavityWidth * 2;
      }

      manufactureInfo.recommendedDimension = Math.ceil(manufactureInfo.lengthOfCoated ?? 0) + ' x ' + Math.ceil(manufactureInfo.widthOfCoated ?? 0);
      manufactureInfo.selectedDimension = Math.ceil(manufactureInfo?.machineMaster?.bedLength ?? 0) + ' x ' + Math.ceil(manufactureInfo?.machineMaster?.bedWidth ?? 0);
      manufactureInfo.totalTonnageRequired = manufactureInfo?.machineMaster?.machineTonnageTons ?? 0;
      manufactureInfo.noOfParts = processMelting?.noOfCore ?? 0;
      if (manufactureInfo.coolingTime) {
        // Casting part Solidification (sec)
        manufactureInfo.coolingTime = this.shareService.isValidNumber(Number(manufactureInfo.coolingTime));
      } else {
        manufactureInfo.coolingTime = this.shareService.isValidNumber(matMetal?.wallThickessMm * 2.5) || 0;
      }

      const hpdcDryCycleTime =
        this.manufacturingCastingConfigService
          .hpdcDryCycleTimeByTonnage()
          .find((x) => x.fromWeight <= Number(manufactureInfo.recommendTonnage) && x.toWeight >= Number(manufactureInfo.recommendTonnage)) || null;

      const partRemoval = 0;

      const partEjection = 5;
      const ladlePourRate = 300000;
      const ladleFillTime = 5;
      const metalInjection = matMetal?.partVolume / 45000 || 0;
      const sliderMovement = Number(manufactureInfo.noOfHitsRequired) === 1 ? hpdcDryCycleTime?.sliderMovement || 0 : 0;
      const dieOpening = hpdcDryCycleTime?.dieOpening || 0;
      const dieClosing = hpdcDryCycleTime?.dieClosing || 0;
      const metalLaddingTime = matMetal?.partVolume / ladlePourRate + ladleFillTime;
      cycleTime =
        (partRemoval + partEjection + sliderMovement + dieOpening + Number(manufactureInfo.coolingTime) + ladleFillTime + metalLaddingTime + dieClosing + sliderMovement + metalInjection) /
        (matMetal?.noOfCavities || 1);
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.GravityDieCasting) {
      // gdc die casting
      const cavityToCavityLength = 50,
        cavityToCavityWidth = 50,
        cavityToEdgeLength = 75,
        cavityToEdgeWidth = 75;
      const noComponentLength = Math.ceil(matMetal?.noOfCavities / 2) || 0,
        noComponentWidth = Math.ceil(matMetal?.noOfCavities / 2) || 0;


      // Total die Length
      if (manufactureInfo.islengthOfCoatedDirty && !!manufactureInfo.lengthOfCoated) {
        manufactureInfo.lengthOfCoated = this.shareService.isValidNumber(Number(manufactureInfo.lengthOfCoated));
      } else {
        let lengthOfCoated = (matMetal?.dimX + Number(manufactureInfo.platenSizeLength)) * noComponentLength + cavityToCavityLength * (noComponentLength - 1) + cavityToEdgeLength * 2;
        if (manufactureInfo.lengthOfCoated) {
          lengthOfCoated = this.shareService.checkDirtyProperty('lengthOfCoated', fieldColorsList) ? manufacturingObj?.lengthOfCoated : lengthOfCoated;
        }
        manufactureInfo.lengthOfCoated = this.shareService.isValidNumber(lengthOfCoated);
      }
      // Total die Width
      if (manufactureInfo.iswidthOfCoatedDirty && !!manufactureInfo.widthOfCoated) {
        manufactureInfo.widthOfCoated = this.shareService.isValidNumber(Number(manufactureInfo.widthOfCoated));
      } else {
        let widthOfCoated = (matMetal?.dimY + Number(manufactureInfo.platenSizeWidth)) * noComponentWidth + cavityToCavityWidth * (noComponentWidth - 1) + cavityToEdgeWidth * 2;
        if (manufactureInfo.widthOfCoated) {
          widthOfCoated = this.shareService.checkDirtyProperty('widthOfCoated', fieldColorsList) ? manufacturingObj?.widthOfCoated : widthOfCoated;
        }
        manufactureInfo.widthOfCoated = this.shareService.isValidNumber(widthOfCoated);
      }

      manufactureInfo.recommendedDimension = Math.ceil(manufactureInfo.lengthOfCoated ?? 0) + ' x ' + Math.ceil(manufactureInfo.widthOfCoated ?? 0);
      manufactureInfo.selectedDimension = Math.ceil(manufactureInfo?.machineMaster?.platenLengthmm ?? 0) + ' x ' + Math.ceil(manufactureInfo?.machineMaster?.platenWidthmm ?? 0);
      manufactureInfo.noOfParts = processMelting?.noOfCore ?? 0;

      const dieOpening = 10,
        dieClosing = 10,
        moldFillRate = 240000,
        fillTimeConst = 15,
        ladleFillTimeConst = 10,
        ladlePourRate = 300000,
        coreLadlingTime = 30 * noOfCores;
      const fillTime = matMetal?.partVolume / moldFillRate + fillTimeConst;
      const ladleTime = matMetal?.partVolume / ladlePourRate + ladleFillTimeConst;
      const dieSprayingTime = 18500,
        dieArea = Number(manufactureInfo?.lengthOfCoated) * Number(manufactureInfo?.widthOfCoated);
      const dieSprayingDrying = dieArea / dieSprayingTime;
      const solidificationTimeConst = 90;
      const coolingFactor = 0.5;

      const maxThickness = matMetal?.wallAverageThickness || 0;
      const projectedArea = matMetal?.partProjectedArea / Math.pow(10, 6);
      const surfaceArea = matMetal?.partSurfaceArea / Math.pow(10, 6);
      const solidificationTime = solidificationTimeConst + maxThickness * coolingFactor * (surfaceArea / projectedArea);

      const partRemoval = this._costingConfig.loadingUnloadingTime(matMetal?.netWeight);

      if (manufactureInfo.iscoolingTimeDirty && !!manufactureInfo.coolingTime) {
        manufactureInfo.coolingTime = this.shareService.isValidNumber(Number(manufactureInfo.coolingTime));
      } else {
        let coolingTime = solidificationTime;
        if (manufactureInfo.coolingTime) {
          coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
        }
        manufactureInfo.coolingTime = this.shareService.isValidNumber(coolingTime);
      }

      cycleTime = Number(manufactureInfo.coolingTime) + coreLadlingTime + dieSprayingDrying + ladleTime + fillTime + dieOpening + dieClosing + partRemoval;
    } else if (Number(manufactureInfo?.processTypeID) === ProcessType.LowPressureDieCasting) {
      // lpdc die casting
      const cavityToCavityLength = 50,
        cavityToCavityWidth = 50,
        cavityToEdgeLength = 75,
        cavityToEdgeWidth = 75;
      const noComponentLength = Math.ceil(matMetal?.noOfCavities / 2) || 0,
        noComponentWidth = Math.ceil(matMetal?.noOfCavities / 2) || 0;

      // Slider Movement Length
      // if (manufactureInfo.isplatenSizeLengthDirty && !!manufactureInfo.platenSizeLength) {
      //   manufactureInfo.platenSizeLength = Number(manufactureInfo.platenSizeLength);
      // } else {
      //   manufactureInfo.platenSizeLength = this.shareService.checkDirtyProperty('platenSizeLength', fieldColorsList)
      //     ? manufacturingObj?.platenSizeLength
      //     : this.shareService.isValidNumber(manufactureInfo.platenSizeLength);
      // }
      // // Slider Movement Width
      // if (manufactureInfo.isplatenSizeWidthDirty && !!manufactureInfo.platenSizeWidth) {
      //   manufactureInfo.platenSizeWidth = Number(manufactureInfo.platenSizeWidth);
      // } else {
      //   manufactureInfo.platenSizeWidth = this.shareService.checkDirtyProperty('platenSizeWidth', fieldColorsList)
      //     ? manufacturingObj?.platenSizeWidth
      //     : this.shareService.isValidNumber(manufactureInfo.platenSizeWidth);
      // }

      // Total die Length
      if (manufactureInfo.islengthOfCoatedDirty && !!manufactureInfo.lengthOfCoated) {
        manufactureInfo.lengthOfCoated = this.shareService.isValidNumber(Number(manufactureInfo.lengthOfCoated));
      } else {
        // let lengthOfCoated = (matMetal?.dimX + Number(manufactureInfo.platenSizeLength)) * noComponentLength + cavityToCavityLength * (noComponentLength - 1) + cavityToEdgeLength * 2;
        let lengthOfCoated = (matMetal?.partTickness + Number(manufactureInfo.platenSizeLength)) * noComponentLength + cavityToCavityLength * (noComponentLength - 1) + cavityToEdgeLength * 2;
        if (manufactureInfo.lengthOfCoated) {
          lengthOfCoated = this.shareService.checkDirtyProperty('lengthOfCoated', fieldColorsList) ? manufacturingObj?.lengthOfCoated : lengthOfCoated;
        }
        manufactureInfo.lengthOfCoated = this.shareService.isValidNumber(lengthOfCoated);
      }
      // Total die Width
      if (manufactureInfo.iswidthOfCoatedDirty && !!manufactureInfo.widthOfCoated) {
        manufactureInfo.widthOfCoated = this.shareService.isValidNumber(Number(manufactureInfo.widthOfCoated));
      } else {
        let widthOfCoated = (matMetal?.dimY + Number(manufactureInfo.platenSizeWidth)) * noComponentWidth + cavityToCavityWidth * (noComponentWidth - 1) + cavityToEdgeWidth * 2;
        if (manufactureInfo.widthOfCoated) {
          widthOfCoated = this.shareService.checkDirtyProperty('widthOfCoated', fieldColorsList) ? manufacturingObj?.widthOfCoated : widthOfCoated;
        }
        manufactureInfo.widthOfCoated = this.shareService.isValidNumber(widthOfCoated);
      }

      manufactureInfo.recommendedDimension = Math.ceil(manufactureInfo.lengthOfCoated ?? 0) + ' x ' + Math.ceil(manufactureInfo.widthOfCoated ?? 0);
      manufactureInfo.selectedDimension = Math.ceil(manufactureInfo?.machineMaster?.platenLengthmm ?? 0) + ' x ' + Math.ceil(manufactureInfo?.machineMaster?.platenWidthmm ?? 0);
      manufactureInfo.totalTonnageRequired = manufactureInfo?.machineMaster?.machineTonnageTons ?? 0;
      manufactureInfo.noOfParts = processMelting?.noOfCore ?? 0;

      const dieOpening = 10,
        dieClosing = 10,
        // moldFillRate = 7500,
        fillTimeConst = 15,
        // ladleFillTimeConst = 10,
        // ladlePourRate = 300000,
        corePlacementTime = 20 * noOfCores;
      const sliderMovement = Number(manufactureInfo.noOfHitsRequired) === 1 ? 7 : 0;
      // const partVolume = matMetal?.partVolume * 1.25;
      const partVolume = (matMetal?.totalPouringWeight / matMetal?.dimX) * Math.pow(10, 6);
      const moldFillRate = partVolume / (matMetal?.partTickness * 2.5);
      const fillTime = partVolume / moldFillRate + fillTimeConst;
      // const ladleTime = matMetal?.partVolume / ladlePourRate + ladleFillTimeConst;
      const dieSprayingTime = 18500;
      const dieArea = Number(manufactureInfo?.lengthOfCoated) * Number(manufactureInfo?.widthOfCoated);
      const dieSprayingDrying = dieArea / dieSprayingTime;
      const solidificationTimeConst = 90;
      const coolingFactor = 0.75;
      // const projectedArea = manufactureInfo.partArea;
      // const surfaceArea = manufactureInfo.flashArea;
      const projectedArea = ((matMetal?.partProjectedArea + matMetal?.partProjectedArea * (60 / 100)) * matMetal?.noOfCavities) / Math.pow(10, 6);
      const surfaceArea = matMetal?.partSurfaceArea / Math.pow(10, 6);
      const solidificationTime = solidificationTimeConst * matMetal?.partTickness * coolingFactor * ((surfaceArea / projectedArea) * 0.25);
      // const solidificationTime = solidificationTimeConst * Math.pow(surfaceArea / projectedArea, 2); // to check
      // const solidificationTime = solidificationTimeConst * Math.pow(matMetal?.partVolume / dieArea, 2); // to check
      // const solidificationTime = solidificationTimeConst * Math.pow(partVolume / dieArea, 2);
      const partRemoval = this._costingConfig.loadingUnloadingTime(matMetal?.netWeight);

      if (manufactureInfo.iscoolingTimeDirty && !!manufactureInfo.coolingTime) {
        manufactureInfo.coolingTime = this.shareService.isValidNumber(Number(manufactureInfo.coolingTime));
      } else {
        let coolingTime = solidificationTime;
        if (manufactureInfo.coolingTime) {
          coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
        }
        manufactureInfo.coolingTime = this.shareService.isValidNumber(coolingTime);
      }

      cycleTime =
        (Number(manufactureInfo.coolingTime) + corePlacementTime + dieSprayingDrying + fillTime + dieOpening + dieClosing + partRemoval + sliderMovement + sliderMovement) / matMetal?.noOfCavities;
    }
    /** End - Process based calc */

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = this.shareService.isValidNumber(cycleTime);
    }

    if (manufactureInfo.ismachineHourRateDirty && !!manufactureInfo.machineHourRate) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList)
        ? manufacturingObj?.machineHourRate
        : this.shareService.isValidNumber(manufactureInfo.machineHourRate);
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
    // if (manufactureInfo.isQaInspectorRateDirty && !!manufactureInfo.qaOfInspectorRate) {
    //   manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    // } else {
    //   manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList) ? manufacturingObj?.qaOfInspectorRate : 0;
    // }
    if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : defaultSamplingRate;
    }

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList)
        ? manufacturingObj?.efficiency
        : this.shareService.isValidNumber(manufactureInfo.efficiency) || 85;
      if (Number(manufactureInfo.efficiency) < 1) {
        manufactureInfo.efficiency *= 100;
      }
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && !!manufactureInfo.noOfLowSkilledLabours) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours) || defaultNoOfLowSkilledLabours;
    }

    // let piecesWitEfficiency = this.shareService.isValidNumber(((3600 / manufactureInfo.cycleTime) * Number(manufactureInfo.efficiency)) * Number(manufactureInfo.noOfParts));

    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : defaultSetupTime;
      // : this.shareService.isValidNumber(manufactureInfo.setUpTime) || defaultSetupTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && !!manufactureInfo.directMachineCost) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      let directMachineCost = 0;
      if (
        (IsHPDCCasting && [ProcessType.HighPressureDieCasting, ProcessType.TrimmingPress].includes(Number(manufactureInfo?.processTypeID))) ||
        (IsGDCCasting && Number(manufactureInfo?.processTypeID) === ProcessType.GravityDieCasting) ||
        (IsInvestmentCasting && Number(manufactureInfo?.processTypeID) === ProcessType.TreePatternAssembly)
      ) {
        directMachineCost = this.shareService.isValidNumber(((manufactureInfo.machineHourRate / 3600) * (manufactureInfo.cycleTime / matMetal?.noOfCavities)) / (manufactureInfo.efficiency / 100));
      } else if (IsLPDCCasting && Number(manufactureInfo?.processTypeID) === ProcessType.TrimmingPress) {
        directMachineCost = this.shareService.isValidNumber(((manufactureInfo.machineHourRate / 3600) * (manufactureInfo.cycleTime / assemblingOfCore)) / (manufactureInfo.efficiency / 100));
      } else if (
        IsGreenCastingAuto &&
        [ProcessType.MoldPerparation, ProcessType.MeltingCasting, ProcessType.PouringCasting, ProcessType.CastingShakeout, ProcessType.CastingDegating].includes(Number(manufactureInfo?.processTypeID))
      ) {
        directMachineCost = this.shareService.isValidNumber(((manufactureInfo.machineHourRate / 3600 / matMetal?.noOfCavities) * manufactureInfo.cycleTime) / (manufactureInfo.efficiency / 100));
      } else {
        directMachineCost = this.shareService.isValidNumber(((manufactureInfo.machineHourRate / 3600) * manufactureInfo.cycleTime) / (manufactureInfo.efficiency / 100));
      }
      if (manufactureInfo.directMachineCost) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && !!manufactureInfo.directSetUpCost) {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(Number(manufactureInfo.directSetUpCost));
    } else {
      let directSetUpCost = this.shareService.isValidNumber(((manufactureInfo.skilledLaborRatePerHour + manufactureInfo.machineHourRate) * (manufactureInfo.setUpTime / 60)) / manufactureInfo.lotSize);
      if (manufactureInfo.directSetUpCost) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && !!manufactureInfo.directLaborCost) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      let directLaborCost = 0;
      if (
        (IsHPDCCasting && [ProcessType.HighPressureDieCasting, ProcessType.TrimmingPress].includes(Number(manufactureInfo?.processTypeID))) ||
        (IsGDCCasting && Number(manufactureInfo?.processTypeID) === ProcessType.GravityDieCasting) ||
        (IsInvestmentCasting && Number(manufactureInfo?.processTypeID) === ProcessType.TreePatternAssembly)
      ) {
        directLaborCost = this.shareService.isValidNumber(
          ((manufactureInfo.lowSkilledLaborRatePerHour / 3600) * ((manufactureInfo.cycleTime / matMetal?.noOfCavities) * manufactureInfo.noOfLowSkilledLabours)) / (manufactureInfo.efficiency / 100)
        );
      } else if (IsLPDCCasting && Number(manufactureInfo?.processTypeID) === ProcessType.TrimmingPress) {
        directLaborCost = this.shareService.isValidNumber(
          ((manufactureInfo.lowSkilledLaborRatePerHour / 3600) * ((manufactureInfo.cycleTime / assemblingOfCore) * manufactureInfo.noOfLowSkilledLabours)) / (manufactureInfo.efficiency / 100)
        );
      } else if (
        IsGreenCastingAuto &&
        [ProcessType.MoldPerparation, ProcessType.MeltingCasting, ProcessType.PouringCasting, ProcessType.CastingShakeout, ProcessType.CastingDegating].includes(Number(manufactureInfo?.processTypeID))
      ) {
        directLaborCost = this.shareService.isValidNumber(
          ((manufactureInfo.lowSkilledLaborRatePerHour / 3600 / matMetal?.noOfCavities) * manufactureInfo.cycleTime * manufactureInfo.noOfLowSkilledLabours) / (manufactureInfo.efficiency / 100)
        );
      } else {
        directLaborCost = this.shareService.isValidNumber(
          ((manufactureInfo.lowSkilledLaborRatePerHour / 3600) * (manufactureInfo.cycleTime * manufactureInfo.noOfLowSkilledLabours)) / (manufactureInfo.efficiency / 100)
        );
      }
      // } else {
      //   directLaborCost = this.shareService.isValidNumber(((
      //     (Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours)) +
      //     (Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours))) / piecesWitEfficiency) * (Number(manufactureInfo?.samplingRate) / 100)
      //   );
      // }
      if (manufactureInfo.directLaborCost) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.processTypeID) {
      manufactureInfo.directProcessCost = this.shareService.isValidNumber(
        Number(manufactureInfo.directLaborCost ?? 0) + Number(manufactureInfo.directMachineCost ?? 0) + Number(manufactureInfo.directSetUpCost ?? 0) + Number(manufactureInfo.inspectionCost ?? 0)
      );
    }

    if (
      (IsGreenCastingAuto && ProcessType.MoldPerparation === Number(manufactureInfo?.processTypeID)) ||
      (IsHPDCCasting && ProcessType.HighPressureDieCasting === Number(manufactureInfo?.processTypeID))
    ) {
      manufactureInfo.yieldCost = manufactureInfo?.yieldPer
        ? this.shareService.isValidNumber(
          (Number(manufactureInfo.directProcessCost) + materialInfoList.reduce((prev, cur) => prev + cur.netMatCost, 0)) * ((100 - Number(manufactureInfo?.yieldPer)) / 100)
        )
        : 0;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(manufactureInfo.directProcessCost + Number(manufactureInfo.yieldCost));

    if ([ProcessType.MetullurgicalInspection].includes(Number(manufactureInfo?.processTypeID))) {
      // manufactureInfo.directProcessCost = manufactureInfo.directProcessCost / (processMelting?.noOfCore || 1);
      const totalPouringWeight = IsHPDCCasting ? matMetal?.totalPouringWeight / 1000 : matMetal?.totalPouringWeight;
      manufactureInfo.directProcessCost = manufactureInfo.directProcessCost / ((processMelting?.selectedTonnage * 1000) / totalPouringWeight);
    }

    if ([ProcessType.RadiographyTesting, ProcessType.CMMInspection].includes(Number(manufactureInfo?.processTypeID))) {
      // const parts = this.manufacturingCastingConfigService.getPartsBySamplingRate(manufactureInfo.samplingRate);
      const parts = (manufactureInfo.samplingRate / 100) * manufactureInfo.lotSize;
      manufactureInfo.directProcessCost = this.shareService.isValidNumber((manufactureInfo.directProcessCost * parts) / manufactureInfo.lotSize);
    } else if ([ProcessType.MetullurgicalInspection, ProcessType.ManualInspection].includes(Number(manufactureInfo?.processTypeID))) {
      manufactureInfo.directProcessCost = this.shareService.isValidNumber(manufactureInfo.directProcessCost * (Number(manufactureInfo.samplingRate) / 100));
    } else if (
      [ProcessType.TrimmingPress].includes(Number(manufactureInfo?.processTypeID)) ||
      (IsHPDCCasting && [ProcessType.HighPressureDieCasting, ProcessType.MeltingCasting, ProcessType.CastingFettling].includes(Number(manufactureInfo?.processTypeID)))
    ) {
      if (manufactureInfo?.samplingRate) {
        manufactureInfo.directProcessCost = this.shareService.isValidNumber(manufactureInfo.directProcessCost * (Number(manufactureInfo?.samplingRate) / 100));
      }
    } else if (
      [ProcessType.CastingMoldAssembly, ProcessType.CastingMoldMaking, ProcessType.CastingShakeout].includes(Number(manufactureInfo?.processTypeID)) ||
      (IsNoBakeCasting && ProcessType.PouringCasting === Number(manufactureInfo?.processTypeID))
    ) {
      manufactureInfo.directProcessCost = manufactureInfo.directProcessCost / (matMetal?.noOfCavities || 1);
    }

    return manufactureInfo;
  }

  // public CalculationForHPDCCasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto)
  //   : Observable<ProcessInfoDto> {
  //   manufactureInfo.runnerAllowance = 75;
  //   manufactureInfo.runnerAllowance = manufactureInfo.runnerAllowance;
  //   if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
  //     manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
  //   } else {
  //     if (manufactureInfo.efficiency != null)
  //       manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
  //   }
  //   if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
  //     manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
  //   } else {
  //     manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : this.shareService.isValidNumber(manufactureInfo.machineHourRate);
  //   }
  //   if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
  //     manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
  //   } else {
  //     manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
  //   }
  //   if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour != null) {
  //     manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
  //   } else {
  //     manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList) ? manufacturingObj?.lowSkilledLaborRatePerHour : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
  //   }
  //   if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.skilledLaborRatePerHour != null) {
  //     manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
  //   } else {
  //     manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList) ? manufacturingObj?.skilledLaborRatePerHour : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
  //   }
  //   if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
  //     manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
  //   } else {
  //     manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList) ? manufacturingObj?.qaOfInspectorRate : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
  //   }
  //   if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate != null) {
  //     manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
  //   } else {
  //     manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : this.shareService.isValidNumber(manufactureInfo.samplingRate);
  //   }

  //   if (manufactureInfo.isallowanceBetweenPartsDirty && manufactureInfo.allowanceBetweenParts != null) {
  //     manufactureInfo.allowanceBetweenParts = Number(manufactureInfo.allowanceBetweenParts);
  //   } else {
  //     manufactureInfo.allowanceBetweenParts = this.shareService.checkDirtyProperty('allowanceBetweenParts', fieldColorsList) ? manufacturingObj?.allowanceBetweenParts : Number(manufactureInfo.allowanceBetweenParts);
  //   }

  //   if (manufactureInfo.isallowanceAlongLengthDirty && manufactureInfo.allowanceAlongLength != null) {
  //     manufactureInfo.allowanceAlongLength = Number(manufactureInfo.allowanceAlongLength);
  //   } else {
  //     manufactureInfo.allowanceAlongLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList) ? manufacturingObj?.allowanceAlongLength : Number(manufactureInfo.allowanceAlongLength);
  //   }

  //   if (manufactureInfo.isallowanceAlongWidthDirty && manufactureInfo.allowanceAlongWidth != null) {
  //     manufactureInfo.allowanceAlongWidth = Number(manufactureInfo.allowanceAlongWidth);
  //   } else {
  //     manufactureInfo.allowanceAlongWidth = this.shareService.checkDirtyProperty('allowanceAlongWidth', fieldColorsList) ? manufacturingObj?.allowanceAlongWidth : Number(manufactureInfo.allowanceAlongWidth);
  //   }

  //   const partLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimX;
  //   const partWidth = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimY;
  //   const maxWallthick = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.wallThickessMm;
  //   const noOfCavities = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.noOfCavities;
  //   const avgWallthick = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ;
  //   const partProjectArea = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partProjectedArea;
  //   const cavityArrangementLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.cavityArrangementLength;
  //   const cavityArrangementWidth = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.cavityArrangementWidth;
  //   const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;

  //   if (manufactureInfo.isplatenSizeLengthDirty && manufactureInfo.platenSizeLength != null) {
  //     manufactureInfo.platenSizeLength = Number(manufactureInfo.platenSizeLength);
  //   } else {
  //     manufactureInfo.platenSizeLength = this.shareService.isValidNumber((Number(partLength) * Number(cavityArrangementLength)) + (Number(manufactureInfo.allowanceBetweenParts) * (Number(cavityArrangementLength) - 1)) + (Number(manufactureInfo.allowanceAlongLength) * 2));
  //     manufactureInfo.platenSizeLength = this.shareService.checkDirtyProperty('platenSizeLength', fieldColorsList) ? manufacturingObj?.platenSizeLength : manufactureInfo.platenSizeLength;
  //   }

  //   if (manufactureInfo.isplatenSizeWidthDirty && manufactureInfo.platenSizeWidth != null) {
  //     manufactureInfo.platenSizeWidth = Number(manufactureInfo.platenSizeWidth);
  //   } else {
  //     manufactureInfo.platenSizeWidth = this.shareService.isValidNumber((Number(partWidth) * Number(cavityArrangementWidth)) + (Number(manufactureInfo.allowanceBetweenParts) * (Number(cavityArrangementWidth) - 1)) + (Number(manufactureInfo.allowanceAlongWidth) * 2) + Number(manufactureInfo.runnerAllowance));
  //     manufactureInfo.platenSizeWidth = this.shareService.checkDirtyProperty('platenSizeWidth', fieldColorsList) ? manufacturingObj?.platenSizeWidth : manufactureInfo.platenSizeWidth;
  //   }
  //   if (manufactureInfo.isshotSizeDirty && manufactureInfo.shotSize != null) {
  //     manufactureInfo.shotSize = Number(manufactureInfo.shotSize);
  //   } else {
  //     manufactureInfo.shotSize = this.shareService.isValidNumber(Number(grossWeight) * Number(noOfCavities));
  //     manufactureInfo.shotSize = this.shareService.checkDirtyProperty('shotSize', fieldColorsList) ? manufacturingObj?.shotSize : manufactureInfo.shotSize;
  //   }

  //   if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
  //     manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
  //   } else {
  //     manufactureInfo.noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : Number(noOfCavities);
  //   }

  //   if (manufactureInfo.isflashAreaDirty && manufactureInfo.flashArea != null) {
  //     manufactureInfo.flashArea = Number(manufactureInfo.flashArea);
  //   } else {
  //     manufactureInfo.flashArea = this.shareService.isValidNumber((Number(partLength) + Number(partWidth)) * (Number(maxWallthick) + 1.5) * Number(noOfCavities));
  //     manufactureInfo.flashArea = this.shareService.checkDirtyProperty('flashArea', fieldColorsList) ? manufacturingObj?.flashArea : manufactureInfo.flashArea;
  //   }

  //   if (manufactureInfo.isclampingPressureDirty && manufactureInfo.clampingPressure != null) {
  //     manufactureInfo.clampingPressure = Number(manufactureInfo.clampingPressure);
  //   } else {
  //     manufactureInfo.clampingPressure = this.shareService.checkDirtyProperty('clampingPressure', fieldColorsList) ? manufacturingObj?.clampingPressure : manufactureInfo.materialmasterDatas?.clampingPressure;
  //   }
  //   manufactureInfo.partArea = manufactureInfo.partArea;

  //   let theoriticalForcce = this.shareService.isValidNumber(((Number(manufactureInfo.partArea) * Number(manufactureInfo.noOfParts)) + Number(manufactureInfo.flashArea)) * Number(manufactureInfo.clampingPressure) * 1.4 / 10000);
  //   manufactureInfo.recommendTonnage = Number(theoriticalForcce) * 1.2;

  //   if (manufactureInfo.isinjectionTempDirty && manufactureInfo.injectionTemp != null) {
  //     manufactureInfo.injectionTemp = Number(manufactureInfo.injectionTemp);
  //   } else {
  //     manufactureInfo.injectionTemp = this.shareService.checkDirtyProperty('injectionTemp', fieldColorsList) ? manufacturingObj?.injectionTemp : manufactureInfo.materialmasterDatas?.injectionTemp;
  //   }

  //   if (manufactureInfo.isliquidTempDirty && manufactureInfo.liquidTemp != null) {
  //     manufactureInfo.liquidTemp = Number(manufactureInfo.liquidTemp);
  //   } else {
  //     manufactureInfo.liquidTemp = this.shareService.checkDirtyProperty('liquidTemp', fieldColorsList) ? manufacturingObj?.liquidTemp : manufactureInfo.materialmasterDatas?.liquidTemp;
  //   }

  //   if (manufactureInfo.ismoldTempDirty && manufactureInfo.moldTemp != null) {
  //     manufactureInfo.moldTemp = Number(manufactureInfo.moldTemp);
  //   } else {
  //     manufactureInfo.moldTemp = this.shareService.checkDirtyProperty('moldTemp', fieldColorsList) ? manufacturingObj?.moldTemp : manufactureInfo.materialmasterDatas?.moldTemp;
  //   }

  //   if (manufactureInfo.iscoolingFactorDirty && manufactureInfo.coolingFactor != null) {
  //     manufactureInfo.coolingFactor = Number(manufactureInfo.coolingFactor);
  //   } else {
  //     manufactureInfo.coolingFactor = this.shareService.checkDirtyProperty('coolingFactor', fieldColorsList) ? manufacturingObj?.coolingFactor : manufactureInfo.materialmasterDatas?.coolingFactor;
  //   }

  //   if (manufactureInfo.isinjectionRateDirty) {
  //     manufactureInfo.injectionRate = Number(manufactureInfo.injectionRate);
  //   } else {
  //     manufactureInfo.injectionRate = this.shareService.checkDirtyProperty('injectionRate', fieldColorsList) ? manufacturingObj?.injectionRate : manufactureInfo.materialmasterDatas?.injectionRate;
  //   }

  //   if (manufactureInfo.isdieClosingTimeDirty && manufactureInfo.dieClosingTime != null) {
  //     manufactureInfo.dieClosingTime = Number(manufactureInfo.dieClosingTime);
  //   } else {
  //     manufactureInfo.dieClosingTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime) / 2);
  //     manufactureInfo.dieClosingTime = this.shareService.checkDirtyProperty('dieClosingTime', fieldColorsList) ? manufacturingObj?.dieClosingTime : manufactureInfo.dieClosingTime;
  //   }

  //   let injectTimePerCavity = this.shareService.isValidNumber(0.035 * (Number(avgWallthick) * (Number(manufactureInfo.injectionTemp) - Number(manufactureInfo.liquidTemp) + 61) / (Number(manufactureInfo.injectionTemp) - Number(manufactureInfo.moldTemp))));

  //   if (manufactureInfo.istotalInjectionTimeDirty && manufactureInfo.totalInjectionTime != null) {
  //     manufactureInfo.totalInjectionTime = Number(manufactureInfo.totalInjectionTime);
  //   } else {
  //     manufactureInfo.totalInjectionTime = Math.ceil(Number(injectTimePerCavity) * Number(manufactureInfo.noOfParts));
  //     manufactureInfo.totalInjectionTime = this.shareService.checkDirtyProperty('totalInjectionTime', fieldColorsList) ? manufacturingObj?.totalInjectionTime : manufactureInfo.totalInjectionTime;
  //   }

  //   if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime != null) {
  //     manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
  //   } else {
  //     manufactureInfo.coolingTime = this.shareService.isValidNumber((Number(maxWallthick) * Number(manufactureInfo.coolingFactor) * (Math.pow((Number(partProjectArea) / Number(manufactureInfo.partArea)), 0.5))));
  //     manufactureInfo.coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : manufactureInfo.coolingTime;
  //   }

  //   if (manufactureInfo.isdieOpeningTimeDirty && manufactureInfo.dieOpeningTime != null) {
  //     manufactureInfo.dieOpeningTime = Number(manufactureInfo.dieOpeningTime);
  //   } else {
  //     manufactureInfo.dieOpeningTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime) / 2);
  //     manufactureInfo.dieOpeningTime = this.shareService.checkDirtyProperty('dieOpeningTime', fieldColorsList) ? manufacturingObj?.dieOpeningTime : manufactureInfo.dieOpeningTime;
  //   }

  //   if (manufactureInfo.ispartExtractionTimeDirty && manufactureInfo.partExtractionTime != null) {
  //     manufactureInfo.partExtractionTime = Number(manufactureInfo.partExtractionTime);
  //   } else {
  //     manufactureInfo.partExtractionTime = this.shareService.checkDirtyProperty('partExtractionTime', fieldColorsList) ? manufacturingObj?.partExtractionTime : Number(manufactureInfo.partExtractionTime);
  //   }

  //   if (manufactureInfo.islubeTimeDirty && manufactureInfo.lubeTime != null) {
  //     manufactureInfo.lubeTime = Number(manufactureInfo.lubeTime);
  //   } else {
  //     manufactureInfo.lubeTime = this.shareService.checkDirtyProperty('lubeTime', fieldColorsList) ? manufacturingObj?.lubeTime : Number(manufactureInfo.lubeTime);
  //   }

  //   if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
  //     manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
  //   } else {
  //     manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
  //   }
  //   let withoutEfficiency = this.shareService.isValidNumber(Number(manufactureInfo.totalInjectionTime) + Number(manufactureInfo.pouringTime) + Number(manufactureInfo.coolingTime) + Number(manufactureInfo.dieOpeningTime) + Number(manufactureInfo.partExtractionTime) + Number(manufactureInfo.lubeTime));
  //   const slideReduction = 0.09;
  //   const cavityReduction = this.shareService.isValidNumber(0.01 * (Number(manufactureInfo.noOfParts) - 1));
  //   const yieldLoss = 0.95;
  //   if (manufactureInfo.isyieldTimeLossDirty && manufactureInfo.yieldTimeLoss != null) {
  //     manufactureInfo.yieldTimeLoss = Number(manufactureInfo.yieldTimeLoss);
  //   } else {
  //     manufactureInfo.yieldTimeLoss = this.shareService.isValidNumber(Number(slideReduction) + Number(cavityReduction) + Number(yieldLoss));
  //     manufactureInfo.yieldTimeLoss = this.shareService.checkDirtyProperty('yieldTimeLoss', fieldColorsList) ? manufacturingObj?.yieldTimeLoss : manufactureInfo.yieldTimeLoss;
  //   }

  //   if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
  //     manufactureInfo.totalCycleTime = Number(manufactureInfo.totalCycleTime);
  //   } else {
  //     manufactureInfo.totalCycleTime = this.shareService.isValidNumber((Number(withoutEfficiency) * Number(manufactureInfo.yieldTimeLoss)) / (Number(manufactureInfo.efficiency) / 100));
  //     manufactureInfo.totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : manufactureInfo.totalCycleTime;
  //   }
  //   manufactureInfo.cycleTime = manufactureInfo.totalCycleTime;

  //   let toolLoadingInfo = manufactureInfo.toolLoadingTimeList?.filter((x) => x.tonnage > Number(manufactureInfo.recommendTonnage) && x.toolType == ToolType.PressMachine).sort((s) => s.tonnage);
  //   let toolLoadingTIme = toolLoadingInfo[0]?.toolLoadingTime;
  //   if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
  //     manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
  //   } else {
  //     manufactureInfo.setUpTime = this.shareService.isValidNumber((Number(toolLoadingTIme)) / manufactureInfo.lotSize);
  //     manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
  //   }
  //   if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
  //     manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
  //   } else {
  //     manufactureInfo.inspectionTime =
  //       manufactureInfo.partComplexity == PartComplexity.Low
  //         ? 5
  //         : manufactureInfo.partComplexity == PartComplexity.Medium
  //           ? 10
  //           : manufactureInfo.partComplexity == PartComplexity.High
  //             ? 20
  //             : 0;
  //     manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
  //   }

  //   if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
  //     manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
  //   } else {
  //     manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.totalCycleTime));
  //     manufactureInfo.directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
  //   }
  //   if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
  //     manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
  //   } else {
  //     manufactureInfo.directSetUpCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) *
  //       (Number(manufactureInfo.setUpTime) *
  //         Number(manufactureInfo.noOfLowSkilledLabours)) +
  //       (Number(manufactureInfo.skilledLaborRatePerHour) / 60) *
  //       (Number(manufactureInfo.setUpTime) *
  //         Number(manufactureInfo.noOfSkilledLabours)) +
  //       (Number(manufactureInfo.machineHourRate) / 60) *
  //       Number(manufactureInfo.setUpTime));
  //     manufactureInfo.directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
  //   }
  //   if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
  //     manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
  //   } else {
  //     manufactureInfo.directLaborCost = this.shareService.isValidNumber(
  //       (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) *
  //       (Number(manufactureInfo.totalCycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
  //     );
  //     manufactureInfo.directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
  //   }
  //   if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
  //     manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
  //   } else {
  //     manufactureInfo.inspectionCost = this.shareService.isValidNumber(((Number(manufactureInfo.qaOfInspectorRate) / 60) *
  //       Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) / Number(manufactureInfo.lotSize));
  //     manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
  //   }

  //   if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
  //     manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
  //   } else {
  //     let sum = this.shareService.isValidNumber(
  //       Number(manufactureInfo.directMachineCost) +
  //       Number(manufactureInfo.directSetUpCost) +
  //       Number(manufactureInfo.directLaborCost) +
  //       Number(manufactureInfo.inspectionCost)
  //     );
  //     manufactureInfo.yieldCost = this.shareService.isValidNumber(
  //       (1 - Number(manufactureInfo.yieldPer) / 100) *
  //       (Number(manufactureInfo.materialInfo.totalCost) -
  //         (Number(manufactureInfo.materialInfo.weight) / 1000) *
  //         Number(manufactureInfo.materialInfo.scrapPrice) +
  //         sum)
  //     );
  //     manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
  //   }

  //   manufactureInfo.directProcessCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost)
  //     + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.inspectionCost) + Number(manufactureInfo.yieldCost));

  //   manufactureInfo.totalElectricityConsumption = this.shareService.isValidNumber((manufactureInfo.cycleTime * manufactureInfo?.machineMaster?.ratedPower) / 3600);
  //   if (manufactureInfo.isesgImpactElectricityConsumptionDirty && manufactureInfo.esgImpactElectricityConsumption != null) {
  //     manufactureInfo.esgImpactElectricityConsumption = Number(manufactureInfo.esgImpactElectricityConsumption);
  //   } else {
  //     let esgImpactElectricityConsumption = 0;
  //     if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
  //       let country = manufactureInfo.countryList.find(x => x.countryId == manufactureInfo.mfrCountryId);
  //       if (country) {
  //         esgImpactElectricityConsumption = this.shareService.isValidNumber((manufactureInfo.totalElectricityConsumption * Number(country.powerESG)));
  //         if (manufactureInfo.esgImpactElectricityConsumption != null) {
  //           esgImpactElectricityConsumption = this.shareService.checkDirtyProperty('esgImpactElectricityConsumption', fieldColorsList) ? manufacturingObj?.esgImpactElectricityConsumption : esgImpactElectricityConsumption;
  //         }
  //       }
  //     }
  //     manufactureInfo.esgImpactElectricityConsumption = esgImpactElectricityConsumption;
  //   }
  //   manufactureInfo.totalFactorySpaceRequired = this.shareService.isValidNumber((manufactureInfo?.machineMaster?.maxLength * manufactureInfo?.machineMaster?.maxWidth) / 1000000);
  //   if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
  //     let country = manufactureInfo.countryList.find(x => x.countryId == manufactureInfo.mfrCountryId);
  //     if (country) {
  //       manufactureInfo.esgImpactFactoryImpact = this.shareService.isValidNumber((manufactureInfo.totalFactorySpaceRequired * Number(country.factorESG) * manufactureInfo.cycleTime) / 3600);
  //     }
  //   }
  //   return new Observable((obs) => {
  //     obs.next(manufactureInfo);
  //   });
  // }

  // public calculationForMeltingCasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): Observable<ProcessInfoDto> {
  public calculationForMeltingCasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): ProcessInfoDto {
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      if (manufactureInfo.efficiency != null)
        manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    }
    manufactureInfo.setUpTimeBatch = 120;
    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList)
        ? manufacturingObj?.machineHourRate
        : this.shareService.isValidNumber(manufactureInfo.machineHourRate);
    }
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour != null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.skilledLaborRatePerHour != null) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }
    if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate != null) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
        ? manufacturingObj?.samplingRate
        : this.shareService.isValidNumber(manufactureInfo.samplingRate);
    }

    if (manufactureInfo.ischargeIntoFuranceDirty && manufactureInfo.chargeIntoFurance != null) {
      manufactureInfo.chargeIntoFurance = Number(manufactureInfo.chargeIntoFurance);
    } else {
      manufactureInfo.chargeIntoFurance = this.shareService.checkDirtyProperty('chargeIntoFurance', fieldColorsList) ? manufacturingObj?.chargeIntoFurance : 40;
    }

    if (manufactureInfo.isliquidMetalTransferDirty && manufactureInfo.liquidMetalTransfer != null) {
      manufactureInfo.liquidMetalTransfer = Number(manufactureInfo.liquidMetalTransfer);
    } else {
      manufactureInfo.liquidMetalTransfer = this.shareService.checkDirtyProperty('liquidMetalTransfer', fieldColorsList) ? manufacturingObj?.liquidMetalTransfer : 8;
    }
    manufactureInfo.liquidMetalTransfer = this.shareService.isValidNumber(manufactureInfo.liquidMetalTransfer);

    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;

    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      manufactureInfo.noOfParts = this.shareService.isValidNumber(Math.round((Number(manufactureInfo.furnaceCapacityTon) * Number(manufactureInfo.utilisation / 100)) / Number(grossWeight)));
      manufactureInfo.noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : this.shareService.isValidNumber(manufactureInfo.noOfParts);
    }

    if (manufactureInfo.istotalMeltingTimeDirty && manufactureInfo.totalMeltingTime != null) {
      manufactureInfo.totalMeltingTime = Number(manufactureInfo.totalMeltingTime);
    } else {
      manufactureInfo.totalMeltingTime = this.shareService.isValidNumber(
        ((Number(manufactureInfo.materialmasterDatas.materialMeltPower) * 1) /
          (Number(manufactureInfo.furnaceCapacityTon) * Number(manufactureInfo.utilisation / 100) * Number(manufactureInfo.powerSupply))) *
        60
      );
      manufactureInfo.totalMeltingTime = this.shareService.checkDirtyProperty('totalMeltingTime', fieldColorsList)
        ? manufacturingObj?.totalMeltingTime
        : this.shareService.isValidNumber(manufactureInfo.totalMeltingTime);
    }
    const cycleTimeWithoutEfficiency =
      Number(manufactureInfo.totalMeltingTime) +
      Number(manufactureInfo.chargeIntoFurance) +
      Number(manufactureInfo.liquidMetalTransfer) +
      Number(manufactureInfo.idleTimeMelt) +
      Number(manufactureInfo.idleTimeMouldBox);
    const withEfficiency = this.shareService.isValidNumber(Number(cycleTimeWithoutEfficiency) / Number(manufactureInfo.efficiency / 100));

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(withEfficiency);
      manufactureInfo.cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(manufactureInfo.cycleTime);
    }
    const perpartMeltingCycletimeMin = this.shareService.isValidNumber(Number(withEfficiency) / Number(manufactureInfo.noOfParts));
    const perpartMeltingCycletimesec = Number(perpartMeltingCycletimeMin) * 60;
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = Number(manufactureInfo.totalCycleTime);
    } else {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(this.shareService.isValidNumber(perpartMeltingCycletimesec));
      manufactureInfo.totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList)
        ? manufacturingObj?.totalCycleTime
        : this.shareService.isValidNumber(manufactureInfo.totalCycleTime);
    }
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo.lotSize));
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }
    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime =
        manufactureInfo.partComplexity == PartComplexity.Low ? 5 : manufactureInfo.partComplexity == PartComplexity.Medium ? 10 : manufactureInfo.partComplexity == PartComplexity.High ? 20 : 0;
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.totalCycleTime));
      manufactureInfo.directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      manufactureInfo.directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.totalCycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      manufactureInfo.inspectionCost =
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
        Number(manufactureInfo.lotSize);
      manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList)
        ? manufacturingObj?.inspectionCost
        : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo.totalCost) - (Number(manufactureInfo.materialInfo.weight) / 1000) * Number(manufactureInfo.materialInfo.scrapPrice) + sum)
      );
      manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.totalElectricityConsumption = this.shareService.isValidNumber((manufactureInfo.cycleTime * manufactureInfo?.machineMaster?.ratedPower) / 3600);
    if (manufactureInfo.isesgImpactElectricityConsumptionDirty && manufactureInfo.esgImpactElectricityConsumption != null) {
      manufactureInfo.esgImpactElectricityConsumption = Number(manufactureInfo.esgImpactElectricityConsumption);
    } else {
      let esgImpactElectricityConsumption = 0;
      if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
        const country = manufactureInfo.countryList.find((x) => x.countryId == manufactureInfo.mfrCountryId);
        if (country) {
          esgImpactElectricityConsumption = this.shareService.isValidNumber(manufactureInfo.totalElectricityConsumption * Number(laborRateDto[0].powerESG));
          if (manufactureInfo.esgImpactElectricityConsumption != null) {
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
        manufactureInfo.esgImpactFactoryImpact = this.shareService.isValidNumber((manufactureInfo.totalFactorySpaceRequired * Number(laborRateDto[0].powerESG) * manufactureInfo.cycleTime) / 3600);
      }
    }
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculationForPouringCasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): Observable<ProcessInfoDto> {
  public calculationForPouringCasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): ProcessInfoDto {
    manufactureInfo.setUpTimeBatch = 20;
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      if (manufactureInfo.efficiency != null)
        manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    }
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    const density = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.density;
    const partArea = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partProjectedArea;

    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList)
        ? manufacturingObj?.machineHourRate
        : this.shareService.isValidNumber(manufactureInfo.machineHourRate);
    }
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour != null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.skilledLaborRatePerHour != null) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }
    if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate != null) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
        ? manufacturingObj?.samplingRate
        : this.shareService.isValidNumber(manufactureInfo.samplingRate);
    }
    const totalPouringTime = this.shareService.isValidNumber(
      (Number(grossWeight) / 1000 / (Number(density) * Math.pow(10, 3) * (Number(partArea) / Math.pow(10, 9)) * Number(manufactureInfo.efficiencyFactor))) *
      Math.sqrt(2 * Number(manufactureInfo.gravitationalAccelaration) * Number(manufactureInfo.effectiveMetalHead))
    );

    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = Number(manufactureInfo.totalCycleTime);
    } else {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(totalPouringTime);
      manufactureInfo.totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList)
        ? manufacturingObj?.totalCycleTime
        : this.shareService.isValidNumber(manufactureInfo.totalCycleTime);
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(manufactureInfo.cycleTime);
      manufactureInfo.cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(manufactureInfo.cycleTime);
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo.lotSize));
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime =
        manufactureInfo.partComplexity == PartComplexity.Low ? 5 : manufactureInfo.partComplexity == PartComplexity.Medium ? 10 : manufactureInfo.partComplexity == PartComplexity.High ? 20 : 0;
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(totalPouringTime));
      manufactureInfo.directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      manufactureInfo.directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.totalCycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      manufactureInfo.inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
        Number(manufactureInfo.lotSize)
      );
      manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList)
        ? manufacturingObj?.inspectionCost
        : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo.totalCost) - (Number(manufactureInfo.materialInfo.weight) / 1000) * Number(manufactureInfo.materialInfo.scrapPrice) + sum)
      );
      manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.totalElectricityConsumption = this.shareService.isValidNumber((manufactureInfo.cycleTime * manufactureInfo?.machineMaster?.ratedPower) / 3600);
    if (manufactureInfo.isesgImpactElectricityConsumptionDirty && manufactureInfo.esgImpactElectricityConsumption != null) {
      manufactureInfo.esgImpactElectricityConsumption = Number(manufactureInfo.esgImpactElectricityConsumption);
    } else {
      let esgImpactElectricityConsumption = 0;
      if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
        const country = manufactureInfo.countryList.find((x) => x.countryId == manufactureInfo.mfrCountryId);
        if (country) {
          esgImpactElectricityConsumption = this.shareService.isValidNumber(manufactureInfo.totalElectricityConsumption * Number(laborRateDto[0].powerESG));
          if (manufactureInfo.esgImpactElectricityConsumption != null) {
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
          (manufactureInfo.totalFactorySpaceRequired * Number(laborRateDto?.length > 0 ? laborRateDto[0].factorESG : 0) * manufactureInfo.cycleTime) / 3600
        );
      }
    }
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }
}
