import { Injectable } from '@angular/core';
import { ProcessType } from 'src/app/modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingSemiRigidConfigService {
  getSubProcessList(processId: number, surfaceFinishType: number = 0, routingScoring: number = 0) {
    let list: any[] = [];
    if (processId === ProcessType.InnerLayer) {
      list = [
        { id: InnerLayers.PreTreatment, name: 'Pre-Treatment', automate: true, machineName: 'Pretreatment_CHEMSTAR' },
        { id: InnerLayers.CoatingDryFilmLamination, name: 'Coating/Dry Film Lamination', automate: true, machineName: 'DFL_Hakuto MACH 610V' },
        { id: InnerLayers.AutomaticExposure, name: 'Automatic exposure', automate: true, machineName: 'Exposure_Orbotech LDI Paragon 8800HI' },
        { id: InnerLayers.DES, name: 'DES', automate: true, machineName: 'DES_WISE DES horizontal line' },
        { id: InnerLayers.AOIScanning, name: 'AOI-Scanning', automate: true, machineName: 'AOI_ORBOTECH DSV 8800 AOI' },
        // { id: InnerLayers.AOIVerification, name: 'AOI-Verification', automate: true, machineName: 'AOI_ORBOTECH DSV 8800 AOI' },
        { id: InnerLayers.LaserCuttingCoreDepth, name: 'Laser Cutting Core Depth', automate: true, machineName: 'Pluritec D6_Laser Cutting Core Depth' }, //new
        { id: InnerLayers.LCUTDesmear, name: 'LCUT/Desmear', automate: true, machineName: 'DESMEARSTAR_LCUT' }, //new
        { id: InnerLayers.ReleaseLayerPrinting, name: 'Release Layer Printing', automate: true, machineName: 'Inkjet printed silk screen' }, //new
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
        { id: 6, name: 'Flexible ink printing', automate: true, machineName: 'AT-AT-EW120P_Flexible ink printing' }, //new
        { id: 7, name: 'Flex Mask-Exposure', automate: true, machineName: 'Orbotech LDI Paragon 8800HI' }, //new
        { id: 8, name: 'Flex Mask-Developing', automate: true, machineName: 'CHEMSTAR' }, //new
        { id: 9, name: 'Flex Mask-Curing', automate: true, machineName: 'CHEMSTAR' }, //new
      ];
    } else if (processId === ProcessType.SilkScreen) {
      list = [
        { id: SilkScreen.SlikscreenPrinting, name: 'Slik screen-Printing', automate: true, machineName: 'Inkjet printed silkscreen' },
        { id: SilkScreen.SlikscreenCuring, name: 'Slik screen-Curing', automate: false },
      ];
    } else if (processId === ProcessType.SurfaceFinish) {
      list = [
        { id: SurfaceFinish.HASLLF, name: 'HASL-LF', automate: true, machineName: 'Horizontal LF HASLEquipment' },
        { id: SurfaceFinish.OSP, name: 'OSP', automate: true, machineName: 'OSP' },
        { id: SurfaceFinish.ENIG, name: 'ENIG', automate: true, machineName: 'Automated Nickel and Gold Plating Line' },
        { id: SurfaceFinish.ImmersionTin, name: 'Immersion Tin', automate: true, machineName: 'Inline system for the tin-plating of copper surfaces and bore holes after solder mask coating' },
        { id: SurfaceFinish.ImmersionSilver, name: 'Immersion Silver Plate', automate: true, machineName: 'Conveyorized Horizontal Immersion Silver Plating Line' },
        { id: SurfaceFinish.DepthRouting, name: 'Depth Routing', automate: true, machineName: 'Schmoll RMXY6 XL' }, //new
        { id: SurfaceFinish.RFCapRemoval, name: 'RF Cap Removal', automate: true, machineName: 'De-capper' }, //new
        { id: SurfaceFinish.ReleaseLayerStrip, name: 'Release Layer Strip', automate: true, machineName: 'Automatic strpping line' }, //new
        { id: SurfaceFinish.PreTreatment, name: 'Pre-Treatment', automate: true, machineName: 'Pretreatment_CHEMSTAR' }, //new
      ];
    } else if (processId === ProcessType.RoutingScoring) {
      list = [
        { id: RoutingScoring.Scoring, name: 'Scoring', automate: true, machineName: 'ATC pcb cutting making machine' },
        { id: RoutingScoring.Routing, name: 'Routing', automate: true, machineName: 'TL-RU6G' },
      ];
    } else if (processId === ProcessType.ETestBBT) {
      list = [
        { id: ETestBBT.BBT, name: 'BBT', automate: true, machineName: 'BBT_A8a Flying Probe Test System' },
        { id: ETestBBT.FlyingProbe, name: 'Flying Probe', automate: true, machineName: 'SPEA 4080_Flying Probe' }, //new
      ];
    }

    if (surfaceFinishType > 0 && processId === ProcessType.SurfaceFinish) {
      list = list.filter((x) => x.id === surfaceFinishType);
    } else if (routingScoring > 0 && processId === ProcessType.RoutingScoring) {
      list = list.filter((x) => x.id === routingScoring);
    }
    return list;
  }
}

export enum InnerLayers {
  PreTreatment = 1,
  CoatingDryFilmLamination = 2,
  AutomaticExposure = 3,
  DES = 4,
  AOIScanning = 5,
  AOIVerification = 6,
  LaserCuttingCoreDepth = 7,
  LCUTDesmear = 8,
  ReleaseLayerPrinting = 9,
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
  FlexibleInkPrinting = 6,
  FlexMaskExposure = 7,
  FlexMaskDeveloping = 8,
  FlexMaskCuring = 9,
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
  DepthRouting = 7,
  RFCapRemoval = 8,
  ReleaseLayerStrip = 9,
  PreTreatment = 10,
}

export enum RoutingScoring {
  Scoring = 1,
  Routing = 2,
}
export enum ETestBBT {
  BBT = 1,
  FlyingProbe = 2,
}
