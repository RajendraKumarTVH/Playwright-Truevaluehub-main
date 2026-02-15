import { Injectable } from '@angular/core';
import { ProcessInfoDto, MaterialInfoDto } from '../models';
import { SharedService } from '../../modules/costing/services/shared.service';
import { PrimaryProcessType, ProcessType } from 'src/app/modules/costing/costing.config';
import { PartComplexity } from 'src/app/shared/enums';
import { MachineType } from 'src/app/modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingCastingConfigService {
  castingFlags = [
    'IsMoldAssemblyForCasting',
    'IsManualInspectionForCasting',
    'IsRadiographyForCasting',
    'IsMetullurgicalForCasting',
    'IsCoreAssemblyForCasting',
    'IsWaxInjectionMoldingForCasting',
    'IsTreePatternAssemblyForCasting',
    'IsDryingForCasting',
    'IsSlurryCoatingForCasting',
    'IsDewaxingForCasting',
    'IsProcessTrimmingPress',
  ];

  samplingData = [
    { maxLot: 1, samplingRate: 100 },
    { maxLot: 10, samplingRate: 20 },
    { maxLot: 50, samplingRate: 10 },
    { maxLot: 100, samplingRate: 5 },
    { maxLot: 1000, samplingRate: 2 },
    { maxLot: 10000, samplingRate: 1 },
    { maxLot: Number.MAX_VALUE, samplingRate: 0.5 },
  ];

  constructor(public sharedService: SharedService) {}
  getHpdcConfigValues(matMetal, processType: ProcessType) {
    if (processType === ProcessType.HighPressureDieCasting) {
      return {
        cavityToCavityLength: 80,
        cavityToCavityWidth: 120,
        cavityToEdgeLength: 60,
        cavityToEdgeWidth: 60,
        factorOfSafety: 0.2,
        cavityPressure: 900,
        runnerProjectedArea: 0.6,
        noComponentWidth: Math.ceil(matMetal?.noOfCavities / 2),
        noComponentLength: matMetal?.noOfCavities / Math.ceil(matMetal?.noOfCavities / 2),
      };
    }
    return null;
  }

  getCoreCycleTime(weight: number) {
    const data = [
      { id: 1, maxWeight: 0.5, cycleTime: 2 },
      { id: 2, maxWeight: 1, cycleTime: 3 },
      { id: 3, maxWeight: 2, cycleTime: 4 },
      { id: 4, maxWeight: 4, cycleTime: 5 },
      { id: 5, maxWeight: 8, cycleTime: 10 },
      { id: 6, maxWeight: 16, cycleTime: 15 },
      { id: 7, maxWeight: 25, cycleTime: 30 },
      { id: 8, maxWeight: 35, cycleTime: 60 },
      { id: 9, maxWeight: 50, cycleTime: 90 },
      { id: 10, maxWeight: 1000000, cycleTime: 120 },
    ];
    return data.find((item) => item.maxWeight >= weight)?.cycleTime || 5;
  }

  getTrimmingCycleTime(weightGrams: number) {
    const data = [
      { id: 1, maxWeight: 200, cycleTime: 5 },
      { id: 2, maxWeight: 400, cycleTime: 7 },
      { id: 3, maxWeight: 800, cycleTime: 10 },
      { id: 4, maxWeight: 1600, cycleTime: 12 },
      { id: 5, maxWeight: 3200, cycleTime: 15 },
      { id: 6, maxWeight: 6400, cycleTime: 20 },
      { id: 7, maxWeight: 1000000, cycleTime: 30 },
    ];
    return data.find((item) => item.maxWeight >= weightGrams)?.cycleTime || 30;
  }

  getManualInspectionCycleTime(weight: number) {
    const data = [
      { maxWeight: 1, cycleTime: 30 },
      { maxWeight: 5, cycleTime: 60 },
      { maxWeight: 10, cycleTime: 90 },
      { maxWeight: 50, cycleTime: 120 },
      { maxWeight: 100, cycleTime: 180 },
      { maxWeight: 500, cycleTime: 300 },
      { maxWeight: 1000, cycleTime: 600 },
      { maxWeight: 1000000, cycleTime: 900 },
    ];
    return data.find((item) => item.maxWeight >= weight)?.cycleTime || 30;
  }

  getCleaningCastingCycleTime(weight: number) {
    const data = [
      { id: 1, maxWeight: 400, cycleTime: 5 },
      { id: 2, maxWeight: 800, cycleTime: 7 },
      { id: 3, maxWeight: 1600, cycleTime: 10 },
      { id: 4, maxWeight: 3200, cycleTime: 15 },
      { id: 5, maxWeight: 6400, cycleTime: 20 },
      { id: 6, maxWeight: 1000000, cycleTime: 30 },
    ];
    return data.find((item) => item.maxWeight >= weight)?.cycleTime || 5;
  }

  getTreePatternPartHandlingTime(weight: number) {
    const data = [
      { id: 1, maxWeight: 50, handlingTime: 5 },
      { id: 2, maxWeight: 100, handlingTime: 7 },
      { id: 3, maxWeight: 150, handlingTime: 10 },
      { id: 4, maxWeight: 250, handlingTime: 12 },
      { id: 5, maxWeight: 350, handlingTime: 15 },
      { id: 6, maxWeight: 450, handlingTime: 20 },
      { id: 7, maxWeight: 1000000, handlingTime: 30 },
    ];
    return data.find((item) => item.maxWeight >= weight)?.handlingTime || 30;
  }

  getFettlingPartPositioningTime(weight: number) {
    const data = [
      { maxWeight: 5, cycleTime: 90 },
      { maxWeight: 10, cycleTime: 120 },
      { maxWeight: 50, cycleTime: 180 },
      { maxWeight: 100, cycleTime: 240 },
      { maxWeight: 500, cycleTime: 300 },
      { maxWeight: 1000, cycleTime: 480 },
      { maxWeight: 1000000, cycleTime: 600 },
    ];
    return data.find((item) => item.maxWeight >= weight)?.cycleTime || 90;
  }

  getSamplingSizeByLotSize(lotSize: number): number {
    return this.samplingData.find((item) => lotSize <= item.maxLot)?.samplingRate ?? 100;
  }

  // getPartsBySamplingRate(samplingRate: number): number {
  //   return this.samplingData.find((row) => row.samplingRate === samplingRate)?.parts ?? 1;
  // }

  getSprueDiameter(weight: number): number {
    const data = [
      { maxWeight: 30, sprueDiameter: 30 },
      { maxWeight: 50, sprueDiameter: 35 },
      { maxWeight: 100, sprueDiameter: 40 },
      { maxWeight: 200, sprueDiameter: 45 },
      { maxWeight: 300, sprueDiameter: 50 },
      { maxWeight: 400, sprueDiameter: 55 },
      { maxWeight: 500, sprueDiameter: 60 },
      { maxWeight: Number.MAX_VALUE, sprueDiameter: 70 },
    ];
    return data.find((item) => item.maxWeight >= weight)?.sprueDiameter || 30;
  }

  getDegatingCuttingRate(materialId: number, machineType: number, materialType: string): number {
    const data: Array<{
      material: Array<number | string>;
      [key: number]: number;
    }> = [
      { material: ['Non-Ferrous'], [MachineType.Manual]: 100, [MachineType.SemiAuto]: 200, [MachineType.Automatic]: 300 }, //all Non Ferrous
      { material: [23, 475], [MachineType.Manual]: 80, [MachineType.SemiAuto]: 90, [MachineType.Automatic]: 100 }, // cast iron and ductile iron
      { material: [232, 54, 157, 70, 281, 31, 436, 369], [MachineType.Manual]: 30, [MachineType.SemiAuto]: 50, [MachineType.Automatic]: 60 }, // cast steel, alloy steel, carbon steel, cold heading steel, cold rolled steel, galvanized steel, hot rolled steel, silicon steel
      { material: [42, 353], [MachineType.Manual]: 20, [MachineType.SemiAuto]: 30, [MachineType.Automatic]: 40 }, // stainless steel and nickel iron
      { material: [314, 142], [MachineType.Manual]: 5, [MachineType.SemiAuto]: 10, [MachineType.Automatic]: 15 }, // tool steel and spring steel
    ];
    const materialKey: number | string = materialType === 'Non Ferrous' ? 'Non-Ferrous' : materialId;
    const row = data.find((d) => d.material.includes(materialKey));
    return row?.[machineType] ?? 60;
  }

  // getDegatingCycleTime(weight: number, materialId: number, materialType: string) {
  //   // materialId: 23 - Cast Iron, 475 - Ductile Iron, steel - all other ferrous, nonFerrous - all Non Ferrous
  //   const data = [
  //     { id: 1, maxWeight: 5, materials: { 23: 60, 475: 90, steel: 100, nonFerrous: 70 } },
  //     { id: 2, maxWeight: 10, materials: { 23: 70, 475: 100, steel: 110, nonFerrous: 80 } },
  //     { id: 3, maxWeight: 50, materials: { 23: 90, 475: 120, steel: 130, nonFerrous: 100 } },
  //     { id: 4, maxWeight: 100, materials: { 23: 120, 475: 180, steel: 180, nonFerrous: 160 } },
  //     { id: 5, maxWeight: 500, materials: { 23: 180, 475: 240, steel: 240, nonFerrous: 220 } },
  //     { id: 6, maxWeight: 1000, materials: { 23: 240, 475: 300, steel: 300, nonFerrous: 300 } },
  //     { id: 7, maxWeight: 10000000, materials: { 23: 300, 475: 600, steel: 600, nonFerrous: 600 } },
  //   ];
  //   if (materialType === 'Ferrous') {
  //     if ([23, 475].includes(materialId)) {
  //       return data.find((item) => item.maxWeight >= weight)?.materials[materialId] || 60;
  //     }
  //     return data.find((item) => item.maxWeight >= weight)?.materials['steel'] || 60;
  //   } else if (materialType === 'Non Ferrous') {
  //     return data.find((item) => item.maxWeight >= weight)?.materials['nonFerrous'] || 60;
  //   } else {
  //     return 60;
  //   }
  // }

  getCastingCorePreparationSubProcessList(materialInfoList: MaterialInfoDto[], corePrepSubProcessIds: number[]): { id: number; name: string }[] {
    const list: { id: number; name: string }[] = [];
    const materialsWithCore = materialInfoList?.filter((m) => m.secondaryProcessId === 2) || [];
    materialsWithCore.forEach((m) => {
      m.coreCostDetails?.forEach((c) => {
        if (!corePrepSubProcessIds.includes(c.coreCostDetailsId)) {
          list.push({
            id: c.coreCostDetailsId,
            name: c.coreName,
          });
        }
      });
    });
    return list;
  }

  hpdcDryCycleTimeByTonnage() {
    return [
      { id: 1, fromWeight: 0, toWeight: 300, dieClosing: 2, dieOpening: 2, sliderMovement: 2 },
      { id: 2, fromWeight: 300.01, toWeight: 500, dieClosing: 3, dieOpening: 3, sliderMovement: 3 },
      { id: 3, fromWeight: 500.01, toWeight: 1000, dieClosing: 5, dieOpening: 5, sliderMovement: 5 },
      { id: 4, fromWeight: 1000.01, toWeight: 10000000, dieClosing: 7, dieOpening: 7, sliderMovement: 7 },
    ];
  }

  getAssemblyOfCore(noOfCores: number, subProcessTypeID: PartComplexity): number {
    if (noOfCores === 2) {
      return subProcessTypeID === PartComplexity.Low ? 20 : subProcessTypeID === PartComplexity.Medium ? 30 : subProcessTypeID === PartComplexity.High ? 40 : 0;
    } else if (noOfCores === 3) {
      return subProcessTypeID === PartComplexity.Low ? 30 : subProcessTypeID === PartComplexity.Medium ? 45 : subProcessTypeID === PartComplexity.High ? 60 : 0;
    } else if (noOfCores === 4) {
      return subProcessTypeID === PartComplexity.Low ? 40 : subProcessTypeID === PartComplexity.Medium ? 60 : subProcessTypeID === PartComplexity.High ? 80 : 0;
    } else if (noOfCores === 5) {
      return subProcessTypeID === PartComplexity.Low ? 50 : subProcessTypeID === PartComplexity.Medium ? 75 : subProcessTypeID === PartComplexity.High ? 100 : 0;
    } else {
      // 1
      return subProcessTypeID === PartComplexity.Low ? 10 : subProcessTypeID === PartComplexity.Medium ? 15 : subProcessTypeID === PartComplexity.High ? 20 : 0;
    }
  }

  getHpdcTonnage(manufactureInfo) {
    const materialInfoList = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList.length > 0 ? manufactureInfo?.materialInfoList : [];
    const matMetal = materialInfoList[0] || null;
    const hpdcConfigVals = this.getHpdcConfigValues(matMetal, ProcessType.HighPressureDieCasting);

    const totalProjectedArea = (Number(matMetal?.partProjectedArea) + Number(matMetal?.partProjectedArea) * hpdcConfigVals.runnerProjectedArea) * matMetal?.noOfCavities;
    const clampingForce = ((totalProjectedArea / 100) * hpdcConfigVals.cavityPressure) / 1000;
    manufactureInfo.recommendTonnage = Math.ceil(clampingForce + clampingForce * hpdcConfigVals.factorOfSafety); // Machine Tonnage required (tons)
  }

  getMeltingTonnage(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    const factorOfSafety = 25 / 100;
    const materialInfoList = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList.length > 0 ? manufactureInfo?.materialInfoList : [];

    const IsNoBakeCasting = materialInfoList[0].processId === PrimaryProcessType.NoBakeCasting;
    const IsInvestmentCasting = materialInfoList[0].processId === PrimaryProcessType.InvestmentCasting;
    const IsGreenCastingAuto = materialInfoList[0].processId === PrimaryProcessType.GreenCastingAuto;
    const IsGreenCastingSemiAuto = materialInfoList[0].processId === PrimaryProcessType.GreenCastingSemiAuto;
    const IsGreenCasting = IsGreenCastingAuto || IsGreenCastingSemiAuto;
    const IsHPDCCasting = materialInfoList[0].processId === PrimaryProcessType.HPDCCasting;
    const IsGDCCasting = materialInfoList[0].processId === PrimaryProcessType.GDCCasting;
    const IsLPDCCasting = materialInfoList[0].processId === PrimaryProcessType.LPDCCasting;
    // const IsShellCasting = materialInfoList[0].processId === PrimaryProcessType.ShellCasting;

    const matMetal = (IsHPDCCasting ? materialInfoList[0] : materialInfoList.filter((rec) => rec.secondaryProcessId === 1)[0]) || null;

    let processMoldMaking = null;
    let processHPDC = null;
    let processGDC = null;
    let processLPDC = null;
    // let processMelting = null;
    // let processSlurryCoating = null;
    let processTreePatternAssembly = null;
    if (IsHPDCCasting) {
      processHPDC = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.HighPressureDieCasting)[0] || null;
    } else if (IsGDCCasting) {
      processGDC = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.GravityDieCasting)[0] || null;
    } else if (IsLPDCCasting) {
      processLPDC = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.LowPressureDieCasting)[0] || null;
    } else if (IsInvestmentCasting) {
      // processSlurryCoating = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.SlurryCoating)[0] || null;
      processTreePatternAssembly = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.TreePatternAssembly)[0] || null;
    }

    if (IsNoBakeCasting) {
      processMoldMaking = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.CastingMoldMaking)[0] || null;
    } else {
      processMoldMaking = manufactureInfo?.processInfoList.filter((rec) => rec.processTypeID === ProcessType.MoldPerparation)[0] || null;
    }

    let otherCycleTime = 0;
    if (IsHPDCCasting) {
      otherCycleTime = processHPDC?.cycleTime || 0;
    } else if (IsGDCCasting) {
      otherCycleTime = processGDC?.cycleTime || 0;
    } else if (IsLPDCCasting) {
      otherCycleTime = processLPDC?.cycleTime || 0;
    } else if (IsInvestmentCasting) {
      otherCycleTime = processTreePatternAssembly?.cycleTime || 0;
    } else {
      otherCycleTime = processMoldMaking?.cycleTime || 0;
    }

    if (manufactureInfo.isNoOfCoreDirty && !!manufactureInfo.noOfCore) {
      manufactureInfo.noOfCore = this.sharedService.isValidNumber(Number(manufactureInfo.noOfCore));
    } else {
      let noOfCore = 0;
      if (IsGreenCasting) {
        noOfCore = processMoldMaking?.noOfCore || 0;
      } else if (IsInvestmentCasting) {
        noOfCore = Math.ceil(3600 / processTreePatternAssembly?.dryCycleTime) || 0;
      } else {
        noOfCore = Math.ceil(3600 / otherCycleTime) || 0;
      }

      if (manufactureInfo.noOfCore) {
        noOfCore = this.sharedService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : noOfCore;
      }
      manufactureInfo.noOfCore = noOfCore;
    }
    // if (manufactureInfo.noOfCore) {
    //   manufactureInfo.noOfCore = this.sharedService.isValidNumber(Number(manufactureInfo.noOfCore));
    // } else {
    //   if (IsGreenCasting) {
    //     manufactureInfo.noOfCore = processMoldMaking?.noOfCore || 0;
    //   } else {
    //     manufactureInfo.noOfCore = Math.ceil(3600 / otherCycleTime) || 0;
    //   }
    // }

    let mtReqPerHr = 0;
    if (IsHPDCCasting) {
      // grams
      mtReqPerHr = (matMetal?.totalPouringWeight / 1000) * Number(manufactureInfo.noOfCore) + (matMetal?.totalPouringWeight / 1000) * factorOfSafety * Number(manufactureInfo.noOfCore);
    } else if (IsNoBakeCasting || IsGreenCasting || IsGDCCasting || IsInvestmentCasting || IsLPDCCasting) {
      mtReqPerHr = matMetal?.totalPouringWeight * Number(manufactureInfo.noOfCore) + matMetal?.totalPouringWeight * factorOfSafety * Number(manufactureInfo.noOfCore);
      // } else {
      //   // nobake
      //   mtReqPerHr = matMetal?.totalPouringWeight * processMoldMaking?.noOfCore + matMetal?.totalPouringWeight * processMoldMaking?.noOfCore * Number(manufactureInfo.noOfCore);
    }
    manufactureInfo.recommendTonnage = Math.ceil((mtReqPerHr / 1000) * 10) / 10; // Furnace Capacity required (tons)
    // manufactureInfo.machineCapacity = this.sharedService.isValidNumber(Number(manufactureInfo.machcineCapacity) / Number(matMetal?.density)); // Capacity(m3)
    if (manufactureInfo.isselectedTonnageDirty && !!manufactureInfo.selectedTonnage) {
      manufactureInfo.selectedTonnage = this.sharedService.isValidNumber(Number(manufactureInfo.selectedTonnage));
    } else {
      // let selectedTonnage = IsHPDCCasting ? manufactureInfo?.furnaceCapacityTon : (manufactureInfo?.furnaceCapacityTon / 1000) * matMetal?.density * 1000;
      let selectedTonnage = (manufactureInfo?.machineMaster?.furnaceCapacityTon / 1000) * matMetal?.density * 1000;
      if (manufactureInfo.selectedTonnage) {
        selectedTonnage = this.sharedService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : selectedTonnage;
      }
      manufactureInfo.selectedTonnage = selectedTonnage;
    }
  }

  sortCastingCoreProcesses(processList: ProcessInfoDto[]) {
    const sortable = processList
      .map((item, index) => ({ item, index }))
      .filter((x) => x.item.subProcessTypeID > 0)
      .sort((a, b) => a.item.subProcessTypeID - b.item.subProcessTypeID);

    let sortableIndex = 0;

    for (let i = 0; i < processList.length; i++) {
      if (processList[i].subProcessTypeID > 0) {
        processList[i] = sortable[sortableIndex].item;
        sortableIndex++;
      }
    }
  }
}
