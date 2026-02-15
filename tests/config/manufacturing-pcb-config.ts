import { ProcessType } from 'src/app/modules/costing/costing.config';


export class ManufacturingPCBConfigService {
  getSubProcessList(processId: number, surfaceFinishType: number = 0, routingScoring: number = 0) {
    let list: any[] = [];
    if (processId === ProcessType.InnerLayer) {
      list = [
        { id: 1, name: 'Pre-Treatment', automate: true, machineName: 'Pretreatment_CHEMSTAR' },
        { id: 2, name: 'Coating/Dry Film Lamination', automate: true, machineName: 'DFL_Hakuto MACH 610V' },
        { id: 3, name: 'Automatic exposure', automate: true, machineName: 'Exposure_Orbotech LDI Paragon 8800HI' },
        { id: 4, name: 'DES', automate: true, machineName: 'DES_WISE DES horizontal line' },
        { id: 5, name: 'AOI-Scanning', automate: true, machineName: 'AOI_ORBOTECH DSV 8800 AOI' },
        //{ id: 6, name: 'AOI-Verification', automate: true, machineName: 'AOI_ORBOTECH DSV 8800 AOI' },
      ];
    } else if (processId === ProcessType.LaminationBonding) {
      list = [
        { id: 1, name: 'CCD Target Drill', automate: true, machineName: 'Schmoll' },
        { id: 2, name: 'Brown oxidization line', automate: true, machineName: 'BOL_Ninomiya system' },
        { id: 3, name: 'PP Cutting', automate: true, machineName: 'PPCM_CQ2000' },
        { id: 4, name: 'Rivet', automate: true, machineName: 'Rivet_Rivet' },
        { id: 5, name: 'Press', automate: true, machineName: 'HYDRAULIC MULTILAYER VACUUM PRESS MACHINE' },
        { id: 6, name: 'Edge routing', automate: false },
      ];
    } else if (processId === ProcessType.PCBDrilling) {
      list = [
        { id: 1, name: 'X-Ray drilling and inspection', automate: true, machineName: 'XRC' },
        { id: 2, name: 'TH-Drilling', automate: true, machineName: 'Pluritec GIGA 8888' },
      ];
    } else if (processId === ProcessType.PCBPlating) {
      list = [
        { id: 1, name: 'PLATING - PreTreatment before PTH', automate: true, machineName: 'SCRUBSTAR' },
        { id: 2, name: 'Pth/Desmear', automate: true, machineName: 'DESMEARSTAR' },
        { id: 3, name: 'Dry after PTH', automate: true, machineName: 'PCB Board Panel Dryer Machine' },
        { id: 4, name: 'Panel Plating', automate: false },
      ];
    } else if (processId === ProcessType.OuterLayer) {
      list = [
        { id: 1, name: 'OUTER LAYER IMAGING - Pre-treatment', automate: true, machineName: 'OUTER LAYER IMAGING - Pre-treatment' },
        { id: 2, name: 'Film Lamination', automate: true, machineName: 'DFL_Hakuto MACH 610V' },
        { id: 3, name: 'Automatic Exposure', automate: true, machineName: 'Exposure_Orbotech LDI Paragon 8800HI' },
        { id: 4, name: 'DES', automate: true, machineName: 'DES_WISE DES horizontal line' },
        { id: 5, name: 'AOI-Scanning', automate: true, machineName: 'AOI_ORBOTECH DSV 8800 AOI' },
        //{ id: 6, name: 'AOI-Verification', automate: true, machineName: 'AOI_ORBOTECH DSV 8800 AOI' },
      ];
    } else if (processId === ProcessType.Soldermask) {
      list = [
        { id: 1, name: 'Pre-Treatment', automate: true, machineName: 'DEVSTAR' },
        { id: 2, name: 'Mask-Printing', automate: true, machineName: 'Inkjet printed solder mask' },
        { id: 3, name: 'Mask-Exposure', automate: false },
        { id: 4, name: 'Mask-Developing', automate: false },
        { id: 5, name: 'Mask-Curing', automate: false },
      ];
    } else if (processId === ProcessType.SilkScreen) {
      list = [
        { id: SilkScreen.SlikscreenPrinting, name: 'Slik screen-Printing', automate: true, machineName: 'Inkjet printed silkscreen' },
        { id: SilkScreen.SlikscreenCuring, name: 'Slik screen-Curing', automate: false },
      ];
    } else if (processId === ProcessType.SurfaceFinish) {
      list = [
        { id: SurfaceFinish.HASL, name: 'HASL', automate: true, machineName: 'Horizontal HASLEquipment' },
        { id: SurfaceFinish.HASLLF, name: 'HASL-LF', automate: true, machineName: 'Horizontal LF HASLEquipment' },
        { id: SurfaceFinish.OSP, name: 'OSP', automate: true, machineName: 'OSP' },
        { id: SurfaceFinish.ENIG, name: 'ENIG', automate: true, machineName: 'Automated Nickel and Gold Plating Line' },
        { id: SurfaceFinish.ImmersionTin, name: 'Immersion Tin', automate: true, machineName: 'Inline system for the tin-plating of copper surfaces and bore holes after solder mask coating' },
        { id: SurfaceFinish.ImmersionSilver, name: 'Immersion Silver Plate', automate: true, machineName: 'Conveyorized Horizontal Immersion Silver Plating Line' },
      ];
    } else if (processId === ProcessType.RoutingScoring) {
      list = [
        { id: RoutingScoring.Scoring, name: 'Scoring', automate: true, machineName: 'ATC pcb cutting making machine' },
        { id: RoutingScoring.Routing, name: 'Routing', automate: true, machineName: 'TL-RU6G' },
      ];
    } else if (processId === ProcessType.ETestBBT) {
      list = [{ id: ETestBBT.BBT, name: 'BBT', automate: true, machineName: 'BBT_A8a Flying Probe Test System' }];
    }

    if (surfaceFinishType > 0 && processId === ProcessType.SurfaceFinish) {
      list = list.filter((x) => x.id === surfaceFinishType);
    } else if (routingScoring > 0 && processId === ProcessType.RoutingScoring) {
      list = list.filter((x) => x.id === routingScoring);
    }
    return list;
  }

