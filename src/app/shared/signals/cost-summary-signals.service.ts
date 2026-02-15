import { Injectable, signal } from '@angular/core';
import { CostSummaryDto, ViewCostSummaryDto } from '../models';
import { CostSummaryService } from '../services/cost-summary.service';
import { Store } from '@ngxs/store';
import * as OverheadActions from '../../modules/_actions/overhead-profit.action';
import * as PackagingInfoActions from '../../modules/_actions/packaging-info.action';
import { RecalculationUpdateSignalsService } from './recalculation-update-signals.service';

@Injectable({
  providedIn: 'root',
})
export class CostSummarySignalsService {
  private readonly _costSummarysSignal = signal<ViewCostSummaryDto[]>([]);
  private readonly _costSummaryAllSignal = signal<{ [key: number]: ViewCostSummaryDto }>({});

  costSummarys = this._costSummarysSignal.asReadonly();
  costSummaryAll = this._costSummaryAllSignal.asReadonly();

  constructor(
    private _CostSummaryService: CostSummaryService,
    private _store: Store,
    public _recalculationUpdateSignalsService: RecalculationUpdateSignalsService
  ) {}

  getCostSummaryByPartInfoId(partInfoId: number, isBulkUpdate?: string) {
    this._CostSummaryService.getCostSummaryViewByPartInfoId(partInfoId).subscribe((result) => {
      this._costSummarysSignal.set([...(result ?? [])]);
      if (result && result.length > 0) {
        this._costSummaryAllSignal.update((all) => ({ ...all, [result[0].partInfoId]: result[0] }));
      }
      // if (result[0].sumNetProcessCost && payload.source === 'bulkUpdateOrCreateProcessInfo') {
      // if (isBulkUpdate === 'bulkUpdateOrCreateProcessInfo') {
      //   this._recalculationUpdateSignalsService.setBulkProcessUpdateLoading(false);
      // } else if (isBulkUpdate === 'bulkUpdateOrCreateMaterialInfo') {
      //   this._recalculationUpdateSignalsService.setBulkMaterialUpdateLoading(false);
      // } else if (isBulkUpdate === 'overHeadProfit') {
      //   this._store.dispatch(new OverheadActions.SetBulkOverheadUpdateLoading(false));
      // } else if (isBulkUpdate === 'bulkUpdateAsyncTooling') {
      //   this._recalculationUpdateSignalsService.setBulkToolingUpdateLoading(false);
      // } else if (isBulkUpdate === 'savePackagingInfo') {
      //   this._store.dispatch(new PackagingInfoActions.SetBulkPackagingUpdateLoading(false));
      // }
      switch (isBulkUpdate) {
        case 'bulkUpdateOrCreateProcessInfo':
          this._recalculationUpdateSignalsService.setBulkProcessUpdateLoading(false);
          break;

        case 'bulkUpdateOrCreateMaterialInfo':
          this._recalculationUpdateSignalsService.setBulkMaterialUpdateLoading(false);
          break;

        case 'overHeadProfit':
          this._store.dispatch(new OverheadActions.SetBulkOverheadUpdateLoading(false));
          break;

        case 'bulkUpdateAsyncTooling':
          this._recalculationUpdateSignalsService.setBulkToolingUpdateLoading(false);
          break;

        case 'savePackagingInfo':
          this._store.dispatch(new PackagingInfoActions.SetBulkPackagingUpdateLoading(false));
          break;
      }
    });
  }

  clearCostSummaryInfos() {
    this._costSummarysSignal.set([]);
  }

  getCostSummaryByMultiplePartInfoIds(partInfoIds: number[]) {
    this._CostSummaryService.getCostSummaryViewByMultiplePartInfoIds(partInfoIds).subscribe((result) => {
      if (result && result.length > 0) {
        this._costSummaryAllSignal.set({ ...this._costSummaryAllSignal(), ...result.reduce((updatedObj, curItem) => ({ ...updatedObj, [curItem.partInfoId]: curItem }), {}) });
      }
    });
  }

  createCostSummary(payload: CostSummaryDto) {
    this._CostSummaryService.saveCostSummary(payload).subscribe((result) => {
      if (result) {
        this.getCostSummaryByPartInfoId(payload.partInfoId);
      }
    });
  }

  updateCostSummary(payload: CostSummaryDto) {
    return this._CostSummaryService.updateCostsummary(payload).subscribe((result) => {
      if (result) {
        this.getCostSummaryByPartInfoId(payload.partInfoId);
      }
    });
  }
}
