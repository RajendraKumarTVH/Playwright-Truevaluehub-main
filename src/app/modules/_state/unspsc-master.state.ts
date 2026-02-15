import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { UnspscClassDto, UnspscCommodityDto, UnspscFamilyDto, UnspscMasterDto, UnspscSegmentDto } from 'src/app/shared/models/unspsc-master.model';
import { GetAllUnspscMasterData } from '../_actions/master-data.action';
import { UnspscMasterService } from 'src/app/shared/services/unspsc-master.service';
import { BlockUiService } from 'src/app/shared/services';

export class UnspscMasterStateModel {
  UnspscMasterData: {
    segments: UnspscSegmentDto[];
    families: UnspscFamilyDto[];
    classes: UnspscClassDto[];
    commodities: UnspscCommodityDto[];
  };
}

@State<UnspscMasterStateModel>({
  name: 'UnspscMaster',
  defaults: {
    UnspscMasterData: {
      segments: [],
      families: [],
      classes: [],
      commodities: [],
    },
  },
})
@Injectable()
export class UnspscMasterState {
  constructor(
    private _unspscMasterService: UnspscMasterService,
    private _blockUiService: BlockUiService
  ) {}

  @Selector()
  static segments(state: UnspscMasterStateModel) {
    return state.UnspscMasterData.segments;
  }

  @Selector()
  static families(state: UnspscMasterStateModel) {
    return state.UnspscMasterData.families;
  }

  @Selector()
  static classes(state: UnspscMasterStateModel) {
    return state.UnspscMasterData.classes;
  }

  @Selector()
  static commodities(state: UnspscMasterStateModel) {
    return state.UnspscMasterData.commodities;
  }

  @Selector()
  static getAllUnspscMasterData(state: UnspscMasterStateModel) {
    return state.UnspscMasterData;
  }

  @Action(GetAllUnspscMasterData)
  getAllUnspscMasterData(state: StateContext<UnspscMasterStateModel>) {
    // this._blockUiService.pushBlockUI('getAllUnspscMasterData');
    return this._unspscMasterService.getAllUnspscMasterData().pipe(
      tap((result: UnspscMasterDto) => {
        state.setState({
          UnspscMasterData: {
            segments: result.segments,
            families: result.families,
            classes: result.classes,
            commodities: result.commodities,
          },
        });
        // this._blockUiService.popBlockUI('getAllUnspscMasterData');
      })
    );
  }
}
