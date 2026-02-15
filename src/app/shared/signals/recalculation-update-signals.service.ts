import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecalculationUpdateSignalsService {
  private readonly _bulkProcessUpdateLoadingSignal = signal<boolean>(true);
  private readonly _bulkMaterialUpdateLoadingSignal = signal<boolean>(true, {
    equal: (a, b) => a === b,
  });
  private readonly _bulkToolingUpdateLoadingSignal = signal<boolean>(true);

  bulkProcessUpdateLoading = this._bulkProcessUpdateLoadingSignal.asReadonly();
  bulkMaterialUpdateLoading = this._bulkMaterialUpdateLoadingSignal.asReadonly();
  bulkToolingUpdateLoading = this._bulkToolingUpdateLoadingSignal.asReadonly();

  setBulkProcessUpdateLoading(flag: boolean) {
    this._bulkProcessUpdateLoadingSignal.set(flag);
  }

  setBulkMaterialUpdateLoading(flag: boolean) {
    this._bulkMaterialUpdateLoadingSignal.set(flag);
  }

  setBulkToolingUpdateLoading(flag: boolean) {
    this._bulkToolingUpdateLoadingSignal.set(flag);
  }
}
