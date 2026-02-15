import { Injectable, signal } from '@angular/core';
import { CotsInfoDto, MoveAssembliesInfoDto } from '../models/cots-info.model';
import { CostSummarySignalsService } from './cost-summary-signals.service';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { CotsInfoService } from '../services';

@Injectable({
  providedIn: 'root',
})
export class CotsInfoSignalsService {
  private readonly _cotsInfoSignal = signal<CotsInfoDto[]>([]);
  cotsInfo = this._cotsInfoSignal.asReadonly();

  constructor(
    private cotsInfoService: CotsInfoService,
    private messaging: MessagingService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  getCotsInfoByPartInfoId(partInfoId: number): void {
    this.cotsInfoService.getCotsInfoByPartInfoId(partInfoId).subscribe((result: CotsInfoDto[]) => {
      this._cotsInfoSignal.set([...(result ?? [])]);
    });
  }

  createCotsInfo(cotsInfo: CotsInfoDto): void {
    this.cotsInfoService.saveCotsInfo(cotsInfo).subscribe((result: CotsInfoDto) => {
      if (result) {
        this._cotsInfoSignal.update((list) => [...list, result]);
      }
    });
  }

  updateCotsInfo(cotsInfo: CotsInfoDto): void {
    this.cotsInfoService.updateCotsInfo(cotsInfo).subscribe((result: CotsInfoDto) => {
      if (result) {
        this._cotsInfoSignal.update((list) => list.map((x) => (x.cotsInfoId === result.cotsInfoId ? result : x)));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(cotsInfo.partInfoId);
      }
    });
  }

  deleteCotsInfo(cotsInfoId: number, partInfoId: number): void {
    this.cotsInfoService.deleteCotsInfo(cotsInfoId).subscribe((result) => {
      if (result) {
        this._cotsInfoSignal.update((list) => list.filter((x) => x.cotsInfoId !== cotsInfoId));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  bulkUpdateCotsInfo(cotsInfo: CotsInfoDto[]): void {
    this.cotsInfoService.bulkUpdateCotsInfo(cotsInfo).subscribe((result: CotsInfoDto[]) => {
      if (result) {
        this._cotsInfoSignal.set([...result]);
      }
    });
  }

  moveAssemblies(payload: MoveAssembliesInfoDto): void {
    this.cotsInfoService.moveAssemblies(payload).subscribe((result: CotsInfoDto[]) => {
      if (result) {
        this.messaging.openSnackBar('Purchase Part has been moved successfully.', '', { duration: 5000 });
        this._cotsInfoSignal.set([...result]);
      }
    });
  }
}
