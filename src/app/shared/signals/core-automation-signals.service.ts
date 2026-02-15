import { Injectable, signal } from '@angular/core';
import { MaterialInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CoreAutomationSignalsService {
  private _recalculateSignal = signal<{
    totmaterialList: MaterialInfoDto[];
    currentPart: any;
    newCoreAdded: boolean;
  } | null>(null);

  recalculateSignal = this._recalculateSignal.asReadonly();

  triggerRecalculation(payload: { totmaterialList: MaterialInfoDto[]; currentPart: any; newCoreAdded: boolean }) {
    this._recalculateSignal.set(payload);
  }
}
