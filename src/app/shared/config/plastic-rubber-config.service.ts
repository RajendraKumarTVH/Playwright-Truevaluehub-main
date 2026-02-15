import { Injectable } from '@angular/core';
import { MaterialInfoDto, MedbMachinesMasterDto, PartInfoDto } from '../models';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { PrimaryProcessType } from 'src/app/modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class PlasticRubberConfigService {
  constructor(
    private sharedService: SharedService,
    private messaging: MessagingService
  ) {}

  getHeatTime(id: number, thickness: number) {
    thickness < 1 && (thickness = 1);
    thickness > 10 && (thickness = 10);
    thickness = Math.round(thickness * 2) / 2; // round to nearest 0.5
    const data = [
      {
        materialFamilyId: 450,
        materialFamilyName: 'PS',
        heatTime: {
          1: 30,
          1.5: 45,
          2: 60,
          2.5: 75,
          3: 90,
          3.5: 105,
          4: 120,
          4.5: 135,
          5: 150,
          5.5: 165,
          6: 180,
          6.5: 195,
          7: 210,
          7.5: 225,
          8: 240,
          8.5: 255,
          9: 270,
          9.5: 285,
          10: 300,
        },
      },
      {
        materialFamilyId: 453,
        materialFamilyName: 'ABS',
        heatTime: {
          1: 40,
          1.5: 60,
          2: 80,
          2.5: 100,
          3: 120,
          3.5: 140,
          4: 160,
          4.5: 180,
          5: 200,
          5.5: 220,
          6: 240,
          6.5: 260,
          7: 280,
          7.5: 300,
          8: 320,
          8.5: 340,
          9: 360,
          9.5: 380,
          10: 400,
        },
      },
      {
        materialFamilyId: 447,
        materialFamilyName: 'PP',
        heatTime: {
          1: 50,
          1.5: 75,
          2: 100,
          2.5: 125,
          3: 150,
          3.5: 175,
          4: 200,
          4.5: 225,
          5: 250,
          5.5: 275,
          6: 300,
          6.5: 325,
          7: 350,
          7.5: 375,
          8: 400,
          8.5: 425,
          9: 450,
          9.5: 475,
          10: 500,
        },
      },
      {
        materialFamilyId: 457,
        materialFamilyName: 'PE',
        heatTime: {
          1: 50,
          1.5: 75,
          2: 100,
          2.5: 125,
          3: 150,
          3.5: 175,
          4: 200,
          4.5: 225,
          5: 250,
          5.5: 275,
          6: 300,
          6.5: 325,
          7: 350,
          7.5: 375,
          8: 400,
          8.5: 425,
          9: 450,
          9.5: 475,
          10: 500,
        },
      },
      {
        materialFamilyId: 325,
        materialFamilyName: 'PET',
        heatTime: {
          1: 30,
          1.5: 45,
          2: 60,
          2.5: 75,
          3: 90,
          3.5: 105,
          4: 120,
          4.5: 135,
          5: 150,
          5.5: 165,
          6: 180,
          6.5: 195,
          7: 210,
          7.5: 225,
          8: 240,
          8.5: 255,
          9: 270,
          9.5: 285,
          10: 300,
        },
      },
      {
        materialFamilyId: 454,
        materialFamilyName: 'PVC',
        heatTime: {
          1: 30,
          1.5: 45,
          2: 60,
          2.5: 75,
          3: 90,
          3.5: 105,
          4: 120,
          4.5: 135,
          5: 150,
          5.5: 165,
          6: 180,
          6.5: 195,
          7: 210,
          7.5: 225,
          8: 240,
          8.5: 255,
          9: 270,
          9.5: 285,
          10: 300,
        },
      },
      {
        materialFamilyId: 444,
        materialFamilyName: 'PC',
        heatTime: {
          1: 60,
          1.5: 90,
          2: 120,
          2.5: 150,
          3: 180,
          3.5: 210,
          4: 240,
          4.5: 270,
          5: 300,
          5.5: 330,
          6: 360,
          6.5: 390,
          7: 420,
          7.5: 450,
          8: 480,
          8.5: 510,
          9: 540,
          9.5: 570,
          10: 600,
        },
      },
    ];
    return data.find((x) => x.materialFamilyId === id).heatTime[thickness] || 30;
  }

  thermoStdSheetLengthList = [
    { length: 304.8 },
    { length: 609.6 },
    { length: 914.4 },
    { length: 1219.2 },
    { length: 1524 },
    { length: 1828 },
    { length: 400.0 },
    { length: 1000 },
    { length: 1200 },
    { length: 1500 },
  ];

  thermoStdSheetWidthList = [{ width: 304.8 }, { width: 609.6 }, { width: 914.4 }, { width: 1219.2 }, { width: 1524 }, { width: 400 }, { width: 600 }, { width: 800 }, { width: 1000 }];

  cuttingSpeeds = [
    { thickness: 1, speed: 1500 },
    { thickness: 2, speed: 1500 },
    { thickness: 3, speed: 1500 },
    { thickness: 4, speed: 1050 },
    { thickness: 5, speed: 1050 },
    { thickness: 6, speed: 1050 },
    { thickness: 7, speed: 750 },
    { thickness: 8, speed: 750 },
    { thickness: 9, speed: 750 },
    { thickness: 10, speed: 750 },
  ];

  materials = [
    { name: 'Polystyrene (PS)', materialType: 'PS', formingTemp: 165, moldTemp: 30, ejectionTemp: 95 },
    { name: 'Polypropylene (PP)', materialType: 'PP', formingTemp: 180, moldTemp: 60, ejectionTemp: 110 },
    { name: 'Polyethylene terephthalate glycol (PETG)', materialType: 'PETG', formingTemp: 160, moldTemp: 40, ejectionTemp: 80 },
    { name: 'High-impact polystyrene (HIPS)', materialType: 'HIPS', formingTemp: 150, moldTemp: 30, ejectionTemp: 95 },
    { name: 'Acrylonitrile butadiene styrene (ABS)', materialType: 'ABS', formingTemp: 170, moldTemp: 70, ejectionTemp: 100 },
    { name: 'Polycarbonate (PC)', materialType: 'PC', formingTemp: 210, moldTemp: 110, ejectionTemp: 160 },
    { name: 'Polyvinyl chloride (PVC)', materialType: 'PVC', formingTemp: 135, moldTemp: 40, ejectionTemp: 85 },
    { name: 'Polyvinyl fluoride (PVF)', materialType: 'PVF', formingTemp: 185, moldTemp: 40, ejectionTemp: 110 },
    { name: 'Polymethyl methacrylate (PMMA)', materialType: 'PMMA', formingTemp: 190, moldTemp: 80, ejectionTemp: 110 },
    { name: 'Polyethylene (PE)', materialType: 'PE', formingTemp: 165, moldTemp: 30, ejectionTemp: 100 },
  ];

  getMaterialTemps(materialType: string): any {
    return this.materials.find((material) => material.materialType === materialType);
  }

  kFactorRubberIM = [
    { materialType: 'Nitrile Rubber', kFactor: 1 },
    { materialType: 'EPDM-Ethylene-Propylene Terpolymer Rubber', kFactor: 1.2 },
    { materialType: 'NBR', kFactor: 1 },
    { materialType: 'SBR-Styrene Butadiene Rubber', kFactor: 1.1 },
    { materialType: 'LSR', kFactor: 0.6 },
    { materialType: 'Other material', kFactor: 1.5 },
  ];

  getVacuumPressure(material: string): number | 0 {
    const pressureMap: Record<string, number> = {
      ABS: 10.8042,
      PVC: 9.822,
      PC: 13.7508,
    };

    // Normalize input (case-insensitive)
    const key = material.toUpperCase();
    return pressureMap[key] ?? 0; // Returns 0 if material not found
  }

  vacuumMaterialData: any[] = [
    {
      material: 'HDPE',
      density: 0.97,
      specificHeat: 1050,
      thermalDiffusivity: 0.2,
      mouldTemperature: 80,
      initialTemperature: 25,
      formingTemperature: 150,
    },
    {
      material: 'ABS',
      density: 1.04,
      specificHeat: 1500,
      thermalDiffusivity: 1.2,
      mouldTemperature: 80,
      initialTemperature: 25,
      formingTemperature: 150,
    },
  ];

  getVacuumMaterialData(material: string): any {
    return this.vacuumMaterialData.find((m) => m.material === material) || null;
  }

  postCureMatrix = [
    { family: 'Natural - Standard Rubber-()', abbreviation: 'NR', rubber: 'Natural Rubber', tempC: null, cycleTimeHrs: null },
    { family: 'Isoprene-(Poly Isoprene)', abbreviation: 'IR', rubber: 'Isoprene Rubber (Synthetic Natural Rubber)', tempC: null, cycleTimeHrs: null },
    { family: 'SBR-(Styrene Butadiene Rubber)', abbreviation: 'SBR', rubber: 'Styrene-Butadiene Rubber', tempC: null, cycleTimeHrs: null },
    { family: 'Polybutadiene-(Polybutadiene (BR))', abbreviation: 'PBR', rubber: 'Polybutadiene Rubber', tempC: null, cycleTimeHrs: null },
    { family: 'Butadiene-(BR-Polybutadiene)', abbreviation: 'PBR', rubber: 'Polybutadiene Rubber', tempC: null, cycleTimeHrs: null },
    { family: '', abbreviation: 'NBR-PVC', rubber: 'Nitrile-Polyvinyl Chloride Blend', tempC: null, cycleTimeHrs: null },
    { family: 'Chloroprene / Neoprene-(CR – POLYCHLOROPRENE (NEOPRENE))', abbreviation: 'CR', rubber: 'Chloroprene Rubber (Neoprene)', tempC: null, cycleTimeHrs: null },
    { family: 'BIIR-(Bromobutyl Rubber)', abbreviation: 'IIR', rubber: 'Isobutylene-Isoprene Rubber (Butyl Rubber)', tempC: 150, cycleTimeHrs: 4 },
    { family: 'EPDM-(Ethylene-Propylene Terpolymer Rubber)', abbreviation: 'EPDM', rubber: 'Ethylene Propylene Diene Monomer Rubber', tempC: 150, cycleTimeHrs: 4 },
    { family: 'Nitrile Rubber', abbreviation: 'NBR', rubber: 'Nitrile Butadiene Rubber', tempC: 150, cycleTimeHrs: 2 },
    { family: '', abbreviation: 'HNBR', rubber: 'Hydrogenated Nitrile Butadiene Rubber', tempC: 150, cycleTimeHrs: 4 },
    { family: '', abbreviation: 'AEM', rubber: 'Ethylene-Acrylic Rubber (Vamac)', tempC: 175, cycleTimeHrs: 4 },
    { family: '', abbreviation: 'ACM', rubber: 'Polyacrylate Rubber', tempC: 150, cycleTimeHrs: 4 },
    { family: '', abbreviation: 'CPE', rubber: 'Chlorinated Polyethylene Rubber', tempC: 150, cycleTimeHrs: 4 },
    { family: '', abbreviation: 'CSM', rubber: 'Chlorosulfonated Polyethylene (Hypalon)', tempC: 150, cycleTimeHrs: 2 },
    { family: 'Silicone Rubber', abbreviation: 'VMQ', rubber: 'Silicone Rubber (Methyl Vinyl Silicone)', tempC: 200, cycleTimeHrs: 4 },
    { family: '', abbreviation: 'FKM', rubber: 'Fluoroelastomer (Viton-type)', tempC: 200, cycleTimeHrs: 4 },
  ];

  getPostCureInfo(family: string) {
    return this.postCureMatrix.find((item) => item.family.toLowerCase() === family.toLowerCase()) || null;
  }

  rubberCuringPartTypes = [
    { id: 1, name: 'O ring' },
    { id: 2, name: 'Oil ring' },
    { id: 3, name: 'Gasket' },
    { id: 4, name: 'Grommet' },
    { id: 5, name: 'Bushes' },
    { id: 6, name: 'Mounts' },
    { id: 7, name: 'Seals' },
    { id: 8, name: 'Oil Seal' },
    { id: 9, name: 'Bellow' },
    { id: 10, name: 'Molded Hoses' },
    { id: 11, name: 'Extruded Hoses' },
  ];

  gapBetweenTrays = [150, 250, 350, 450, 550, 650, 750, 850, 1000];

  verticalGapMapConfig: { [key: number]: number[] } = {
    3550: [150, 250, 350, 450, 550, 650, 750, 850, 1000],
    1200: [150, 250, 350],
    600: [150, 250, 350],
  };

  masterBatchColors = [
    {
      id: 1,
      name: 'Black',
    },
    {
      id: 2,
      name: 'Grey',
    },
    {
      id: 3,
      name: 'White',
    },
    {
      id: 4,
      name: 'Red',
    },
    {
      id: 5,
      name: 'Yellow',
    },
    {
      id: 6,
      name: 'Orange',
    },
    {
      id: 7,
      name: 'Blue',
    },
    {
      id: 8,
      name: 'Purple',
    },
    {
      id: 9,
      name: 'Green',
    },
  ];

  getGrossWeightFactor(netWeight: number): number {
    if (netWeight <= 0.499) return 2.25;
    if (netWeight < 1) return 1.8;
    if (netWeight < 2) return 1.44;
    if (netWeight < 5) return 1.26;
    if (netWeight <= 999) return 1.08;
    return 1.08; // default for > 999 (adjust if you have a rule)
  }

  getGrossWeightFactorForCompression(netWeight: number): number {
    if (netWeight <= 0.499) return 2.5;
    if (netWeight < 1) return 2;
    if (netWeight < 2) return 1.6;
    if (netWeight < 5) return 1.4;
    if (netWeight < 50) return 1.2;
    if (netWeight <= 999) return 1.1;
    return 1.1; // default for > 999 (adjust if you have a rule)
  }

  getGrossWeightFactorForTransferMolding(netWeight: number): number {
    if (netWeight <= 0.499) return 2.38;
    if (netWeight < 1) return 1.9;
    if (netWeight < 2) return 1.52;
    if (netWeight < 5) return 1.33;
    if (netWeight < 50) return 1.14;
    if (netWeight <= 999) return 1.09;
    return 1.09; // default for > 999 (adjust if you have a rule)
  }

  getBestMachineForRubberMolding(machines: MedbMachinesMasterDto[], materialInfo: MaterialInfoDto, currentPart: PartInfoDto, checkCavity: boolean): any | null {
    type MachineScore = {
      machine: MedbMachinesMasterDto;
      machineTonnage: number;
      finalNOC: number; // final number of cavities
      cycleTimePerPartSec: number; // seconds per part (guarded)
      annualCapacity70: number; // parts per year at 70% utilization
      annualCapacity90: number; // parts per year at 90% utilization
      noOfPossibleMachineTonnage70: number; // tonnage if eligible at 70% else 0
      noOfPossibleMachineTonnage90: number; // tonnage if eligible at 90% else 0
      noOfTools70: number; // tools required at 70% utilization
      noOfTools90: number; // tools required at 90% utilization
      toolSize: { length: number; width: number };
      shotWeight: number;
    };

    let scores: MachineScore[] = [];

    // Constants / assumptions (keep consistent units!)
    const avlHoursPerYear = 5160; // From your code
    const secondsPerHour = 3600;

    for (const machine of machines) {
      const machineTonnage = machine.machineTonnageTons || 0;
      const platenLengthmm = machine.platenLengthmm || 0;
      const platenWidthmm = machine.platenWidthmm || 0;

      // Your helper-derived values
      const injectionVolume = machine?.injectionRate || 0;
      const endAllowanceLength = this.getEndAllowance(machineTonnage);
      const endAllowanceWidth = this.getEndAllowance(machineTonnage);
      const machiShotWeight = injectionVolume * (materialInfo?.density || 0) || 0;

      const partDimX = materialInfo.dimX || 0;
      const partDimY = materialInfo.dimY || 0;
      // const partDimZ = materialInfo.dimZ || 0;

      let gapL = this.getGapL(partDimX);
      let gapW = this.getGapW(partDimY);

      let toolL = platenLengthmm - 2 * endAllowanceLength;
      let toolW = platenWidthmm - 2 * endAllowanceWidth;

      // No of cavities based on tool size
      const noOfCavityLength = partDimX > 0 ? Math.floor(toolL / (partDimX + gapL)) : 0;
      const noOfCavityWidth = partDimY > 0 ? Math.floor(toolW / (partDimY + gapW)) : 0;
      const totalNoOfCavities = Math.max(0, noOfCavityLength * noOfCavityWidth);

      // NOC based on shot weight
      const partGrossWeight = materialInfo.grossWeight || 0;
      const shotWtNOC = partGrossWeight > 0 ? Math.floor(machiShotWeight / partGrossWeight) : 0;

      // Final NOC
      let finalNOC = 0;
      if (materialInfo.processId === PrimaryProcessType.RubberInjectionMolding) {
        finalNOC = Math.max(0, Math.min(totalNoOfCavities, shotWtNOC));
      } else {
        finalNOC = totalNoOfCavities;
      }

      // Insert placement time (seconds)
      let insertPlacementTime = 0;
      if (materialInfo?.noOfInserts && materialInfo.noOfInserts <= 10) {
        insertPlacementTime = 5 * materialInfo.noOfInserts;
      } else if (materialInfo?.noOfInserts && materialInfo.noOfInserts > 10) {
        insertPlacementTime = 60;
      }

      // Curing time calculation (assumes output in seconds—ensure consistency!)
      const materialTypeName = materialInfo?.materialMarketData?.materialMaster?.materialTypeName || '';
      const curingInfo = this.getRubberMoldingCuringInfo(materialTypeName, materialInfo?.wallAverageThickness || 0);

      // Weight factor
      let weightFactor: number;
      if (partGrossWeight <= 10) {
        weightFactor = 0.95;
      } else if (partGrossWeight > 10 && partGrossWeight <= 20) {
        weightFactor = 1.0;
      } else {
        weightFactor = 1.1;
      }

      const cureSystemFactor = 0.95;

      // If curingInfo values are in minutes, convert to seconds here
      // Example: curingInfo.baseCuringTimeMin (minutes) -> seconds
      let curingTimeSec = 0;
      if (curingInfo) {
        // const baseTimeSec = (curingInfo.baseCuringTimeMin || 0) * 60; // convert minutes to seconds
        curingTimeSec = (curingInfo.cri || 1) * curingInfo.baseCuringTimeMin * (curingInfo.shearFactor || 1) * weightFactor * cureSystemFactor;
      }

      const handlingTimeSec = 40; // seconds

      // Total cycle time for 1 shot (with all cavities)
      const totalTimePerShotSec = insertPlacementTime + curingTimeSec + handlingTimeSec;

      // Guard finalNOC
      const cycleTimePerPartSec = finalNOC > 0 ? totalTimePerShotSec / finalNOC : Number.POSITIVE_INFINITY;

      // Annual capacity at utilization (parts/year)
      const partsPerHour = cycleTimePerPartSec !== Number.POSITIVE_INFINITY && cycleTimePerPartSec > 0 ? secondsPerHour / cycleTimePerPartSec : 0;

      const annualCapacity70 = partsPerHour * avlHoursPerYear * 0.7;
      const annualCapacity90 = partsPerHour * avlHoursPerYear * 0.9;

      const eav = currentPart.eav || 0;

      const noOfPossibleMachineTonnage70 = annualCapacity70 >= eav ? machineTonnage : 0;
      const noOfPossibleMachineTonnage90 = annualCapacity90 >= eav ? machineTonnage : 0;

      const noOfTools70 = annualCapacity70 > 0 ? eav / annualCapacity70 : Number.POSITIVE_INFINITY;
      const noOfTools90 = annualCapacity90 > 0 ? eav / annualCapacity90 : Number.POSITIVE_INFINITY;

      scores.push({
        machine,
        machineTonnage,
        finalNOC,
        cycleTimePerPartSec,
        annualCapacity70,
        annualCapacity90,
        noOfPossibleMachineTonnage70,
        noOfPossibleMachineTonnage90,
        noOfTools70,
        noOfTools90,
        toolSize: { length: toolL, width: toolW },
        shotWeight: machiShotWeight,
      });
    }

    const scoresByMatCavitysc = checkCavity ? scores.filter((s) => s.finalNOC === materialInfo.noOfCavities) : scores;
    if (scoresByMatCavitysc.length > 0) {
      scores = scoresByMatCavitysc;
    } else {
      scores = scores.filter((s) => s.finalNOC >= materialInfo.noOfCavities);
    }

    if (scores.length === 0) {
      this.messaging.openSnackBar(`No machines were found for this cavity, so the process will not be added.`, '', {
        duration: 5000,
      });
    }

    // ---- Selection logic ----
    // 1) Eligible at 70% -> lowest tonnage
    const eligible70 = scores.filter((s) => s.noOfPossibleMachineTonnage70 > 0).sort((a, b) => a.machineTonnage - b.machineTonnage);

    if (eligible70.length > 0) {
      return { machine: eligible70[0].machine, finalNOC: eligible70[0].finalNOC, toolSize: eligible70[0].toolSize };
    }

    // 2) Else eligible at 90% -> lowest tonnage
    const eligible90 = scores.filter((s) => s.noOfPossibleMachineTonnage90 > 0).sort((a, b) => a.machineTonnage - b.machineTonnage);

    if (eligible90.length > 0) {
      return { machine: eligible90[0].machine, finalNOC: eligible90[0].finalNOC, toolSize: eligible90[0].toolSize };
    }

    // 3) Else choose lowest noOfTools90 (tie-break by lowest tonnage)
    const byLeastTools90 = scores.sort((a, b) => {
      if (a.noOfTools90 === b.noOfTools90) {
        return a.machineTonnage - b.machineTonnage;
      }
      return a.noOfTools90 - b.noOfTools90;
    });

    return byLeastTools90.length > 0 ? { machine: byLeastTools90[0].machine, finalNOC: byLeastTools90[0].finalNOC, toolSize: byLeastTools90[0].toolSize } : null;
  }

  getGapL(partLengthMM: number): number {
    if (partLengthMM <= 30) return 5;
    if (partLengthMM <= 100) return 7.5;
    if (partLengthMM <= 200) return 10;
    return 15; // for >200 up to 999+ (your row shows 999 -> 15)
  }

  getGapW(partWidthMM: number): number {
    if (partWidthMM <= 30) return 5;
    if (partWidthMM <= 100) return 7.5;
    if (partWidthMM <= 200) return 10;
    return 15; // for >200 up to 999+ (your row shows 999 -> 15)
  }

  getEndAllowance(tonnage: number): number {
    if (tonnage <= 100) return 60;
    if (tonnage <= 250) return 80;
    return 100;
  }

  // -----------------------------
  // Curing time table for rubber molding as JSON array
  // -----------------------------
  rubberMoldingCuringData = [
    {
      rubber: 'EPDM',
      family: 'EPDM-(Ethylene-Propylene Terpolymer Rubber)',
      cri: 1.1,
      shearFactor: 0.9,
      times: {
        'Upto 1': 150,
        '1 to 2': 180,
        '2 to 3': 220,
        '3 to 4': 240,
        '4 to 5': 270,
        '5 to 10': 320,
        '10 to 50': 470,
      },
    },
    {
      rubber: 'NBR',
      family: 'Nitrile Rubber',
      cri: 1.0,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'HNBR',
      family: '',
      cri: 1.1,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'FKM',
      family: '',
      cri: 1.3,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'AEM',
      family: '',
      cri: 1.2,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'ACM',
      family: '',
      cri: 0.8,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'VMQ',
      family: 'Silicone Rubber',
      cri: 0.8,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'NR',
      family: 'Natural - Standard Rubber-()',
      cri: 1.0,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'SBR',
      family: 'SBR-(Styrene Butadiene Rubber)',
      cri: 1.0,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'LSR',
      family: '',
      cri: 1.0,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
    {
      rubber: 'others',
      family: 'others',
      cri: 1.0,
      shearFactor: 0.9,
      times: { 'Upto 1': 150, '1 to 2': 180, '2 to 3': 220, '3 to 4': 240, '4 to 5': 270, '5 to 10': 320, '10 to 50': 470 },
    },
  ];

  // -----------------------------
  // Thickness bucket resolver
  // -----------------------------
  getThicknessBucket(thicknessMm: number): string {
    if (thicknessMm <= 1) return 'Upto 1';
    if (thicknessMm <= 2) return '1 to 2';
    if (thicknessMm <= 3) return '2 to 3';
    if (thicknessMm <= 4) return '3 to 4';
    if (thicknessMm <= 5) return '4 to 5';
    if (thicknessMm <= 10) return '5 to 10';
    if (thicknessMm <= 50) return '10 to 50';
    // If thickness beyond the table, clamp to the largest bucket or throw error
    return '10 to 50'; // you may choose to throw instead
  }

  // -----------------------------
  // Main function: returns a plain object
  // -----------------------------
  getRubberMoldingCuringInfo(rubberType: string, thicknessMm: number) {
    if (thicknessMm == null || thicknessMm <= 0 || !Number.isFinite(thicknessMm)) {
      console.warn('Invalid thickness. Provide thickness in mm (> 0).');
      return null;
    }

    let row = this.rubberMoldingCuringData.find((r) => r.family.toLowerCase() === rubberType.trim().toLowerCase());

    if (!row) {
      row = this.rubberMoldingCuringData.find((r) => r.family.toLowerCase() === 'others');
    }

    const bucket = this.getThicknessBucket(thicknessMm);
    const baseTimeMin = row.times[bucket];

    // Adjust with CRI (Cure Rate Index) multiplier
    const adjustedTimeMin = Math.round(baseTimeMin * row.cri);

    return {
      rubberType: row.rubber,
      thicknessMm,
      thicknessBucket: bucket,
      baseCuringTimeMin: baseTimeMin,
      cri: row.cri,
      adjustedCuringTimeMin: adjustedTimeMin,
      shearFactor: row.shearFactor,
    };
  }
}
