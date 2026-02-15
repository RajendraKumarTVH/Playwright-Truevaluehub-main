import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  GetPackagingInfosByPartInfoId,
  SavePackagingInfo,
  DeletePackagingInfo,
  SetBulkPackagingUpdateLoading,
  GetPackagingDescriptionMasterData,
  GetPackagingFormMasterData,
  GetPackagingSizeDefinitionMasterData,
} from '../_actions/packaging-info.action';
import { BlockUiService } from 'src/app/shared/services';
import { tap } from 'rxjs/operators';
import { PackagingInfoService } from 'src/app/shared/services/packaging-info.service';
import { PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';
// import { PartInfoStateModel } from './part-info.state';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import { PackagingDescriptionDto, PackagingFormDto, PackagingSizeDefinitionDto } from 'src/app/shared/models/PackagingMaterialMasterDto.model';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

export class PackagingInfoStateModel {
  packagingInfo: PackagingInfoDto;
  bulkPackagingUpdateLoading: boolean;
  packagingDescriptionMasterData: PackagingDescriptionDto[];
  packagingFormMasterData: PackagingFormDto[];
  packagingSizeDefinitionMasterData: PackagingSizeDefinitionDto[];
}

@State<PackagingInfoStateModel>({
  name: 'PackagingInfos',
  defaults: {
    packagingInfo: null,
    bulkPackagingUpdateLoading: true,
    packagingDescriptionMasterData: null,
    packagingFormMasterData: null,
    packagingSizeDefinitionMasterData: null,
  },
})
@Injectable({ providedIn: 'root' })
export class PackagingInfoState {
  constructor(
    private _PackagingInfoService: PackagingInfoService,
    private _blockUiService: BlockUiService,
    private _store: Store,
    private costSummarySignalsService: CostSummarySignalsService
  ) {}

  @Selector()
  static getPackageInfo(state: PackagingInfoStateModel) {
    return state.packagingInfo;
  }

  // @Selector()
  // static getPkgInfo(state: PartInfoStateModel) {
  //   return { ...state };
  // }

  @Selector()
  static getBulkPackagingUpdateStatus(state: PackagingInfoStateModel) {
    return state.bulkPackagingUpdateLoading;
  }

  @Selector()
  static getPackagingDescriptionMasterData(state: PackagingInfoStateModel) {
    return state.packagingDescriptionMasterData;
  }
  @Selector()
  static getPackagingFormMasterData(state: PackagingInfoStateModel) {
    return state.packagingFormMasterData;
  }
  @Selector()
  static getPackagingSizeDefinitionMasterData(state: PackagingInfoStateModel) {
    return state.packagingSizeDefinitionMasterData;
  }

  @Action(GetPackagingInfosByPartInfoId)
  getPackagingInfosByPartInfoId(state: StateContext<PackagingInfoStateModel>, payload: GetPackagingInfosByPartInfoId) {
    // state.patchState({
    //   packagingInfo: null,
    // });
    return this._PackagingInfoService.getPackagingDetails(payload.partInfoId).pipe(
      tap((result) => {
        // if (result) {
        state.patchState({
          packagingInfo: result ? { ...result } : null,
        });
        // }
      })
    );
  }

  @Action(GetPackagingDescriptionMasterData)
  getPackagingDescriptionMasterData(state: StateContext<PackagingInfoStateModel>) {
    return this._PackagingInfoService.getPackagingDescriptionMasterData().pipe(
      tap((result) => {
        state.patchState({
          packagingDescriptionMasterData: result ? { ...result } : null,
        });
      })
    );
  }

  @Action(GetPackagingFormMasterData)
  getPackagingFormMasterData(state: StateContext<PackagingInfoStateModel>) {
    return this._PackagingInfoService.getPackagingFormMasterData().pipe(
      tap((result) => {
        state.patchState({
          packagingFormMasterData: result ? { ...result } : null,
        });
      })
    );
  }

  @Action(GetPackagingSizeDefinitionMasterData)
  getPackagingSizeDefinitionMasterData(state: StateContext<PackagingInfoStateModel>) {
    return this._PackagingInfoService.getPackagingSizeDefinitionMasterData().pipe(
      tap((result) => {
        state.patchState({
          packagingSizeDefinitionMasterData: result ? { ...result } : null,
        });
      })
    );
  }

  @Action(SavePackagingInfo)
  savePackagingInfo(state: StateContext<PackagingInfoStateModel>, payload: SavePackagingInfo) {
    // this._blockUiService.pushBlockUI('savePackagingInfo');
    return this._PackagingInfoService.savePackagingInfo(payload.packagingInfo).pipe(
      tap((result) => {
        if (result) {
          state.patchState({
            packagingInfo: result,
          });
          this.costSummarySignalsService.getCostSummaryByPartInfoId(payload.packagingInfo.partInfoId, 'savePackagingInfo');
        }
        // this._blockUiService.popBlockUI('savePackagingInfo');
      })
    );
  }

  @Action(DeletePackagingInfo)
  deletePackagingInfo(state: StateContext<PackagingInfoStateModel>, payload: DeletePackagingInfo) {
    // this._blockUiService.pushBlockUI('deletePackagingInfo');
    return this._PackagingInfoService.deletePacking(payload.partInfoId).pipe(
      tap((result) => {
        if (result) {
          state.patchState({
            packagingInfo: null,
          });
        }
        // this._blockUiService.popBlockUI('deletePackagingInfo');
      })
    );
  }
  @Action(SetBulkPackagingUpdateLoading)
  setBulkPackagingUpdateLoadingFalse(state: StateContext<PackagingInfoStateModel>, flag: SetBulkPackagingUpdateLoading) {
    state.patchState({
      bulkPackagingUpdateLoading: flag.source,
    });
  }
}
