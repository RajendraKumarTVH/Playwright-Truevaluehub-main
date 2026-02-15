import { Injectable } from '@angular/core';
import { BendingToolTypes, MachineType, ProcessType, StampingType } from 'src/app/modules/costing/costing.config';
import { PartComplexity } from '../enums';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MaterialInfoDto, PartInfoDto, ProcessInfoDto } from '../models';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SubProcessTypeInfoDto } from '../models/subprocess-info.model';

@Injectable({
  providedIn: 'root',
})
export class SheetMetalConfigService {
  constructor(
    private sharedService: SharedService,
    private _fb: FormBuilder
  ) {}

  simpleCountries = [1, 2, 3, 4, 8, 11, 16, 21, 22, 23, 24, 26, 27, 35, 37, 39, 44, 49, 54, 55, 60, 65];
  compoundCountries = [
    5, 6, 7, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20, 25, 28, 29, 30, 31, 32, 33, 34, 36, 38, 40, 41, 42, 43, 45, 46, 47, 48, 50, 51, 52, 53, 56, 57, 58, 59, 61, 62, 63, 64, 66, 67, 68, 69, 70,
  ];

  defaultPercentages(processTypeId: number, partComplexity = PartComplexity.Low, percentageType = 'yieldPercentage') {
    const vals = [
      { processTypeId: ProcessType.LaserCutting, yieldPercentage: { 1: 99, 2: 98, 3: 96 }, samplingRate: { 1: 1.95, 2: 4, 3: 6 } },
      { processTypeId: ProcessType.PlasmaCutting, yieldPercentage: { 1: 98.5, 2: 97.5, 3: 94 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
      { processTypeId: ProcessType.OxyCutting, yieldPercentage: { 1: 98, 2: 96, 3: 92 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.WaterJetCutting, yieldPercentage: { 1: 98, 2: 97.5, 3: 94 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.Progressive, yieldPercentage: { 1: 99, 2: 98, 3: 97 }, samplingRate: { 1: 1.95, 2: 4, 3: 6 } },
      { processTypeId: ProcessType.Drawing, yieldPercentage: { 1: 99, 2: 98, 3: 97 }, samplingRate: { 1: 1.95, 2: 4, 3: 6 } },
      { processTypeId: ProcessType.Forming, yieldPercentage: { 1: 99, 2: 98, 3: 97 }, samplingRate: { 1: 1.95, 2: 4, 3: 6 } },
      { processTypeId: ProcessType.Stage, yieldPercentage: { 1: 98.5, 2: 97, 3: 95 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
      { processTypeId: ProcessType.TurretTPP, yieldPercentage: { 1: 98.5, 2: 97.5, 3: 94 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.Bending, yieldPercentage: { 1: 98, 2: 97, 3: 96 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
      { processTypeId: ProcessType.Assembly, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
    ];
    return vals.find((x) => x.processTypeId === processTypeId)?.[percentageType]?.[partComplexity] || vals[3]?.[percentageType]?.[partComplexity];
  }

  // 2. Data array
  spmData: SpmRecommendation[] = [
    { material: 'Carbon Steel', thicknessMax: 1, spm16_5T: 184, spm20T: 205, spm30T: 228, spm40T: 232 },
    { material: 'Carbon Steel', thicknessMax: 1.6, spm16_5T: 168, spm20T: 187, spm30T: 208, spm40T: 212 },
    { material: 'Carbon Steel', thicknessMax: 2.5, spm16_5T: 147, spm20T: 164, spm30T: 182, spm40T: 186 },
    { material: 'Carbon Steel', thicknessMax: 3.2, spm16_5T: 126, spm20T: 140, spm30T: 156, spm40T: 159 },
    { material: 'Carbon Steel', thicknessMax: 4.5, spm16_5T: 105, spm20T: 117, spm30T: 130, spm40T: 133 },
    { material: 'Carbon Steel', thicknessMax: 6, spm16_5T: 84, spm20T: 94, spm30T: 104, spm40T: 106 },

    { material: 'Stainless Steel', thicknessMax: 1, spm16_5T: 138, spm20T: 154, spm30T: 171, spm40T: 174 },
    { material: 'Stainless Steel', thicknessMax: 1.6, spm16_5T: 126, spm20T: 140, spm30T: 156, spm40T: 159 },
    { material: 'Stainless Steel', thicknessMax: 2.5, spm16_5T: 110, spm20T: 123, spm30T: 136, spm40T: 139 },
    { material: 'Stainless Steel', thicknessMax: 3.2, spm16_5T: 94, spm20T: 105, spm30T: 117, spm40T: 119 },
    { material: 'Stainless Steel', thicknessMax: 4.5, spm16_5T: 79, spm20T: 88, spm30T: 98, spm40T: 99 },
    { material: 'Stainless Steel', thicknessMax: 6, spm16_5T: 63, spm20T: 70, spm30T: 78, spm40T: 80 },

    { material: 'Aluminium', thicknessMax: 1, spm16_5T: 193, spm20T: 215, spm30T: 239, spm40T: 244 },
    { material: 'Aluminium', thicknessMax: 1.6, spm16_5T: 177, spm20T: 197, spm30T: 218, spm40T: 223 },
    { material: 'Aluminium', thicknessMax: 2.5, spm16_5T: 154, spm20T: 172, spm30T: 191, spm40T: 195 },
    { material: 'Aluminium', thicknessMax: 3.2, spm16_5T: 132, spm20T: 147, spm30T: 164, spm40T: 167 },
    { material: 'Aluminium', thicknessMax: 4.5, spm16_5T: 110, spm20T: 123, spm30T: 136, spm40T: 139 },
    { material: 'Aluminium', thicknessMax: 6, spm16_5T: 88, spm20T: 98, spm30T: 109, spm40T: 111 },

    { material: 'Copper Alloy', thicknessMax: 1, spm16_5T: 138, spm20T: 154, spm30T: 171, spm40T: 174 },
    { material: 'Copper Alloy', thicknessMax: 1.6, spm16_5T: 126, spm20T: 140, spm30T: 156, spm40T: 159 },
    { material: 'Copper Alloy', thicknessMax: 2.5, spm16_5T: 110, spm20T: 123, spm30T: 136, spm40T: 139 },
    { material: 'Copper Alloy', thicknessMax: 3.2, spm16_5T: 94, spm20T: 105, spm30T: 117, spm40T: 119 },
    { material: 'Copper Alloy', thicknessMax: 4.5, spm16_5T: 79, spm20T: 88, spm30T: 98, spm40T: 99 },
    { material: 'Copper Alloy', thicknessMax: 6, spm16_5T: 63, spm20T: 70, spm30T: 78, spm40T: 80 },
  ];

  // 3. Function to get data
  getSpmRecommendation(material: string, thickness: number): SpmRecommendation | undefined {
    // Get all records for the given material
    const materialRows = this.spmData.filter((x) => x.material === material).sort((a, b) => a.thicknessMax - b.thicknessMax); // sort ascending by thickness

    // Find the first row where thicknessMax >= given thickness
    return materialRows.find((x) => x.thicknessMax >= thickness);
  }

  getBestSheetUtilizationData(materialInfo: MaterialInfoDto) {
    // --- 1. Calculate edge allowance once ---
    // let edgeAllowance = 0;
    // const dimZ = Number(materialInfo.dimUnfoldedZ);
    // if (dimZ < 4) {
    //   edgeAllowance = dimZ * 2;
    // } else if (dimZ < 20) {
    //   edgeAllowance = 5;
    // }

    // --- 2. Define available sheet sizes ---
    const sheetSizes = [
      { sno: 1, length: 2000, width: 1000 },
      { sno: 2, length: 2500, width: 1250 },
      { sno: 3, length: 3000, width: 1500 },
      { sno: 4, length: 4000, width: 2000 },
      { sno: 5, length: 2438, width: 914 },
      { sno: 6, length: 3048, width: 914 },
      { sno: 7, length: 3658, width: 914 },
      { sno: 8, length: 914, width: 914 },
      { sno: 9, length: 1219, width: 914 },
      { sno: 10, length: 1829, width: 914 },
      { sno: 11, length: 1219, width: 1219 },
      { sno: 12, length: 1524, width: 1219 },
      { sno: 13, length: 1829, width: 1219 },
      { sno: 14, length: 2134, width: 1219 },
      { sno: 15, length: 2438, width: 1219 },
      { sno: 16, length: 3048, width: 1219 },
      { sno: 17, length: 3658, width: 1219 },
      { sno: 18, length: 1524, width: 1524 },
      { sno: 19, length: 1829, width: 1524 },
      { sno: 20, length: 2134, width: 1524 },
      { sno: 21, length: 2438, width: 1524 },
    ];

    // --- 3. Helper to compute metrics for a sheet ---
    function calculateSheet(sno: number, length: number, width: number) {
      const { dimUnfoldedX, dimUnfoldedY, partAllowance, dimUnfoldedZ, density, netWeight, moldBoxLength, runnerDia, runnerLength } = materialInfo;

      const weight = (length * width * dimUnfoldedZ * density) / 1000;

      // const partsLtoL = Math.floor((length - 2 * edgeAllowance) / (dimUnfoldedX + partAllowance));
      // const partsLtoW = Math.floor((width - 2 * edgeAllowance) / (dimUnfoldedY + partAllowance));
      // const partsWtoL = Math.floor((width - 2 * edgeAllowance) / (dimUnfoldedX + partAllowance));
      // const partsWtoW = Math.floor((length - 2 * edgeAllowance) / (dimUnfoldedY + partAllowance));

      let partsLtoL = 0,
        partsLtoW = 0,
        partsWtoL = 0,
        partsWtoW = 0;
      if (materialInfo.processId === ProcessType.TurretTPP) {
        partsLtoL = Math.floor((length + partAllowance - (moldBoxLength + runnerDia)) / (dimUnfoldedX + partAllowance));
        partsLtoW = Math.floor((width + partAllowance - (moldBoxLength + runnerLength)) / (dimUnfoldedY + partAllowance));
        partsWtoL = Math.floor((width + partAllowance - (moldBoxLength + runnerDia)) / (dimUnfoldedX + partAllowance));
        partsWtoW = Math.floor((length + partAllowance - (moldBoxLength + runnerLength)) / (dimUnfoldedY + partAllowance));
      } else {
        partsLtoL = Math.floor((length + partAllowance - (2 * moldBoxLength + runnerDia)) / (dimUnfoldedX + partAllowance));
        partsLtoW = Math.floor((width + partAllowance - (2 * moldBoxLength + runnerLength)) / (dimUnfoldedY + partAllowance));
        partsWtoL = Math.floor((width + partAllowance - (2 * moldBoxLength + runnerDia)) / (dimUnfoldedX + partAllowance));
        partsWtoW = Math.floor((length + partAllowance - (2 * moldBoxLength + runnerLength)) / (dimUnfoldedY + partAllowance));
      }

      const highestParts = Math.max(partsLtoL * partsLtoW, partsWtoL * partsWtoW);

      const utilization = (highestParts * netWeight) / weight;

      return {
        sno,
        size: `${length}x${width}`,
        length,
        width,
        weight,
        partsLtoL,
        partsLtoW,
        partsWtoL,
        partsWtoW,
        highestParts,
        utilization, // keep numeric for comparison
      };
    }

    // --- 4. Calculate all sheets ---
    const allSheets = sheetSizes.map((s) => calculateSheet(s.sno, s.length, s.width));

    // --- 5. Find sheet with max utilization ---
    const maxSheet = allSheets.reduce((prev, curr) => (curr.utilization > prev.utilization ? curr : prev));

    // --- 6. Format utilization as percentage ---
    return { ...maxSheet, utilization: maxSheet.utilization * 100 };
  }

  getCustomSheetUtilizationData(materialInfo: MaterialInfoDto) {
    // --- 1. Calculate edge allowance once ---
    // let edgeAllowance = 0;
    // const dimZ = Number(materialInfo.dimUnfoldedZ);
    // if (dimZ < 4) {
    //   edgeAllowance = dimZ * 2;
    // } else if (dimZ < 20) {
    //   edgeAllowance = 5;
    // }

    // --- 2. Helper for calculation ---
    function calculateSheet(length: number, width: number) {
      const { dimUnfoldedX, dimUnfoldedY, partAllowance, dimUnfoldedZ, density, netWeight, moldBoxLength, runnerDia, runnerLength } = materialInfo;

      const weight = (length * width * dimUnfoldedZ * density) / 1000;

      let partsLtoL = 0,
        partsLtoW = 0,
        partsWtoL = 0,
        partsWtoW = 0;
      if (materialInfo.processId === ProcessType.TurretTPP) {
        partsLtoL = Math.floor((length + partAllowance - (moldBoxLength + runnerDia)) / (dimUnfoldedX + partAllowance));
        partsLtoW = Math.floor((width + partAllowance - (moldBoxLength + runnerLength)) / (dimUnfoldedY + partAllowance));
        partsWtoL = Math.floor((width + partAllowance - (moldBoxLength + runnerDia)) / (dimUnfoldedX + partAllowance));
        partsWtoW = Math.floor((length + partAllowance - (moldBoxLength + runnerLength)) / (dimUnfoldedY + partAllowance));
      } else {
        partsLtoL = Math.floor((length + partAllowance - (2 * moldBoxLength + runnerDia)) / (dimUnfoldedX + partAllowance));
        partsLtoW = Math.floor((width + partAllowance - (2 * moldBoxLength + runnerLength)) / (dimUnfoldedY + partAllowance));
        partsWtoL = Math.floor((width + partAllowance - (2 * moldBoxLength + runnerDia)) / (dimUnfoldedX + partAllowance));
        partsWtoW = Math.floor((length + partAllowance - (2 * moldBoxLength + runnerLength)) / (dimUnfoldedY + partAllowance));
      }

      const highestParts = Math.max(partsLtoL * partsLtoW, partsWtoL * partsWtoW);

      const utilization = (highestParts * netWeight) / weight;

      return {
        size: `${length}x${width}`,
        length,
        width,
        weight,
        partsLtoL,
        partsLtoW,
        partsWtoL,
        partsWtoW,
        highestParts,
        utilization: utilization * 100,
      };
    }

    // --- 3. Return single sheet result ---
    return calculateSheet(materialInfo.coilLength, materialInfo.coilWidth);
  }

  getDwellTime(materialType: string, thickness: number, bendType: number) {
    if (materialType !== 'Spring Steel') {
      materialType = this.mapMaterial(materialType);
    }
    const dwellTimeData = [
      // Aluminum
      { material: 'Aluminum', thickness: '0.5 – 1.0', airBending: 0.2, bottomBending: 0.3, coining: 0.8, reference: 'WILA tooling Guide tooling, Amada B-102 Hand book' },
      { material: 'Aluminum', thickness: '1.1 – 2.0', airBending: 0.3, bottomBending: 0.4, coining: 1, reference: 'WILA tooling Guide, Trumpf' },
      { material: 'Aluminum', thickness: '2.1 – 4.0', airBending: 0.4, bottomBending: 0.6, coining: 1.5, reference: 'Amada, Trumpf' },
      { material: 'Aluminum', thickness: '4.1 – 6.0', airBending: 0.5, bottomBending: 0.7, coining: 1.8, reference: 'WILA tooling Guide, Trumpf' },
      { material: 'Aluminum', thickness: '6.1 – 10.0', airBending: 0.6, bottomBending: 0.9, coining: 2.2, reference: 'Amada, WILA tooling Guide' },
      { material: 'Aluminum', thickness: '10.1 – 15.0', airBending: 0.8, bottomBending: 1.3, coining: 3.5, reference: 'Trumpf, Amada' },
      { material: 'Aluminum', thickness: '15.1 – 20.0', airBending: 1, bottomBending: 1.5, coining: 4, reference: 'WILA tooling Guide, Heavy Gauge Forming' },
      { material: 'Aluminum', thickness: '20.1 – 25.0', airBending: 1.2, bottomBending: 1.8, coining: 5, reference: 'Amada, WILA tooling Guide, SME' },

      // Copper Alloy
      { material: 'Copper Alloy', thickness: '0.5 – 1.0', airBending: 0.2, bottomBending: 0.3, coining: 1, reference: 'Trumpf, SME Handbook' },
      { material: 'Copper Alloy', thickness: '1.1 – 2.0', airBending: 0.3, bottomBending: 0.5, coining: 1.2, reference: 'Amada' },
      { material: 'Copper Alloy', thickness: '2.1 – 4.0', airBending: 0.4, bottomBending: 0.6, coining: 1.6, reference: 'WILA tooling Guide' },
      { material: 'Copper Alloy', thickness: '4.1 – 6.0', airBending: 0.6, bottomBending: 0.8, coining: 2, reference: 'SME Forming Guide' },
      { material: 'Copper Alloy', thickness: '6.1 – 10.0', airBending: 0.7, bottomBending: 1, coining: 2.5, reference: 'SME, Trumpf' },
      { material: 'Copper Alloy', thickness: '10.1 – 15.0', airBending: 0.8, bottomBending: 1.3, coining: 3.5, reference: 'Trumpf, Amada' },
      { material: 'Copper Alloy', thickness: '15.1 – 20.0', airBending: 1, bottomBending: 1.5, coining: 4, reference: 'WILA tooling Guide, Heavy Gauge Forming' },
      { material: 'Copper Alloy', thickness: '20.1 – 25.0', airBending: 1.2, bottomBending: 1.8, coining: 5, reference: 'Amada, WILA tooling Guide, SME' },

      // Stainless Steel
      { material: 'Stainless Steel', thickness: '0.5 – 1.0', airBending: 0.3, bottomBending: 0.4, coining: 1.2, reference: 'WILA tooling Guide, Trumpf' },
      { material: 'Stainless Steel', thickness: '1.1 – 2.0', airBending: 0.4, bottomBending: 0.5, coining: 1.4, reference: 'Trumpf, WILA tooling Guide' },
      { material: 'Stainless Steel', thickness: '2.1 – 4.0', airBending: 0.5, bottomBending: 0.7, coining: 1.8, reference: 'Trumpf, WILA tooling Guide' },
      { material: 'Stainless Steel', thickness: '4.1 – 6.0', airBending: 0.6, bottomBending: 0.9, coining: 2.2, reference: 'Amada, WILA tooling Guide' },
      { material: 'Stainless Steel', thickness: '6.1 – 10.0', airBending: 0.7, bottomBending: 1.1, coining: 2.8, reference: 'Trumpf, Amada' },
      { material: 'Stainless Steel', thickness: '10.1 – 15.0', airBending: 0.8, bottomBending: 1.3, coining: 3.5, reference: 'Trumpf, Amada' },
      { material: 'Stainless Steel', thickness: '15.1 – 20.0', airBending: 1, bottomBending: 1.5, coining: 4, reference: 'WILA tooling Guide, Heavy Gauge Forming' },
      { material: 'Stainless Steel', thickness: '20.1 – 25.0', airBending: 1.2, bottomBending: 1.8, coining: 5, reference: 'Amada, WILA tooling Guide, SME' },

      // Carbon Steel
      { material: 'Carbon Steel', thickness: '0.5 – 1.0', airBending: 0.2, bottomBending: 0.4, coining: 1, reference: 'Amada Tech Guide' },
      { material: 'Carbon Steel', thickness: '1.1 – 2.0', airBending: 0.3, bottomBending: 0.5, coining: 1.2, reference: 'SME Sheet Metal Guide' },
      { material: 'Carbon Steel', thickness: '2.1 – 4.0', airBending: 0.4, bottomBending: 0.6, coining: 1.5, reference: 'Amada' },
      { material: 'Carbon Steel', thickness: '4.1 – 6.0', airBending: 0.5, bottomBending: 0.8, coining: 2, reference: 'Trumpf' },
      { material: 'Carbon Steel', thickness: '6.1 – 10.0', airBending: 0.6, bottomBending: 1, coining: 2.5, reference: 'WILA tooling Guide, Techni-Tool' },
      { material: 'Carbon Steel', thickness: '10.1 – 15.0', airBending: 0.8, bottomBending: 1.3, coining: 3.5, reference: 'Trumpf, Amada' },
      { material: 'Carbon Steel', thickness: '15.1 – 20.0', airBending: 1, bottomBending: 1.5, coining: 4, reference: 'WILA tooling Guide, Heavy Gauge Forming' },
      { material: 'Carbon Steel', thickness: '20.1 – 25.0', airBending: 1.2, bottomBending: 1.8, coining: 5, reference: 'Amada, WILA tooling Guide, SME' },

      // Spring Steel
      { material: 'Spring Steel', thickness: '0.5 – 1.0', airBending: 0.3, bottomBending: 0.5, coining: 1.5, reference: 'SME, WILA tooling Guide' },
      { material: 'Spring Steel', thickness: '10.1 – 15.0', airBending: 0.8, bottomBending: 1.3, coining: 3.5, reference: 'Trumpf, Amada' },
      { material: 'Spring Steel', thickness: '15.1 – 20.0', airBending: 1, bottomBending: 1.5, coining: 4, reference: 'WILA tooling Guide, Heavy Gauge Forming' },
      { material: 'Spring Steel', thickness: '20.1 – 25.0', airBending: 1.2, bottomBending: 1.8, coining: 5, reference: 'Amada, WILA tooling Guide, SME' },
    ];

    let dwellTime = 0;
    const materialDwellTime = dwellTimeData.find((item) => {
      if (item.material !== materialType) return false;
      const [min, max] = item.thickness.split('–').map((v) => parseFloat(v.trim()));
      return thickness >= min && thickness <= max;
    });

    if (materialDwellTime) {
      const dwellTimeEntry = materialDwellTime;
      switch (bendType) {
        case 1: // Air Bending
          dwellTime = dwellTimeEntry.airBending;
          break;
        case 2: // Bottom Bending':
          dwellTime = dwellTimeEntry.bottomBending;
          break;
        case 3: // Coining
          dwellTime = dwellTimeEntry.coining;
          break;
        default:
          dwellTime = 0; // Default to 0 if bend type is not recognized
      }
    }
    return dwellTime;
  }

  transferPressParams: TransferPressParam[] = [
    {
      partType: 'Small part (bracket, < 500 mm long)',
      range: '<=500',
      vRobot: 500,
      vLoading: 450,
      vUnloading: 450,
    },
    {
      partType: 'Medium part (crossmember, 500–1000 mm)',
      range: '500-1000',
      vRobot: 450,
      vLoading: 400,
      vUnloading: 400,
    },
    {
      partType: 'Large part (door inner, 1000–1500 mm)',
      range: '1000-1500',
      vRobot: 350,
      vLoading: 350,
      vUnloading: 350,
    },
  ];

  // Function to get config by blank size
  getTransferPressParameters(blankSize: string): TransferPressParam | null {
    if (blankSize === '<=500') {
      return this.transferPressParams[0];
    } else if (blankSize === '500-1000') {
      return this.transferPressParams[1];
    } else if (blankSize === '1000-1500') {
      return this.transferPressParams[2];
    }
    return null; // Out of range
  }

  getStampingProgressiveTonnage(materialInfo: MaterialInfoDto, processInfo: ProcessInfoDto) {
    let totalTonnage = 0;
    const thickness = materialInfo?.dimUnfoldedZ;
    for (let i = 0; i < processInfo.subProcessFormArray?.controls?.length; i++) {
      const info = processInfo.subProcessFormArray?.controls[i];
      if ([StampingType.BlankingPunching, StampingType.Piercing, StampingType.Compound].includes(info.value.subProcessTypeID)) {
        const thickness = processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.dimUnfoldedZ;
        const lengthOfCut = Number(info?.value?.lengthOfCut);
        const theoriticalForcce = this.sharedService.isValidNumber((lengthOfCut * Number(thickness) * Number(processInfo.materialmasterDatas.shearingStrength)) / 9810);
        const recommendedTon = this.sharedService.isValidNumber(Number(theoriticalForcce) * 1.25);
        totalTonnage += recommendedTon;
      } else if ([StampingType.Bending].includes(info.value.subProcessTypeID)) {
        const ultimateTensileMaterial = this.sharedService.isValidNumber(processInfo.materialmasterDatas?.tensileStrength);
        const theoreticalForce = (Math.pow(thickness, 1) * info.value.bendingLineLength * ultimateTensileMaterial * processInfo.bendingCoeffecient) / 9810;
        const recommendTonnage = this.sharedService.isValidNumber(theoreticalForce) * 1.25;
        totalTonnage += recommendTonnage;
      } else if ([StampingType.Forming, StampingType.Coining].includes(info.value.subProcessTypeID)) {
        const blankHoldingForce = Number(info.value.formingForce) * (1 / 3);
        // const noOFImpression = (processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.noOfCavities) || 1;
        const theoriticalForcce = Number(info.value.formingForce) + Number(blankHoldingForce); //* Number(noOFImpression);
        const recommendTonnage = Number(theoriticalForcce) * 1.25;
        totalTonnage += recommendTonnage;
      }
    }
    return totalTonnage;
  }

  getTransferPressTonnage(materialInfo: MaterialInfoDto, processInfo: ProcessInfoDto) {
    let maxTon = 0;
    const thickness = materialInfo?.dimUnfoldedZ;
    for (let i = 0; i < processInfo.subProcessFormArray?.controls?.length; i++) {
      const info = processInfo.subProcessFormArray?.controls[i];
      if ([StampingType.Piercing].includes(info.value.subProcessTypeID)) {
        const thickness = processInfo.materialInfoList?.length && processInfo.materialInfoList[0]?.dimUnfoldedZ;
        const lengthOfCut = Number(info?.value?.lengthOfCut);
        const theoriticalForcce = this.sharedService.isValidNumber((lengthOfCut * Number(thickness) * Number(processInfo.materialmasterDatas.shearingStrength)) / 9810);
        const recommendedTon = this.sharedService.isValidNumber(Number(theoriticalForcce) * 1.25);
        maxTon = maxTon < recommendedTon ? recommendedTon : maxTon;
      } else if ([StampingType.Bending].includes(info.value.subProcessTypeID)) {
        const ultimateTensileMaterial = this.sharedService.isValidNumber(processInfo.materialmasterDatas?.tensileStrength);
        const theoreticalForce = (Math.pow(thickness, 1) * info.value.bendingLineLength * ultimateTensileMaterial * processInfo.bendingCoeffecient) / 9810;
        const recommendTonnage = this.sharedService.isValidNumber(theoreticalForce) * 1.25;
        maxTon = maxTon < recommendTonnage ? recommendTonnage : maxTon;
      } else if ([StampingType.Forming].includes(info.value.subProcessTypeID)) {
        const blankHoldingForce = Number(info.value.formingForce) * (1 / 3);
        const theoriticalForcce = Number(info.value.formingForce) + Number(blankHoldingForce);
        const recommendTonnage = Number(theoriticalForcce) * 1.25;
        maxTon = maxTon < recommendTonnage ? recommendTonnage : maxTon;
      } else if ([StampingType.ShallowDrawRect, StampingType.RedrawRect, StampingType.ShallowDrawCir, StampingType.RedrawCir].includes(info.value.subProcessTypeID)) {
        let perimeter = Number(info?.value?.lengthOfCut); // TODO: get drawing primeter
        let tensileStrength = processInfo.materialInfoList?.length > 0 ? processInfo.materialInfoList[0]?.ultimateTensileStrength : 0; // Number(info?.value?.shoulderWidth);
        const drawKFactor = 1.15;

        const theoriticalForcce = this.sharedService.isValidNumber((3.14 * perimeter * Number(thickness) * Number(tensileStrength) * Number(drawKFactor)) / 9806.65);
        const recommendedTon = this.sharedService.isValidNumber(Number(theoriticalForcce) * 1.2);

        maxTon = maxTon < recommendedTon ? recommendedTon : maxTon;
      } else if ([StampingType.Trimming].includes(info.value.subProcessTypeID)) {
        let perimeter = Number(info?.value?.lengthOfCut);
        let shearStrength = processInfo?.materialmasterDatas?.shearingStrength || 0;

        const theoriticalForcce = this.sharedService.isValidNumber((perimeter * Number(shearStrength) * Number(thickness)) / 9806.65);
        const recommendedTon = this.sharedService.isValidNumber(Number(theoriticalForcce) * 1.2);

        maxTon = maxTon < recommendedTon ? recommendedTon : maxTon;
      }
    }
    return maxTon;
  }

  getDieOpeningTime(materialList: MaterialInfoDto[], processInfo: ProcessInfoDto) {
    const dimz = this.sharedService.isValidNumber(materialList?.length && materialList[0]?.dimUnfoldedZ);
    if (dimz < 3) {
      processInfo.dieOpeningThickness = 6;
    } else if (dimz < 10) {
      processInfo.dieOpeningThickness = 8;
    } else if (dimz < 12) {
      processInfo.dieOpeningThickness = 10;
    } else if (dimz > 12) {
      processInfo.dieOpeningThickness = 12;
    }
    const dieOpeningTime = Number(processInfo.partThickness) * Number(processInfo.dieOpeningThickness);
    return dieOpeningTime;
  }

  getBendingTonnage(materialList: MaterialInfoDto[], processInfo: ProcessInfoDto, currentPart: PartInfoDto) {
    const bendingCoeffecient = 1.33;
    const ultimateTensileMaterial = this.sharedService.isValidNumber(processInfo.materialmasterDatas?.tensileStrength);
    const dimz = this.sharedService.isValidNumber(materialList?.length && materialList[0]?.dimUnfoldedZ);
    processInfo.dieOpeningTime = this.getDieOpeningTime(materialList, processInfo);
    if (currentPart?.eav > 100000 && processInfo.bendingLineLength < 400) {
      processInfo.moldTemp = BendingToolTypes.Dedicated;
      const theoreticalForceForce = (Math.pow(dimz, 2) * Number(processInfo.bendingLineLength) * ultimateTensileMaterial * bendingCoeffecient) / Number(processInfo.shoulderWidth) / 9810;
      processInfo.theoreticalForce = this.sharedService.isValidNumber(theoreticalForceForce);
      processInfo.totalTonnageRequired = this.sharedService.isValidNumber(theoreticalForceForce) * Number(processInfo.noOfbends || 1);
      processInfo.recommendTonnage = this.sharedService.isValidNumber(processInfo.totalTonnageRequired) * 1.25;
    } else {
      processInfo.moldTemp = BendingToolTypes.Soft;
      processInfo.newToolingRequired = false;
      const bendingForceKn = this.sharedService.isValidNumber(
        (1.42 * Math.pow(Number(processInfo.partThickness), 2) * Number(processInfo.bendingLineLength / 1000) * Number(ultimateTensileMaterial)) / processInfo.dieOpeningTime
      );
      const bendingForcePerTon = this.sharedService.isValidNumber(bendingForceKn * 0.10204);
      processInfo.recommendTonnage = bendingForcePerTon * 1.25;
    }
    return processInfo.recommendTonnage;
  }

  getBlankingTonnage(materialInfo: MaterialInfoDto, processInfo: ProcessInfoDto) {
    const thickness = materialInfo?.dimUnfoldedZ;
    const theoriticalForcce = this.sharedService.isValidNumber((Number(processInfo.lengthOfCut) * Number(thickness) * Number(processInfo.materialmasterDatas.shearingStrength)) / 9810);
    const recommendedTon = this.sharedService.isValidNumber(Number(theoriticalForcce) * 1.25);
    return recommendedTon;
  }

  getRecommendedBedSizeStaging(unfoldedLength, unfoldedWidth, thickness, height) {
    let recBedLength = 0;

    if (unfoldedLength <= 100) {
      recBedLength = unfoldedLength + 2 * 100;
    } else if (unfoldedLength <= 200) {
      recBedLength = unfoldedLength + 2 * 120;
    } else if (unfoldedLength <= 500) {
      recBedLength = unfoldedLength + 2 * 150;
    } else {
      recBedLength = unfoldedLength + 2 * 200;
    }

    // Round up to nearest multiple of 5
    recBedLength = Math.ceil(recBedLength / 5) * 5;

    let recBedWidth: number;

    if (unfoldedWidth <= 100) {
      recBedWidth = unfoldedWidth + 2 * 100; // +200
    } else if (unfoldedWidth <= 200) {
      recBedWidth = unfoldedWidth + 2 * 120; // +240
    } else if (unfoldedWidth <= 500) {
      recBedWidth = unfoldedWidth + 2 * 150; // +300
    } else {
      recBedWidth = unfoldedWidth + 2 * 200; // +400
    }

    // Round up to nearest multiple of 5
    recBedWidth = Math.ceil(recBedWidth / 5) * 5;

    // recommended shut height
    const dieInsert = Math.max(0.3 * height, 12);
    const punches = Math.max(10 * thickness, 20);
    const dieHolderPlate = Math.max(0.4 * height, 30);
    const dieBackPlate = Math.max(0.25 * height, 20);
    const punchHolderPlate = Math.max(0.4 * height, 18);
    const punchBackPlate = Math.max(0.2 * height, 12);
    const stripperPlate = Math.max(6 * thickness, 10);

    let topShoeeThickness = 50;
    const minTopShoeeThickness = Math.min(recBedLength, recBedWidth);
    if (minTopShoeeThickness <= 300) {
      topShoeeThickness = 30;
    } else if (minTopShoeeThickness <= 400) {
      topShoeeThickness = 35;
    } else if (minTopShoeeThickness <= 500) {
      topShoeeThickness = 40;
    } else if (minTopShoeeThickness <= 600) {
      topShoeeThickness = 45;
    }

    let bottomShoeeThickness = topShoeeThickness;
    let chMargin = 13;

    let total = dieInsert + punches + dieHolderPlate + dieBackPlate + punchHolderPlate + punchBackPlate + stripperPlate + topShoeeThickness + bottomShoeeThickness + chMargin;
    total += thickness;
    const maxDieSetHeight = Math.ceil(total / 5) * 5;

    return { recBedLength, recBedWidth, maxDieSetHeight };
  }

  getRecommendedBedSizeProgressive(unfoldedLength, unfoldedWidth, thickness, height, noOfStages, stripLayout, noOfImpressions) {
    let recBedLength = unfoldedWidth * noOfStages + 30 * (noOfStages - 1) + 2 * 180;

    // Round up to the nearest multiple of 5
    recBedLength = Math.ceil(recBedLength / 5) * 5;

    let recBedWidth: number;

    if (stripLayout === 1) {
      recBedWidth = unfoldedLength + 260;
    } else {
      recBedWidth = unfoldedLength * noOfImpressions + 260;
    }

    // Round up to nearest multiple of 5
    recBedWidth = Math.ceil(recBedWidth / 5) * 5;

    // recommended shut height
    const dieInsert = Math.max(0.3 * height, 12);
    const punches = Math.max(10 * thickness, 20);
    const dieHolderPlate = Math.max(0.4 * height, 30);
    const dieBackPlate = Math.max(0.25 * height, 20);
    const punchHolderPlate = Math.max(0.4 * height, 18);
    const punchBackPlate = Math.max(0.2 * height, 12);
    const stripperPlate = Math.max(6 * height, 10);

    let topShoeeThickness = 50;
    const minTopShoeeThickness = Math.min(recBedLength, recBedWidth);
    if (minTopShoeeThickness <= 300) {
      topShoeeThickness = 30;
    } else if (minTopShoeeThickness <= 400) {
      topShoeeThickness = 35;
    } else if (minTopShoeeThickness <= 500) {
      topShoeeThickness = 40;
    } else if (minTopShoeeThickness <= 600) {
      topShoeeThickness = 45;
    }

    let bottomShoeeThickness = topShoeeThickness;
    let chMargin = 18;

    let total = dieInsert + punches + dieHolderPlate + dieBackPlate + punchHolderPlate + punchBackPlate + stripperPlate + topShoeeThickness + bottomShoeeThickness + chMargin;
    total += thickness;
    const maxDieSetHeight = Math.ceil(total / 5) * 5;

    return { recBedLength, recBedWidth, maxDieSetHeight };
  }

  getInjectionMoldingTonnage(materialInfo: MaterialInfoDto, processInfo: ProcessInfoDto, currentPart: PartInfoDto) {
    const partProjArea = materialInfo?.partProjectedArea || 0;
    const runnderProjArea = materialInfo?.runnerProjectedArea || 0;
    const noOfCavity = materialInfo?.noOfCavities;
    // const recommendTonnage1 = this.sharedService.isValidNumber((processInfo.cavityPressure * Number(noOfCavity) * (partProjArea + projArea)) / 1000);
    // const runnerProjectedArea = this.sharedService.isValidNumber(22/7*materialInfo?.runnerDia/2*materialInfo?.runnerLength);

    const factorOFSafety = currentPart?.partComplexity === 1 ? 1.1 : currentPart?.partComplexity === 2 ? 1.15 : 1.2;

    const recTon = ((runnderProjArea + partProjArea) * noOfCavity * processInfo.cavityPressure * factorOFSafety) / 1000;
    const recommendTonnage = this.sharedService.isValidNumber(Math.ceil(recTon));

    // let partLengthCavity = 0;
    // let partWidthCavity = 0;
    // if (noOfCavity === 1) {
    //   partLengthCavity = 1;
    //   partWidthCavity = 1;
    // } else if (noOfCavity === 2) {
    //   partLengthCavity = 2;
    //   partWidthCavity = 1;
    // } else if (noOfCavity === 4) {
    //   partLengthCavity = 2;
    //   partWidthCavity = 2;
    // } else if (noOfCavity === 8) {
    //   partLengthCavity = 4;
    //   partWidthCavity = 4;
    // } else {
    //   partLengthCavity = noOfCavity;
    //   partWidthCavity = noOfCavity;
    // }
    const partLength = materialInfo?.dimX;
    const partWidth = materialInfo?.dimY;
    const envelopLength = Number(partLength) * Number(materialInfo?.cavityArrangementLength || 1);
    const envelopWidth = Number(partWidth) * Number(materialInfo?.cavityArrangementWidth || 1);
    const runnerGapLength = 50;
    const runnerGapWidth = 50;
    const sideGapLength = 160;
    const sideGapWidth = 160;
    const moldBaseLength = Number(envelopLength) + Number(runnerGapLength) + Number(sideGapLength);
    const moldBaseWidth = Number(envelopWidth) + Number(runnerGapWidth) + Number(sideGapWidth);
    processInfo.platenSizeLength = moldBaseLength;
    processInfo.platenSizeWidth = moldBaseWidth;
    // const machinesWithTieBarLength = machineTypeDescription?.filter((x) => x.tieBarDistanceHor >= moldBaseLength).sort((a, b) => (a.tieBarDistanceHor < b.tieBarDistanceHor ? -1 : 1));
    // const machinesWithTieBarWidth = machineTypeDescription?.filter((x) => x.tieBarDistanceVer >= moldBaseWidth).sort((a, b) => (a.tieBarDistanceVer < b.tieBarDistanceVer ? -1 : 1));
    // const tieBarLengthTOn: number = machinesWithTieBarLength[0]?.machineTonnageTons;
    // const tieBarWidthTOn: number = machinesWithTieBarWidth[0]?.machineTonnageTons;
    // const recommendTonnage2 = Math.max(tieBarLengthTOn, tieBarWidthTOn);
    // const recommendTonnage = Math.max(recommendTonnage1, recommendTonnage2);
    return recommendTonnage;
  }

  getStageSubprocessEntry(subProcessInfo: SubProcessTypeInfoDto) {
    const formGroup = this._fb.group({
      subProcessInfoId: null,
      processInfoId: subProcessInfo.processInfoId,
      subProcessTypeID: subProcessInfo.subProcessTypeId,
      recommendTonnage: subProcessInfo.recommendTonnage,
      hlFactor: this.sharedService.extractedProcessData?.HlFactor || 0,
      lengthOfCut: subProcessInfo.lengthOfCut,
      formLength: subProcessInfo.formLength,
      formHeight: subProcessInfo.formHeight,
      formPerimeter: subProcessInfo.formPerimeter,
      blankArea: subProcessInfo.blankArea,
      formingForce: subProcessInfo.formingForce,
      bendingLineLength: subProcessInfo.bendingLineLength,
      shoulderWidth: subProcessInfo.shoulderWidth,
      noOfBends: subProcessInfo.noOfBends,
      noOfHoles: subProcessInfo.noOfHoles,
    });
    return formGroup;
  }

  getFormingEntriesSumByAxis() {
    const groupedByAxis = new Map<string, { formHeight: number; formLength: number; formPerimeter: number; formArea: number }>();
    for (const item of this.sharedService.extractedProcessData.ProcessFormInfo) {
      const axis = item.FormAxis;
      if (!groupedByAxis.has(axis)) {
        groupedByAxis.set(axis, { formHeight: 0, formLength: 0, formPerimeter: 0, formArea: 0 });
      }
      const group = groupedByAxis.get(axis);
      if (group) {
        group.formLength += item.FormLength * item.FormQty;
        group.formHeight += item.FormHeight * item.FormQty;
        group.formPerimeter += item.FormPerimeter * item.FormQty;
        group.formArea += item.FormArea * item.FormQty;
      }
    }
    const groupedArray = Array.from(groupedByAxis, ([axis, data]) => ({
      axis: axis,
      formLength: data.formLength,
      formHeight: data.formHeight,
      formPerimeter: data.formPerimeter,
      formArea: data.formArea,
    }));
    return groupedArray;
  }

  getBendingEntriesSumByAxis(): { axis: string; lengthSum: number }[] {
    const processBendingInfo = this.sharedService.extractedProcessData?.ProcessBendingInfo ?? [];

    if (!Array.isArray(processBendingInfo) || processBendingInfo.length === 0) {
      return [];
    }

    const groupedData = processBendingInfo.reduce((acc: Record<string, any[]>, entry: any) => {
      if (!acc[entry.Axis]) {
        acc[entry.Axis] = [];
      }
      acc[entry.Axis].push(entry);
      return acc;
    }, {});

    const groupedArray = Object.entries(groupedData).map(([axis, entries]) => ({
      axis,
      entries,
    }));

    const axisLengthList: { axis: string; lengthSum: number }[] = [];

    for (const { axis, entries } of groupedArray) {
      let axisSum = 0;
      for (const entry of entries as any[]) {
        axisSum += (entry.Length ?? 0) * (entry.BendCount ?? 0);
      }
      axisLengthList.push({ axis, lengthSum: axisSum });
    }

    return axisLengthList;
  }

  getFormingTonnage(fromingInfo: ProcessInfoDto) {
    let recommendTonnage = 0;
    this.sharedService.extractedProcessData?.ProcessFormInfo?.forEach((formingInfo) => {
      const formingForce = this.sharedService.isValidNumber(
        (Number(formingInfo?.FormArea) * 0.5 * (Number(fromingInfo.materialmasterDatas.yieldStrength) + fromingInfo.materialmasterDatas.tensileStrength)) / 10000
      );
      const blankHoldingForce = Number(formingForce) / 3;
      const theoriticalForcce = Number(formingForce) + Number(blankHoldingForce);
      recommendTonnage = Number(theoriticalForcce) * 1.25;
    });
    return recommendTonnage;
  }
  getFormingTonnageByUserInput(formingInfo: ProcessInfoDto) {
    const blankArea = formingInfo?.subProcessTypeInfos[0]?.blankArea;
    const formingForce = this.sharedService.isValidNumber((blankArea * 0.5 * (Number(formingInfo.materialmasterDatas.yieldStrength) + formingInfo.materialmasterDatas.tensileStrength)) / 10000);
    const blankHoldingForce = Number(formingForce) / 3;
    const theoriticalForcce = Number(formingForce) + Number(blankHoldingForce);
    const recommendTonnage = Number(theoriticalForcce) * 1.25;
    return recommendTonnage;
  }

  stampingSubprocessMapper(info: any) {
    const subProcessInfo = new SubProcessTypeInfoDto();
    subProcessInfo.subProcessInfoId = 0;
    subProcessInfo.processInfoId = info.value.processInfoId || 0;
    subProcessInfo.subProcessTypeId = info.value.subProcessTypeID;
    subProcessInfo.lengthOfCut = info.value.lengthOfCut || 0;
    subProcessInfo.formLength = info.value.formLength || 0;
    subProcessInfo.formHeight = info.value.formHeight || 0;
    subProcessInfo.hlFactor = info.value.hlFactor || 0;
    subProcessInfo.bendingLineLength = info.value.bendingLineLength || 0;
    subProcessInfo.shoulderWidth = info.value.shoulderWidth || 0;
    subProcessInfo.noOfBends = info.value.noOfBends || 0;
    subProcessInfo.formPerimeter = info.value.formPerimeter || 0;
    subProcessInfo.recommendTonnage = this.sharedService.isValidNumber(info.value.recommendTonnage);
    subProcessInfo.blankArea = info?.value?.blankArea || 0;
    subProcessInfo.formingForce = info?.value?.formingForce || 0;
    subProcessInfo.noOfHoles = info?.value?.noOfHoles || 0;

    return subProcessInfo;
  }

  getStampingSubProcessList() {
    return [
      { id: StampingType.BlankingPunching, name: 'Blanking Punching' },
      { id: StampingType.Forming, name: 'Forming' },
      { id: StampingType.Drawing, name: 'Drawing' },
      { id: StampingType.Bending, name: 'Bending' },
      { id: StampingType.Piercing, name: 'Piercing' },
      { id: StampingType.Coining, name: 'Coining' },
      { id: StampingType.Compound, name: 'Compound' },
      { id: StampingType.Restrike, name: 'Restrike' },

      // Additional subprocesses added for tranfer press
      { id: StampingType.ShallowDrawRect, name: 'Shallow Draw (Rectangle)' },
      { id: StampingType.RedrawRect, name: 'Redraw (Rectangle)' },
      { id: StampingType.Trimming, name: 'Trimming' },
      { id: StampingType.ShallowDrawCir, name: 'Shallow Draw (Circle)' },
      { id: StampingType.RedrawCir, name: 'Redraw (Circle)' },
    ];
  }

  getSubTypeNamebyId(processInfo: ProcessInfoDto) {
    let subProcessName = 'N/A';
    if ([ProcessType.Stage, ProcessType.Progressive].includes(processInfo?.processTypeID)) {
      if (processInfo?.subProcessTypeInfos && processInfo?.subProcessTypeInfos?.length) {
        const subProcessTypeID = processInfo?.subProcessTypeInfos[0]?.subProcessTypeId;
        subProcessName = this.getStampingSubProcessList().find((x) => x.id === subProcessTypeID)?.name;
        if (subProcessTypeID === StampingType.Compound) {
          subProcessName = 'Blanking & Piercing';
        }
      }
    }
    return subProcessName;
  }
  getNoOfLowSkilledLabours(automationType: MachineType) {
    const vals = {
      1: 0.33, //auto
      2: 0.5, // semi-auto
      3: 1, // manual
    };
    return vals[automationType] || 0.33;
  }

  getNumberOfStages(noOfStage: number): number {
    let blankPunch = 0,
      idleStage = 0,
      cutOff = 0,
      dummy = 0;
    if (noOfStage < 5) {
      blankPunch = 3;
      idleStage = noOfStage + noOfStage / 2;
      cutOff = 1;
      dummy = 0;
    } else if (noOfStage > 5 && noOfStage < 8) {
      blankPunch = 3;
      idleStage = noOfStage + (noOfStage / 2 + 1);
      cutOff = 1;
      dummy = 1;
    } else if (noOfStage > 8) {
      blankPunch = 4;
      idleStage = noOfStage + noOfStage / 2;
      cutOff = 1;
      dummy = 2;
    } else {
      blankPunch = 6;
      idleStage = noOfStage + 2 * noOfStage;
      cutOff = 6;
      dummy = 4;
    }
    return Math.round(blankPunch + idleStage + cutOff + dummy);
  }

  getBestUtilisationForSheetMetal(materialInfo: MaterialInfoDto) {
    const sheetStandards = this.getBestSheetUtilizationData(materialInfo);
    const sheetWeight = sheetStandards && sheetStandards.weight ? sheetStandards.weight : 0;
    const partsPerCoil = sheetStandards && sheetStandards.highestParts ? sheetStandards.highestParts : 0;
    const utilisation = sheetStandards && sheetStandards.utilization ? sheetStandards.utilization : 0;
    return { utilisation: utilisation, sheetWeight: sheetWeight, partsPerCoil: partsPerCoil, sheetLength: sheetStandards.length, sheetWidth: sheetStandards.width };
  }

  getNumberOfStage(processInfo: ProcessInfoDto, isRecalculate = false) {
    let noOfStages = 0;
    if (isRecalculate) {
      for (let i = 0; i < processInfo.subProcessTypeInfos?.length; i++) {
        const info = processInfo.subProcessTypeInfos[i];
        if ([StampingType.Forming, StampingType.Bending, StampingType.Drawing, StampingType.Coining, StampingType.Compound].includes(Number(info?.subProcessTypeId))) {
          noOfStages++;
        }
      }
    } else {
      for (let i = 0; i < processInfo.subProcessFormArray?.controls?.length; i++) {
        const info = processInfo.subProcessFormArray?.controls[i];
        if ([StampingType.Forming, StampingType.Bending, StampingType.Drawing, StampingType.Coining, StampingType.Compound].includes(Number(info?.value?.subProcessTypeID))) {
          noOfStages++;
        }
      }
    }

    return noOfStages;
  }

  getNumberOfStagesForTransferPress(processInfo: ProcessInfoDto, isRecalculate = false) {
    let noOfStages = 0;
    if (isRecalculate) {
      for (let i = 0; i < processInfo.subProcessTypeInfos?.length; i++) {
        const info = processInfo.subProcessTypeInfos[i];
        if (
          [
            StampingType.Forming,
            StampingType.Bending,
            StampingType.ShallowDrawRect,
            StampingType.RedrawRect,
            StampingType.ShallowDrawCir,
            StampingType.RedrawCir,
            StampingType.Trimming,
            StampingType.Piercing,
            StampingType.Coining,
            StampingType.Compound,
          ].includes(Number(info?.subProcessTypeId))
        ) {
          noOfStages++;
        }
      }
    } else {
      for (let i = 0; i < processInfo.subProcessFormArray?.controls?.length; i++) {
        const info = processInfo.subProcessFormArray?.controls[i];
        if (
          [
            StampingType.Forming,
            StampingType.Bending,
            StampingType.ShallowDrawRect,
            StampingType.RedrawRect,
            StampingType.ShallowDrawCir,
            StampingType.RedrawCir,
            StampingType.Trimming,
            StampingType.Piercing,
          ].includes(Number(info?.value?.subProcessTypeID))
        ) {
          noOfStages++;
        }
      }
    }

    return noOfStages;
  }

  getToolingRequiredOrNotForStage(countryId: number) {
    const blankEntryType: number = this.simpleCountries.includes(countryId) ? StampingType.BlankingPunching : StampingType.Compound;
    const noOfHitsRequired = blankEntryType === StampingType.Compound ? StagingToolingType.Compound : StagingToolingType.Simple;
    return noOfHitsRequired;
  }

  stampingSubProcessFormAssignValue(manufactureInfo: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
      const info = manufactureInfo.subProcessFormArray?.controls[i];
      (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
        formLength: this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(info?.value?.formLength), conversionValue, isEnableUnitConversion),
        formHeight: this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(info?.value?.formHeight), conversionValue, isEnableUnitConversion),
        formPerimeter: this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(info?.value?.formPerimeter), conversionValue, isEnableUnitConversion),
        bendingLineLength: this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(info?.value?.bendingLineLength), conversionValue, isEnableUnitConversion),
        shoulderWidth: this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(info?.value?.shoulderWidth), conversionValue, isEnableUnitConversion),
        blankArea: this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(info?.value?.blankArea), conversionValue, isEnableUnitConversion),
        flashArea: this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(info?.value?.flashArea), conversionValue, isEnableUnitConversion),
        noOfHoles: this.sharedService.isValidNumber(info?.value?.noOfHoles),
        recommendTonnage: this.sharedService.isValidNumber(info?.value?.recommendTonnage),
      });
    }
  }

  stampingSubProcessFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion, subProcessFormArray) {
    for (let i = 0; i < result?.subProcessFormArray?.controls?.length; i++) {
      const info = result.subProcessFormArray?.controls[i];
      (subProcessFormArray.controls as FormGroup[])[i].patchValue({
        hlFactor: this.sharedService.isValidNumber(info?.value?.hlFactor),
        recommendTonnage: this.sharedService.isValidNumber(info?.value?.recommendTonnage),
        formLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(info?.value?.formLength), conversionValue, isEnableUnitConversion),
        formHeight: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(info?.value?.formHeight), conversionValue, isEnableUnitConversion),
        formPerimeter: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(info?.value?.formPerimeter), conversionValue, isEnableUnitConversion),
        bendingLineLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(info?.value?.bendingLineLength), conversionValue, isEnableUnitConversion),
        shoulderWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(info?.value?.shoulderWidth), conversionValue, isEnableUnitConversion),
        blankArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(info?.value?.blankArea), conversionValue, isEnableUnitConversion),
        flashArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(info?.value?.flashArea), conversionValue, isEnableUnitConversion),
        formingForce: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(info?.value?.formingForce), conversionValue, isEnableUnitConversion),
        noOfHoles: this.sharedService.isValidNumber(info?.value?.noOfHoles),
      });
    }
  }

  setCommonSubprocess(subProcessInfo: SubProcessTypeInfoDto, processInfo: ProcessInfoDto, subProcessTypeId: number, params?, materialInfoList?) {
    subProcessInfo.processInfoId = processInfo.processInfoId;
    subProcessInfo.subProcessTypeId = subProcessTypeId;
    if (subProcessTypeId == StampingType.BlankingPunching) {
      subProcessInfo.lengthOfCut = this.sharedService.extractedProcessData?.ExternalPerimeter;
    }

    if (subProcessTypeId == StampingType.Piercing) {
      subProcessInfo.lengthOfCut = this.sharedService.extractedProcessData?.InternalPerimeter;
    }
    if ([StampingType.ShallowDrawRect, StampingType.RedrawRect, StampingType.ShallowDrawCir, StampingType.RedrawCir].includes(subProcessTypeId)) {
      subProcessInfo.lengthOfCut = params.formPerimeter; //this.sharedService.extractedProcessData?.InternalPerimeter;
    }
    if (subProcessTypeId == StampingType.Trimming) {
      subProcessInfo.lengthOfCut = params.formPerimeter; // this.sharedService.extractedProcessData?.InternalPerimeter;
    }

    if (subProcessTypeId == StampingType.Bending) {
      subProcessInfo.bendingLineLength = params?.lengthSum;
      subProcessInfo.shoulderWidth = this.getDieOpeningTime(materialInfoList, processInfo);
    }
    if (subProcessTypeId == StampingType.Forming) {
      subProcessInfo.processInfoId = processInfo.processTypeID;
      subProcessInfo.formLength = params.formLength;
      subProcessInfo.formHeight = params.formHeight;
      subProcessInfo.formPerimeter = params.formPerimeter;
      subProcessInfo.blankArea = params.formArea;
    }
  }

  getstagingsubprocess(processInfo: ProcessInfoDto, subProcessTypeId: number, params?, materialInfoList?) {
    const SubProcessList = this._fb.array([]) as FormArray;
    const subProcessInfo = new SubProcessTypeInfoDto();
    this.setCommonSubprocess(subProcessInfo, processInfo, subProcessTypeId, params, materialInfoList);
    if (subProcessTypeId == StampingType.Compound) {
      subProcessInfo.lengthOfCut = this.sharedService.extractedProcessData?.ExternalPerimeter + this.sharedService.extractedProcessData?.InternalPerimeter;
    }
    if ([StampingType.Compound, StampingType.BlankingPunching, StampingType.Piercing].includes(subProcessTypeId)) {
      processInfo.inspectionCost = 0;
      processInfo.qaOfInspectorRate = 0;
      processInfo.inspectionTime = 0;
      processInfo.isQaInspectorRateDirty = true;
      processInfo.isinspectionCostDirty = true;
      processInfo.isinspectionTimeDirty = true;
    }
    const process = this.getStageSubprocessEntry(subProcessInfo);
    SubProcessList.push(process);
    processInfo.subProcessFormArray = SubProcessList;
  }

  getProgressiveSubProcess(subProcessList: FormArray, processInfo: ProcessInfoDto, subProcessTypeId: number, params?, materialInfoList?) {
    const subProcessInfo = new SubProcessTypeInfoDto();
    this.setCommonSubprocess(subProcessInfo, processInfo, subProcessTypeId, params, materialInfoList);
    const process = this.getStageSubprocessEntry(subProcessInfo);
    subProcessList.push(process);
  }

  shearigProcessSpeedData: ShearigProcessSpeed[] = [
    { Material: 'Mild Steel', Thickness: 1, Vfeed: 500, Vclamp: 50, Vcut: 143, Vreturn: 176, Voffload: 300, MaterialTypeId: 433 },
    { Material: 'Mild Steel', Thickness: 2, Vfeed: 450, Vclamp: 45, Vcut: 132, Vreturn: 165, Voffload: 280, MaterialTypeId: 433 },
    { Material: 'Mild Steel', Thickness: 3, Vfeed: 400, Vclamp: 40, Vcut: 121, Vreturn: 154, Voffload: 260, MaterialTypeId: 433 },
    { Material: 'Mild Steel', Thickness: 4, Vfeed: 350, Vclamp: 35, Vcut: 110, Vreturn: 143, Voffload: 240, MaterialTypeId: 433 },
    { Material: 'Mild Steel', Thickness: 5, Vfeed: 300, Vclamp: 30, Vcut: 99, Vreturn: 132, Voffload: 220, MaterialTypeId: 433 },

    { Material: 'Stainless Steel', Thickness: 1, Vfeed: 450, Vclamp: 45, Vcut: 132, Vreturn: 165, Voffload: 280, MaterialTypeId: 42 },
    { Material: 'Stainless Steel', Thickness: 2, Vfeed: 400, Vclamp: 40, Vcut: 121, Vreturn: 154, Voffload: 260, MaterialTypeId: 42 },
    { Material: 'Stainless Steel', Thickness: 3, Vfeed: 350, Vclamp: 35, Vcut: 110, Vreturn: 143, Voffload: 240, MaterialTypeId: 42 },
    { Material: 'Stainless Steel', Thickness: 4, Vfeed: 300, Vclamp: 30, Vcut: 99, Vreturn: 132, Voffload: 220, MaterialTypeId: 42 },
    { Material: 'Stainless Steel', Thickness: 5, Vfeed: 250, Vclamp: 30, Vcut: 88, Vreturn: 121, Voffload: 200, MaterialTypeId: 42 },

    { Material: 'Aluminum', Thickness: 1, Vfeed: 600, Vclamp: 60, Vcut: 165, Vreturn: 198, Voffload: 350, MaterialTypeId: 266 },
    { Material: 'Aluminum', Thickness: 2, Vfeed: 550, Vclamp: 55, Vcut: 154, Vreturn: 187, Voffload: 330, MaterialTypeId: 266 },
    { Material: 'Aluminum', Thickness: 3, Vfeed: 500, Vclamp: 50, Vcut: 143, Vreturn: 176, Voffload: 310, MaterialTypeId: 266 },
    { Material: 'Aluminum', Thickness: 4, Vfeed: 450, Vclamp: 50, Vcut: 132, Vreturn: 165, Voffload: 290, MaterialTypeId: 266 },
    { Material: 'Aluminum', Thickness: 5, Vfeed: 400, Vclamp: 50, Vcut: 121, Vreturn: 154, Voffload: 270, MaterialTypeId: 266 },

    { Material: 'High Strength Steel (HSS)', Thickness: 1, Vfeed: 400, Vclamp: 40, Vcut: 121, Vreturn: 154, Voffload: 260, MaterialTypeId: 0 },
    { Material: 'High Strength Steel (HSS)', Thickness: 2, Vfeed: 350, Vclamp: 35, Vcut: 110, Vreturn: 143, Voffload: 240, MaterialTypeId: 0 },
    { Material: 'High Strength Steel (HSS)', Thickness: 3, Vfeed: 300, Vclamp: 35, Vcut: 99, Vreturn: 132, Voffload: 220, MaterialTypeId: 0 },
    { Material: 'High Strength Steel (HSS)', Thickness: 4, Vfeed: 250, Vclamp: 30, Vcut: 88, Vreturn: 121, Voffload: 200, MaterialTypeId: 0 },
    { Material: 'High Strength Steel (HSS)', Thickness: 5, Vfeed: 200, Vclamp: 30, Vcut: 77, Vreturn: 110, Voffload: 180, MaterialTypeId: 0 },

    { Material: 'Carbon Steel', Thickness: 1, Vfeed: 550, Vclamp: 55, Vcut: 154, Vreturn: 187, Voffload: 330, MaterialTypeId: 157 },
    { Material: 'Carbon Steel', Thickness: 2, Vfeed: 500, Vclamp: 50, Vcut: 143, Vreturn: 176, Voffload: 310, MaterialTypeId: 157 },
    { Material: 'Carbon Steel', Thickness: 3, Vfeed: 450, Vclamp: 50, Vcut: 132, Vreturn: 165, Voffload: 290, MaterialTypeId: 157 },
    { Material: 'Carbon Steel', Thickness: 4, Vfeed: 400, Vclamp: 50, Vcut: 121, Vreturn: 154, Voffload: 270, MaterialTypeId: 157 },
    { Material: 'Carbon Steel', Thickness: 5, Vfeed: 350, Vclamp: 50, Vcut: 115, Vreturn: 150, Voffload: 260, MaterialTypeId: 157 },
  ];

  getShearigProcessSpeedDataByMaterialType(materialType, thickness: number): ShearigProcessSpeed[] {
    return this.shearigProcessSpeedData.filter((row) => row.Material === materialType && row.Thickness >= thickness).sort((a, b) => a.Thickness - b.Thickness);
  }

  // TPP Machine Recommendation
  findSpm(material: string, thickness: number) {
    return this.spmData.filter((x) => x.material === material && x.thicknessMax >= thickness).sort((a, b) => a.thicknessMax - b.thicknessMax)[0];
  }

  calculateTPPMachineTimes(spmRow: any, noOfStrokes: number) {
    const result: Record<string, { min: number; sec: number }> = {};

    Object.entries(spmRow).forEach(([key, spm]) => {
      if (key.startsWith('spm') && typeof spm === 'number') {
        const sec = (60 / spm) * noOfStrokes;
        const min = sec / 60;
        result[key] = { min, sec };
      }
    });

    return result;
  }

  calculateLowestMachineCosts(spmTimes: Record<string, { min: number; sec: number }>, machines: any[]) {
    const results = [];

    for (const m of machines) {
      let spmKey = `spm${m.machineTonnageTons.toString().replace('.', '_')}T`;

      // If exact key not found → pick next available higher key
      if (!spmTimes[spmKey]) {
        const tonnage = m.machineTonnageTons;
        if (tonnage <= 16.5) spmKey = 'spm16_5T';
        else if (tonnage <= 20) spmKey = 'spm20T';
        else if (tonnage <= 30) spmKey = 'spm30T';
        else spmKey = 'spm40T';
      }

      if (spmTimes[spmKey]) {
        const minutes = spmTimes[spmKey].min;
        const cost = (m.machineHourRate / 60) * (minutes * 60); // same as hour-rate * minutes
        results.push({
          ...m,
          cost: cost.toFixed(4),
          usedSpmKey: spmKey,
        });
      }
    }

    return results;
  }

  selectLowestCost(results: any[]) {
    if (!results.length) return [];

    // Find minimum cost
    const minCost = Math.min(...results.map((r) => parseFloat(r.cost)));

    // Return all results matching minCost
    return results.filter((r) => parseFloat(r.cost) === minCost);
  }

  // Laser Pierce Time configuration
  laserPiercingTimes: MaterialTable = {
    'Carbon Steel': [
      { maxThickness: 1, values: { '<=2000': 0.3, '<=4000': 0.2, '<=6000': 0.15, '>6000': 0.1 } },
      { maxThickness: 3, values: { '<=2000': 1, '<=4000': 0.7, '<=6000': 0.5, '>6000': 0.4 } },
      { maxThickness: 6, values: { '<=2000': 2.5, '<=4000': 1.8, '<=6000': 1.2, '>6000': 1 } },
      { maxThickness: null, values: { '<=2000': 5, '<=4000': 3.5, '<=6000': 2.5, '>6000': 2 } },
    ],
    'Stainless Steel': [
      { maxThickness: 1, values: { '<=2000': 0.5, '<=4000': 0.3, '<=6000': 0.2, '>6000': 0.15 } },
      { maxThickness: 3, values: { '<=2000': 1.2, '<=4000': 0.8, '<=6000': 0.6, '>6000': 0.5 } },
      { maxThickness: 6, values: { '<=2000': 3, '<=4000': 2, '<=6000': 1.5, '>6000': 1.2 } },
      { maxThickness: null, values: { '<=2000': 6, '<=4000': 4, '<=6000': 3, '>6000': 2.5 } },
    ],
    Aluminium: [
      { maxThickness: 1, values: { '<=2000': 0.7, '<=4000': 0.4, '<=6000': 0.3, '>6000': 0.2 } },
      { maxThickness: 3, values: { '<=2000': 1.5, '<=4000': 1, '<=6000': 0.8, '>6000': 0.6 } },
      { maxThickness: 6, values: { '<=2000': 3.5, '<=4000': 2.5, '<=6000': 1.8, '>6000': 1.5 } },
      { maxThickness: null, values: { '<=2000': 7, '<=4000': 5, '<=6000': 3.5, '>6000': 2.8 } },
    ],
    'Copper Alloy': [
      { maxThickness: 1, values: { '<=2000': 0.5, '<=4000': 0.3, '<=6000': 0.2, '>6000': 0.15 } },
      { maxThickness: 3, values: { '<=2000': 1.2, '<=4000': 0.8, '<=6000': 0.6, '>6000': 0.5 } },
      { maxThickness: 6, values: { '<=2000': 3, '<=4000': 2, '<=6000': 1.5, '>6000': 1.2 } },
      { maxThickness: null, values: { '<=2000': 6, '<=4000': 4, '<=6000': 3, '>6000': 2.5 } },
    ],
  };

  getLaserPiercingTime(material: string, thickness: number, power: number): number | null {
    material = this.mapMaterial(material);
    if (!material) return 0;
    const matTable = this.laserPiercingTimes[material];
    if (!matTable) return 0;

    // pick power key
    let powerKey: PowerKey;
    if (power <= 2000) powerKey = '<=2000';
    else if (power <= 4000) powerKey = '<=4000';
    else if (power <= 6000) powerKey = '<=6000';
    else powerKey = '>6000';

    // pick thickness row
    const row = matTable.find((r) => (r.maxThickness !== null ? thickness <= r.maxThickness : thickness > 6));
    if (!row) return 0;

    return row.values[powerKey];
  }

  // Plasma Pierce Time configuration

  plasmaPiercingTime: PlasmaPiercingTable = {
    'Carbon Steel': {
      '<=3': { '45A': 1, '85A': 0.6, '130A': 0.5, '200A': 0.4, '300A': 0.36, '400A': 0.3, '600A': 0.24, '800A': 0.2 },
      '<=6': { '45A': 2, '85A': 1.3, '130A': 1, '200A': 0.8, '300A': 0.7, '400A': 0.6, '600A': 0.48, '800A': 0.4 },
      '<=12': { '45A': 3.5, '85A': 2.5, '130A': 2, '200A': 1.5, '300A': 1.3, '400A': 1.1, '600A': 0.9, '800A': 0.75 },
      '<=16': { '45A': 4.5, '85A': 3.2, '130A': 2.8, '200A': 2, '300A': 1.7, '400A': 1.4, '600A': 1.1, '800A': 0.9 },
      '<=20': { '45A': 5.5, '85A': 4, '130A': 3.6, '200A': 2.8, '300A': 2.4, '400A': 2, '600A': 1.6, '800A': 1.3 },
      '<=25': { '45A': 6.5, '85A': 5, '130A': 4.5, '200A': 3.8, '300A': 3.2, '400A': 2.6, '600A': 2.1, '800A': 1.7 },
      '>25': { '45A': 7.8, '85A': 6, '130A': 5.5, '200A': 4.5, '300A': 3.8, '400A': 3.2, '600A': 2.6, '800A': 2 },
    },
    'Stainless Steel': {
      '<=3': { '45A': 1.2, '85A': 0.8, '130A': 0.6, '200A': 0.5, '300A': 0.45, '400A': 0.36, '600A': 0.3, '800A': 0.24 },
      '<=6': { '45A': 2.8, '85A': 1.8, '130A': 1.4, '200A': 1, '300A': 0.85, '400A': 0.7, '600A': 0.55, '800A': 0.45 },
      '<=12': { '45A': 4.5, '85A': 3, '130A': 2.4, '200A': 2, '300A': 1.7, '400A': 1.4, '600A': 1.1, '800A': 0.9 },
      '<=16': { '45A': 5.5, '85A': 4, '130A': 3.2, '200A': 2.8, '300A': 2.4, '400A': 1.9, '600A': 1.5, '800A': 1.2 },
      '<=20': { '45A': 6.5, '85A': 5, '130A': 4.2, '200A': 3.6, '300A': 3, '400A': 2.4, '600A': 1.9, '800A': 1.5 },
      '<=25': { '45A': 7.5, '85A': 6, '130A': 5.2, '200A': 4.5, '300A': 3.8, '400A': 3, '600A': 2.4, '800A': 1.9 },
      '>25': { '45A': 8.5, '85A': 7, '130A': 6, '200A': 5.2, '300A': 4.4, '400A': 3.5, '600A': 2.8, '800A': 2.2 },
    },
    Aluminium: {
      '<=3': { '45A': 1, '85A': 0.7, '130A': 0.5, '200A': 0.4, '300A': 0.36, '400A': 0.3, '600A': 0.24, '800A': 0.2 },
      '<=6': { '45A': 2.5, '85A': 1.5, '130A': 1.2, '200A': 1, '300A': 0.85, '400A': 0.7, '600A': 0.55, '800A': 0.45 },
      '<=12': { '45A': 4, '85A': 2.8, '130A': 2, '200A': 1.8, '300A': 1.5, '400A': 1.2, '600A': 0.95, '800A': 0.75 },
      '<=16': { '45A': 5, '85A': 3.5, '130A': 2.8, '200A': 2.5, '300A': 2, '400A': 1.6, '600A': 1.3, '800A': 1 },
      '<=20': { '45A': 6, '85A': 4.5, '130A': 3.6, '200A': 3.2, '300A': 2.6, '400A': 2.1, '600A': 1.6, '800A': 1.3 },
      '<=25': { '45A': 7, '85A': 5.5, '130A': 4.4, '200A': 4, '300A': 3.3, '400A': 2.6, '600A': 2, '800A': 1.6 },
      '>25': { '45A': 8, '85A': 6.5, '130A': 5.2, '200A': 4.8, '300A': 4, '400A': 3.2, '600A': 2.4, '800A': 2 },
    },
    'Copper Alloy': {
      '<=3': { '45A': 1.2, '85A': 0.8, '130A': 0.6, '200A': 0.5, '300A': 0.45, '400A': 0.36, '600A': 0.3, '800A': 0.24 },
      '<=6': { '45A': 2.8, '85A': 1.8, '130A': 1.4, '200A': 1, '300A': 0.85, '400A': 0.7, '600A': 0.55, '800A': 0.45 },
      '<=12': { '45A': 4.5, '85A': 3, '130A': 2.4, '200A': 2, '300A': 1.7, '400A': 1.4, '600A': 1.1, '800A': 0.9 },
      '<=16': { '45A': 5.5, '85A': 4, '130A': 3.2, '200A': 2.8, '300A': 2.4, '400A': 1.9, '600A': 1.5, '800A': 1.2 },
      '<=20': { '45A': 6.5, '85A': 5, '130A': 4.2, '200A': 3.6, '300A': 3, '400A': 2.4, '600A': 1.9, '800A': 1.5 },
      '<=25': { '45A': 7.5, '85A': 6, '130A': 5.2, '200A': 4.5, '300A': 3.8, '400A': 3, '600A': 2.4, '800A': 1.9 },
      '>25': { '45A': 8.5, '85A': 7, '130A': 6, '200A': 5.2, '300A': 4.4, '400A': 3.5, '600A': 2.8, '800A': 2.2 },
    },
  };

  getPlasmaPiercingTime(material: string, thickness: number, amps: number): number | null {
    material = this.mapMaterial(material);
    if (!material) return 0;

    const plasmaThicknessKeys: { key: PlasmaThicknessKey; max: number | null }[] = [
      { key: '<=3', max: 3 },
      { key: '<=6', max: 6 },
      { key: '<=12', max: 12 },
      { key: '<=16', max: 16 },
      { key: '<=20', max: 20 },
      { key: '<=25', max: 25 },
      { key: '>25', max: null }, // catch-all
    ];

    const plasmaPowerKeys: { key: PlasmaPowerKey; max: number }[] = [
      { key: '45A', max: 45 },
      { key: '85A', max: 85 },
      { key: '130A', max: 130 },
      { key: '200A', max: 200 },
      { key: '300A', max: 300 },
      { key: '400A', max: 400 },
      { key: '600A', max: 600 },
      { key: '800A', max: 800 },
    ];

    // 1. Find thickness bracket
    const thicknessKey = plasmaThicknessKeys.find((t) => (t.max === null ? thickness > 25 : thickness <= t.max))?.key;

    if (!thicknessKey) return 0;

    // 2. Find amps bracket (round up)
    const powerKey = plasmaPowerKeys.find((p) => amps <= p.max)?.key;
    if (!powerKey) return 0;

    // 3. Lookup in table
    return this.plasmaPiercingTime[material][thicknessKey][powerKey];
  }

  // Laser Dwell time configuration

  laserDwellTime: Record<MaterialFamily, Record<LaserDwellThicknessKey, number>> = {
    'Carbon Steel': { '<=1': 0.2, '<=3': 0.3, '<=5': 0.4, '<=8': 0.5, '<=10': 0.6, '>10': 0.8 },
    'Stainless Steel': { '<=1': 0.3, '<=3': 0.4, '<=5': 0.5, '<=8': 0.6, '<=10': 0.8, '>10': 1 },
    Aluminium: { '<=1': 0.4, '<=3': 0.5, '<=5': 0.6, '<=8': 0.8, '<=10': 1, '>10': 1.2 },
    'Copper Alloy': { '<=1': 0.5, '<=3': 0.6, '<=5': 0.8, '<=8': 1, '<=10': 1.2, '>10': 1.5 },
    // "Plastics": { "<=1": 0.1, "<=3": 0.2, "<=5": 0.3, "<=8": 0.4, "<=10": 0.5, ">10": 0.6 }
  };

  getLaserDwellTime(material: string, thickness: number): number | null {
    material = this.mapMaterial(material);
    if (!material) return 0;
    const thicknessKeys: { key: LaserDwellThicknessKey; max: number | null }[] = [
      { key: '<=1', max: 1 },
      { key: '<=3', max: 3 },
      { key: '<=5', max: 5 },
      { key: '<=8', max: 8 },
      { key: '<=10', max: 10 },
      { key: '>10', max: 0 },
    ];

    const thicknessKey = thicknessKeys.find((t) => (t.max === null ? thickness > 10 : thickness <= t.max))?.key;

    if (!thicknessKey) return 0;

    return this.laserDwellTime[material][thicknessKey];
  }

  materialMapping: Record<string, string> = {
    'Alloy Steel': 'Stainless Steel',
    Aluminium: 'Aluminium',
    'Carbon Steel': 'Carbon Steel',
    'Cast Iron': 'Carbon Steel',
    'Cold heading steel': 'Carbon Steel',
    'Cold Rolled Steel': 'Carbon Steel',
    'Copper Alloy': 'Copper Alloy',
    'Ductile Iron': 'Carbon Steel',
    'Galvanized Steel': 'Carbon Steel',
    'Hot Rolled Steel': 'Carbon Steel',
    'Leaded Red Brass Alloy': 'Copper Alloy',
    'Magnesium Alloy': 'Copper Alloy',
    'Nickel & Nickel Alloy': 'Copper Alloy',
    'Nickel Iron': 'Copper Alloy',
    'Silicon Steel': 'Carbon Steel',
    'Spring Steel': 'Carbon Steel',
    'Stainless Steel': 'Stainless Steel',
    Titanium: 'Copper Alloy',
    'Tool Steel': 'Stainless Steel',
    'Copper & Copper Alloy': 'Copper Alloy',
  };

  // Helper to normalize material
  mapMaterial(raw: string): string | null {
    return this.materialMapping[raw] || null;
  }

  calculateSetupTimesForBendBrake(bendLength: number): number {
    const tools: ToolData[] = [
      { tool: 'Punch', length: 415, weight: '6-8 kgs', lifting: 1 },
      { tool: 'Punch', length: 835, weight: '12-15 kgs', lifting: 2 },
      { tool: 'Die', length: 415, weight: '8-10 kgs', lifting: 1.5 },
      { tool: 'Die', length: 835, weight: '15-18 kgs', lifting: 3 },
    ];

    const grouped = new Map<number, number>(); // length -> combined totalTime

    tools.forEach((tool) => {
      const slidingClampingTime = tool.lifting / 2;
      const fittingTime = slidingClampingTime;
      const totalTime = tool.lifting + slidingClampingTime + fittingTime;

      const currentTotal = grouped.get(tool.length) || 0;
      grouped.set(tool.length, currentTotal + totalTime);
    });

    let minSetup: SetupTimeResult = { length: 0, setupTime: Infinity };

    grouped.forEach((combinedTotalTime, length) => {
      const multiplier = Math.ceil(bendLength / length);
      const setupTime = Math.max(multiplier * combinedTotalTime, combinedTotalTime);

      if (setupTime < minSetup.setupTime) {
        minSetup = { length, setupTime };
      }
    });

    return minSetup.setupTime === Infinity ? 0 : minSetup.setupTime;
  }

  thicknessRules = [
    { max: 6.0, maxInclusive: false, allowance: 5 },
    { min: 6.0, minInclusive: true, max: 8.0, maxInclusive: true, allowance: 6 },
    { min: 8.0, minInclusive: false, max: 10.0, maxInclusive: false, allowance: 10 },
    { max: 16.0, maxInclusive: true, allowance: 12 },
    { max: 20.0, maxInclusive: true, allowance: 15 },
    { max: 25.4, maxInclusive: true, allowance: 16 },
    { max: 35.0, maxInclusive: true, allowance: 18 },
    { max: 55.0, maxInclusive: true, allowance: 20 },
    { max: 76.2, maxInclusive: true, allowance: 22 },
    { min: 76.2, minInclusive: false, allowance: 25 },
  ];

  oxyThicknessRules = [
    { max: 6.0, maxInclusive: false, allowance: 5 },
    { min: 6.0, minInclusive: true, max: 8.0, maxInclusive: true, allowance: 6 },
    { min: 8.0, minInclusive: false, max: 10.0, maxInclusive: false, allowance: 10 },
    { max: 16.0, maxInclusive: true, allowance: 12 },
    { max: 20.0, maxInclusive: true, allowance: 15 },
    { max: 25.4, maxInclusive: true, allowance: 16 },
    { max: 35.0, maxInclusive: true, allowance: 18 },
    { max: 55.0, maxInclusive: true, allowance: 20 },
    { max: 76.2, maxInclusive: true, allowance: 22 },
    { min: 76.2, minInclusive: false, allowance: 25 },
  ];

  getOxyPartAllowance(thickness: number): number {
    // return 0 for invalid inputs
    if (!Number.isFinite(thickness) || thickness < 0) return 0;

    for (const rule of this.oxyThicknessRules) {
      if (rule.min !== undefined) {
        const passMin = rule.minInclusive ? thickness >= rule.min : thickness > rule.min;
        if (!passMin) continue;
      }
      if (rule.max !== undefined) {
        const passMax = rule.maxInclusive ? thickness <= rule.max : thickness < rule.max;
        if (!passMax) continue;
      }
      return rule.allowance;
    }

    // return 0 if no rule matched
    return 0;
  }

  // Ordered cap entries: each defines the upper bound (inclusive).
  // For rows like "≤ 120", we still treat them as caps with inclusive upper bound.
  caps = [
    { cap: 10, oxySpeedMmPerMin: 450, pierceSpeedMmPerSec: 8, label: '≤10' },
    { cap: 12, oxySpeedMmPerMin: 423, pierceSpeedMmPerSec: 10, label: '>10 ≤12' },
    { cap: 12.7, oxySpeedMmPerMin: 416, pierceSpeedMmPerSec: 10, label: '>12 ≤12.7' },
    { cap: 14, oxySpeedMmPerMin: 402, pierceSpeedMmPerSec: 10, label: '>12.7 ≤14' },
    { cap: 15, oxySpeedMmPerMin: 393, pierceSpeedMmPerSec: 11, label: '>14 ≤15' },
    { cap: 16, oxySpeedMmPerMin: 385, pierceSpeedMmPerSec: 12, label: '>15 ≤16' },
    { cap: 18, oxySpeedMmPerMin: 374, pierceSpeedMmPerSec: 12, label: '>16 ≤18' },
    { cap: 19, oxySpeedMmPerMin: 369, pierceSpeedMmPerSec: 12, label: '>18 ≤19' },
    { cap: 20, oxySpeedMmPerMin: 380, pierceSpeedMmPerSec: 14, label: '>19 ≤20' },
    { cap: 22, oxySpeedMmPerMin: 360, pierceSpeedMmPerSec: 15, label: '>20 ≤22' },
    { cap: 24, oxySpeedMmPerMin: 347, pierceSpeedMmPerSec: 15, label: '>22 ≤24' },
    { cap: 25, oxySpeedMmPerMin: 340, pierceSpeedMmPerSec: 15, label: '>24 ≤25' },
    { cap: 25.4, oxySpeedMmPerMin: 338, pierceSpeedMmPerSec: 15, label: '>25 ≤25.4' },
    { cap: 27, oxySpeedMmPerMin: 329, pierceSpeedMmPerSec: 15, label: '>25.4 ≤27' },
    { cap: 28, oxySpeedMmPerMin: 324, pierceSpeedMmPerSec: 16, label: '>27 ≤28' },
    { cap: 30, oxySpeedMmPerMin: 320, pierceSpeedMmPerSec: 16, label: '>28 ≤30' },
    { cap: 32, oxySpeedMmPerMin: 310, pierceSpeedMmPerSec: 16, label: '>30 ≤32' },
    { cap: 35, oxySpeedMmPerMin: 296, pierceSpeedMmPerSec: 16, label: '>32 ≤35' },
    { cap: 38.1, oxySpeedMmPerMin: 283, pierceSpeedMmPerSec: 16, label: '>35 ≤38.1' },
    { cap: 40, oxySpeedMmPerMin: 277, pierceSpeedMmPerSec: 19, label: '>38.1 ≤40' },
    { cap: 45, oxySpeedMmPerMin: 258, pierceSpeedMmPerSec: 19, label: '>40 ≤45' },
    { cap: 50, oxySpeedMmPerMin: 280, pierceSpeedMmPerSec: 19, label: '>45 ≤50' },
    { cap: 50.5, oxySpeedMmPerMin: 278, pierceSpeedMmPerSec: 19, label: '>50 ≤50.5' },
    { cap: 55, oxySpeedMmPerMin: 260, pierceSpeedMmPerSec: 19, label: '>50.5 ≤55' },
    { cap: 60, oxySpeedMmPerMin: 240, pierceSpeedMmPerSec: 20, label: '>55 ≤60' },
    { cap: 63.5, oxySpeedMmPerMin: 227, pierceSpeedMmPerSec: 20, label: '>60 ≤63.5' },
    { cap: 70, oxySpeedMmPerMin: 240, pierceSpeedMmPerSec: 20, label: '>63.5 ≤70' },
    { cap: 71, oxySpeedMmPerMin: 238, pierceSpeedMmPerSec: 20, label: '>70 ≤71' },
    { cap: 75, oxySpeedMmPerMin: 225, pierceSpeedMmPerSec: 20, label: '>71 ≤75' },
    { cap: 76.2, oxySpeedMmPerMin: 221, pierceSpeedMmPerSec: 20, label: '>75 ≤76.2' },
    { cap: 80, oxySpeedMmPerMin: 209, pierceSpeedMmPerSec: 20, label: '>76.2 ≤80' },
    { cap: 85, oxySpeedMmPerMin: 193, pierceSpeedMmPerSec: 19, label: '>80 ≤85' },
    { cap: 90, oxySpeedMmPerMin: 200, pierceSpeedMmPerSec: 18, label: '>85 ≤90' },
    { cap: 100, oxySpeedMmPerMin: 183, pierceSpeedMmPerSec: 20, label: '>90 ≤100' },

    // Range caps as given (still use same rule: prevCap < t ≤ thisCap)
    { cap: 120, oxySpeedMmPerMin: 170, pierceSpeedMmPerSec: 25, label: '>100 ≤120' },
    { cap: 160, oxySpeedMmPerMin: 140, pierceSpeedMmPerSec: 25, label: '>120 ≤160' },
    { cap: 200, oxySpeedMmPerMin: 110, pierceSpeedMmPerSec: 25, label: '>160 ≤200' },
    { cap: 280, oxySpeedMmPerMin: 60, pierceSpeedMmPerSec: 25, label: '>200 ≤280' },
    { cap: 350, oxySpeedMmPerMin: 60, pierceSpeedMmPerSec: 25, label: '>280 ≤350' },
    { cap: 400, oxySpeedMmPerMin: 50, pierceSpeedMmPerSec: 25, label: '>350 ≤400' },
  ] as const;

  /**
   * Builds range windows out of the caps:
   *   - First range: thickness ≤ caps[0].cap
   *   - Subsequent ranges: prev.cap < thickness ≤ cur.cap
   */
  ranges = this.caps.map((cur, i, arr) => {
    const prevCap = i === 0 ? -Infinity : arr[i - 1].cap;
    const minExclusive = prevCap; // thickness must be > minExclusive
    const maxInclusive = cur.cap; // and ≤ maxInclusive
    return {
      minExclusive,
      maxInclusive,
      oxySpeedMmPerMin: cur.oxySpeedMmPerMin,
      pierceSpeedMmPerSec: cur.pierceSpeedMmPerSec,
      label: cur.label,
    };
  });

  /**
   * Finds a single matched object for given thickness (mm).
   * Rule: prevCap < thickness ≤ currentCap
   * Returns null if no match (e.g., thickness > last cap or invalid).
   */
  getOxyCutSpeeds = (thicknessMm: number) => {
    if (!Number.isFinite(thicknessMm) || thicknessMm < 0) return null;

    // First bucket (i=0): thickness ≤ first cap
    if (thicknessMm <= this.ranges[0].maxInclusive) return this.ranges[0];

    // Other buckets: prevCap < thickness ≤ currentCap
    const match = this.ranges.find((r, i) => i > 0 && thicknessMm > r.minExclusive && thicknessMm <= r.maxInclusive);
    return match ?? null;
  };

  // Lookup table defined as plain constants.
  tubeLaserSpeeds = {
    'Carbon Steel': [
      { thickness: 1, kerf: 0.5, speeds: { 500: 3.78, 1000: 4.2, 1500: 10.92, 2000: 12.6 } },
      { thickness: 2, kerf: 0.6, speeds: { 500: 2.0475, 1000: 2.9575, 1500: 3.185, 2000: 4.095 } },
      { thickness: 3, kerf: 0.7, speeds: { 500: 1.365, 1000: 1.365, 1500: 1.82, 2000: 2.184 } },
      { thickness: 4, kerf: 0.8, speeds: { 500: 0.78, 1000: 1.248, 1500: 1.56, 2000: 1.82 } },
      { thickness: 5, kerf: 0.9, speeds: { 500: 0.572, 1000: 1.04, 1500: 1.3, 2000: 1.56 } },
      { thickness: 6, kerf: 1.0, speeds: { 500: 0.468, 1000: 0.832, 1500: 1.144, 2000: 1.352 } },
      { thickness: 8, kerf: 1.2, speeds: { 500: 0, 1000: 0.672, 1500: 0.784, 2000: 1.008 } },
      { thickness: 10, kerf: 1.3, speeds: { 500: 0, 1000: 0.56, 1500: 0.616, 2000: 0.728 } },
      { thickness: 12, kerf: 1.5, speeds: { 500: 0, 1000: 0.504, 1500: 0.63, 2000: 0.756 } },
      { thickness: 14, kerf: 1.8, speeds: { 500: 0, 1000: 0, 1500: 0.441, 2000: 0.504 } },
      { thickness: 16, kerf: 2.0, speeds: { 500: 0, 1000: 0, 1500: 0, 2000: 0.441 } },
      { thickness: 18, kerf: 2.3, speeds: { 500: 0, 1000: 0, 1500: 0, 2000: 0.378 } },
    ],
    'Stainless Steel': [
      { thickness: 1, kerf: 0.5, speeds: { 500: 5.46, 1000: 10.5, 1500: 11.34, 2000: 12.6 } },
      { thickness: 2, kerf: 0.6, speeds: { 500: 2.275, 1000: 5.46, 1500: 5.915, 2000: 6.37 } },
      { thickness: 3, kerf: 0.7, speeds: { 500: 0.364, 1000: 1.1375, 1500: 2.275, 2000: 2.9575 } },
      { thickness: 4, kerf: 0.8, speeds: { 500: 0, 1000: 0.676, 1500: 1.248, 2000: 2.34 } },
      { thickness: 5, kerf: 0.9, speeds: { 500: 0, 1000: 0.364, 1500: 0.676, 2000: 1.3 } },
      { thickness: 6, kerf: 1.0, speeds: { 500: 0, 1000: 0, 1500: 0.52, 2000: 1.04 } },
      { thickness: 8, kerf: 1.2, speeds: { 500: 0, 1000: 0, 1500: 0, 2000: 0.56 } },
    ],
    Aluminium: [
      { thickness: 1, kerf: 0.3, speeds: { 500: 2.31, 1000: 4.2, 1500: 8.4, 2000: 10.5 } },
      { thickness: 2, kerf: 0.3, speeds: { 500: 0.6825, 1000: 2.275, 1500: 3.185, 2000: 4.55 } },
      { thickness: 3, kerf: 0.4, speeds: { 500: 0, 1000: 0.6825, 1500: 1.82, 2000: 2.73 } },
      { thickness: 4, kerf: 0.5, speeds: { 500: 0, 1000: 0, 1500: 0.78, 2000: 1.56 } },
      { thickness: 5, kerf: 0.5, speeds: { 500: 0, 1000: 0, 1500: 0.52, 2000: 0.936 } },
      { thickness: 6, kerf: 0.6, speeds: { 500: 0, 1000: 0, 1500: 0, 2000: 0.52 } },
      { thickness: 8, kerf: 0.7, speeds: { 500: 0, 1000: 0, 1500: 0, 2000: 0.448 } },
    ],
    Brass: [
      { thickness: 1, kerf: 0.5, speeds: { 500: 2.31, 1000: 4.2, 1500: 6.3, 2000: 7.56 } },
      { thickness: 2, kerf: 0.6, speeds: { 500: 0.455, 1000: 1.638, 1500: 2.275, 2000: 3.64 } },
      { thickness: 3, kerf: 0.7, speeds: { 500: 0, 1000: 0.455, 1500: 1.1375, 2000: 1.82 } },
      { thickness: 4, kerf: 0.8, speeds: { 500: 0, 1000: 0, 1500: 0.832, 2000: 1.04 } },
      { thickness: 5, kerf: 0.9, speeds: { 500: 0, 1000: 0, 1500: 0.364, 2000: 0.624 } },
      { thickness: 6, kerf: 1.0, speeds: { 500: 0, 1000: 0, 1500: 0, 2000: 0.364 } },
    ],
  } as const;

  // Allowed power settings present in the table.
  POWERS = [500, 1000, 1500, 2000] as const;

  // --- Helpers ---

  // Pick the row whose thickness is NEAREST to the requested thickness.
  // If tie (equal distance), prefer the HIGHER thickness.
  nearestThicknessRow(rows: any[], thickness: number) {
    if (!rows || !rows.length) return null;
    const t = Number(thickness);

    let best = rows[0];
    let bestDelta = Math.abs(rows[0].thickness - t);

    for (let i = 1; i < rows.length; i++) {
      const delta = Math.abs(rows[i].thickness - t);
      if (delta < bestDelta) {
        best = rows[i];
        bestDelta = delta;
      } else if (delta === bestDelta && rows[i].thickness > best.thickness) {
        // tie → choose higher thickness
        best = rows[i];
      }
    }
    return best;
  }

  // Pick the NEAREST available power from POWERS.
  // If tie, prefer the HIGHER power.
  nearestPower(power: number) {
    const p = Number(power);
    let best: (typeof this.POWERS)[number] = this.POWERS[0];
    let bestDelta = Math.abs(this.POWERS[0] - p);

    for (let i = 1; i < this.POWERS.length; i++) {
      const delta = Math.abs(this.POWERS[i] - p);
      if (delta < bestDelta) {
        best = this.POWERS[i];
        bestDelta = delta;
      } else if (delta === bestDelta && this.POWERS[i] > best) {
        // tie → higher power
        best = this.POWERS[i];
      }
    }
    return best;
  }

  /**
   * Returns kerf and cutting speed (m/min) for the given material, thickness, and power.
   * - Thickness: choose NEAREST thickness row (tie → higher).
   * - Power: choose NEAREST available power key (no interpolation; tie → higher).
   * Returns null if material not found.
   */
  getTubeLaserCuttingSpeed(material: string, thickness: number, power: number) {
    const rows = (this.tubeLaserSpeeds as any)[material];
    if (!rows) return null;

    // Select nearest thickness row
    const row = this.nearestThicknessRow(rows, thickness);
    if (!row) return null;

    const kerf = row.kerf;
    const speeds = row.speeds as any;

    // Select nearest power (no interpolation)
    const p = this.nearestPower(power);

    // If chosen power isn't present in the row, try the next closest powers as fallback.
    // (This is defensive; in your table every POWERS key exists for each row.)
    let speed = speeds[p];
    if (speed == null) {
      // fallback: scan other powers by increasing distance
      const sortedByDistance = [...this.POWERS].sort((a, b) => {
        const da = Math.abs(a - power);
        const db = Math.abs(b - power);
        if (da === db) return b - a; // tie → higher power
        return da - db;
      });
      for (const cand of sortedByDistance) {
        if (speeds[cand] != null) {
          speed = speeds[cand];
          break;
        }
      }
    }

    return { kerf, speed };
  }

  extractWatts(text: string) {
    if (!text) return 0;

    const regex = /(\d+(\.\d+)?)\s*(k?w)\b/i;
    const match = text.match(regex);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[3].toLowerCase();

    if (unit === 'kw') return value * 1000; // convert kW → watts
    if (unit === 'w') return value; // already in watts

    return 0;
  }

  // Piercing time lookup (seconds), separated per material group.
  // Thickness bins: "<=1", "<=3", "<=6", ">6"
  // Power bins: "<=2000", "<=4000", "<=6000", ">6000"

  TUBE_LASER_PIERCING_TABLE = {
    'Carbon Steel': {
      '<=1': { '<=2000': 0.3, '<=4000': 0.2, '<=6000': 0.15, '>6000': 0.1 },
      '<=3': { '<=2000': 1.0, '<=4000': 0.7, '<=6000': 0.5, '>6000': 0.4 },
      '<=6': { '<=2000': 2.5, '<=4000': 1.8, '<=6000': 1.2, '>6000': 1.0 },
      '>6': { '<=2000': 5.0, '<=4000': 3.5, '<=6000': 2.5, '>6000': 2.0 },
    },
    'Galvanized Steel': {
      '<=1': { '<=2000': 0.3, '<=4000': 0.2, '<=6000': 0.15, '>6000': 0.1 },
      '<=3': { '<=2000': 1.0, '<=4000': 0.7, '<=6000': 0.5, '>6000': 0.4 },
      '<=6': { '<=2000': 2.5, '<=4000': 1.8, '<=6000': 1.2, '>6000': 1.0 },
      '>6': { '<=2000': 5.0, '<=4000': 3.5, '<=6000': 2.5, '>6000': 2.0 },
    },
    'Stainless Steel': {
      '<=1': { '<=2000': 0.5, '<=4000': 0.3, '<=6000': 0.2, '>6000': 0.15 },
      '<=3': { '<=2000': 1.2, '<=4000': 0.8, '<=6000': 0.6, '>6000': 0.5 },
      '<=6': { '<=2000': 3.0, '<=4000': 2.0, '<=6000': 1.5, '>6000': 1.2 },
      '>6': { '<=2000': 6.0, '<=4000': 4.0, '<=6000': 3.0, '>6000': 2.5 },
    },
    Aluminum: {
      '<=1': { '<=2000': 0.7, '<=4000': 0.4, '<=6000': 0.3, '>6000': 0.2 },
      '<=3': { '<=2000': 1.5, '<=4000': 1.0, '<=6000': 0.8, '>6000': 0.6 },
      '<=6': { '<=2000': 3.5, '<=4000': 2.5, '<=6000': 1.8, '>6000': 1.5 },
      '>6': { '<=2000': 7.0, '<=4000': 5.0, '<=6000': 3.5, '>6000': 2.8 },
    },
    'Copper Alloy': {
      '<=1': { '<=2000': 0.5, '<=4000': 0.3, '<=6000': 0.2, '>6000': 0.15 },
      '<=3': { '<=2000': 1.2, '<=4000': 0.8, '<=6000': 0.6, '>6000': 0.5 },
      '<=6': { '<=2000': 3.0, '<=4000': 2.0, '<=6000': 1.5, '>6000': 1.2 },
      '>6': { '<=2000': 6.0, '<=4000': 4.0, '<=6000': 3.0, '>6000': 2.5 },
    },
    Copper: {
      '<=1': { '<=2000': 0.5, '<=4000': 0.3, '<=6000': 0.2, '>6000': 0.15 },
      '<=3': { '<=2000': 1.2, '<=4000': 0.8, '<=6000': 0.6, '>6000': 0.5 },
      '<=6': { '<=2000': 3.0, '<=4000': 2.0, '<=6000': 1.5, '>6000': 1.2 },
      '>6': { '<=2000': 6.0, '<=4000': 4.0, '<=6000': 3.0, '>6000': 2.5 },
    },
  } as const;

  thicknessBin(thicknessMm: number) {
    if (thicknessMm <= 1) return '<=1';
    if (thicknessMm <= 3) return '<=3';
    if (thicknessMm <= 6) return '<=6';
    return '>6';
  }

  powerBin(powerW: number) {
    // <=2000, <=4000, <=6000, >6000
    if (powerW <= 2000) return '<=2000';
    if (powerW <= 4000) return '<=4000';
    if (powerW <= 6000) return '<=6000';
    return '>6000';
  }

  /**
   * Returns piercing time in seconds.
   * - material: string with flexible matching (e.g., "SS304", "Stainless steel", "Carbon steel", "AlMg3", "Copper").
   * - thicknessMm: number (mm).
   * - powerW: number (watts).
   * Returns null if material cannot be mapped.
   */
  getTubeLaserPiercingTime(material: string, thicknessMm: number, powerW: number) {
    const group = material;
    if (!group) return null;

    const tBin = this.thicknessBin(Number(thicknessMm));
    const pBin = this.powerBin(Number(powerW));

    const row = (this.TUBE_LASER_PIERCING_TABLE as any)[group];
    if (!row) return null;

    const times = row[tBin];
    if (!times) return null;

    return times[pBin] ?? null;
  }

  countBendsInAngleBucketsForTubeBending(items) {
    let lt_45 = 0; // angle < 45
    let gt45_lt90 = 0; // 45 < angle < 90
    let gt90_lt135 = 0; // 90 < angle < 135
    let gt135_lt180 = 0; // 135 < angle < 180

    for (const item of items) {
      const angle = typeof item.Angle === 'string' ? parseFloat(item.Angle) : item.Angle;
      const count = Number(item.BendCount) || 0;

      if (!Number.isFinite(angle)) continue;

      if (angle < 45) {
        lt_45 += count;
      } else if (angle >= 45 && angle < 90) {
        gt45_lt90 += count;
      } else if (angle >= 90 && angle < 135) {
        gt90_lt135 += count;
      } else if (angle >= 135 && angle <= 180) {
        gt135_lt180 += count;
      }
      // angles equal to 45, 90, 135, 180 are not counted in any bucket per your spec
    }

    return {
      lessThan45: lt_45,
      between45And90: gt45_lt90,
      between90And135: gt90_lt135,
      between135And180: gt135_lt180,
    };
  }

  ANGLE_CONFIG: Record<AngleKey, { gate: (m: ProcessInfoDto) => number; ranges: Array<{ max: number; value: number }> }> = {
    angle45: {
      gate: (m) => m.noOfStartsPierce,
      ranges: [
        { max: 15, value: 1 },
        { max: 30, value: 1 },
        { max: 50, value: 1.2 },
        { max: 100, value: 1.5 },
        { max: 150, value: 2.5 },
      ],
    },
    angle90: {
      gate: (m) => m.noOfHitsRequired,
      ranges: [
        { max: 15, value: 1 },
        { max: 30, value: 1.2 },
        { max: 50, value: 1.33 },
        { max: 100, value: 2 },
        { max: 150, value: 5 },
      ],
    },
    angle135: {
      gate: (m) => m.noOfHoles,
      ranges: [
        { max: 15, value: 1.2 },
        { max: 30, value: 1.33 },
        { max: 50, value: 1.5 },
        { max: 100, value: 3 },
        { max: 150, value: 7 },
      ],
    },
    angle180: {
      gate: (m) => m.noofStroke,
      ranges: [
        { max: 15, value: 1.33 },
        { max: 30, value: 1.5 },
        { max: 50, value: 2 },
        { max: 100, value: 4 },
        { max: 150, value: 10 },
      ],
    },
  };

  valueByLength(gateValue: number, length: number, ranges: Array<{ max: number; value: number }>): number {
    if (gateValue <= 0) return 0;
    for (const r of ranges) {
      if (length <= r.max) return r.value;
    }
    return 0;
  }

  computeAnglesForTubeBending(manufactureInfo: ProcessInfoDto, materialInfo: MaterialInfoDto) {
    const L = materialInfo.moldBoxLength;

    const result = {} as Record<AngleKey, number>;
    (Object.keys(this.ANGLE_CONFIG) as AngleKey[]).forEach((key) => {
      const { gate, ranges } = this.ANGLE_CONFIG[key];
      result[key] = this.valueByLength(gate(manufactureInfo), L, ranges);
    });

    return result;
  }

  // Dataset (you can keep it as an array or convert to a Map—I'll build a lookup below)
  MACHINES = [
    { MachineName: 'Tube Bending Dia20mm USA', maxTubeThicknessmm: 2, bendingSpeedDegPerSec: 280, tubeFeedMmPerSec: 935, tubeRotationDegPerSec: 130 },
    { MachineName: 'Tube Bending Dia30mm USA', maxTubeThicknessmm: 2, bendingSpeedDegPerSec: 280, tubeFeedMmPerSec: 935, tubeRotationDegPerSec: 120 },
    { MachineName: 'Tube Bending Dia50mm USA', maxTubeThicknessmm: 2, bendingSpeedDegPerSec: 90, tubeFeedMmPerSec: 500, tubeRotationDegPerSec: 180 },
    { MachineName: 'Tube Bending Dia100mm USA', maxTubeThicknessmm: 2, bendingSpeedDegPerSec: 35, tubeFeedMmPerSec: 250, tubeRotationDegPerSec: 180 },
    { MachineName: 'Tube Bending Dia150mm USA', maxTubeThicknessmm: 3, bendingSpeedDegPerSec: 12.5, tubeFeedMmPerSec: 250, tubeRotationDegPerSec: 45 },

    { MachineName: 'Tube Bending Dia25.4mm India', maxTubeThicknessmm: 2.5, bendingSpeedDegPerSec: 90, tubeFeedMmPerSec: 150, tubeRotationDegPerSec: 75 },
    { MachineName: 'Tube Bending Dia50.8mm India', maxTubeThicknessmm: 2.5, bendingSpeedDegPerSec: 90, tubeFeedMmPerSec: 225, tubeRotationDegPerSec: 110 },
    { MachineName: 'Tube Bending Dia89mm India', maxTubeThicknessmm: 4, bendingSpeedDegPerSec: 90, tubeFeedMmPerSec: 300, tubeRotationDegPerSec: 150 },
    { MachineName: 'Tube Bending Dia114mm India', maxTubeThicknessmm: 4.2, bendingSpeedDegPerSec: 45, tubeFeedMmPerSec: 150, tubeRotationDegPerSec: 60 },

    { MachineName: 'Tube Bending Dia25mm China', maxTubeThicknessmm: 1.6, bendingSpeedDegPerSec: 100, tubeFeedMmPerSec: 500, tubeRotationDegPerSec: 100 },
    { MachineName: 'Tube Bending Dia50mm China', maxTubeThicknessmm: 3, bendingSpeedDegPerSec: 42.5, tubeFeedMmPerSec: 500, tubeRotationDegPerSec: 100 },
    { MachineName: 'Tube Bending Dia100mm China', maxTubeThicknessmm: 8, bendingSpeedDegPerSec: 15, tubeFeedMmPerSec: 400, tubeRotationDegPerSec: 80 },
    { MachineName: 'Tube Bending Dia168mm China', maxTubeThicknessmm: 14, bendingSpeedDegPerSec: 10, tubeFeedMmPerSec: 400, tubeRotationDegPerSec: 80 },

    { MachineName: 'Tube Bending Dia22.23mm Germany', maxTubeThicknessmm: 1.83, bendingSpeedDegPerSec: 150, tubeFeedMmPerSec: 250, tubeRotationDegPerSec: 120 },
    { MachineName: 'Tube Bending Dia41.28mm Germany', maxTubeThicknessmm: 3.05, bendingSpeedDegPerSec: 90, tubeFeedMmPerSec: 300, tubeRotationDegPerSec: 140 },
    { MachineName: 'Tube Bending Dia60.33mm Germany', maxTubeThicknessmm: 3.91, bendingSpeedDegPerSec: 50, tubeFeedMmPerSec: 275, tubeRotationDegPerSec: 130 },
  ];

  // Build a fast case-insensitive lookup
  MACHINE_INDEX = this.MACHINES.reduce((acc, item) => {
    acc[item.MachineName.toLowerCase()] = item;
    return acc;
  }, {});

  // Default object with numeric fields = 0 (MachineName echoes the query for clarity)
  defaultMachine(name) {
    return {
      MachineName: name,
      maxTubeThicknessmm: 0,
      bendingSpeedDegPerSec: 0,
      tubeFeedMmPerSec: 0,
      tubeRotationDegPerSec: 0,
    };
  }

  /**
   * Returns the machine spec object for a given machine name (case-insensitive).
   * If not found, returns an object with same fields but numeric values set to 0.
   */
  getMachineSpecs(machineName) {
    if (!machineName || typeof machineName !== 'string') {
      return this.defaultMachine('');
    }
    const key = machineName.trim().toLowerCase();
    return this.MACHINE_INDEX[key] || this.defaultMachine(machineName);
  }
}

