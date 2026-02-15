import { Injectable, signal } from '@angular/core';
import { BillOfMaterialDto } from '../models';
import { BomTreeModel } from '../models/bom-tree-viewmodel';
import { BomService } from '../services/bom.service';
import { BlockUiService } from '../services/block-ui.service';
import { Store } from '@ngxs/store';
import * as BomActions from '../../modules/_actions/bom.action';
import { AddBomDto } from '../models/add-bom.model';

@Injectable({
  providedIn: 'root',
})
export class BomInfoSignalsService {
  private readonly _bomTreeSignal = signal<BomTreeModel[]>([]);
  private readonly _bomInfoSignal = signal<BillOfMaterialDto[]>([]);
  private readonly _bulkBomInfoSignal = signal<BillOfMaterialDto[]>([]);
  private readonly _addBomSignal = signal<any>(null);

  bomTree = this._bomTreeSignal.asReadonly();
  bomInfo = this._bomInfoSignal.asReadonly();
  addBomInfo = this._addBomSignal.asReadonly();
  bulkBomInfo = this._bulkBomInfoSignal.asReadonly();

  constructor(
    private bomService: BomService,
    private blockUiService: BlockUiService,
    private store: Store
  ) {}

  getBomTreeByProjectId(projectInfoId: number, scenarioId: number) {
    this.bomService.getBomsTreeByProjectId(projectInfoId, scenarioId).subscribe((result: BomTreeModel[]) => {
      // if (result) {
      this._bomTreeSignal.set([...(result ?? [])]);
      // }
    });
  }

  clearBomInfos() {
    this._bomInfoSignal.set([]);
    this._bomTreeSignal.set([]);
  }

  getBomsByProjectId(projectInfoId: number) {
    this.bomService.getBomsByProjectId(projectInfoId).subscribe((result: BillOfMaterialDto[]) => {
      // if (result) {
      this._bomInfoSignal.set([...(result ?? [])]);
      // }
    });
  }

  addBillOfMaterial(addBomInfo: any) {
    this.bomService.addBillOfMaterial(addBomInfo).subscribe((result: AddBomDto) => {
      if (result) {
        // this.store.dispatch(new BomActions.GetBomsTreeByProjectId(result.projectInfoId, result.scenarioId));
        this.getBomTreeByProjectId(result.projectInfoId, result.scenarioId);
      }
    });
  }

  addNewBillOfMaterial(addBomInfo: any) {
    this.blockUiService.pushBlockUI('addNewBillOfMaterial');
    this.bomService.addNewBillOfMaterial(addBomInfo).subscribe((result: AddBomDto) => {
      if (result) {
        this._addBomSignal.set(result);
      }
      this.blockUiService.popBlockUI('addNewBillOfMaterial');
    });
  }

  removeBillOfMaterial(bomId: number, projectId: number, scenarioId: number) {
    this.bomService.removeBillOfMaterial(bomId).subscribe((result: boolean) => {
      if (result) {
        // this.store.dispatch(new BomActions.GetBomsTreeByProjectId(projectId, scenarioId));
        // this.store.dispatch(new BomActions.GetBomsByProjectId(projectId));
        this.getBomTreeByProjectId(projectId, scenarioId);
        this.getBomsByProjectId(projectId);
      }
    });
  }

  updateBillOfMaterial(bomId: number, bomInfo: BillOfMaterialDto, projectId: number, partInfoId: number) {
    this.bomService.updateBom(bomId, bomInfo).subscribe((result) => {
      if (result) {
        this.store.dispatch(new BomActions.GetBoardLoadedComponents(projectId, partInfoId));
      }
    });
  }

  bulkUpdateOrCreateBOMInfo(bulkMaterialInfo: BillOfMaterialDto[]) {
    this.bomService.bulkUpdateOrCreateBOMInfo(bulkMaterialInfo).subscribe((result) => {
      if (result) {
        this._bulkBomInfoSignal.set([...result]);
      }
    });
  }

  deleteSingleMaterialInfo(bomId: number, projectId: number, scenarioId: number) {
    this.bomService.removeSingleBillOfMaterial(bomId).subscribe((result) => {
      if (result) {
        // this.store.dispatch(new BomActions.GetBomsTreeByProjectId(projectId, scenarioId));
        // this.store.dispatch(new BomActions.GetBomsByProjectId(projectId));
        this.getBomTreeByProjectId(projectId, scenarioId);
        this.getBomsByProjectId(projectId);
      }
    });
  }
}
