import { Injectable, signal } from '@angular/core';
import { MaterialInfoDto } from 'src/app/shared/models';
import { MaterialInfoService, ApiCacheService, BlockUiService } from 'src/app/shared/services';
import { Store } from '@ngxs/store';
import { CostSummarySignalsService } from './cost-summary-signals.service';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';

@Injectable({
  providedIn: 'root',
})
export class MaterialInfoSignalsService {
  private materialInfosSignal = signal<MaterialInfoDto[]>([]);
  private processList = signal<any[]>([]);
  private selectedMatProcessTypeName = signal<string>('');
  // private bulkMaterialUpdateLoadingSignal = signal<boolean>(true, {
  //   equal: (a, b) => a === b,
  // });
  private bulkMaterialInfosSignal = signal<MaterialInfoDto[]>([]);

  materialInfos = this.materialInfosSignal.asReadonly();
  materialProcessList = this.processList.asReadonly();
  matProcessTypeName = this.selectedMatProcessTypeName.asReadonly();

  bulkMaterialInfos = this.bulkMaterialInfosSignal.asReadonly();
  // bulkMaterialUpdateLoading = this.bulkMaterialUpdateLoadingSignal.asReadonly();

  constructor(
    private materialInfoService: MaterialInfoService,
    private blockUi: BlockUiService,
    private _apiCacheService: ApiCacheService,
    private _store: Store,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  getMaterialInfosByPartInfoId(partInfoId: number) {
    this.materialInfoService.getMaterialInfosByPartInfoId(partInfoId).subscribe((result: MaterialInfoDto[]) => {
      // if (result) {
      this.materialInfosSignal.set([...(result ?? [])]);
      // }
    });
  }

  setMaterialProcessList(processList) {
    this.processList.set(processList);
  }

  setMaterialProcessTypeName(processName) {
    this.selectedMatProcessTypeName.set(processName);
  }

  clearMaterialInfos() {
    this.materialInfosSignal.set([]);
    this.bulkMaterialInfosSignal.set([]);
    // this.bulkMaterialUpdateLoadingSignal.set(true);
  }

  createMaterialInfo(materialInfo: MaterialInfoDto) {
    this.materialInfoService.saveMaterialInfo(materialInfo).subscribe((result: MaterialInfoDto) => {
      if (result) {
        this.materialInfosSignal.update((list) => [...list, result]);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(materialInfo.partInfoId);
      }
    });
  }

  updateMaterialInfo(materialInfo: MaterialInfoDto) {
    this.materialInfoService.updateMaterialInfo(materialInfo).subscribe((result: MaterialInfoDto) => {
      if (result) {
        this.materialInfosSignal.update((list) => list.map((x) => (x.materialInfoId === result.materialInfoId ? result : x)));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(materialInfo.partInfoId);
      }
    });
  }

  deleteMaterialInfo(materialInfoId: number, partInfoId: number) {
    this.materialInfoService.deleteMaterialInfo(materialInfoId).subscribe((result) => {
      if (result) {
        this.materialInfosSignal.update((list) => list.filter((x) => x.materialInfoId !== materialInfoId));
        this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
      }
    });
  }

  bulkUpdateOrCreateMaterialInfo(payload: MaterialInfoDto[]) {
    this.materialInfoService.bulkUpdateOrCreateMaterialInfo(payload).subscribe((result: MaterialInfoDto[]) => {
      if (result) {
        this.bulkMaterialInfosSignal.set(result);

        const partInfoId = result?.[0]?.partInfoId || 0;
        if (partInfoId > 0) {
          this._apiCacheService.removeCache(`/api/costing/MaterialInfo/${partInfoId}/materialdetails`);
          this.getMaterialInfosByPartInfoId(partInfoId);
          this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId, 'bulkUpdateOrCreateMaterialInfo');
        }
      }
    });
  }

  // setBulkMaterialUpdateLoading(flag: boolean) {
  //   this.bulkMaterialUpdateLoadingSignal.set(flag);
  // }
}