type AngleKey = 'angle45' | 'angle90' | 'angle135' | 'angle180';

type LaserDwellThicknessKey = '<=1' | '<=3' | '<=5' | '<=8' | '<=10' | '>10';
//  Define allowed keys for power levels
type PowerKey = '<=2000' | '<=4000' | '<=6000' | '>6000';

type MaterialTable = Record<string, ThicknessRow[]>;

interface ThicknessRow {
  maxThickness: number | null; // null means ">6"
  values: Record<PowerKey, number>;
}

// Plasma
type MaterialFamily = 'Carbon Steel' | 'Stainless Steel' | 'Aluminium' | 'Copper Alloy';

type PlasmaThicknessKey = '<=3' | '<=6' | '<=12' | '<=16' | '<=20' | '<=25' | '>25';

type PlasmaPowerKey = '45A' | '85A' | '130A' | '200A' | '300A' | '400A' | '600A' | '800A';

type PlasmaPiercingTable = {
  [family in MaterialFamily]: {
    [thickness in PlasmaThicknessKey]: {
      [power in PlasmaPowerKey]: number;
    };
  };
};

export enum StagingToolingType {
  Simple = 1,
  Compound = 2,
  No = 3,
}
interface SpmRecommendation {
  material: string;
  thicknessMax: number;
  spm16_5T: number;
  spm20T: number;
  spm30T: number;
  spm40T: number;
}

export class ShearigProcessSpeed {
  Material: string;
  Thickness: number;
  Vfeed: number;
  Vclamp: number;
  Vcut: number;
  Vreturn: number;
  Voffload: number;
  MaterialTypeId: number;
}

// Define the config structure
export class TransferPressParam {
  partType: string;
  range: string;
  vRobot: number;
  vLoading: number;
  vUnloading: number;
}

interface ToolData {
  tool: string;
  length: number;
  weight: string;
  lifting: number;
}

interface SetupTimeResult {
  length: number;
  setupTime: number;
}
