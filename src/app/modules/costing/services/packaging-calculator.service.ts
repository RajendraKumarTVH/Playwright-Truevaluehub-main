import { Injectable } from '@angular/core';
// import { MaterialTypeEnum } from 'src/app/shared/models/packaging-info.model';

@Injectable({
  providedIn: 'root',
})
export class PackagingCalculatorService {
  // getTotalCostPerShipment(costPerUnit: number, boxPerShipment: number, palletPerShipment: number, eav: number, deliveryFrequency: number, matType?: MaterialTypeEnum) {
  //   let totalCostPerShipment = 0;
  //   if (matType == MaterialTypeEnum.Box) {
  //     totalCostPerShipment = costPerUnit * boxPerShipment;
  //   }
  //   if (matType == MaterialTypeEnum.Pallet) {
  //     totalCostPerShipment = costPerUnit * palletPerShipment;
  //   }
  //   if (matType == MaterialTypeEnum.Protect) {
  //     // TODO - check for simulation
  //     // this.protectiveCost = costPerUnit;
  //     // const totProtPkgCost = costPerUnit * boxPerShipment;
  //     // this.f.totalProtectivePkgCost.setValue(totProtPkgCost.toFixed(4));
  //   }
  //   const totalPackagCostPerShipment = Number(totalCostPerShipment) * 1.95;
  //   const partsPerShipment = Math.round((eav / deliveryFrequency) * 365);
  //   const costPerUnit1 = (partsPerShipment && totalPackagCostPerShipment / partsPerShipment) || 0;
  // }
}
