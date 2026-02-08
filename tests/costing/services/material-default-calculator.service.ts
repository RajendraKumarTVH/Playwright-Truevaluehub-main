import { Injectable } from '@angular/core';
import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
/*
  CommodityType.WiringHarness,
  CommodityType.Electronics,
  CommodityType.PrintedCircuitBoard,
  CommodityType.Testing,
  CommodityType.Others,
  CommodityType.PCBAQuickCosting,
  CommodityType.AdditiveManufacturing
   */
@Injectable({
  providedIn: 'root',
})
export class MaterialDefaultCalculatorService implements IMaterialCalculationByCommodity {
  private currentPart: PartInfoDto;

  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }
  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      default:
        return materialInfo;
    }
  }
}
