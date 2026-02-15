import { Injectable } from '@angular/core';
import { CommodityType } from 'src/app/modules/costing/costing.config';
import { CostToolingDto } from '../models/tooling.model';

@Injectable({
  providedIn: 'root',
})
export class ToolingInfoConfigService {
  setDefaultValuesForTooling(costTooling: CostToolingDto, commodityId: number) {
    if (commodityId === CommodityType.Casting) {
      costTooling.runnerGapLength = 60;
      costTooling.runnerGapWidth = 60;
      costTooling.sideGapLength = 80;
      costTooling.sideGapWidth = 120;
    } else {
      costTooling.runnerGapLength = 30;
      costTooling.runnerGapWidth = 30;
      costTooling.sideGapLength = 50;
      costTooling.sideGapWidth = 50;
    }
  }
}