  getDrillingLookupList(thickness: number, diameter: number) {
    let list: any[] = [];
    list = [
      { thickness: 0.4, d1: 2, d2: 2, d3: 3, d4: 4, d5: 4, d6: 5, d7: 5, d8: 6, d9: 6, d10: 6 },
      { thickness: 0.5, d1: 2, d2: 2, d3: 3, d4: 4, d5: 4, d6: 5, d7: 5, d8: 6, d9: 6, d10: 6 },
      { thickness: 0.6, d1: 2, d2: 2, d3: 3, d4: 4, d5: 4, d6: 5, d7: 5, d8: 6, d9: 6, d10: 6 },
      { thickness: 0.7, d1: 2, d2: 2, d3: 3, d4: 4, d5: 4, d6: 5, d7: 5, d8: 6, d9: 6, d10: 6 },
      { thickness: 0.8, d1: 2, d2: 2, d3: 3, d4: 4, d5: 4, d6: 5, d7: 5, d8: 6, d9: 6, d10: 6 },
      { thickness: 0.9, d1: 1, d2: 2, d3: 3, d4: 3, d5: 4, d6: 4, d7: 4, d8: 4, d9: 4, d10: 5 },
      { thickness: 1.0, d1: 1, d2: 2, d3: 3, d4: 3, d5: 4, d6: 4, d7: 4, d8: 4, d9: 4, d10: 5 },
      { thickness: 1.1, d1: 2, d2: 2, d3: 2, d4: 4, d5: 4, d6: 4, d7: 4, d8: 4, d9: 4, d10: 4 },
      { thickness: 1.2, d1: 2, d2: 2, d3: 2, d4: 4, d5: 4, d6: 4, d7: 4, d8: 4, d9: 4, d10: 4 },
      { thickness: 1.3, d1: 2, d2: 2, d3: 2, d4: 4, d5: 4, d6: 4, d7: 4, d8: 4, d9: 4, d10: 4 },
      { thickness: 1.4, d1: 1, d2: 1, d3: 2, d4: 2, d5: 3, d6: 3, d7: 3, d8: 3, d9: 3, d10: 4 },
      { thickness: 1.5, d1: 1, d2: 1, d3: 2, d4: 2, d5: 3, d6: 3, d7: 3, d8: 3, d9: 3, d10: 4 },
      { thickness: 1.6, d1: 1, d2: 1, d3: 2, d4: 2, d5: 3, d6: 3, d7: 3, d8: 3, d9: 3, d10: 4 },
      { thickness: 1.7, d1: 1, d2: 1, d3: 2, d4: 2, d5: 3, d6: 3, d7: 3, d8: 3, d9: 3, d10: 3 },
      { thickness: 1.8, d1: 1, d2: 1, d3: 1, d4: 1, d5: 2, d6: 2, d7: 2, d8: 2, d9: 2, d10: 3 },
      { thickness: 1.9, d1: 1, d2: 1, d3: 1, d4: 1, d5: 2, d6: 2, d7: 2, d8: 2, d9: 2, d10: 3 },
      { thickness: 2.0, d1: 1, d2: 1, d3: 1, d4: 1, d5: 2, d6: 2, d7: 2, d8: 2, d9: 2, d10: 3 },
      { thickness: 2.1, d1: 1, d2: 1, d3: 1, d4: 1, d5: 2, d6: 2, d7: 2, d8: 2, d9: 2, d10: 3 },
      { thickness: 2.2, d1: 1, d2: 1, d3: 1, d4: 1, d5: 2, d6: 2, d7: 2, d8: 2, d9: 2, d10: 2 },
      { thickness: 2.3, d1: 1, d2: 1, d3: 1, d4: 1, d5: 2, d6: 2, d7: 2, d8: 2, d9: 2, d10: 2 },
      { thickness: 2.4, d1: 1, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 2, d8: 2, d9: 2, d10: 2 },
      { thickness: 2.5, d1: 1, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1, d8: 2, d9: 2, d10: 2 },
      { thickness: 2.6, d1: 1, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1, d8: 1, d9: 2, d10: 2 },
      { thickness: 2.7, d1: 1, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1, d8: 1, d9: 1, d10: 2 },
      { thickness: 2.8, d1: 1, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1, d8: 1, d9: 1, d10: 2 },
      { thickness: 2.9, d1: 1, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1, d8: 1, d9: 1, d10: 2 },
      { thickness: 3.0, d1: 1, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1, d8: 1, d9: 1, d10: 1 },
      { thickness: 3.1, d1: 0, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1, d8: 1, d9: 1, d10: 1 },
      { thickness: 3.2, d1: 0, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1, d8: 1, d9: 1, d10: 1 },
    ];
    const diameterMap: { from: number; to?: number; key: keyof (typeof list)[number] }[] = [
      { from: 0.1, key: 'd1' },
      { from: 0.15, key: 'd2' },
      { from: 0.2, key: 'd3' },
      { from: 0.25, key: 'd4' },
      { from: 0.3, key: 'd5' },
      { from: 0.35, key: 'd6' },
      { from: 0.4, key: 'd7' },
      { from: 0.45, key: 'd8' },
      { from: 0.5, key: 'd9' },
      { from: 0.55, to: Infinity, key: 'd10' },
    ];
    const thicknessRow = list.find((row) => row.thickness === thickness);
    const diameterMatch = diameterMap.find((m) => diameter === m.from || (m.to && diameter >= m.from && diameter <= m.to));
    return thicknessRow && diameterMatch ? thicknessRow[diameterMatch.key] : 0;
  }

