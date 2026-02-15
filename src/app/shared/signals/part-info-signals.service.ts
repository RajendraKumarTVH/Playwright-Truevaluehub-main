import { Injectable, signal } from '@angular/core';
import { PartInfoDto } from '../models';
import { PartInfoService } from '../services/part-info.service';
import { Store } from '@ngxs/store';
import { CostSummarySignalsService } from './cost-summary-signals.service';

@Injectable({
  providedIn: 'root',
})
export class PartInfoSignalsService {
  private readonly _partInfoSignal = signal<PartInfoDto | null>(null);
  partInfo = this._partInfoSignal.asReadonly();

  constructor(
    private partInfoService: PartInfoService,
    private store: Store,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  getPartInfo(partInfoId: number) {
    this.partInfoService.getParttDetailsById(partInfoId).subscribe((result) => {
      // if (result) {
      this._partInfoSignal.set(result ?? null);
      // }
    });
  }

  clearPartInfo() {
    this._partInfoSignal.set(null);
  }

  updatePartInfo(partInfo: PartInfoDto) {
    this.partInfoService.updatePartInfo(partInfo).subscribe((result) => {
      if (result) {
        this._partInfoSignal.set(result);

        // this.store.dispatch(new CostSummaryActions.GetCostSummaryByPartInfoId(partInfo.partInfoId));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfo.partInfoId);
      }
    });
  }
}
