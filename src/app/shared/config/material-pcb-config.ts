import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { SurfaceFinish } from './manufacturing-pcb-config';

@Injectable({
  providedIn: 'root',
})
export class MaterialPCBConfigService {
  constructor(public sharedService: SharedService) {}

  public copperLayers = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0, L7: 0, L8: 0, L9: 0, L10: 0 };
  public solderMaskLayers = { M1: 0, M2: 0 };
  public prepregLayers = { PP1: 0, PP2: 0, PP3: 0, PP4: 0, PP5: 0 };
  public coreLayers = { C1: 0, C2: 0, C3: 0, C4: 0 };

  getCopperThicknessList() {
    return [
      { id: 1, name: '0.5' },
      { id: 2, name: '1' },
      { id: 3, name: '1.5' },
      { id: 4, name: '2' },
      { id: 5, name: '2.5' },
      { id: 6, name: '3' },
      { id: 7, name: '3.5' },
      { id: 8, name: '4' },
      { id: 9, name: '4.5' },
      { id: 10, name: '5' },
      { id: 11, name: '5.5' },
      { id: 12, name: '6' },
    ];
  }

  getCopperLayersList() {
    return [
      { id: 1, name: 1 },
      { id: 2, name: 2 },
      { id: 4, name: 4 },
      { id: 6, name: 6 },
      { id: 8, name: 8 },
      { id: 10, name: 10 },
      { id: 12, name: 12 },
      { id: 14, name: 14 },
      { id: 16, name: 16 },
      { id: 18, name: 18 },
      { id: 20, name: 20 },
      { id: 22, name: 22 },
      { id: 24, name: 24 },
      { id: 26, name: 26 },
      { id: 28, name: 28 },
      { id: 30, name: 30 },
    ];
  }

  getPanelData() {
    return [
      { x: 14, y: 16, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 14, y: 24, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 16, y: 18, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 16, y: 21, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 18, y: 24, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 18.25, y: 24.25, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 20, y: 24, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 21, y: 24, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 21.25, y: 24.25, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 21.5, y: 24.5, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
      { x: 16, y: 24, res: 0, percent: 0, noOfArrayX: 0, noOfArrayY: 0, index: 0, fullNumber: 0 },
    ];
  }

  getLinXList(w: number, l: number) {
    const T = 0.5;
    const S = 0.12;
    const panelData = this.getPanelData();
    const resData: any[] = [];
    panelData.forEach((panel, index) => {
      const x = Math.trunc((panel.x - T * 2 + S) / (l + S));
      const y = Math.trunc((panel.y - T * 2 + S) / (w + S));
      const x1 = Math.trunc((panel.x - (l + S) * x - T * 2 + S) / (w + S));
      const y1 = Math.trunc((panel.y - T * 2 + S) / (l + S));
      const nx = Math.trunc(((panel.x - T * 2 + S) / (l + S) - x) * (l + S) * 1000) / 1000;
      const nnx = Math.trunc((l + S - ((panel.x - (w + S) * x - T * 2 + S) / (l + S) - Math.trunc((panel.x - (w + S) * x - T * 2 + S) / (l + S))) * (l + S)) * 1000) / 1000;
      const lAll = x * y + x1 * y1;

      const wx = Math.trunc((panel.x - T * 2 + S) / (w + S));
      const wy = Math.trunc((panel.y - T * 2 + S) / (l + S));
      const wny = Math.trunc(((panel.y - T * 2 + S) / (l + S) - Math.trunc((panel.y - T * 2 + S) / (l + S))) * (l + S) * 1000) / 1000;
      const wx1 = Math.trunc((panel.x - T * 2 + S) / (l + S));
      const wy1 = Math.trunc((panel.y - (l + S) * wy - T * 2 + S) / (w + S));
      const wnny = Math.trunc((w + S - ((panel.y - (l + S) * wy - T * 2 + S) / (w + S) - Math.trunc((panel.y - (l + S) * wy - T * 2 + S) / (w + S))) * (w + S)) * 1000) / 1000;
      const wall = wx * wy + wx1 * wy1;
      resData.push({
        //length
        L_x: x,
        L_y: y,
        L_nx: nx,
        L_ny: panel.y,
        L_x1: x1,
        L_y1: y1,
        L_nx1: panel.y,
        L_ny1: x1 * y1 == 0 ? nx : l - nnx,
        L_nny: 0,
        L_nnx: nnx,
        L_1: x * y,
        L_2: x1 * y1,
        lAll: lAll,
        //Width
        W_x: wx,
        W_y: wy,
        W_nx: panel.x,
        W_ny: wny,
        W_x1: wx1,
        W_y1: wy1,
        W_nx1: wx1 * wy1 == 0 ? wny : w - wnny,
        W_ny1: panel.x,
        W_nny: wnny,
        W_nnx: 0,
        W_1: wx * wy,
        W_2: wx1 * wy1,
        W_all: wall,
      });
      const res = lAll > wall ? lAll : wall;
      panel.res = res;
      panel.percent = this.sharedService.isValidNumber((l * w * res) / (panel.x * panel.y));
      panel.fullNumber = this.sharedService.isValidNumber(((l * w * res) / (panel.x * panel.y)) * 100);
      panel.noOfArrayX = res == 0 ? 0 : lAll > wall ? x : wx;
      panel.noOfArrayY = res == 0 ? 0 : lAll > wall ? y : wy;
      panel.index = index + 1;
    });

    return { panelInfo: panelData, lookupInfo: resData };
  }

  getSurfaceFInish() {
    return [
      { id: SurfaceFinish.HASL, name: 'HASL' },
      { id: SurfaceFinish.HASLLF, name: 'HASL-LF' },
      { id: SurfaceFinish.OSP, name: 'OSP' },
      { id: SurfaceFinish.ENIG, name: 'ENIG' },
      { id: SurfaceFinish.ImmersionTin, name: 'Immersion Tin' },
      { id: SurfaceFinish.ImmersionSilver, name: 'Immersion Silver' },
    ];
  }
  getRigidLayerConstruction(noOfCoppLayers: number = 0) {
    const list = [
      { id: 1, noOfCopperLayer: 4, layerName: '1-3' },
      { id: 2, noOfCopperLayer: 4, layerName: '2-4' },
      { id: 3, noOfCopperLayer: 6, layerName: '1-5' },
      { id: 4, noOfCopperLayer: 6, layerName: '2-6' },
      { id: 5, noOfCopperLayer: 8, layerName: '1-7' },
      { id: 6, noOfCopperLayer: 8, layerName: '2-8' },
      { id: 7, noOfCopperLayer: 10, layerName: '1-9' },
      { id: 8, noOfCopperLayer: 10, layerName: '2-10' },
    ];
    return [4, 6, 8, 10].includes(noOfCoppLayers) ? list?.filter((x) => x.noOfCopperLayer === noOfCoppLayers) : list;
  }

  getSurfaceFInishThickness(surfaceFinish: number, isdensity: boolean = false, isCost: boolean = false) {
    const list = [
      { surface: SurfaceFinish.HASL, thickness: 0.000762, density: 0, cost: 116 },
      { surface: SurfaceFinish.HASLLF, thickness: 0.000762, density: 5.75, cost: 1963 },
      { surface: SurfaceFinish.OSP, thickness: 0.0002, density: 1.3, cost: 5100 },
      { surface: SurfaceFinish.ENIG, thickness: 0.0000508, density: 19.32, cost: 99000 },
      { surface: SurfaceFinish.ImmersionTin, thickness: 0.001, density: 5.75, cost: 5672 },
      { surface: SurfaceFinish.ImmersionSilver, thickness: 0.00012032, density: 10.53, cost: 3571 },
    ];
    if (isdensity) {
      return list?.find((x) => x.surface === Number(surfaceFinish))?.density || 0;
    } else if (isCost) {
      return list?.find((x) => x.surface === Number(surfaceFinish))?.cost || 0;
    } else {
      return list?.find((x) => x.surface === Number(surfaceFinish))?.thickness || 0;
    }
  }
  getLaminatesLookupData(panelX: number, panelY: number) {
    const list = [
      { x: 14, y: 16, factor: 1.555554311 },
      { x: 14, y: 24, factor: 2.333331467 },
      { x: 16, y: 18, factor: 1.9999984 },
      { x: 16, y: 21, factor: 2.333331467 },
      { x: 18, y: 24, factor: 2.9999976 },
      { x: 18.25, y: 24.25, factor: 3.073348236 },
      { x: 20, y: 24, factor: 3.333330667 },
      { x: 21, y: 24, factor: 3.4999972 },
      { x: 21.25, y: 24.25, factor: 3.578556165 },
      { x: 21.5, y: 24.5, factor: 3.657983185 },
      { x: 16, y: 24, factor: 2.666664533 },
    ];
    return list?.find((x) => x.x === panelX && x.y === panelY)?.factor || 1;
  }

  getConsumableLookupData(calculatedUsage: number, noOfLayers: number) {
    const list = [
      { annualUsage: 10, L1: 20.9, L2: 58.3, L4: 71.6, L6: 101.5, L8: 115.2, L10: 129.6, L12: 145.8, L14: 164.0, L16: 184.5, L18: 207.6, L20: 233.5 },
      { annualUsage: 50, L1: 20.2, L2: 56.2, L4: 69.3, L6: 99.4, L8: 112.3, L10: 126.7, L12: 142.6, L14: 160.4, L16: 180.4, L18: 203.0, L20: 228.4 },
      { annualUsage: 100, L1: 19.4, L2: 54.7, L4: 67.9, L6: 97.7, L8: 110.0, L10: 125.1, L12: 140.7, L14: 158.3, L16: 178.1, L18: 200.4, L20: 225.4 },
      { annualUsage: 250, L1: 18.9, L2: 53.1, L4: 65.8, L6: 94.8, L8: 106.7, L10: 121.3, L12: 136.5, L14: 153.6, L16: 172.8, L18: 194.4, L20: 218.7 },
      { annualUsage: 500, L1: 18.1, L2: 51.0, L4: 63.2, L6: 91.0, L8: 102.4, L10: 116.5, L12: 131.1, L14: 147.4, L16: 165.9, L18: 186.6, L20: 209.9 },
      { annualUsage: 1000, L1: 17.2, L2: 48.4, L4: 60.0, L6: 86.5, L8: 97.3, L10: 110.7, L12: 124.5, L14: 140.1, L16: 157.6, L18: 177.3, L20: 199.4 },
      { annualUsage: 2000, L1: 16.2, L2: 45.5, L4: 56.4, L6: 81.3, L8: 91.5, L10: 104.0, L12: 117.0, L14: 131.7, L16: 148.1, L18: 166.6, L20: 187.5 },
      { annualUsage: 2500, L1: 15.0, L2: 42.3, L4: 52.5, L6: 75.6, L8: 85.1, L10: 96.7, L12: 108.8, L14: 122.4, L16: 137.8, L18: 155.0, L20: 174.3 },
      { annualUsage: 3000, L1: 13.9, L2: 39.1, L4: 48.5, L6: 69.9, L8: 78.7, L10: 89.5, L12: 100.7, L14: 113.3, L16: 127.4, L18: 143.3, L20: 161.3 },
      { annualUsage: 4000, L1: 12.9, L2: 36.2, L4: 44.9, L6: 64.7, L8: 72.8, L10: 82.8, L12: 93.1, L14: 104.8, L16: 117.9, L18: 132.6, L20: 149.2 },
      { annualUsage: 5000, L1: 11.9, L2: 33.5, L4: 41.5, L6: 59.8, L8: 67.3, L10: 76.6, L12: 86.1, L14: 96.9, L16: 109.0, L18: 122.7, L20: 138.0 },
      { annualUsage: 6000, L1: 11.0, L2: 31.0, L4: 38.4, L6: 55.3, L8: 62.3, L10: 70.8, L12: 79.7, L14: 89.6, L16: 100.8, L18: 113.5, L20: 127.6 },
      { annualUsage: 7000, L1: 10.2, L2: 28.7, L4: 35.5, L6: 51.2, L8: 57.6, L10: 65.5, L12: 73.7, L14: 82.9, L16: 93.3, L18: 104.9, L20: 118.1 },
      { annualUsage: 8000, L1: 9.4, L2: 26.5, L4: 32.9, L6: 47.3, L8: 53.3, L10: 60.6, L12: 68.2, L14: 76.7, L16: 86.3, L18: 97.1, L20: 109.2 },
      { annualUsage: 9000, L1: 8.7, L2: 24.5, L4: 30.4, L6: 43.8, L8: 49.3, L10: 56.1, L12: 63.1, L14: 70.9, L16: 79.8, L18: 89.8, L20: 101.0 },
      { annualUsage: 10000, L1: 8.0, L2: 22.6, L4: 28.0, L6: 40.3, L8: 45.3, L10: 51.6, L12: 58.0, L14: 65.3, L16: 73.4, L18: 82.6, L20: 92.9 },
      { annualUsage: 20000, L1: 7.4, L2: 20.8, L4: 25.7, L6: 37.1, L8: 41.7, L10: 47.4, L12: 53.4, L14: 60.0, L16: 67.6, L18: 76.0, L20: 85.5 },
      { annualUsage: 30000, L1: 6.8, L2: 19.1, L4: 23.7, L6: 34.1, L8: 38.4, L10: 43.7, L12: 49.1, L14: 55.2, L16: 62.2, L18: 69.9, L20: 78.7 },
      { annualUsage: 40000, L1: 6.2, L2: 17.6, L4: 21.8, L6: 31.4, L8: 35.3, L10: 40.2, L12: 45.2, L14: 50.8, L16: 57.2, L18: 64.3, L20: 72.4 },
      { annualUsage: 50000, L1: 5.7, L2: 16.2, L4: 20.0, L6: 28.9, L8: 32.5, L10: 36.9, L12: 41.6, L14: 46.8, L16: 52.6, L18: 59.2, L20: 66.6 },
    ];
    const match = list.find((x) => x.annualUsage > calculatedUsage);
    const key = `L${noOfLayers}`;
    return match ? match[key as keyof typeof match] : 0;
  }

  getDefaultDrillingEntries(pcbSizeX: number, pcbSizeY: number) {
    const xyInInch = (pcbSizeX / 25.4) * (pcbSizeY / 25.4);
    const resData = [
      { drill: 0.25, count: 11, quantity: this.sharedService.isValidNumber(xyInInch * 11) },
      { drill: 0.3, count: 6, quantity: this.sharedService.isValidNumber(xyInInch * 6) },
      { drill: 0.6, count: 1.5, quantity: this.sharedService.isValidNumber(xyInInch * 1.5) },
      { drill: 1, count: 0.5, quantity: this.sharedService.isValidNumber(xyInInch * 0.5) },
    ];
    return resData;
  }
}

export enum PCBLayer {
  Copper = 1,
  Core = 2,
  Prepreg = 3,
  Drilling = 4,
  CoreCost = 5,
  PrepregCost = 6,
}

export enum SilkScreenColor {
  NA = 1,
  White = 2,
  Black = 3,
}
export interface Layer {
  name: string;
  type: 'M' | 'L' | 'C' | 'PP';
  value?: number;
  color?: string;
}