  getRoutingLookupList(thickness: number, diameter: number) {
    let list: any[] = [];
    list = [
      { thickFrom: 0.0, thickTo: 0.4, d1: 5, d2: 6, d3: 7, d4: 9, d5: 10, d6: 12 },
      { thickFrom: 0.41, thickTo: 0.6, d1: 4, d2: 5, d3: 6, d4: 8, d5: 9, d6: 10 },
      { thickFrom: 0.61, thickTo: 0.8, d1: 3, d2: 4, d3: 5, d4: 6, d5: 8, d6: 8 },
      { thickFrom: 0.81, thickTo: 1.0, d1: 2, d2: 3, d3: 4, d4: 5, d5: 6, d6: 6 },
      { thickFrom: 1.01, thickTo: 1.2, d1: 2, d2: 2, d3: 3, d4: 4, d5: 5, d6: 6 },
      { thickFrom: 1.21, thickTo: 1.6, d1: 2, d2: 2, d3: 3, d4: 3, d5: 4, d6: 5 },
      { thickFrom: 1.61, thickTo: 1.8, d1: 1, d2: 1, d3: 2, d4: 3, d5: 4, d6: 5 },
      { thickFrom: 1.81, thickTo: 2.0, d1: 1, d2: 1, d3: 2, d4: 2, d5: 3, d6: 4 },
      { thickFrom: 2.01, thickTo: 2.5, d1: 1, d2: 1, d3: 1, d4: 2, d5: 2, d6: 3 },
      { thickFrom: 2.51, thickTo: 3.0, d1: 1, d2: 1, d3: 1, d4: 1, d5: 2, d6: 2 },
    ];
    const diameterRanges = [
      { from: 0.8, to: 0.9, key: 'd1' },
      { from: 1.0, to: 1.2, key: 'd2' },
      { from: 1.3, to: 1.4, key: 'd3' },
      { from: 1.5, to: 1.8, key: 'd4' },
      { from: 1.9, to: 2.2, key: 'd5' },
      { from: 2.3, to: 3.175, key: 'd6' },
    ];
    const thicknessMatch = list.find((x) => thickness >= x.thickFrom && thickness <= x.thickTo);
    const diameterMatch = diameterRanges.find((r) => diameter >= r.from && diameter <= r.to);
    return thicknessMatch && diameterMatch ? thicknessMatch[diameterMatch.key] : 0;
  }
}

