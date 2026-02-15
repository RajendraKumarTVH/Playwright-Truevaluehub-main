import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlaybookConfig {}

export enum CostDriverMasterEnum {
  GrossRawMaterialWeight = 1,
  RawMaterialPrice = 2,
  ScrapRecoveryWeight = 3,
  ScrapRecoveryPrice = 4,
  CycleTime = 5,
  MachineHourlyRate = 6,
  LaborCost = 7,
  OverHead = 8,
  Profit = 9,
  TotalPartCost = 10,
}
