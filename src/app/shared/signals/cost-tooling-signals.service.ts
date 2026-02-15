import { Injectable, signal } from '@angular/core';
import { CostToolingDto, ToolingMaterialInfoDto, BopCostToolingDto, ToolingProcessInfoDto } from '../models/tooling.model';
import { MaterialMarketDataDto } from '../models';
import { CostToolingService } from '../services/cost-tooling.service';
import { Store } from '@ngxs/store';
import { ApiCacheService } from '../services/api-cache.service';
import { MaterialMasterService } from '../services/material-master.service';
import { CostSummarySignalsService } from './cost-summary-signals.service';
// import * as CostSummaryActions from '../../modules/_actions/cost-summary.action';

@Injectable({
  providedIn: 'root',
})
export class CostToolingSignalsService {
  private readonly _toolingInfosSignal = signal<CostToolingDto[]>([]);
  private readonly _toolingMaterialInfosSignal = signal<ToolingMaterialInfoDto[]>([]);
  private readonly _defaultMarketDataSignal = signal<MaterialMarketDataDto[]>([]);
  // private readonly _bulkToolingUpdateLoadingSignal = signal<boolean>(true);

  toolingInfos = this._toolingInfosSignal.asReadonly();
  toolingMaterialInfos = this._toolingMaterialInfosSignal.asReadonly();
  defaultMarketDataForTooling = this._defaultMarketDataSignal.asReadonly();
  // bulkToolingUpdateLoading = this._bulkToolingUpdateLoadingSignal.asReadonly();

  constructor(
    private _toolService: CostToolingService,
    private _store: Store,
    private _apiCacheService: ApiCacheService,
    private materialMasterService: MaterialMasterService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  getToolingInfosByPartInfoId(partInfoId: number) {
    this._toolService.getCostToolingByPartId(partInfoId).subscribe((result: CostToolingDto[]) => {
      // if (result) {
      this._toolingInfosSignal.set([...(result ?? [])]);
      // }
    });
  }

  saveToolingInfo(toolingInfo: CostToolingDto, partInfoId: number) {
    this._toolService.saveCostTooling(toolingInfo).subscribe((result: CostToolingDto) => {
      if (result) {
        this._toolingInfosSignal.update((list) => [...list, result]);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  bulkUpdateToolingInfo(toolingInfo: CostToolingDto, partInfoId: number) {
    this._toolService.bulkUpdateTooling(toolingInfo).subscribe((result: CostToolingDto) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  bulkUpdateAsync(toolingInfo: CostToolingDto[], partInfoId: number) {
    this._toolService.bulkUpdateAsync(toolingInfo).subscribe((result: CostToolingDto[]) => {
      if (result) {
        this._apiCacheService.removeCache('/api/costing/CostTooling/' + partInfoId);
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId, 'bulkUpdateAsyncTooling');
      }
    });
  }

  updateToolingCostPerPart(toolingInfo: CostToolingDto, partInfoId: number) {
    this._toolService.updateToolingCostPerPart(toolingInfo).subscribe((result: CostToolingDto) => {
      if (result) {
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  // bulkUpdateToolingCostPerPart(toolingInfo: CostToolingDto[], partInfoId: number) {
  //   return this._toolService.bulkUpdateToolingCostPerPart(toolingInfo).subscribe((result) => {
  //     if (result) {
  //       this._store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(partInfoId));
  //     }
  //   });
  // }

  deleteToolingInfo(toolingId: number, partInfoId: number) {
    this._toolService.deleteCostToolingById(toolingId).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  saveToolingMaterialInfo(toolingMaterialList: ToolingMaterialInfoDto, partInfoId: number) {
    this._toolService.saveCostToolingMaterial(toolingMaterialList).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  bulkUpdateOrCreateToolingMaterialInfo(toolingMaterialList: ToolingMaterialInfoDto[], partInfoId: number) {
    this._toolService.bulkUpdateOrCreateToolingMaterialInfo(toolingMaterialList).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  deleteToolingMaterialInfo(materialInfoId: number, partInfoId: number) {
    this._toolService.deleteCostToolingMaterialById(materialInfoId).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
      }
    });
  }

  saveBOPInfo(BOPList: BopCostToolingDto, partInfoId: number) {
    this._toolService.saveCostToolingBOP(BOPList).subscribe((result) => {
      if (result) {
        this._apiCacheService.removeCache('/api/costing/CostTooling/' + partInfoId);
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  bulkUpdateOrCreateBOPInfo(BOPList: any[], partInfoId: number) {
    this._toolService.bulkUpdateOrCreateBOPInfo(BOPList).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  saveToolingProcessInfo(toolingProcessList: ToolingProcessInfoDto, partInfoId: number) {
    this._toolService.saveCostToolingProcess(toolingProcessList).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  bulkUpdateOrCreateToolingProcessInfo(toolingProcessList: any[], partInfoId: number) {
    this._toolService.bulkUpdateOrCreateToolingProcessInfo(toolingProcessList).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  deleteToolingProcessInfo(processInfoId: number, partInfoId: number) {
    this._toolService.deleteCostToolingProcessById(processInfoId).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
      }
    });
  }

  deleteToolingBOPInfo(bopId: number, partInfoId: number) {
    this._toolService.deleteCostToolingBOPById(bopId).subscribe((result) => {
      if (result) {
        this.getToolingInfosByPartInfoId(partInfoId);
      }
    });
  }

  getDefaultValuesForTooling(countryId: number) {
    this._defaultMarketDataSignal.set([]);
    this.materialMasterService.getMaterialMarketDataListByCountryId(countryId).subscribe((result: MaterialMarketDataDto[]) => {
      // if (result) {
      this._defaultMarketDataSignal.set([...(result ?? [])]);
      // }
    });
  }

  // setBulkToolingUpdateLoading(source: boolean) {
  //   this._bulkToolingUpdateLoadingSignal.set(source);
  // }
}
