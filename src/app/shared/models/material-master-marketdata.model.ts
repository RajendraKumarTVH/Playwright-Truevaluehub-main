import { MaterialMarketDataDto } from './material-market-data.model';
import { MaterialMasterDto } from './material-master.model';
import { MaterialTypeDto } from './material-type.model';
import { ProcessInfoDto } from './process-info.model';
import { CostToolingDto } from './tooling.model';

export class MaterialMasterMarketDataDto {
  constructor() {
    this.materialTypeList = [];
    this.materialMasterDto = [];
  }
  materialMarketData: MaterialMarketDataDto;
  materialTypeList: MaterialTypeDto[];
  materialMasterDto: MaterialMasterDto[];
}

export class MostSimilarPartCostDetailsDto {
  partInfoId: number;
  commodityId?: number;
  materialMasterDtos?: MaterialMasterDto[];
  processInfoDtos?: ProcessInfoDto[];
  costToolingDtos?: CostToolingDto[];
}
