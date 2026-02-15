import { Injectable } from '@angular/core';
import { CommodityType } from 'src/app/modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class CostingToolingBopConfigService {
  public bopInfo = {
    totCost: 0,
    totProcessCost: 0,
    totQty: 0,
  };

  getBOPDescription(commodity: number) {
    let list: any[] = [];
    if (commodity == CommodityType.PlasticAndRubber || commodity === CommodityType.Casting || commodity == CommodityType.SheetMetal) {
      list = [{ id: 1, name: 'Standard Purchased Parts', quantity: 1, cost: 120 }];
    }
    return list;
  }

  getCriticality() {
    return [
      { id: 1, name: 'Simple', value: 0.4, processValue: 0.5 },
      { id: 2, name: 'Medium', value: 0.6, processValue: 0.7 },
      { id: 3, name: 'Complex', value: 0.8, processValue: 0.9 },
    ];
  }
}
