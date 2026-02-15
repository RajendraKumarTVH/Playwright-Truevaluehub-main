import { Injectable } from '@angular/core';
import { ProcessType } from 'src/app/modules/costing/costing.config';
import {
  BoringOperationTypes,
  DrillingTypes,
  GearBroachingOperationTypes,
  GearCuttingOperationTypes,
  GearGrindingOperationTypes,
  GearShavingOperationTypes,
  GearSplineRollingOperationTypes,
  GrindingOperationTypes,
  MillingTypes,
  TurningTypes,
} from 'src/app/shared/enums/machining-types.enum';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { FormBuilder } from '@angular/forms';
import unloadingTimeData from '../json/unloading-time-data.json';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingMachiningConfigService {
  conversionValue: any;
  isEnableUnitConversion: any;
  machineProcessList = [];
  machineProcessObject = null;

  machiningProcesses = [
    'TurningCenter',
    'MillingCenter',
    'DrillingCenter',
    'Boring',
    'SurfaceGrinding',
    'CylindricalGrinding',
    'CenterlessGrinding',
    'GearCutting',
    'GearBroaching',
    'GearSplineRolling',
    'GearShaving',
    'GearGrinding',
  ];
  turningProcesses = [
    TurningTypes.FacingRoughing,
    TurningTypes.FacingFinishing,
    TurningTypes.TurningODRoughing,
    TurningTypes.TurningODFinishing,
    TurningTypes.TaperTurningRoughing,
    TurningTypes.TaperTurningFinishing,
    TurningTypes.TurningIDRoughing,
    TurningTypes.TurningIDFinishing,
    TurningTypes.Parting,
    TurningTypes.ODGrooving,
    TurningTypes.IdGrooving,
    TurningTypes.FaceGrooving,
    TurningTypes.ThreadCutting,
    TurningTypes.Knurling,
    TurningTypes.FaceMillingRoughing,
    TurningTypes.FaceMillingFinishing,
    TurningTypes.SlotMillingRoughing,
    TurningTypes.SlotMillingFinishing,
    TurningTypes.EndMillingRoughing,
    TurningTypes.EndMillingFinishing,
    TurningTypes.LinearPocketRoughing,
    TurningTypes.LinearPocketFinishing,
    TurningTypes.CircularPocketRoughing,
    TurningTypes.CircularPocketFinishing,
    TurningTypes.CircularBossRoughing,
    TurningTypes.CircularBossFinishing,
    TurningTypes.SideMillingRoughing,
    TurningTypes.SideMillingFinishing,
    TurningTypes.ThreadMilling,
    TurningTypes.SpotFaceMilling,
    TurningTypes.Drilling,
    TurningTypes.PeckDrilling,
    TurningTypes.Reaming,
    TurningTypes.Tapping,
    TurningTypes.CounterSinking,
    TurningTypes.BoringRoughing,
    TurningTypes.BoringFinishing,
    TurningTypes.TSlot,
    TurningTypes.VolumetricMillingRoughing,
    TurningTypes.VolumetricMillingFinishing,
    TurningTypes.EdgeBreakingChamferFillet,
  ];
  millingOperations = [
    MillingTypes.FaceMillingRoughing,
    MillingTypes.FaceMillingFinishing,
    MillingTypes.SlotMillingRoughing,
    MillingTypes.SlotMillingFinishing,
    MillingTypes.EndMillingRoughing,
    MillingTypes.EndMillingFinishing,
    MillingTypes.LinearPocketRoughing,
    MillingTypes.LinearPocketFinishing,
    MillingTypes.CircularPocketRoughing,
    MillingTypes.CircularPocketFinishing,
    MillingTypes.CircularBossRoughing,
    MillingTypes.CircularBossFinishing,
    MillingTypes.SideMillingRoughing,
    MillingTypes.SideMillingFinishing,
    MillingTypes.ThreadMilling,
    MillingTypes.SpotFaceMilling,
    MillingTypes.Drilling,
    MillingTypes.PeckDrilling,
    MillingTypes.Reaming,
    MillingTypes.Tapping,
    MillingTypes.CounterSinking,
    MillingTypes.BoringRoughing,
    MillingTypes.BoringFinishing,
    MillingTypes.Trepanning,
    MillingTypes.TSlotTNut,
    MillingTypes.TSlot,
    MillingTypes.VolumetricMillingRoughing,
    MillingTypes.VolumetricMillingFinishing,
    MillingTypes.EdgeBreakingChamferFillet,
  ];
  drillingOperations = [DrillingTypes.Drilling, DrillingTypes.Tapping];
  boringOperations = [BoringOperationTypes.BoringRoughing, BoringOperationTypes.BoringFinishing];
  surfaceGrindingOperations = [GrindingOperationTypes.SurfaceGrindingRoughing, GrindingOperationTypes.SurfaceGrindingFinishing];
  cylindericalGrindingOperations = [GrindingOperationTypes.CylindricalGrindingRoughing, GrindingOperationTypes.CylindricalGrindingFinishing];
  centerlessGrindingOperations = [GrindingOperationTypes.CenterlessGrindingRoughing, GrindingOperationTypes.CenterlessGrindingFinishing];
  gearCuttingOperations = [GearCuttingOperationTypes.GearCuttingHobby];
  gearBroachingOperations = [GearBroachingOperationTypes.Broaching];
  gearSplineRollingOperations = [GearSplineRollingOperationTypes.SplineForming];
  gearShavingOperations = [GearShavingOperationTypes.GearShavingSemiFinish, GearShavingOperationTypes.GearShavingFinish];
  gearGrindingOperations = [GearGrindingOperationTypes.GearGrindingSemiFinish, GearGrindingOperationTypes.GearGrindingFinish];
  machiningProcess = [
    ProcessType.TurningCenter,
    ProcessType.MillingCenter,
    ProcessType.DrillingCenter,
    ProcessType.Boring,
    ProcessType.SurfaceGrinding,
    ProcessType.CylindricalGrinding,
    ProcessType.CenterlessGrinding,
    ProcessType.GearCutting,
    ProcessType.GearBroaching,
    ProcessType.GearSplineRolling,
    ProcessType.GearShaving,
    ProcessType.GearGrinding,
  ];

  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {
    this.machineProcessList = this.getProcessList();
    this.machineProcessObject = this.getProcessObject();
  }
  // getWorkCenterList() {
  //     return [
  //         { id: 1, name: "Drilling Center" },
  //         { id: 2, name: "VMC Milling Center" },
  //         { id: 3, name: "CNC Turning Center" },
  //         { id: 4, name: "Grinding/Finishing Center" },
  //         { id: 5, name: "Gear Hobbing/Cutting Center" },
  //         { id: 6, name: "Boring Center" },
  //         { id: 7, name: "Vertical Boring Center" },
  //     ];
  // }

  getProcessList() {
    return this.machiningProcesses.map((process) => ({ id: ProcessType[process], process }));
  }
  getProcessObject() {
    const processObj = {};
    this.machiningProcesses.forEach((process) => (processObj[ProcessType[process]] = process));
    return processObj;
  }

  getOperationTypes(workCenter: number) {
    let resultList: any[] = [];
    workCenter = Number(workCenter);
    if (workCenter === ProcessType.DrillingCenter) {
      resultList = [
        // { id: 1, name: "Counter-Sinking" },
        // { id: 2, name: "Reaming" },
        // { id: 3, name: "Step-Drilling" },
        { id: 5, name: 'Drilling' },
        { id: 4, name: 'Tapping' },
      ];
    } else if (workCenter === ProcessType.TurningCenter) {
      resultList = [
        { id: 5, name: 'Facing-Roughing' },
        { id: 6, name: 'Facing-Finishing' },
        { id: 1, name: 'Rough Turn OD' },
        { id: 2, name: 'Finish Turn OD' }, // old Turning finishing
        { id: 3, name: 'Taper Turning-Roughing' },
        { id: 4, name: 'Taper Turning-Finishing' },
        { id: 11, name: 'Rough Turn ID' },
        { id: 12, name: 'Finish Turn ID' }, // old boring finishing
        { id: 7, name: 'Parting' },
        { id: 8, name: 'OD Grooving' },
        { id: 19, name: 'ID Grooving' },
        { id: 10, name: 'Face Grooving' },
        { id: 9, name: 'Thread Cutting' },
        { id: 16, name: 'Knurling' },
        { id: 21, name: 'Face Milling-Roughing' },
        { id: 22, name: 'Face Milling-Finishing' },
        { id: 27, name: 'Slot Milling-Roughing' },
        { id: 28, name: 'Slot Milling-Finishing' },
        { id: 17, name: 'End Milling-Roughing' },
        { id: 18, name: 'End Milling-Finishing' },
        { id: 25, name: 'Linear Pocket-Roughing' },
        { id: 26, name: 'Linear Pocket-Finishing' },
        { id: 29, name: 'Circular Pocket-Roughing' },
        { id: 30, name: 'Circular Pocket-Finishing' },
        { id: 31, name: 'Circular Boss-Roughing' },
        { id: 32, name: 'Circular Boss-Finishing' },
        { id: 23, name: 'Side Milling-Roughing' },
        { id: 24, name: 'Side Milling-Finishing' },
        { id: 33, name: 'Thread Milling' },
        { id: 34, name: 'Spot Face Milling' },
        { id: 13, name: 'Drilling' },
        { id: 20, name: 'Peck Drilling' },
        { id: 14, name: 'Reaming' },
        { id: 15, name: 'Tapping' },
        { id: 35, name: 'Counter Sinking' },
        { id: 36, name: 'Boring-Roughing' },
        { id: 37, name: 'Boring-Finishing' },
        { id: 38, name: 'T Slot' },
        { id: 39, name: 'Volumetric Milling-Roughing' },
        { id: 40, name: 'Volumetric Milling-Finishing' },
        { id: 41, name: 'Edge Breaking Chamfer/Fillet' },
      ];
    } else if (workCenter === ProcessType.MillingCenter) {
      resultList = [
        { id: 1, name: 'Face Milling-Roughing' },
        { id: 2, name: 'Face Milling-Finishing' },
        { id: 3, name: 'Slot Milling-Roughing' },
        { id: 4, name: 'Slot Milling-Finishing' },
        { id: 5, name: 'End Milling-Roughing' },
        { id: 6, name: 'End Milling-Finishing' },
        { id: 21, name: 'Linear Pocket-Roughing' },
        { id: 22, name: 'Linear Pocket-Finishing' },
        { id: 23, name: 'Circular Pocket-Roughing' },
        { id: 24, name: 'Circular Pocket-Finishing' },
        { id: 25, name: 'Circular Boss-Roughing' },
        { id: 26, name: 'Circular Boss-Finishing' },
        { id: 7, name: 'Side Milling-Roughing' },
        { id: 8, name: 'Side Milling-Finishing' },
        { id: 9, name: 'Thread Milling' },
        { id: 10, name: 'Spot Face Milling' },
        { id: 11, name: 'Drilling' },
        { id: 20, name: 'PeckDrilling' },
        { id: 14, name: 'Reaming' },
        { id: 18, name: 'Tapping' },
        { id: 12, name: 'Counter Sinking/Chamfering' },
        { id: 13, name: 'Boring-Roughing' },
        { id: 19, name: 'Boring-Finishing' },
        { id: 16, name: 'Trepanning Tool' },
        { id: 17, name: 'T-slot T Nut' },
        { id: 15, name: 'T-slot' },
        { id: 27, name: 'Volumetric Milling-Roughing' },
        { id: 28, name: 'Volumetric Milling-Finishing' },
        { id: 29, name: 'Edge Breaking Chamfer/Fillet' },
      ];
    } else if (workCenter === ProcessType.SurfaceGrinding) {
      resultList = [
        { id: 1, name: 'Surface Grinding-Roughing' },
        { id: 2, name: 'Surface Grinding-Finishing' },
      ];
    } else if (workCenter === ProcessType.CylindricalGrinding) {
      resultList = [
        { id: 3, name: 'Cylindrical Grinding-Roughing' },
        { id: 4, name: 'Cylindrical Grinding-Finishing' },
      ];
    } else if (workCenter === ProcessType.CenterlessGrinding) {
      resultList = [
        { id: 5, name: 'Centerless Grinding-Roughing' },
        { id: 6, name: 'Centerless Grinding-Finishing' },
      ];
    } else if (workCenter === ProcessType.Boring) {
      resultList = [
        { id: 1, name: 'Boring-Roughing' },
        { id: 2, name: 'Boring-Finishing' },
        // { id: 3, name: "Taper Boring-Roughing" },
        // { id: 4, name: "Taper Boring-Finishing" },
      ];
    } else if (workCenter === ProcessType.GearCutting) {
      resultList = [{ id: 1, name: 'Gear Hobbing/Cutting' }];
    } else if (workCenter === ProcessType.GearBroaching) {
      resultList = [{ id: 2, name: 'Broaching' }];
    } else if (workCenter === ProcessType.GearSplineRolling) {
      resultList = [{ id: 3, name: 'Spline Forming' }];
    } else if (workCenter === ProcessType.GearShaving) {
      resultList = [
        { id: 4, name: 'Gear Shaving Semi-Finish' },
        { id: 5, name: 'Gear Shaving Finish' },
      ];
    } else if (workCenter === ProcessType.GearGrinding) {
      resultList = [
        { id: 6, name: 'Gear Grinding Semi-Finish' },
        { id: 7, name: 'Gear Grinding Finish' },
      ];
    }
    return resultList;
  }

  getCuttingParametersForRefMaterials(matId: number) {
    const materialList = [
      { materialId: 54, materialName: 'Alloy Steel', refMaterialId: 54 },
      { materialId: 157, materialName: 'Carbon Steel', refMaterialId: 157 },
      { materialId: 23, materialName: 'Cast Iron', refMaterialId: 23 },
      { materialId: 232, materialName: 'Cast Steel', refMaterialId: 42 },
      { materialId: 70, materialName: 'Cold heading steel', refMaterialId: 42 },
      { materialId: 281, materialName: 'Cold Rolled Steel', refMaterialId: 54 },
      { materialId: 475, materialName: 'Ductile Iron', refMaterialId: 475 },
      { materialId: 31, materialName: 'Galvanized Steel', refMaterialId: 54 },
      { materialId: 157, materialName: 'High Carbon Bearing steel', refMaterialId: 157 },
      { materialId: 436, materialName: 'Hot Rolled Steel', refMaterialId: 54 },
      { materialId: 353, materialName: 'Nickel Iron', refMaterialId: 42 },
      { materialId: 369, materialName: 'Silicon Steel', refMaterialId: 42 },
      { materialId: 142, materialName: 'Spring Steel', refMaterialId: 42 },
      { materialId: 42, materialName: 'Stainless Steel', refMaterialId: 42 },
      { materialId: 314, materialName: 'Tool Steel', refMaterialId: 42 },

      { materialId: 266, materialName: 'Aluminium', refMaterialId: 266 },
      { materialId: 118, materialName: 'Antimony', refMaterialId: 242 },
      { materialId: 384, materialName: 'Bismuth', refMaterialId: 262 },
      { materialId: 473, materialName: 'Bronze & Bronze alloy', refMaterialId: 473 },
      { materialId: 154, materialName: 'Chromium', refMaterialId: 262 },
      { materialId: 242, materialName: 'Copper Alloy', refMaterialId: 242 },
      { materialId: 274, materialName: 'Gold', refMaterialId: 262 },
      { materialId: 165, materialName: 'Graphite', refMaterialId: 473 },
      { materialId: 160, materialName: 'Lead alloy', refMaterialId: 473 },
      { materialId: 194, materialName: 'Lead alloy', refMaterialId: 473 },
      { materialId: 57, materialName: 'Leaded Red Brass Alloy', refMaterialId: 473 },
      { materialId: 62, materialName: 'Magnesium Alloy', refMaterialId: 266 },
      { materialId: 283, materialName: 'Manganese Bronze Alloy', refMaterialId: 473 },
      { materialId: 262, materialName: 'Nickel & Nickel Alloy', refMaterialId: 262 },
      { materialId: 66, materialName: 'Niobium', refMaterialId: 206 },
      { materialId: 218, materialName: 'Palladium', refMaterialId: 206 },
      { materialId: 119, materialName: 'Silver Alloy', refMaterialId: 473 },
      { materialId: 330, materialName: 'Tin', refMaterialId: 206 },
      { materialId: 206, materialName: 'Titanium', refMaterialId: 206 },
      { materialId: 458, materialName: 'Tungsten Carbide', refMaterialId: 0 },
      { materialId: 2, materialName: 'Zinc & Zinc Alloy', refMaterialId: 262 },
      { materialId: 280, materialName: 'Zinc+Nickel', refMaterialId: 262 },

      { materialId: 453, materialName: 'ABS', refMaterialId: 472 },
      { materialId: 478, materialName: 'BMC', refMaterialId: 474 },
      { materialId: 452, materialName: 'HIPS', refMaterialId: 472 },
      { materialId: 460, materialName: 'LCP', refMaterialId: 472 },
      { materialId: 461, materialName: 'Nylon(PA)', refMaterialId: 461 },
      { materialId: 446, materialName: 'PA6T', refMaterialId: 474 },
      { materialId: 446, materialName: 'PA9T', refMaterialId: 474 },
      { materialId: 449, materialName: 'PBT', refMaterialId: 474 },
      { materialId: 449, materialName: 'PBT+ASA', refMaterialId: 474 },
      { materialId: 449, materialName: 'PBT+PET', refMaterialId: 474 },
      { materialId: 444, materialName: 'PC', refMaterialId: 472 },
      { materialId: 457, materialName: 'PE', refMaterialId: 472 },
      { materialId: 472, materialName: 'PEEK', refMaterialId: 472 },
      { materialId: 325, materialName: 'PET', refMaterialId: 472 },
      { materialId: 451, materialName: 'PETG', refMaterialId: 472 },
      { materialId: 456, materialName: 'PMMA', refMaterialId: 456 },
      { materialId: 456, materialName: 'PMMA(Acrylic)', refMaterialId: 456 },
      { materialId: 462, materialName: 'POM(Acetal)', refMaterialId: 462 },
      { materialId: 447, materialName: 'PP', refMaterialId: 472 },
      { materialId: 476, materialName: 'PPA', refMaterialId: 474 },
      { materialId: 465, materialName: 'PPE', refMaterialId: 474 },
      { materialId: 445, materialName: 'PPE+PA', refMaterialId: 474 },
      { materialId: 463, materialName: 'PPS', refMaterialId: 474 },
      { materialId: 450, materialName: 'PS', refMaterialId: 472 },
      { materialId: 471, materialName: 'PSU - Polysulfone', refMaterialId: 474 },
      { materialId: 464, materialName: 'PU', refMaterialId: 474 },
      { materialId: 477, materialName: 'PVA', refMaterialId: 474 },
      { materialId: 454, materialName: 'PVC', refMaterialId: 472 },
      { materialId: 455, materialName: 'PVF', refMaterialId: 474 },
      { materialId: 474, materialName: 'Tetragonal Zirconia Polycrystal (TZP)', refMaterialId: 474 },
      { materialId: 470, materialName: 'TPO - Thermoplastic Polyolefin', refMaterialId: 462 },
    ];
    return materialList.find((m) => m.materialId === matId)?.refMaterialId || null;
  }

  getFaceMillingCutter(inputData: number, field = 'widthOfCut') {
    const data = [
      { id: 1, maxWidthOfCut: 9, cutterDia: 10, noOfInserts: 2 },
      { id: 2, maxWidthOfCut: 15, cutterDia: 16, noOfInserts: 2 },
      { id: 3, maxWidthOfCut: 19, cutterDia: 20, noOfInserts: 3 },
      { id: 4, maxWidthOfCut: 24, cutterDia: 25, noOfInserts: 4 },
      { id: 5, maxWidthOfCut: 29, cutterDia: 30, noOfInserts: 5 },
      { id: 6, maxWidthOfCut: 39, cutterDia: 40, noOfInserts: 6 },
      { id: 7, maxWidthOfCut: 49, cutterDia: 50, noOfInserts: 6 },
      { id: 8, maxWidthOfCut: 59, cutterDia: 60, noOfInserts: 6 },
      { id: 9, maxWidthOfCut: 79, cutterDia: 80, noOfInserts: 6 },
      { id: 10, maxWidthOfCut: 99, cutterDia: 100, noOfInserts: 10 },
      { id: 11, maxWidthOfCut: 10000, cutterDia: 125, noOfInserts: 14 },
    ];
    if (field === 'cutterDia') {
      return data.find((x: any) => x.cutterDia >= inputData) || data[data.length - 1];
    }
    return data.find((x) => x.maxWidthOfCut >= inputData) || data[data.length - 1];
  }

  getEndMillingCutter(inputData: number, field = 'widthOfCut') {
    // End Side LinearPocket Slot CircularPocket
    const data = [
      { id: 1, maxWidthOfCut: 1.5, cutterDia: 1, noOfInserts: 2 },
      { id: 2, maxWidthOfCut: 2, cutterDia: 1.5, noOfInserts: 3 },
      { id: 3, maxWidthOfCut: 3, cutterDia: 2, noOfInserts: 3 },
      { id: 4, maxWidthOfCut: 4, cutterDia: 3, noOfInserts: 4 },
      { id: 5, maxWidthOfCut: 5, cutterDia: 4, noOfInserts: 4 },
      { id: 6, maxWidthOfCut: 6, cutterDia: 5, noOfInserts: 4 },
      { id: 7, maxWidthOfCut: 8, cutterDia: 6, noOfInserts: 4 },
      { id: 8, maxWidthOfCut: 10, cutterDia: 8, noOfInserts: 4 },
      { id: 9, maxWidthOfCut: 12, cutterDia: 10, noOfInserts: 4 },
      { id: 10, maxWidthOfCut: 14, cutterDia: 12, noOfInserts: 4 },
      { id: 11, maxWidthOfCut: 16, cutterDia: 14, noOfInserts: 4 },
      { id: 12, maxWidthOfCut: 20, cutterDia: 16, noOfInserts: 4 },
      { id: 13, maxWidthOfCut: 35, cutterDia: 20, noOfInserts: 3 },
      { id: 14, maxWidthOfCut: 50, cutterDia: 32, noOfInserts: 4 },
      { id: 15, maxWidthOfCut: 75, cutterDia: 40, noOfInserts: 5 },
      { id: 16, maxWidthOfCut: 100, cutterDia: 50, noOfInserts: 6 },
      { id: 17, maxWidthOfCut: 200, cutterDia: 63, noOfInserts: 8 },
      { id: 18, maxWidthOfCut: 1000000, cutterDia: 80, noOfInserts: 10 },
    ];
    if (field === 'cutterDia') {
      return data.find((x: any) => x.cutterDia >= inputData) || data[data.length - 1];
    }
    return data.find((x) => x.maxWidthOfCut >= inputData) || data[data.length - 1];
  }

  getCircularBossCutter(inputData: number, field = 'workpieceFinalDia') {
    const data = [
      { id: 1, maxDia: 10, cutterDia: 5, noOfInserts: 4 },
      { id: 2, maxDia: 25, cutterDia: 10, noOfInserts: 4 },
      { id: 3, maxDia: 50, cutterDia: 16, noOfInserts: 4 },
      { id: 4, maxDia: 75, cutterDia: 20, noOfInserts: 4 },
      { id: 5, maxDia: 100, cutterDia: 25, noOfInserts: 4 },
      { id: 6, maxDia: 10000, cutterDia: 25, noOfInserts: 4 },
    ];
    if (field === 'cutterDia') {
      return data.find((x: any) => x.cutterDia >= inputData) || data[data.length - 1];
    }
    return data.find((x) => x.maxDia >= inputData) || data[data.length - 1];
  }

  getSpotFaceMillingCutter(cutterDia) {
    const data = [
      { id: 1, cutterDiaMax: 20, noOfInserts: 2 },
      { id: 2, cutterDiaMax: 35, noOfInserts: 3 },
      { id: 3, cutterDiaMax: 50, noOfInserts: 4 },
      { id: 4, cutterDiaMax: 100, noOfInserts: 6 },
    ];
    return data.find((x) => x.cutterDiaMax >= cutterDia) || data[data.length - 1];
  }

  getThreadMillingCutter(threadDiameter: number, pitch: number) {
    const data = [
      { threadDiameter: 1.6, pitch: 0.35, cutterDia: 1.524 },
      { threadDiameter: 2, pitch: 0.4, cutterDia: 1.905 },
      { threadDiameter: 2.5, pitch: 0.45, cutterDia: 2.159 },
      { threadDiameter: 3, pitch: 0.5, cutterDia: 2.286 },
      { threadDiameter: 4, pitch: 0.7, cutterDia: 2.794 },
      { threadDiameter: 4.5, pitch: 0.75, cutterDia: 3.175 },
      { threadDiameter: 5, pitch: 0.8, cutterDia: 3.556 },
      { threadDiameter: 6, pitch: 1, cutterDia: 4.318 },
      { threadDiameter: 8, pitch: 1, cutterDia: 5.969 },
      { threadDiameter: 8, pitch: 1.25, cutterDia: 5.969 },
      { threadDiameter: 10, pitch: 1, cutterDia: 7.366 },
      { threadDiameter: 10, pitch: 1.5, cutterDia: 7.366 },
      { threadDiameter: 12, pitch: 1, cutterDia: 10.16 },
      { threadDiameter: 12, pitch: 1.25, cutterDia: 8.763 },
      { threadDiameter: 14, pitch: 1.25, cutterDia: 11.43 },
      { threadDiameter: 14, pitch: 1.5, cutterDia: 11.43 },
      { threadDiameter: 14, pitch: 2, cutterDia: 11.43 },
      { threadDiameter: 16, pitch: 2.5, cutterDia: 11.43 },
      { threadDiameter: 18, pitch: 2.5, cutterDia: 13.97 },
      { threadDiameter: 20, pitch: 2.5, cutterDia: 15.24 },
      { threadDiameter: 22, pitch: 2.5, cutterDia: 17.272 },
      { threadDiameter: 24, pitch: 1.5, cutterDia: 18.796 },
      { threadDiameter: 24, pitch: 2, cutterDia: 18.796 },
      { threadDiameter: 24, pitch: 2.5, cutterDia: 18.796 },
      { threadDiameter: 27, pitch: 3, cutterDia: 20.828 },
      { threadDiameter: 30, pitch: 3.5, cutterDia: 22.86 },
      { threadDiameter: 33, pitch: 3.5, cutterDia: 24.13 },
      { threadDiameter: 36, pitch: 4, cutterDia: 25.146 },
    ];

    return pitch > 0
      ? data.find((r) => r.threadDiameter >= threadDiameter && r.pitch >= pitch) || data[data.length - 1]
      : data.find((r) => r.threadDiameter >= threadDiameter) || data[data.length - 1];
  }

  getTSlotCutter(slotWidth: number, slotDepth: number, cutterDia?: number, field = '') {
    const data = [
      { id: 1, cutterDia: 9.7, slotWidthFrom: 0.7, slotWidthTo: 1, toolWidth: 0.7, slotDepthFrom: 0, slotDepthTo: 1.5, radialCuttingDepthMax: 1.5, noOfInserts: 3 },
      { id: 2, cutterDia: 9.7, slotWidthFrom: 1, slotWidthTo: 2, toolWidth: 1, slotDepthFrom: 0, slotDepthTo: 1.5, radialCuttingDepthMax: 1.5, noOfInserts: 3 },
      { id: 3, cutterDia: 9.7, slotWidthFrom: 2, slotWidthTo: 1000000, toolWidth: 2, slotDepthFrom: 0, slotDepthTo: 1.5, radialCuttingDepthMax: 1.5, noOfInserts: 3 },
      { id: 4, cutterDia: 11.7, slotWidthFrom: 2.2, slotWidthTo: 1000000, toolWidth: 2.2, slotDepthFrom: 1.5, slotDepthTo: 2.5, radialCuttingDepthMax: 2.5, noOfInserts: 3 },
      { id: 5, cutterDia: 17.7, slotWidthFrom: 1.1, slotWidthTo: 1.5, toolWidth: 1.1, slotDepthFrom: 2.5, slotDepthTo: 3.5, radialCuttingDepthMax: 3.5, noOfInserts: 3 },
      { id: 6, cutterDia: 17.7, slotWidthFrom: 1.5, slotWidthTo: 1000000, toolWidth: 1.5, slotDepthFrom: 2.5, slotDepthTo: 3.5, radialCuttingDepthMax: 3.5, noOfInserts: 6 },
      { id: 7, cutterDia: 21.7, slotWidthFrom: 1, slotWidthTo: 1000000, toolWidth: 1, slotDepthFrom: 3.5, slotDepthTo: 4.5, radialCuttingDepthMax: 4.5, noOfInserts: 3 },
      { id: 8, cutterDia: 21.7, slotWidthFrom: 1, slotWidthTo: 2, toolWidth: 2, slotDepthFrom: 3.5, slotDepthTo: 4.5, radialCuttingDepthMax: 4.5, noOfInserts: 3 },
      { id: 9, cutterDia: 21.7, slotWidthFrom: 2, slotWidthTo: 3, toolWidth: 3, slotDepthFrom: 3.5, slotDepthTo: 4.5, radialCuttingDepthMax: 4.5, noOfInserts: 3 },
      { id: 10, cutterDia: 21.7, slotWidthFrom: 3, slotWidthTo: 4, toolWidth: 4, slotDepthFrom: 3.5, slotDepthTo: 4.5, radialCuttingDepthMax: 4.5, noOfInserts: 3 },
      { id: 11, cutterDia: 27.7, slotWidthFrom: 3, slotWidthTo: 1000000, toolWidth: 3, slotDepthFrom: 3.5, slotDepthTo: 4.5, radialCuttingDepthMax: 4.5, noOfInserts: 6 },
      { id: 12, cutterDia: 34.7, slotWidthFrom: 1.5, slotWidthTo: 2, toolWidth: 1.5, slotDepthFrom: 4.5, slotDepthTo: 10, radialCuttingDepthMax: 10, noOfInserts: 6 },
      { id: 13, cutterDia: 34.7, slotWidthFrom: 2, slotWidthTo: 3, toolWidth: 2, slotDepthFrom: 4.5, slotDepthTo: 10, radialCuttingDepthMax: 10, noOfInserts: 6 },
      { id: 14, cutterDia: 34.7, slotWidthFrom: 3, slotWidthTo: 1000000, toolWidth: 3, slotDepthFrom: 4.5, slotDepthTo: 10, radialCuttingDepthMax: 10, noOfInserts: 6 },
      { id: 15, cutterDia: 40, slotWidthFrom: 6, slotWidthTo: 10, toolWidth: 6, slotDepthFrom: 10, slotDepthTo: 11, radialCuttingDepthMax: 11, noOfInserts: 4 },
      { id: 16, cutterDia: 40, slotWidthFrom: 10, slotWidthTo: 1000000, toolWidth: 10, slotDepthFrom: 10, slotDepthTo: 11, radialCuttingDepthMax: 11, noOfInserts: 4 },
      { id: 17, cutterDia: 50, slotWidthFrom: 6, slotWidthTo: 10, toolWidth: 6, slotDepthFrom: 11, slotDepthTo: 14, radialCuttingDepthMax: 14, noOfInserts: 3 },
      { id: 18, cutterDia: 50, slotWidthFrom: 10, slotWidthTo: 1000000, toolWidth: 10, slotDepthFrom: 11, slotDepthTo: 14, radialCuttingDepthMax: 14, noOfInserts: 3 },
      { id: 19, cutterDia: 80, slotWidthFrom: 6, slotWidthTo: 10, toolWidth: 6, slotDepthFrom: 14, slotDepthTo: 19.5, radialCuttingDepthMax: 19.5, noOfInserts: 3 },
      { id: 20, cutterDia: 80, slotWidthFrom: 10, slotWidthTo: 1000000, toolWidth: 10, slotDepthFrom: 14, slotDepthTo: 19.5, radialCuttingDepthMax: 19.5, noOfInserts: 3 },
      { id: 21, cutterDia: 100, slotWidthFrom: 6, slotWidthTo: 1000000, toolWidth: 6, slotDepthFrom: 19.5, slotDepthTo: 25.5, radialCuttingDepthMax: 25.5, noOfInserts: 5 },
      { id: 22, cutterDia: 200, slotWidthFrom: 8, slotWidthTo: 1000000, toolWidth: 8, slotDepthFrom: 25.5, slotDepthTo: 51, radialCuttingDepthMax: 51, noOfInserts: 8 },
      { id: 23, cutterDia: 304.8, slotWidthFrom: 15, slotWidthTo: 1000000, toolWidth: 15, slotDepthFrom: 51, slotDepthTo: 109.49, radialCuttingDepthMax: 109.49, noOfInserts: 15 },
    ];

    if (field === 'cutterDia' && cutterDia > 0) {
      return data.find((x: any) => x.cutterDia >= cutterDia) || data[data.length - 1];
    }
    return data.find((x) => x.slotDepthFrom < slotDepth && x.slotDepthTo >= slotDepth && x.slotWidthFrom < slotWidth && x.slotWidthTo >= slotWidth) || data[data.length - 1];
  }

  getTSlotTNutCutter(slotWidth: number, slotHeight: number, cutterDia?: number, field = '') {
    const data = [
      { id: 1, slotWidth: 14, slotHeight: 6, cutterDia: 12, toolWidth: 4, noOfInserts: 4 },
      { id: 2, slotWidth: 16, slotHeight: 6, cutterDia: 12, toolWidth: 4, noOfInserts: 4 },
      { id: 3, slotWidth: 16, slotHeight: 6, cutterDia: 12, toolWidth: 4, noOfInserts: 4 },
      { id: 4, slotWidth: 19, slotHeight: 7, cutterDia: 16, toolWidth: 5, noOfInserts: 6 },
      { id: 5, slotWidth: 22, slotHeight: 9, cutterDia: 20, toolWidth: 5, noOfInserts: 6 },
      { id: 6, slotWidth: 22, slotHeight: 9, cutterDia: 20, toolWidth: 5, noOfInserts: 6 },
      { id: 7, slotWidth: 25, slotHeight: 9, cutterDia: 20, toolWidth: 5, noOfInserts: 6 },
      { id: 8, slotWidth: 29, slotHeight: 11, cutterDia: 25, toolWidth: 6, noOfInserts: 8 },
      { id: 9, slotWidth: 29, slotHeight: 11, cutterDia: 25, toolWidth: 6, noOfInserts: 8 },
      { id: 10, slotWidth: 35, slotHeight: 14, cutterDia: 30, toolWidth: 8, noOfInserts: 8 },
      { id: 11, slotWidth: 35, slotHeight: 14, cutterDia: 30, toolWidth: 8, noOfInserts: 8 },
      { id: 12, slotWidth: 41, slotHeight: 18, cutterDia: 35, toolWidth: 10, noOfInserts: 8 },
      { id: 13, slotWidth: 51, slotHeight: 24, cutterDia: 40, toolWidth: 14, noOfInserts: 8 },
    ];

    if (field === 'cutterDia' && cutterDia > 0) {
      return data.find((x: any) => x.cutterDia >= cutterDia) || data[data.length - 1];
    }
    return data.find((x) => x.slotWidth >= slotWidth && x.slotHeight >= slotHeight) || data[data.length - 1];
  }

  getVolumetricMillCutter(inputData: number, field = 'minLength') {
    const data = [
      { id: 1, cutterDia: 1, noOfInserts: 2 },
      { id: 2, cutterDia: 1.5, noOfInserts: 3 },
      { id: 3, cutterDia: 2, noOfInserts: 3 },
      { id: 4, cutterDia: 3, noOfInserts: 3 },
      { id: 5, cutterDia: 4, noOfInserts: 4 },
      { id: 6, cutterDia: 5, noOfInserts: 4 },
      { id: 7, cutterDia: 6, noOfInserts: 4 },
      { id: 8, cutterDia: 8, noOfInserts: 4 },
      { id: 9, cutterDia: 10, noOfInserts: 4 },
      { id: 10, cutterDia: 12, noOfInserts: 4 },
      { id: 11, cutterDia: 14, noOfInserts: 4 },
      { id: 12, cutterDia: 16, noOfInserts: 4 },
      { id: 13, cutterDia: 18, noOfInserts: 4 },
      { id: 14, cutterDia: 20, noOfInserts: 4 },
      { id: 15, cutterDia: 25, noOfInserts: 4 },
    ];

    if (field === 'cutterDia') {
      return data.find((x: any) => x.cutterDia >= inputData) || data[data.length - 1];
    }
    const cutterDia = inputData * 2 - 1;
    const ind = data.findIndex((x: any) => x.cutterDia >= cutterDia);
    const selectedData = ind > 0 ? data[ind - 1] : data[data.length - 1];
    return selectedData;
  }

  getGroovCutter(grooveWidth: number) {
    const grooveCutterList = [
      { grooveWidthMax: 1, insertWidth: 0.5 },
      { grooveWidthMax: 1.5, insertWidth: 1 },
      { grooveWidthMax: 2, insertWidth: 1.5 },
      { grooveWidthMax: 2.5, insertWidth: 2 },
      { grooveWidthMax: 3, insertWidth: 2.5 },
      { grooveWidthMax: 4, insertWidth: 3 },
      { grooveWidthMax: 5, insertWidth: 3 },
      { grooveWidthMax: 6, insertWidth: 4 },
      { grooveWidthMax: 8, insertWidth: 5 },
      { grooveWidthMax: 9, insertWidth: 5 },
      { grooveWidthMax: 10, insertWidth: 6.35 },
      { grooveWidthMax: 11, insertWidth: 6.35 },
      { grooveWidthMax: 12, insertWidth: 6.35 },
      { grooveWidthMax: 13, insertWidth: 8 },
      { grooveWidthMax: 1000000, insertWidth: 8 },
    ];

    return grooveCutterList.find((x) => grooveWidth <= x.grooveWidthMax) || grooveCutterList[grooveCutterList.length - 1];
  }

  getKnurlingCutter(inputData: number) {
    // to implement only after getting the type
    const data = [
      { type: 'Straight', knurDiameter: 100, pitch: 1, factor: 0.35, depth: 0, workpieceInitialDiameter: 0 },
      { type: 'Diagonal', knurDiameter: 100, pitch: 1, factor: 0.35, depth: 0, workpieceInitialDiameter: 0 },
      { type: 'Diamond Male', knurDiameter: 100, pitch: 1, factor: 0.4, depth: 0, workpieceInitialDiameter: 0 },
      { type: 'Diamond Female', knurDiameter: 100, pitch: 1, factor: 0.25, depth: 0, workpieceInitialDiameter: 0 },
      { type: '80° Form', knurDiameter: 100, pitch: 1, factor: 0.48, depth: 0, workpieceInitialDiameter: 0 },
      { type: '70° Form', knurDiameter: 100, pitch: 1, factor: 0.55, depth: 0, workpieceInitialDiameter: 0 },
    ];

    const selected = data.find((x: any) => x.knurDiameter >= inputData) || data[data.length - 1];
    selected.depth = selected.pitch * selected.factor;
    selected.workpieceInitialDiameter = selected.knurDiameter - 2 * selected.depth;
    return selected;
  }

  getEdgeBreakingChamferFillet(inputData: number, field = 'totalDepOfCut') {
    const data = [
      { totalDepthCut: 5, cutterDia: 12, noOfInserts: 4 },
      { totalDepthCut: 7, cutterDia: 16, noOfInserts: 4 },
      { totalDepthCut: 10, cutterDia: 22, noOfInserts: 6 },
    ];

    if (field === 'cutterDia') {
      return data.find((x: any) => x.cutterDia >= inputData) || data[data.length - 1];
    }
    return data.find((x: any) => x.totalDepthCut >= inputData) || data[data.length - 1];
  }

  getDrillingSize(inputData: number) {
    const data = [
      { holeSize: 1, drillSize: 1 },
      { holeSize: 2, drillSize: 2 },
      { holeSize: 3, drillSize: 3 },
      { holeSize: 4, drillSize: 4 },
      { holeSize: 5, drillSize: 5 },
      { holeSize: 6, drillSize: 6 },
      { holeSize: 7, drillSize: 7 },
      { holeSize: 8, drillSize: 8 },
      { holeSize: 9, drillSize: 9 },
      { holeSize: 10, drillSize: 10 },
      { holeSize: 11, drillSize: 11 },
      { holeSize: 12, drillSize: 12 },
      { holeSize: 13, drillSize: 13 },
      { holeSize: 14, drillSize: 14 },
      { holeSize: 15, drillSize: 15 },
      { holeSize: 16, drillSize: 16 },
      { holeSize: 17, drillSize: 17 },
      { holeSize: 18, drillSize: 18 },
      { holeSize: 19, drillSize: 19 },
      { holeSize: 20, drillSize: 20 },
      { holeSize: 21, drillSize: 21 },
      { holeSize: 22, drillSize: 22 },
      { holeSize: 23, drillSize: 23 },
      { holeSize: 24, drillSize: 24 },
      { holeSize: 25, drillSize: 25 },
      { holeSize: 31, drillSize: 24 },
      { holeSize: 39, drillSize: 25 },
      { holeSize: 50, drillSize: 32 },
      { holeSize: 62, drillSize: 49 },
      { holeSize: 100, drillSize: 50 },
      { holeSize: 100000, drillSize: 63 },
    ];
    return data.find((x) => x.holeSize >= inputData) || data[data.length - 1];
  }

  getManufacturingAutomationData(weight: number, countryId: number, volume: number, noOfOperations: number) {
    const toPartWeight = unloadingTimeData.find((item) => item.toPartWeight >= weight)?.toPartWeight || unloadingTimeData[0]?.toPartWeight;
    const processes = unloadingTimeData.find((item) => item.toPartWeight >= weight)?.processes;
    const byRegion = processes?.filter((x) => x.regionIds.includes(countryId) || x.regionIdsOthers.includes(countryId));
    const byVolume = byRegion?.length > 0 ? byRegion?.find((x) => x.toVolume >= volume) : processes?.find((x) => x.toVolume >= volume);

    let selected: any = byVolume ? byVolume : byRegion?.length > 0 ? byRegion[0] : processes?.length > 0 ? processes[0] : unloadingTimeData[0]?.processes[0];
    selected = { ...selected, toPartWeight, setupTimeMins: selected.setupTimeMins + 3 * noOfOperations };
    return selected;
  }

  getMachiningFlags() {
    return {
      isTurning: false,
      isMilling: false,
      isDrilling: false,
      isBoring: false,
      // isGrinding: false,
      isSurfaceGrinding: false,
      isCylindricalGrinding: false,
      isCenterlessGrinding: false,
      isGearCutting: false,
      isGearBroaching: false,
      isGearSplineRolling: false,
      isGearShaving: false,
      isGearGrinding: false,
      isGear: false,
      // isVerticalBoring: false,
    };
  }

  setMachineFlags(workCenterId: number) {
    workCenterId = Number(workCenterId);
    const ret = {
      isTurning: workCenterId === ProcessType.TurningCenter,
      isMilling: workCenterId === ProcessType.MillingCenter,
      isDrilling: workCenterId === ProcessType.DrillingCenter,
      isBoring: workCenterId === ProcessType.Boring,
      // isGrinding: workCenterId===ProcessType.GrindingCenter,
      isSurfaceGrinding: workCenterId === ProcessType.SurfaceGrinding,
      isCylindricalGrinding: workCenterId === ProcessType.CylindricalGrinding,
      isCenterlessGrinding: workCenterId === ProcessType.CenterlessGrinding,
      isGearCutting: workCenterId === ProcessType.GearCutting,
      isGearBroaching: workCenterId === ProcessType.GearBroaching,
      isGearSplineRolling: workCenterId === ProcessType.GearSplineRolling,
      isGearShaving: workCenterId === ProcessType.GearShaving,
      isGearGrinding: workCenterId === ProcessType.GearGrinding,
      isGear: false,
    };
    ret.isGear = ret.isGearCutting || ret.isGearBroaching || ret.isGearSplineRolling || ret.isGearShaving || ret.isGearGrinding;
    return ret;
  }

  getGearCuttingModuleData(module: number) {
    const moduleData = [
      { id: 1, module: 0.5, hobDia: 50 },
      { id: 2, module: 0.75, hobDia: 50 },
      { id: 3, module: 1, hobDia: 50 },
      { id: 4, module: 1.25, hobDia: 50 },
      { id: 5, module: 1.5, hobDia: 56 },
      { id: 6, module: 1.75, hobDia: 56 },
      { id: 7, module: 2, hobDia: 63 },
      { id: 8, module: 2.25, hobDia: 70 },
      { id: 9, module: 2.5, hobDia: 70 },
      { id: 10, module: 2.75, hobDia: 70 },
      { id: 11, module: 3, hobDia: 80 },
      { id: 12, module: 3.25, hobDia: 80 },
      { id: 13, module: 3.5, hobDia: 80 },
      { id: 14, module: 3.75, hobDia: 90 },
      { id: 15, module: 4, hobDia: 90 },
      { id: 16, module: 4.5, hobDia: 90 },
      { id: 17, module: 5, hobDia: 100 },
      { id: 18, module: 5.5, hobDia: 100 },
      { id: 19, module: 6, hobDia: 115 },
      { id: 20, module: 6.5, hobDia: 115 },
      { id: 21, module: 7, hobDia: 115 },
      { id: 22, module: 8, hobDia: 125 },
      { id: 23, module: 9, hobDia: 125 },
      { id: 24, module: 10, hobDia: 140 },
    ];
    return moduleData.find((x) => x.module >= module)?.hobDia || moduleData[0].hobDia;
  }

  getGearBroachingModuleData(rootDiameter: number) {
    const rootData = [
      { id: 1, rootDiaFrom: 0, rootDiaTo: 30, approach: 200 },
      { id: 2, rootDiaFrom: 30.01, rootDiaTo: 60, approach: 250 },
    ];
    return rootData.find((x) => x.rootDiaFrom <= rootDiameter && x.rootDiaTo >= rootDiameter)?.approach || rootData[rootData.length - 1].approach;
  }

  getGearCuttingSpeedFeed() {
    // for carbon steel low
    return { cs: 75, feed: 2.5 };
  }
  getGearBroachingFeed() {
    // for carbon steel low
    return { feed: 600 };
  }
  getGearSplineRollingCuttingSpeed() {
    // for carbon steel low
    return { cs: 75 };
  }
  getGearShavingCuttingSpeedFeedDepth() {
    // for carbon steel low
    return {
      semiFinishCS: 250,
      finishCS: 280,
      semiFinishFeed: 3,
      finishFeed: 2.5,
      semiFinishDepth: 0.5,
      finishDepth: 0.1,
    };
  }
  getGearGrindingCuttingSpeedFeedDepth() {
    // for carbon steel low
    return {
      semiFinishCS: 70,
      finishCS: 75,
      semiFinishFeed: 3,
      finishFeed: 2.5,
      semiFinishDepth: 0.25,
      finishDepth: 0.1,
    };
  }

  getNoOfPassesGearCutting(lengthOfCut) {
    const vals = [
      { noPass: 3, len: 8 },
      { noPass: 2, len: 3.5 },
      { noPass: 1, len: 0 },
    ];
    return vals.find((x) => x.len <= lengthOfCut)?.noPass || 1;
  }

  getHandlingTimeGear(netWeight) {
    const vals = [
      { time: 0.3, weight: 0.5 },
      { time: 0.5, weight: 1 },
      { time: 1, weight: 2 },
      { time: 2, weight: 5 },
    ];
    return vals.find((x) => x.weight > netWeight)?.time || 0.5;
  }

  getMachiningFeatureList(processTypeId: number, fd: any = null): any[] {
    let operationsMappingList = [];
    if (processTypeId === ProcessType.TurningCenter) {
      // if (fd?.diameter > 10) {
      //   // include drilling when diameter > 10
      //   boringOperationTypes.unshift(TurningTypes.Drilling);
      // }

      if (fd?.width >= 25 && fd?.length >= 25) {
        operationsMappingList.push({ featureName: 'Flat Milled Face', operationTypes: [TurningTypes.FaceMillingRoughing, TurningTypes.FaceMillingFinishing] });
      } else if (fd?.width < 25) {
        operationsMappingList.push({ featureName: 'Flat Milled Face', operationTypes: [TurningTypes.EndMillingRoughing, TurningTypes.EndMillingFinishing] });
      } else if (fd?.length < 25) {
        operationsMappingList.push({ featureName: 'Flat Milled Face', operationTypes: [TurningTypes.SideMillingRoughing, TurningTypes.SideMillingFinishing] });
      }

      return operationsMappingList.concat([
        { featureName: 'Turn Diameter Face', operationTypes: [TurningTypes.TurningODRoughing, TurningTypes.TurningODFinishing] },
        { featureName: 'Turn Face Face', operationTypes: [TurningTypes.FacingRoughing, TurningTypes.FacingFinishing] },
        { featureName: 'Turn Taper Diameter Face', operationTypes: [TurningTypes.TaperTurningRoughing, TurningTypes.TaperTurningFinishing] },
        { featureName: 'Turn Chamfer Diameter Face', operationTypes: [TurningTypes.TaperTurningRoughing, TurningTypes.TaperTurningFinishing] },
        { featureName: 'Drill Diameter Face', operationTypes: [TurningTypes.Drilling] },
        // { featureName: 'Closed Pockets', operationTypes: [TurningTypes.VolumetricMillingRoughing, TurningTypes.VolumetricMillingFinishing] },
        { featureName: 'Closed Pocket', operationTypes: [TurningTypes.LinearPocketRoughing, TurningTypes.LinearPocketFinishing] },
        { featureName: 'Turn OD Groove', operationTypes: [TurningTypes.ODGrooving] },
        { featureName: 'Circuler Side Milled Face', operationTypes: [TurningTypes.Drilling, TurningTypes.CircularPocketRoughing, TurningTypes.CircularPocketFinishing] },
        { featureName: 'Bore Diameter Face', operationTypes: [TurningTypes.TurningIDRoughing, TurningTypes.TurningIDFinishing] },
        { featureName: 'Open Pocket', operationTypes: [TurningTypes.SlotMillingRoughing, TurningTypes.SlotMillingFinishing] },
        { featureName: 'Drill Diameter', operationTypes: [TurningTypes.Drilling, TurningTypes.PeckDrilling] },
        // { featureName: 'Stepped Hole', operationTypes: [TurningTypes.SpotFaceMilling] },
        { featureName: 'Boss', operationTypes: [TurningTypes.CircularBossRoughing, TurningTypes.CircularBossFinishing] },
        { featureName: 'Convex Profile Edge Side Milling Face', operationTypes: [TurningTypes.EdgeBreakingChamferFillet] },
        { featureName: 'End Face Groove', operationTypes: [TurningTypes.FaceGrooving] },
        { featureName: 'Turn ID Groove', operationTypes: [TurningTypes.IdGrooving] },
        { featureName: 'Countersink', operationTypes: [TurningTypes.CounterSinking] },
        { featureName: 'Counterbore', operationTypes: [TurningTypes.SpotFaceMilling] },
        { featureName: 'Fillet', operationTypes: [TurningTypes.TaperTurningRoughing, TurningTypes.TaperTurningFinishing] },
        { featureName: 'Chamfer', operationTypes: [TurningTypes.TaperTurningRoughing, TurningTypes.TaperTurningFinishing] },
        { featureName: 'Turn Fillet Face', operationTypes: [TurningTypes.TaperTurningRoughing, TurningTypes.TaperTurningFinishing] },
      ]);
    } else if (processTypeId === ProcessType.MillingCenter) {
      return operationsMappingList.concat([
        { featureName: 'Flat Milled Face', operationTypes: [MillingTypes.FaceMillingRoughing, MillingTypes.FaceMillingFinishing] },
        { featureName: 'Open Pocket', operationTypes: [MillingTypes.LinearPocketRoughing, MillingTypes.LinearPocketFinishing] },
        { featureName: 'Closed Pocket', operationTypes: [MillingTypes.LinearPocketRoughing, MillingTypes.LinearPocketFinishing] },
        { featureName: 'Through Pocket', operationTypes: [MillingTypes.LinearPocketRoughing, MillingTypes.LinearPocketFinishing] },
        { featureName: 'Through Hole', operationTypes: [MillingTypes.Drilling] },
        { featureName: 'Counterbore', operationTypes: [MillingTypes.SpotFaceMilling] },
        { featureName: 'Blind Hole', operationTypes: [MillingTypes.Drilling] },
        { featureName: 'Countersink', operationTypes: [MillingTypes.CounterSinking] },
        { featureName: 'Countersink Through Hole', operationTypes: [MillingTypes.Drilling] },
        { featureName: 'Through Bore', operationTypes: [MillingTypes.BoringRoughing, MillingTypes.BoringFinishing] },
        { featureName: 'Concave Fillet Edge Side Milling Face', operationTypes: [MillingTypes.SideMillingRoughing, MillingTypes.SideMillingFinishing] },
      ]);
    }
    return [];
  }

  // getDefaultMachiningOperationFormFields(processTypeID: number, operationTypeId: number, fd: any = null, commodityId: number, extractedMaterialData: any) {
  //   const diameter = fd?.radius ? fd.radius * 2 : fd?.diameter || 0;
  //   const length = fd?.length ?? (fd?.depth || 0);
  //   const depth = fd?.depth || 0;
  //   const maxDia = fd?.maxdaimeter || 0;
  //   const minDia = fd?.mindaimeter || 0;
  //   const width = fd?.width || 0;
  //   const featureId = fd?.id || 0;
  //   const stockDia = extractedMaterialData?.StockDiameter || 0;
  //   let returnObj: any = {
  //     featureId: featureId,
  //   };
  //   if (ProcessType.TurningCenter === processTypeID) {
  //     // if (operationTypeId === TurningTypes.TurningODRoughing) {
  //     //   returnObj = {
  //     //     ...returnObj,
  //     //     workpieceInitialDia: stockDia,
  //     //     workpieceFinalDia: diameter > 0 ? diameter + 0.3 : 0,
  //     //     lengthOfCut: length,
  //     //   };
  //     // } else if (operationTypeId === TurningTypes.TurningODFinishing) {
  //     //   returnObj = {
  //     //     ...returnObj,
  //     //     workpieceInitialDia: diameter > 0 ? diameter + 0.3 : 0,
  //     //     workpieceFinalDia: diameter,
  //     //     lengthOfCut: length,
  //     //   };
  //     // } else
  //     if (operationTypeId === TurningTypes.TaperTurningRoughing) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: maxDia > 0 ? maxDia + 0.3 : 0,
  //         workpieceFinalDia: minDia > 0 ? minDia + 0.3 : 0,
  //         lengthOfCut: length,
  //       };
  //     } else if (operationTypeId === TurningTypes.TaperTurningFinishing) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: maxDia > 0 ? maxDia + 0.3 : 0,
  //         workpieceFinalDia: minDia,
  //         lengthOfCut: length,
  //       };
  //     } else if (operationTypeId === TurningTypes.FacingRoughing) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: stockDia,
  //         workpieceFinalDia: minDia,
  //         // lengthOfCut: length,
  //       };
  //     } else if (operationTypeId === TurningTypes.FacingFinishing) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: stockDia,
  //         workpieceFinalDia: minDia,
  //         // lengthOfCut: length,
  //       };
  //     } else if (operationTypeId === TurningTypes.BoringRoughing) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: 10,
  //         workpieceFinalDia: diameter > 0 ? diameter - 0.4 : 0,
  //         lengthOfCut: length,
  //       };
  //     } else if (operationTypeId === TurningTypes.BoringFinishing) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: diameter > 0 ? diameter - 0.4 : 0,
  //         workpieceFinalDia: diameter,
  //         lengthOfCut: length,
  //       };
  //       // } else if ([TurningTypes.TurningODRoughing, TurningTypes.TurningODFinishing].includes(operationTypeId)) {
  //       //     if (commodityId === CommodityType.Casting) {
  //       //         returnObj = {
  //       //              ...returnObj,
  //       //             finalGrooveDia: diameter,
  //       //             lengthOfCut: length,
  //       //             workpieceInitialDia: 0,
  //       //             // totalDepOfCut: 2,
  //       //             // noOfPasses: 1
  //       //         };
  //       //     } else { //machining
  //       //         returnObj = {
  //       //              ...returnObj,
  //       //             // finalGrooveDia: diameter,
  //       //             lengthOfCut: length,
  //       //             workpieceInitialDia: stockDia,
  //       //             workpieceFinalDia: diameter,
  //       //             // totalDepOfCut: 2,
  //       //             // noOfPasses: 1
  //       //         };
  //       //     }
  //       // } else if ([TurningTypes.FacingRoughing, TurningTypes.FacingFinishing].includes(operationTypeId)) {
  //       //     if (commodityId === CommodityType.Casting) {
  //       //         returnObj = {
  //       //              ...returnObj,
  //       //             workpieceInitialDia: maxDia,
  //       //             workpieceFinalDia: minDia,
  //       //         };
  //       //     } else { //machining
  //       //         returnObj = {
  //       //              ...returnObj,
  //       //             workpieceInitialDia: stockDia,
  //       //             workpieceFinalDia: 0,
  //       //         };
  //       //     }
  //     } else if (operationTypeId === TurningTypes.ODGrooving) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: diameter + depth * 2,
  //         workpieceFinalDia: diameter,
  //         totalDepOfCut: width,
  //       };
  //     } else if (operationTypeId === TurningTypes.IdGrooving) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: diameter - depth * 2,
  //         workpieceFinalDia: diameter,
  //         totalDepOfCut: width,
  //       };
  //     } else if (operationTypeId === TurningTypes.Parting) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: stockDia,
  //         workpieceFinalDia: 0,
  //       };
  //     } else if (operationTypeId === TurningTypes.Drilling) {
  //       returnObj = {
  //         ...returnObj,
  //         workpieceInitialDia: diameter > 10 ? 10 : diameter, // > 10 means boaring is applicable
  //         lengthOfCut: length,
  //       };
  //     }
  //   }
  //   return returnObj;
  // }

  getMachiningOperationFormFields(selectedProcessInfoId: number) {
    return {
      operationName: '',
      featureId: '',
      subProcessInfoId: 0,
      operationTypeId: 0,
      processInfoId: selectedProcessInfoId || 0,
      subProcessTypeId: 0,
      diameterOfDrill: 0,
      depthOfDrill: 0,
      noOfPasses: 0,
      noOfHoles: 0,
      noOfMultiples: 0,
      cuttingTime: 0,
      cycleTime: 0,
      workpieceInitialDia: 0,
      workpieceFinalDia: 0,
      lengthOfCut: 0,
      workpieceOuterDia: 0,
      workpieceInnerDia: 0,
      partInitialDia: 0,
      finalGrooveDia: 0,
      widthOfCut: 0,
      totalDepOfCut: 0,
      minLength: 0,
      totalNoOfPasses: 0,
      wheelDiameter: 0,
      wheelWidth: 0,
      cutterDia: 0,
      noOfToolInserts: 0,
      surfaceArea: 0,
      volume: 0,
      fluteLength: 0,
      noOfFlutes: 0,
      noOfTeeth: 0,
      pitchDiameter: 0,
      outerDiameter: 0,
      rootDiameter: 0,
      pressureAngle: 0,
      helixAngle: 0,
      finishCutMatAllowance: 0,
      hobDiameter: 0,
      noOfStarts: 0,
      spiralAngle: 0,
      hobspeedRoughing: 0,
      hobspeedFinishing: 0,
      gearAddendum: 0,
      toothDepth: 0,
      depthOfCutRoughing: 0,
      depthOfCutFinishing: 0,
      hobApproachRoughing: 0,
      hobApproachFinishing: 0,
      hobOverrun: 0,
      totalHobRoughing: 0,
      totalHobFinishing: 0,
      cuttingSpeed: 0,
      feed: 0,
      depthOfCut: 0,

      isCounterSinking: false,
      isStepDrilling: false,
      isReaming: false,
      isTapping: false,
      isDrilling: false,
      isPeckDrilling: false,
      isKnurling: false,
      isFaceMillingRoughing: false,
      isFaceMillingFinishing: false,
      isSlotMillingRoughing: false,
      isSlotMillingFinishing: false,
      isEndMillingRoughing: false,
      isEndMillingFinishing: false,
      isSideMillingRoughing: false,
      isSideMillingFinishing: false,
      isLinearPocketRoughing: false,
      isLinearPocketFinishing: false,
      isCircularPocketRoughing: false,
      isCircularPocketFinishing: false,
      isCircularBossRoughing: false,
      isCircularBossFinishing: false,
      isVolumetricMillingRoughing: false,
      isVolumetricMillingFinishing: false,
      isEdgeBreakingChamferFillet: false,
      isThreadMilling: false,
      isSpotFaceMilling: false,
      isTrepanning: false,
      isTslot: false,
      isTslotTnut: false,
      isTurningODRoughing: false,
      isTurningODFinishing: false,
      isTurningIDRoughing: false,
      isTurningIDFinishing: false,
      isTaperTurningRoughing: false,
      isTaperTurningFinishing: false,
      isBoringRoughing: false,
      isBoringFinishing: false,
      isFacingRoughing: false,
      isFacingFinishing: false,
      isParting: false,
      isODGrooving: false,
      isIdGrooving: false,
      isFaceGrooving: false,
      isThreadCutting: false,
      isSurfaceGrindingRoughing: false,
      isSurfaceGrindingFinishing: false,
      isCylindricalGrindingRoughing: false,
      isCylindricalGrindingFinishing: false,
      isCenterlessGrindingRoughing: false,
      isCenterlessGrindingFinishing: false,
      isTaperBoringRoughing: false,
      isTaperBoringFinishing: false,
      isGearCuttingHobbing: false,
      isBroaching: false,
      isSplineForming: false,
      isShavingSemiFinish: false,
      isShavingFinish: false,
      isGearGrindingSemiFinish: false,
      isGearGrindingFinish: false,
    };
  }

  getOperationFlags(workCenter, operationType) {
    let operationFlags = {};
    workCenter = Number(workCenter);
    operationType = Number(operationType);
    if (ProcessType.TurningCenter === workCenter) {
      operationFlags = {
        isFacingRoughing: operationType === TurningTypes.FacingRoughing,
        isFacingFinishing: operationType === TurningTypes.FacingFinishing,
        isTurningODRoughing: operationType === TurningTypes.TurningODRoughing,
        isTurningODFinishing: operationType === TurningTypes.TurningODFinishing,
        isTaperTurningRoughing: operationType === TurningTypes.TaperTurningRoughing,
        isTaperTurningFinishing: operationType === TurningTypes.TaperTurningFinishing,
        isTurningIDRoughing: operationType === TurningTypes.TurningIDRoughing,
        isTurningIDFinishing: operationType === TurningTypes.TurningIDFinishing,
        isParting: operationType === TurningTypes.Parting,
        isODGrooving: operationType === TurningTypes.ODGrooving,
        isIdGrooving: operationType === TurningTypes.IdGrooving,
        isFaceGrooving: operationType === TurningTypes.FaceGrooving,
        isThreadCutting: operationType === TurningTypes.ThreadCutting,
        isKnurling: operationType === TurningTypes.Knurling,
        isFaceMillingRoughing: operationType === TurningTypes.FaceMillingRoughing,
        isFaceMillingFinishing: operationType === TurningTypes.FaceMillingFinishing,
        isSlotMillingRoughing: operationType === TurningTypes.SlotMillingRoughing,
        isSlotMillingFinishing: operationType === TurningTypes.SlotMillingFinishing,
        isEndMillingRoughing: operationType === TurningTypes.EndMillingRoughing,
        isEndMillingFinishing: operationType === TurningTypes.EndMillingFinishing,
        isLinearPocketRoughing: operationType === TurningTypes.LinearPocketRoughing,
        isLinearPocketFinishing: operationType === TurningTypes.LinearPocketFinishing,
        isCircularPocketRoughing: operationType === TurningTypes.CircularPocketRoughing,
        isCircularPocketFinishing: operationType === TurningTypes.CircularPocketFinishing,
        isCircularBossRoughing: operationType === TurningTypes.CircularBossRoughing,
        isCircularBossFinishing: operationType === TurningTypes.CircularBossFinishing,
        isSideMillingRoughing: operationType === TurningTypes.SideMillingRoughing,
        isSideMillingFinishing: operationType === TurningTypes.SideMillingFinishing,
        isThreadMilling: operationType === TurningTypes.ThreadMilling,
        isSpotFaceMilling: operationType === TurningTypes.SpotFaceMilling,
        isDrilling: operationType === TurningTypes.Drilling,
        isPeckDrilling: operationType === TurningTypes.PeckDrilling,
        isReaming: operationType === TurningTypes.Reaming,
        isTapping: operationType === TurningTypes.Tapping,
        isCounterSinking: operationType === TurningTypes.CounterSinking,
        isBoringRoughing: operationType === TurningTypes.BoringRoughing,
        isBoringFinishing: operationType === TurningTypes.BoringFinishing,
        isTslot: operationType === TurningTypes.TSlot,
        isVolumetricMillingRoughing: operationType === TurningTypes.VolumetricMillingRoughing,
        isVolumetricMillingFinishing: operationType === TurningTypes.VolumetricMillingFinishing,
        isEdgeBreakingChamferFillet: operationType === TurningTypes.EdgeBreakingChamferFillet,
      };
    } else if (ProcessType.MillingCenter === workCenter) {
      operationFlags = {
        isFaceMillingRoughing: operationType === MillingTypes.FaceMillingRoughing,
        isFaceMillingFinishing: operationType === MillingTypes.FaceMillingFinishing,
        isSlotMillingRoughing: operationType === MillingTypes.SlotMillingRoughing,
        isSlotMillingFinishing: operationType === MillingTypes.SlotMillingFinishing,
        isEndMillingRoughing: operationType === MillingTypes.EndMillingRoughing,
        isEndMillingFinishing: operationType === MillingTypes.EndMillingFinishing,
        isLinearPocketRoughing: operationType === MillingTypes.LinearPocketRoughing,
        isLinearPocketFinishing: operationType === MillingTypes.LinearPocketFinishing,
        isCircularPocketRoughing: operationType === MillingTypes.CircularPocketRoughing,
        isCircularPocketFinishing: operationType === MillingTypes.CircularPocketFinishing,
        isCircularBossRoughing: operationType === MillingTypes.CircularBossRoughing,
        isCircularBossFinishing: operationType === MillingTypes.CircularBossFinishing,
        isVolumetricMillingRoughing: operationType === MillingTypes.VolumetricMillingRoughing,
        isVolumetricMillingFinishing: operationType === MillingTypes.VolumetricMillingFinishing,
        isSideMillingRoughing: operationType === MillingTypes.SideMillingRoughing,
        isSideMillingFinishing: operationType === MillingTypes.SideMillingFinishing,
        isThreadMilling: operationType === MillingTypes.ThreadMilling,
        isSpotFaceMilling: operationType === MillingTypes.SpotFaceMilling,
        isDrilling: operationType === MillingTypes.Drilling,
        isPeckDrilling: operationType === MillingTypes.PeckDrilling,
        isReaming: operationType === MillingTypes.Reaming,
        isTapping: operationType === MillingTypes.Tapping,
        isCounterSinking: operationType === MillingTypes.CounterSinking,
        isBoringRoughing: operationType === MillingTypes.BoringRoughing,
        isBoringFinishing: operationType === MillingTypes.BoringFinishing,
        isTrepanning: operationType === MillingTypes.Trepanning,
        isTslotTnut: operationType === MillingTypes.TSlotTNut,
        isTslot: operationType === MillingTypes.TSlot,
        isEdgeBreakingChamferFillet: operationType === MillingTypes.EdgeBreakingChamferFillet,
      };
    } else if (ProcessType.DrillingCenter === workCenter) {
      operationFlags = {
        isDrilling: operationType === DrillingTypes.Drilling,
        isTapping: operationType === DrillingTypes.Tapping,
      };
    } else if (ProcessType.Boring === workCenter) {
      operationFlags = {
        isBoringRoughing: operationType === BoringOperationTypes.BoringRoughing,
        isBoringFinishing: operationType === BoringOperationTypes.BoringFinishing,
      };
    } else if (ProcessType.SurfaceGrinding === workCenter) {
      operationFlags = {
        isSurfaceGrindingRoughing: operationType === GrindingOperationTypes.SurfaceGrindingRoughing,
        isSurfaceGrindingFinishing: operationType === GrindingOperationTypes.SurfaceGrindingFinishing,
      };
    } else if (ProcessType.CylindricalGrinding === workCenter) {
      operationFlags = {
        isCylindricalGrindingFinishing: operationType === GrindingOperationTypes.CylindricalGrindingFinishing,
        isCylindricalGrindingRoughing: operationType === GrindingOperationTypes.CylindricalGrindingRoughing,
      };
    } else if (ProcessType.CenterlessGrinding === workCenter) {
      operationFlags = {
        isCenterlessGrindingFinishing: operationType === GrindingOperationTypes.CenterlessGrindingFinishing,
        isCenterlessGrindingRoughing: operationType === GrindingOperationTypes.CenterlessGrindingRoughing,
      };
    } else if (ProcessType.GearCutting === workCenter) {
      operationFlags = {
        isGearCuttingHobbing: operationType === GearCuttingOperationTypes.GearCuttingHobby,
      };
    } else if (ProcessType.GearBroaching === workCenter) {
      operationFlags = {
        isBroaching: operationType === GearBroachingOperationTypes.Broaching,
      };
    } else if (ProcessType.GearSplineRolling === workCenter) {
      operationFlags = {
        isSplineForming: operationType === GearSplineRollingOperationTypes.SplineForming,
      };
    } else if (ProcessType.GearShaving === workCenter) {
      operationFlags = {
        isShavingSemiFinish: operationType === GearShavingOperationTypes.GearShavingSemiFinish,
        isShavingFinish: operationType === GearShavingOperationTypes.GearShavingFinish,
      };
    } else if (ProcessType.GearGrinding === workCenter) {
      operationFlags = {
        isGearGrindingSemiFinish: operationType === GearGrindingOperationTypes.GearGrindingSemiFinish,
        isGearGrindingFinish: operationType === GearGrindingOperationTypes.GearGrindingFinish,
      };
    }

    return {
      isCounterSinking: operationType === DrillingTypes.CounterSinking && workCenter === ProcessType.DrillingCenter,
      isStepDrilling: operationType === DrillingTypes.StepDrilling && workCenter === ProcessType.DrillingCenter,
      ...operationFlags,
      isTaperBoringRoughing: operationType === BoringOperationTypes.TaperBoringRoughing && workCenter === ProcessType.Boring,
      isTaperBoringFinishing: operationType === BoringOperationTypes.TaperBoringFinishing && workCenter === ProcessType.Boring,
    };
  }

  // convertUomInUI(value: number) {
  //     return this.sharedService.convertUomInUI(value, this.conversionValue, this.isEnableUnitConversion);
  // }

  // convertUomToSaveAndCalculation(value: number) {
  //     return this.sharedService.convertUomToSaveAndCalculation(value, this.conversionValue, this.isEnableUnitConversion);
  // }

  // defaultReturn(value: number) {
  //     return value;
  // }

  setMachiningSubProcess(selectedProcessInfoId, info, conversionValue, isEnableUnitConversion, fn = 'defaultReturn') {
    this.conversionValue = conversionValue;
    this.isEnableUnitConversion = isEnableUnitConversion;
    return {
      processInfoId: this.sharedService.isValidNumber(selectedProcessInfoId),
      operationTypeId: info.operationTypeId,
      operationName: info.operationName,
      featureId: info.featureId,
      subProcessTypeId: this.sharedService.isValidNumber(info.subProcessTypeId),
      lengthOfCut: this.sharedService[fn](this.sharedService.isValidNumber(info.lengthOfCut)),
      diameterOfDrill: this.sharedService[fn](this.sharedService.isValidNumber(info.diameterOfDrill)),
      depthOfDrill: this.sharedService[fn](this.sharedService.isValidNumber(info.depthOfDrill)),
      noOfPasses: this.sharedService.isValidNumber(info.noOfPasses),
      noOfHoles: this.sharedService.isValidNumber(info.noOfHoles),
      noOfMultiples: this.sharedService.isValidNumber(info.noOfMultiples),
      cuttingTime: this.sharedService.isValidNumber(info.cuttingTime),
      cycleTime: this.sharedService.isValidNumber(info.cycleTime),
      workpieceInitialDia: this.sharedService[fn](this.sharedService.isValidNumber(info.workpieceInitialDia)),
      workpieceFinalDia: this.sharedService[fn](this.sharedService.isValidNumber(info.workpieceFinalDia)),
      workpieceOuterDia: this.sharedService[fn](this.sharedService.isValidNumber(info.workpieceOuterDia)),
      workpieceInnerDia: this.sharedService[fn](this.sharedService.isValidNumber(info.workpieceInnerDia)),
      partInitialDia: this.sharedService[fn](this.sharedService.isValidNumber(info.partInitialDia)),
      finalGrooveDia: this.sharedService[fn](this.sharedService.isValidNumber(info.finalGrooveDia)),
      widthOfCut: this.sharedService[fn](this.sharedService.isValidNumber(info.widthOfCut)),
      totalDepOfCut: this.sharedService[fn](this.sharedService.isValidNumber(info.totalDepOfCut)),
      minLength: this.sharedService[fn](this.sharedService.isValidNumber(info.minLength)),
      totalNoOfPasses: this.sharedService.isValidNumber(info.totalNoOfPasses),
      wheelDiameter: this.sharedService[fn](this.sharedService.isValidNumber(info.wheelDiameter)),
      wheelWidth: this.sharedService[fn](this.sharedService.isValidNumber(info.wheelWidth)),
      cutterDia: this.sharedService[fn](this.sharedService.isValidNumber(info.cutterDia)),
      noOfToolInserts: this.sharedService.isValidNumber(info.noOfToolInserts),
      surfaceArea: this.sharedService[fn](this.sharedService.isValidNumber(info.surfaceArea)),
      volume: this.sharedService[fn](this.sharedService.isValidNumber(info.volume)),
      noOfFlutes: this.sharedService[fn](this.sharedService.isValidNumber(info.noOfFlutes)),
      fluteLength: this.sharedService[fn](this.sharedService.isValidNumber(info.fluteLength)),
      noOfTeeth: this.sharedService.isValidNumber(info.noOfTeeth),
      pitchDiameter: this.sharedService[fn](this.sharedService.isValidNumber(info.pitchDiameter)),
      outerDiameter: this.sharedService[fn](this.sharedService.isValidNumber(info.outerDiameter)),
      rootDiameter: this.sharedService[fn](this.sharedService.isValidNumber(info.rootDiameter)),
      pressureAngle: this.sharedService.isValidNumber(info.pressureAngle),
      helixAngle: this.sharedService.isValidNumber(info.helixAngle),
      finishCutMatAllowance: this.sharedService[fn](this.sharedService.isValidNumber(info.finishCutMatAllowance)),
      hobDiameter: this.sharedService[fn](this.sharedService.isValidNumber(info.hobDiameter)),
      noOfStarts: this.sharedService.isValidNumber(info.noOfStarts),
      spiralAngle: this.sharedService.isValidNumber(info.spiralAngle),
      hobspeedRoughing: this.sharedService.isValidNumber(info.hobspeedRoughing),
      hobspeedFinishing: this.sharedService.isValidNumber(info.hobspeedFinishing),
      gearAddendum: this.sharedService.isValidNumber(info.gearAddendum),
      toothDepth: this.sharedService.isValidNumber(info.toothDepth),
      depthOfCutRoughing: this.sharedService.isValidNumber(info.depthOfCutRoughing),
      depthOfCutFinishing: this.sharedService.isValidNumber(info.depthOfCutFinishing),
      hobApproachRoughing: this.sharedService.isValidNumber(info.hobApproachRoughing),
      hobApproachFinishing: this.sharedService.isValidNumber(info.hobApproachFinishing),
      hobOverrun: this.sharedService.isValidNumber(info.hobOverrun),
      totalHobRoughing: this.sharedService.isValidNumber(info.totalHobRoughing),
      totalHobFinishing: this.sharedService.isValidNumber(info.totalHobFinishing),
      cuttingSpeed: this.sharedService.isValidNumber(info.cuttingSpeed),
      feed: this.sharedService.isValidNumber(info.feed),
      depthOfCut: this.sharedService.isValidNumber(info.depthOfCut),
    };
  }

  getAxisCount(featureData: any): number {
    return (
      featureData
        ?.reduce(
          (axis: number[], feature: any) => {
            feature?.axis?.forEach((element: number, i: number) => {
              if (element !== 0) {
                axis[i] = 1;
              }
            });
            return axis;
          },
          [0, 0, 0]
        )
        .reduce((sum: number, val: number) => sum + val, 0) || 0
    );
  }

  // getMachiningFormFields() {
  //     return {
  //         directTooling: [0],
  //         unloadingTime: 0,
  //         directProcessCost: [0, [Validators.required]],
  //         machiningOperationType: this.formbuilder.array([]),
  //     };
  // }

  // manufacturingMachiningFormReset(conversionValue, isEnableUnitConversion) {
  //     return {
  //         directTooling: 0,
  //         unloadingTime: 0,
  //         directProcessCost: 0
  //     };
  // }

  // manufacturingMachiningFormPatch(obj: ProcessInfoDto) {
  //     return {
  //         directTooling: this.sharedService.isValidNumber(obj.directTooling),
  //         unloadingTime: obj.unloadingTime || 0,
  //         directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost)
  //     };
  // }

  // manufacturingMachiningFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
  //     manufactureInfo.directTooling = formCtrl['directTooling'].value;
  //     manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value;
  // }

  // manufacturingMachiningDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
  //     manufactureInfo.isDirectToolingDirty = formCtrl['directTooling'].dirty;
  //     manufactureInfo.isUnloadingTimeDirty = formCtrl['unloadingTime'].dirty;
  // }

  // manufacturingMachiningFormPatchResults(result: ProcessInfoDto) {
  //     return {
  //         directTooling: this.sharedService.isValidNumber(result.directTooling),
  //         unloadingTime: this.sharedService.isValidNumber(result.unloadingTime),
  //         directProcessCost: this.sharedService.isValidNumber(result.directProcessCost)
  //     };
  // }

  // manufacturingMachiningFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
  //     // const model = new ProcessInfoDto();
  //     // model.directTooling = formCtrl['directTooling'].value || 0;
  //     // model.unloadingTime = formCtrl['unloadingTime'].value || 0;
  //     // model.directProcessCost = formCtrl['directProcessCost'].value || 0;
  //     // return model;
  //     return {
  //         directTooling: formCtrl['directTooling'].value,
  //         unloadingTime: formCtrl['unloadingTime'].value,
  //         directProcessCost: formCtrl['directProcessCost'].value
  //     };
  // }
}

// export enum WorkCenters {
//     DrillingCenter = 1,
//     VMCMillingCenter = 2,
//     CNCTurningCenter = 3,
//     GrindingCenter = 4,
//     GearCutting = 5,
//     BoringCenter = 6,
//     VerticalBoringCenter = 7
// }