export enum InnerLayers {
  PreTreatment = 1,
  CoatingDryFilmLamination = 2,
  AutomaticExposure = 3,
  DES = 4,
  AOIScanning = 5,
  AOIVerification = 6,
}

export enum LayerConstruction {
  Foil = 1,
  Core = 2,
}

export enum LaminationBonding {
  CCDTargetDrill = 1,
  BrownOxidizationLine = 2,
  PPCutting = 3,
  Rivet = 4,
  Press = 5,
  EdgeRouting = 6,
}
export enum PCBDrilling {
  XRayDrilling = 1,
  THDrilling = 2,
}

export enum PCBPlating {
  PreTreatmentBeforePTH = 1,
  PthDesmear = 2,
  DryafterPTH = 3,
  PanelPlating = 4,
}

export enum OuterLayer {
  IMAGINGPretreatment = 1,
  FilmLamination = 2,
  AutomaticExposure = 3,
  DES = 4,
  AOIScanning = 5,
  AOIVerification = 6,
}

export enum Soldermask {
  PreTreatment = 1,
  MaskPrinting = 2,
  MaskExposure = 3,
  MaskDeveloping = 4,
  MaskCuring = 5,
}
export enum SilkScreen {
  SlikscreenPrinting = 1,
  SlikscreenCuring = 2,
}

export enum SurfaceFinish {
  HASL = 1,
  HASLLF = 2,
  OSP = 3,
  ENIG = 4,
  ImmersionTin = 5,
  ImmersionSilver = 6,
}

export enum RoutingScoring {
  Scoring = 1,
  Routing = 2,
}
export enum ETestBBT {
  BBT = 1,
}
