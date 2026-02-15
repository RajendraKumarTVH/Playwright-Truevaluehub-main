import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MountingTechnology } from './manufacturing-electronics-config';

@Injectable({
  providedIn: 'root',
})
export class MaterialPCBAConfigService {
  constructor(public sharedService: SharedService) {}

  getMountingTechnology() {
    return [
      { id: MountingTechnology.SingleSideTH, name: 'Single Side TH' },
      { id: MountingTechnology.DoubleSideTH, name: 'Double Side TH' },
      { id: MountingTechnology.SingleSideSMT, name: 'Single Side SMT' },
      { id: MountingTechnology.SingleSideSMTTH, name: 'Single Side (SMT+TH)' },
      { id: MountingTechnology.OneSideSMTOneSideTH, name: 'One Side SMT & One Side TH' },
      { id: MountingTechnology.DoubleSideSMT, name: 'Double Side SMT' },
      { id: MountingTechnology.DoubleSideSMTOneSideTH, name: 'Double Side SMT + One Side TH' },
      { id: MountingTechnology.DoubleSideTHOneSideSMT, name: 'Double Side TH + One Side SMT' },
      { id: MountingTechnology.DoubleSideSMTTH, name: 'Double Side (SMT+ TH)' },
    ];
  }

  getApplication() {
    return [
      { id: 1, name: 'Medical' },
      { id: 2, name: 'Consumer Electronics' },
      { id: 3, name: 'Automotive' },
    ];
  }

  getSolderPasteMaterialList() {
    return [
      { id: 1, name: 'SAC305 Indium8.9HF', cost: 90 },
      { id: 2, name: 'Kester Solder 70-4021-0821', cost: 79 },
      { id: 3, name: 'Senju M705-GRN360-K2-V', cost: 85 },
    ];
  }

  getConformalCoatingList() {
    return [
      { id: 1, name: 'DOWSIL™ 1-2577+ Toluene Solution (Silicon)', cost: 90.09729053 },
      { id: 2, name: 'HumiSeal 1A33 Acrylic CC', cost: 29.28 },
      { id: 3, name: 'HumiSeal® 1B31 Acrylic CC', cost: 32.56 },
      { id: 3, name: 'Aerosols (Spray Applications) - 1B73 Acrylic', cost: 16.26 },
    ];
  }
  getAdhesivePottingList() {
    return [
      { id: 1, name: '3M DP-190-GRAY (Epoxy)', cost: 23.22 },
      { id: 2, name: 'SEPOX 201 XP + DK 433 XP (Epoxy)', cost: 93.05 },
      { id: 3, name: 'RS PRO Amber Epoxy Potting Compound', cost: 58.38 },
      { id: 4, name: 'RTV 162 (Silicon)', cost: 10.10693333 },
      { id: 5, name: 'Rubber Type RTV Silicon Heatsink Paste ', cost: 10.52941176 },
    ];
  }
}
