import { Injectable, signal } from '@angular/core';
// import * as ToolingInfoActions from '../../modules/_actions/tooling-info.action';
import { ProcessInfoDto } from '../models';
import { ProcessInfoService } from '../services/process-info.service';
import { Store } from '@ngxs/store';
import { ApiCacheService } from '../services/api-cache.service';
// import * as CostSummaryActions from '../../modules/_actions/cost-summary.action';
import { CostToolingSignalsService } from './cost-tooling-signals.service';
import { CostSummarySignalsService } from './cost-summary-signals.service';

@Injectable({
  providedIn: 'root',
})
export class ProcessInfoSignalsService {
  private readonly _processInfosSignal = signal<ProcessInfoDto[]>([]);
  // private readonly _bulkProcessUpdateLoadingSignal = signal<boolean>(true);

  processInfos = this._processInfosSignal.asReadonly();
  // bulkProcessUpdateLoading = this._bulkProcessUpdateLoadingSignal.asReadonly();

  constructor(
    private processInfoService: ProcessInfoService,
    private store: Store,
    private apiCacheService: ApiCacheService,
    private toolingInfoSignalsService: CostToolingSignalsService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  getProcessInfosByPartInfoId(partInfoId: number) {
    this.processInfoService.getProcessInfoByPartInfoId(partInfoId).subscribe((result: ProcessInfoDto[]) => {
      // if (result) {
      // this._processInfosSignal.set([...result]);
      this._processInfosSignal.set([...(result ?? [])]);
      // }
    });
  }

  clearProcessInfos() {
    this._processInfosSignal.set([]);
    // this._bulkProcessUpdateLoadingSignal.set(true);
  }

  createProcessInfo(processInfo: ProcessInfoDto) {
    if (sessionStorage.getItem('processlist') && window.location.pathname === '/analytics/bestprocess') {
      const processes = JSON.parse(sessionStorage.getItem('processlist'));
      processes.push({ ...processInfo, processInfoId: 0 });
      sessionStorage.setItem('processlist', JSON.stringify(processes));
    }
    this.processInfoService.saveProcessInfoDetails(processInfo).subscribe((result: ProcessInfoDto) => {
      if (result) {
        this._processInfosSignal.update((list) => [...list, result]);

        // this.store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(processInfo.partInfoId));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(processInfo.partInfoId);
        // this.store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(processInfo.partInfoId));
        this.toolingInfoSignalsService.getToolingInfosByPartInfoId(processInfo.partInfoId);
      }
    });
  }

  updateProcessInfo(processInfo: ProcessInfoDto) {
    this.processInfoService.updateProcessInfo(processInfo).subscribe((result: ProcessInfoDto) => {
      if (result) {
        this._processInfosSignal.update((list) => list.map((x) => (x.processInfoId === result.processInfoId ? result : x)));

        // this.store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(processInfo.partInfoId));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(processInfo.partInfoId);
        // this.store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(processInfo.partInfoId));
        this.toolingInfoSignalsService.getToolingInfosByPartInfoId(processInfo.partInfoId);
      }
    });
  }

  deleteProcessInfo(processInfoId: number, partInfoId: number) {
    this.processInfoService.deleteProcessInfo(processInfoId).subscribe((result) => {
      if (result) {
        this._processInfosSignal.update((list) => list.filter((x) => x.processInfoId !== processInfoId));

        // this.store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(partInfoId));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
        // this.store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(partInfoId));
        this.toolingInfoSignalsService.getToolingInfosByPartInfoId(partInfoId);
      }
    });
  }

  deleteAllProcessInfo(partInfoId: number) {
    this.processInfoService.deleteAllProcessInfo(partInfoId).subscribe((result) => {
      if (result) {
        this._processInfosSignal.set([]);

        // this.store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(partInfoId));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
        // this.store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(partInfoId));
        this.toolingInfoSignalsService.getToolingInfosByPartInfoId(partInfoId);
      }
    });
  }

  bulkUpdateOrCreateProcessInfo(processInfos: ProcessInfoDto[]) {
    console.log('BulkUpdateOrCreateProcessInfo', processInfos); // BP
    if (sessionStorage.getItem('processlist') && window.location.pathname === '/analytics/bestprocess') {
      const processes = JSON.parse(sessionStorage.getItem('processlist'));
      processes.push({ ...processInfos[0], processInfoId: 0 });
      sessionStorage.setItem('processlist', JSON.stringify(processes));
    }
    this.processInfoService.bulkUpdateOrCreateProcessInfo(processInfos).subscribe((result: ProcessInfoDto[]) => {
      if (result) {
        const partInfoId = result.length > 0 ? result[0].partInfoId : 0;

        if (partInfoId > 0) {
          this.getProcessInfosByPartInfoId(partInfoId);

          this.apiCacheService.removeCache('/api/costing/CostTooling/' + partInfoId);

          // this.store.dispatch(new ToolingInfoActions.GetToolingInfosByPartInfoId(partInfoId));
          this.toolingInfoSignalsService.getToolingInfosByPartInfoId(partInfoId);
          // this.store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(partInfoId, 'bulkUpdateOrCreateProcessInfo'));
          this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId, 'bulkUpdateOrCreateProcessInfo');
        }
      }
    });
  }

  // setBulkProcessUpdateLoading(flag: boolean) {
  //   this._bulkProcessUpdateLoadingSignal.set(flag);
  // }
}
